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

  const handleApproveMatch = async (job: Job) => {
    let targetDriver = job.driver;
    let targetVehicle = job.vehicle;

    if (job.overrideReason && job.overrideReason.startsWith("RECOMMENDED_MATCH:")) {
      const parts = job.overrideReason.split(":");
      if (parts.length >= 3) {
        targetVehicle = parts[1];
        targetDriver = `${parts[2]} (#DRV-AUTO)`;
      }
    } else if (job.driver.includes("Pending")) {
      targetDriver = "Dave Miller (#DRV-104)";
      targetVehicle = "Truck #NL-14 (Mack Titan)";
    }

    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Assigned",
          driver: targetDriver,
          vehicle: targetVehicle,
          eta: job.priority === "Express" ? "13:30 ACST (Express)" : "14:45 ACST"
        })
      });
      const data = await res.json();
      if (data.success && data.job) {
        onJobReassigned(data.job);
        toast.success(
          `Dispatcher confirmed allocation of ${targetDriver} (${targetVehicle}) to #${job.id}. Manifest dispatched to cab.`,
          "Driver Assignment Approved (FR-02)"
        );
      } else {
        toast.error("Failed to approve assignment", "Error");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error", "Approval Failed");
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
                    onClick={() => handleApproveMatch(job)}
                    title="CoR Approval Gate: Confirm Driver Match (FR-02)"
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
    </div>
  );
}
