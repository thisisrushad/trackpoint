"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Job, Vehicle, NT_COORDINATES } from "@/lib/data";
import Pagination from "./Pagination";
import { LayoutGrid, Navigation, RefreshCw, X, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";

const DispatcherMap = dynamic(() => import("./DispatcherMap"), { ssr: false });

interface DispatcherBoardProps {
  jobs: Job[];
  fleet: Vehicle[];
  onJobReassigned: (updatedJob: Job) => void;
}

export default function DispatcherBoard({ jobs, fleet, onJobReassigned }: DispatcherBoardProps) {
  const toast = useToast();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [overrideDriver, setOverrideDriver] = useState("Dave Miller (#DRV-104)");
  const [reasonCode, setReasonCode] = useState("DRIVER_FATIGUE");
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [zoomLevel, setZoomLevel] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(4);

  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return jobs.slice(start, start + pageSize);
  }, [jobs, currentPage, pageSize]);

  const openOverride = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleConfirmOverride = async () => {
    if (!selectedJob) return;

    try {
      const res = await fetch(`/api/jobs/${selectedJob.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "override",
          driver: overrideDriver,
          reasonCode: reasonCode
        })
      });
      const data = await res.json();
      if (data.success && data.job) {
        onJobReassigned(data.job);
        toast.success(
          `Consignment #${selectedJob.id} allocated to ${overrideDriver}. Compliance Reason Code [${reasonCode}] logged to MongoDB Atlas (PR-02).`,
          "Reassignment Complete (FR-03)"
        );
        setIsModalOpen(false);
      } else {
        toast.error("Failed to reassign driver in database.", "Error");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error", "Override Failed");
    }
  };

  // Dispatcher Approval Modal state
  const [approveJob, setApproveJob] = useState<Job | null>(null);
  const [approveDriver, setApproveDriver] = useState("Dave Miller (#DRV-104)");
  const [approveVehicle, setApproveVehicle] = useState("Truck #NL-14 (Mack Titan)");
  const [isSubmittingApprove, setIsSubmittingApprove] = useState(false);

  const openApproveModal = (job: Job) => {
    let initialDriver = "Dave Miller (#DRV-104)";
    let initialVehicle = "Truck #NL-14 (Mack Titan)";

    if (job.overrideReason && job.overrideReason.startsWith("RECOMMENDED_MATCH:")) {
      const parts = job.overrideReason.split(":");
      if (parts.length >= 3) {
        initialVehicle = parts[1];
        initialDriver = `${parts[2]} (#DRV-101)`;
      }
    } else if (!job.driver.includes("Pending")) {
      initialDriver = job.driver;
      initialVehicle = job.vehicle;
    }

    setApproveJob(job);
    setApproveDriver(initialDriver);
    setApproveVehicle(initialVehicle);
  };

  const handleConfirmApproval = async () => {
    if (!approveJob) return;
    setIsSubmittingApprove(true);

    try {
      const res = await fetch(`/api/jobs/${approveJob.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Assigned",
          driver: approveDriver,
          vehicle: approveVehicle,
          eta: approveJob.priority === "Express" ? "13:30 ACST (Express)" : "14:45 ACST"
        })
      });
      const data = await res.json();
      if (data.success && data.job) {
        onJobReassigned(data.job);
        toast.success(
          `Dispatcher approved Consignment #${approveJob.id}! Assigned to ${approveDriver} (${approveVehicle}). Manifest dispatched to cab.`,
          "Driver Assignment Approved (FR-02)"
        );
        setApproveJob(null);
      } else {
        toast.error("Failed to approve assignment", "Error");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error", "Approval Failed");
    } finally {
      setIsSubmittingApprove(false);
    }
  };

  return (
    <div className="view-grid grid-3col">
      {/* Left: Dispatch Queue */}
      <div className="glass-card col-span-1">
        <div className="card-header flex-between">
          <div className="flex-align">
            <div className="header-icon">
              <LayoutGrid size={20} />
            </div>
            <div>
              <h2>Dispatch Queue (FR-02)</h2>
              <p className="text-muted">Automated nearest-vehicle queue</p>
            </div>
          </div>
          <span className="badge-counter">{jobs.length} Active</span>
        </div>

        <div className="job-list-container">
          {paginatedJobs.map((job) => (
            <div key={job.id} className="job-card-item">
              <div className="j-top">
                <span className="j-id">{job.id}</span>
                <span className={`badge-status ${job.status === "Delivered" ? "delivered" : "in-transit"}`}>
                  {job.status}
                </span>
              </div>
              <div className="j-route"><strong>{job.customer}</strong></div>
              <div className="j-meta">
                <span>📍 {job.pickup.split('(')[0]} → {job.dropoff.split('(')[0]}</span>
              </div>
              <div className="j-meta" style={{ marginTop: "4px", color: "#60a5fa" }}>
                <span>🎯 Allocated: {job.driver}</span>
              </div>
              <div className="j-actions" style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                {(job.status === "Booked" || job.status === "Assigned") && (
                  <button
                    className="btn btn-sm"
                    style={{
                      fontSize: "0.72rem",
                      padding: "0.25rem 0.55rem",
                      background: "linear-gradient(135deg, #059669, #10b981)",
                      color: "#ffffff",
                      border: "1px solid #34d399",
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem"
                    }}
                    onClick={() => openApproveModal(job)}
                    title="Review & Confirm Driver Allocation (FR-02)"
                  >
                    <CheckCircle2 size={12} />
                    <span>Approve</span>
                  </button>
                )}
                <button className="btn btn-secondary btn-sm" onClick={() => openOverride(job)}>
                  Override (FR-03)
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => toast.info(`Consignment #${job.id} route pushed to driver handset!`, "Route Dispatched")}
                >
                  Push Route
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Dispatch Queue Pagination */}
        <div style={{ padding: "0.25rem 0.5rem" }}>
          <Pagination
            currentPage={currentPage}
            totalItems={jobs.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[3, 4, 6]}
            labelSingular="run"
            labelPlural="runs"
          />
        </div>
      </div>

      {/* Right: Fleet Map & Territory Controls */}
      <div className="glass-card col-span-2">
        <div className="card-header flex-between">
          <div className="flex-align">
            <div className="header-icon icon-primary">
              <Navigation size={20} />
            </div>
            <div>
              <h2>Northern Territory Fleet Telematics (FR-05)</h2>
              <p className="text-muted">35 Fitted Vehicles · Corridors (Darwin, Katherine, Tennant Creek, Alice Springs)</p>
            </div>
          </div>
          <div className="fleet-actions" style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => { setMapCenter(NT_COORDINATES.darwin); setZoomLevel(11); }}
            >
              Center Darwin
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => { setMapCenter([-16.5, 132.5]); setZoomLevel(6); }}
            >
              View All NT
            </button>
          </div>
        </div>

        <DispatcherMap vehicles={fleet} centerTarget={mapCenter} zoomLevel={zoomLevel} />

        <div className="fleet-strip">
          <div className="f-stat"><strong className="text-success">28</strong> On Route</div>
          <div className="f-stat"><strong className="text-accent">4</strong> Loading / Depot</div>
          <div className="f-stat"><strong className="text-muted">3</strong> Off Duty</div>
          <div className="f-stat"><strong className="text-warning">0</strong> Unscheduled Overtime</div>
        </div>
      </div>

      {/* Reassignment Modal */}
      {isModalOpen && selectedJob && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="flex-align">
                <ShieldAlert size={18} color="#38bdf8" />
                <h3>Manual Dispatcher Override (FR-03)</h3>
              </div>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p className="text-sm text-muted mb-3">
                Overriding automated allocation for Consignment <strong className="text-primary">#{selectedJob.id}</strong>.
              </p>

              <div className="form-group mb-3">
                <label>Select Alternative Driver & Vehicle</label>
                <select value={overrideDriver} onChange={(e) => setOverrideDriver(e.target.value)}>
                  <option value="Dave Miller (#DRV-104)">Dave Miller — Truck #NL-14 (Mack Titan, Katherine)</option>
                  <option value="Sarah Peterson (#DRV-108)">Sarah Peterson — Rigid #NL-08 (Hino 500, Darwin Metro)</option>
                  <option value="Mark Taylor (#DRV-112)">Mark Taylor — Road Train #NL-31 (Kenworth, Alice Springs)</option>
                </select>
              </div>

              <div className="form-group mb-3">
                <label>Mandatory Override Reason Code (PR-02)</label>
                <select value={reasonCode} onChange={(e) => setReasonCode(e.target.value)}>
                  <option value="DRIVER_FATIGUE">Heavy Vehicle Fatigue Compliance Limit (CR-05)</option>
                  <option value="VEHICLE_CAPACITY">Specialized Refrigeration / Oversize Freight</option>
                  <option value="CUSTOMER_SPECIAL_REQUEST">VIP Customer Preferred Carrier Allocation</option>
                  <option value="MAINTENANCE">Scheduled Depot Maintenance Inspection</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleConfirmOverride}>
                Confirm Reassignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispatcher Approval & Driver/Vehicle Allocation Modal */}
      {approveJob && (
        <div className="modal-backdrop" style={{ zIndex: 10002 }}>
          <div
            className="modal-dialog"
            style={{
              maxWidth: "540px",
              background: "linear-gradient(180deg, #1e293b, #0f172a)",
              border: "1px solid rgba(52, 211, 153, 0.4)",
              borderRadius: "14px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.8)",
              color: "#f8fafc"
            }}
          >
            <div className="modal-header">
              <div className="flex-align" style={{ gap: "0.5rem" }}>
                <CheckCircle2 size={18} color="#34d399" />
                <h3 style={{ margin: 0, fontSize: "1.05rem" }}>Approve & Dispatch #{approveJob.id}</h3>
              </div>
              <button className="btn-close" onClick={() => setApproveJob(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div
                style={{
                  background: "rgba(15, 23, 42, 0.7)",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.5rem"
                }}
              >
                <div><span className="text-muted">Customer:</span> <strong>{approveJob.customer}</strong></div>
                <div><span className="text-muted">Priority:</span> <strong className="text-primary">{approveJob.priority}</strong></div>
                <div style={{ gridColumn: "span 2" }}><span className="text-muted">Route:</span> {approveJob.pickup.split('(')[0]} → {approveJob.dropoff.split('(')[0]}</div>
                <div style={{ gridColumn: "span 2" }}><span className="text-muted">Cargo:</span> {approveJob.goods}</div>
              </div>

              <div
                style={{
                  background: "rgba(56, 189, 248, 0.1)",
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                  padding: "0.6rem 0.8rem",
                  borderRadius: "8px",
                  fontSize: "0.78rem"
                }}
              >
                <div style={{ color: "#38bdf8", fontWeight: 700, marginBottom: "2px" }}>Algorithm Nearest-Depot Match:</div>
                <div>{approveJob.vehicle.replace("Suggested: ", "")}</div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: "0.76rem", fontWeight: 600, color: "#cbd5e1", marginBottom: "4px", display: "block" }}>
                  Confirm or Change Linehaul Unit & Driver:
                </label>
                <select
                  value={approveDriver}
                  onChange={(e) => {
                    const drv = e.target.value;
                    setApproveDriver(drv);
                    if (drv.includes("Liam Chen")) setApproveVehicle("Van #NL-01 (HiAce Courier)");
                    else if (drv.includes("Dave Miller")) setApproveVehicle("Truck #NL-14 (Mack Titan)");
                    else if (drv.includes("Sarah Peterson")) setApproveVehicle("Rigid #NL-08 (Hino 500)");
                    else if (drv.includes("Samira Patel")) setApproveVehicle("Rigid #NL-06 (Fuso Fighter)");
                    else if (drv.includes("Wayne Campbell")) setApproveVehicle("Semi #NL-11 (Volvo FM)");
                    else if (drv.includes("Mark Taylor")) setApproveVehicle("Road Train #NL-31 (Kenworth T909)");
                  }}
                  style={{
                    width: "100%",
                    padding: "0.55rem 0.75rem",
                    borderRadius: "6px",
                    background: "#0f172a",
                    color: "#f8fafc",
                    border: "1px solid rgba(56, 189, 248, 0.4)",
                    fontSize: "0.82rem"
                  }}
                >
                  <option value="Liam Chen (#DRV-101)">Liam Chen (#DRV-101) — Van #NL-01 (HiAce Courier, Darwin)</option>
                  <option value="Dave Miller (#DRV-104)">Dave Miller (#DRV-104) — Truck #NL-14 (Mack Titan, Katherine)</option>
                  <option value="Sarah Peterson (#DRV-108)">Sarah Peterson (#DRV-108) — Rigid #NL-08 (Hino 500, Darwin)</option>
                  <option value="Samira Patel (#DRV-106)">Samira Patel (#DRV-106) — Rigid #NL-06 (Fuso Fighter, Darwin)</option>
                  <option value="Wayne Campbell (#DRV-111)">Wayne Campbell (#DRV-111) — Semi #NL-11 (Volvo FM, Katherine)</option>
                  <option value="Mark Taylor (#DRV-112)">Mark Taylor (#DRV-112) — Road Train #NL-31 (Kenworth, Alice Springs)</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#94a3b8", padding: "0.4rem 0.6rem", background: "rgba(255, 255, 255, 0.03)", borderRadius: "4px" }}>
                <span>Allocated Vehicle:</span>
                <strong style={{ color: "#38bdf8" }}>{approveVehicle}</strong>
              </div>
            </div>

            <div className="modal-footer" style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setApproveJob(null)}>
                Cancel
              </button>
              <button
                className="btn btn-sm"
                disabled={isSubmittingApprove}
                onClick={handleConfirmApproval}
                style={{
                  background: "linear-gradient(135deg, #059669, #10b981)",
                  border: "1px solid #34d399",
                  color: "#ffffff",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem"
                }}
              >
                <CheckCircle2 size={13} />
                <span>{isSubmittingApprove ? "Allocating..." : "Confirm & Dispatch Linehaul"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
