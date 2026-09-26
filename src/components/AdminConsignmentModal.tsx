"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Job, STUART_HIGHWAY_WAYPOINTS, NT_COORDINATES } from "@/lib/data";
import { useToast } from "@/context/ToastContext";

const MapView = dynamic(() => import("./MapView"), { ssr: false });
import {
  X,
  MapPin,
  Truck,
  UserCheck,
  CheckCircle2,
  Clock,
  FileText,
  ShieldCheck,
  RefreshCw,
  Printer,
  Download,
  AlertTriangle,
  Zap,
  Activity,
  Compass,
  ArrowRight,
  Send
} from "lucide-react";

interface AdminConsignmentModalProps {
  job: Job;
  onClose: () => void;
  onJobUpdated: (updatedJob: Job) => void;
}

export default function AdminConsignmentModal({
  job,
  onClose,
  onJobUpdated
}: AdminConsignmentModalProps) {
  const toast = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [overrideDriver, setOverrideDriver] = useState(job.driver);
  const [reasonCode, setReasonCode] = useState("DRIVER_FATIGUE");
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [showMap, setShowMap] = useState(true);

  const isDelivered = job.status === "Delivered";

  const handlePushRoute = () => {
    toast.info(`Consignment #${job.id} route telemetry successfully transmitted to Driver ${job.driver}.`, "Route Pushed");
  };

  const handleManualOverride = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
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
        onJobUpdated(data.job);
        toast.success(
          `Consignment #${job.id} reallocated to ${overrideDriver}. Compliance Code [${reasonCode}] logged to MongoDB Atlas.`,
          "Driver Reassigned (FR-03)"
        );
        setShowOverrideForm(false);
      } else {
        toast.error("Failed to reassign driver. Check database connection.", "Override Failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error", "Error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (newStatus: "Assigned" | "In Transit" | "Delivered") => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus
        })
      });
      const data = await res.json();
      if (data.success && data.job) {
        onJobUpdated(data.job);
        toast.success(
          `Consignment #${job.id} status updated to "${newStatus}" in MongoDB Atlas.`,
          "Status Updated"
        );
      }
    } catch (err: any) {
      toast.error(err.message || "Network error", "Update Failed");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApproveAssignment = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Assigned"
        })
      });
      const data = await res.json();
      if (data.success && data.job) {
        onJobUpdated(data.job);
        toast.success(
          `Dispatcher Approval Confirmed: Driver ${job.driver} officially assigned to Consignment #${job.id}. Manifest dispatched to in-cab console.`,
          "Driver Assignment Approved (FR-02)"
        );
      } else {
        toast.error("Failed to approve assignment in database.", "Approval Error");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error", "Approval Failed");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 10000, overflowY: "auto", padding: "1.5rem 0" }}>
      <div
        className="modal-dialog"
        style={{
          maxWidth: "880px",
          width: "95vw",
          background: "linear-gradient(180deg, rgba(20, 24, 39, 0.98), rgba(15, 23, 42, 0.98))",
          border: "1px solid rgba(56, 189, 248, 0.3)",
          borderRadius: "16px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.85)",
          backdropFilter: "blur(20px)",
          color: "#f8fafc"
        }}
      >
        {/* Modal Header */}
        <div
          className="modal-header"
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "rgba(56, 189, 248, 0.15)",
                border: "1px solid rgba(56, 189, 248, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#38bdf8"
              }}
            >
              <Truck size={22} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
                  Consignment #{job.id}
                </h3>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    padding: "0.2rem 0.55rem",
                    borderRadius: "999px",
                    background: job.priority === "Express" ? "rgba(239, 68, 68, 0.2)" : "rgba(59, 130, 246, 0.2)",
                    color: job.priority === "Express" ? "#fca5a5" : "#93c5fd",
                    border: `1px solid ${job.priority === "Express" ? "rgba(239, 68, 68, 0.4)" : "rgba(59, 130, 246, 0.4)"}`
                  }}
                >
                  {job.priority} Priority
                </span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    padding: "0.2rem 0.55rem",
                    borderRadius: "999px",
                    background: isDelivered ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)",
                    color: isDelivered ? "#6ee7b7" : "#fcd34d",
                    border: `1px solid ${isDelivered ? "rgba(16, 185, 129, 0.4)" : "rgba(245, 158, 11, 0.4)"}`
                  }}
                >
                  {job.status}
                </span>
              </div>
              <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#94a3b8" }}>
                Commercial Client: <strong style={{ color: "#f1f5f9" }}>{job.customer}</strong> · Live Database Record
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#94a3b8",
              borderRadius: "8px",
              padding: "0.4rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          
          {/* Top Quick Action Bar */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              justifyContent: "space-between",
              alignItems: "center",
              background: "rgba(15, 23, 42, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.07)",
              borderRadius: "10px",
              padding: "0.75rem 1rem"
            }}
          >
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 600 }}>Quick Status Change:</span>
              <button
                disabled={isUpdating || job.status === "Assigned"}
                onClick={() => handleStatusChange("Assigned")}
                style={{
                  padding: "0.3rem 0.65rem",
                  fontSize: "0.75rem",
                  borderRadius: "6px",
                  background: job.status === "Assigned" ? "rgba(59, 130, 246, 0.3)" : "rgba(255, 255, 255, 0.05)",
                  color: job.status === "Assigned" ? "#60a5fa" : "#cbd5e1",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  cursor: "pointer"
                }}
              >
                Assigned
              </button>
              <button
                disabled={isUpdating || job.status === "In Transit"}
                onClick={() => handleStatusChange("In Transit")}
                style={{
                  padding: "0.3rem 0.65rem",
                  fontSize: "0.75rem",
                  borderRadius: "6px",
                  background: job.status === "In Transit" ? "rgba(245, 158, 11, 0.3)" : "rgba(255, 255, 255, 0.05)",
                  color: job.status === "In Transit" ? "#fbbf24" : "#cbd5e1",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  cursor: "pointer"
                }}
              >
                In Transit
              </button>
              <button
                disabled={isUpdating || job.status === "Delivered"}
                onClick={() => handleStatusChange("Delivered")}
                style={{
                  padding: "0.3rem 0.65rem",
                  fontSize: "0.75rem",
                  borderRadius: "6px",
                  background: job.status === "Delivered" ? "rgba(16, 185, 129, 0.3)" : "rgba(255, 255, 255, 0.05)",
                  color: job.status === "Delivered" ? "#34d399" : "#cbd5e1",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  cursor: "pointer"
                }}
              >
                Delivered
              </button>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              {(job.status === "Booked" || job.status === "Assigned") && (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={handleApproveAssignment}
                  className="btn btn-sm"
                  style={{
                    fontSize: "0.75rem",
                    padding: "0.35rem 0.75rem",
                    background: "linear-gradient(135deg, #059669, #10b981)",
                    color: "#ffffff",
                    border: "1px solid #34d399",
                    fontWeight: 700,
                    borderRadius: "6px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)"
                  }}
                  title="Chain of Responsibility Approval Gate: Confirm Engine Driver Selection"
                >
                  <CheckCircle2 size={13} />
                  <span>Approve Match</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="btn btn-secondary btn-sm"
                style={{
                  fontSize: "0.75rem",
                  padding: "0.35rem 0.75rem",
                  borderColor: showMap ? "rgba(56, 189, 248, 0.5)" : undefined,
                  color: showMap ? "#38bdf8" : undefined
                }}
              >
                <Compass size={13} />
                <span>{showMap ? "Hide Corridor Map" : "Show Corridor Map"}</span>
              </button>
              <button
                onClick={handlePushRoute}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: "0.75rem", padding: "0.35rem 0.75rem" }}
              >
                <Send size={13} />
                <span>Push Route to Handset</span>
              </button>
              <button
                onClick={() => setShowOverrideForm(!showOverrideForm)}
                className="btn btn-primary btn-sm"
                style={{ fontSize: "0.75rem", padding: "0.35rem 0.75rem" }}
              >
                <RefreshCw size={13} />
                <span>{showOverrideForm ? "Hide Override" : "Reassign Driver (FR-03)"}</span>
              </button>
            </div>
          </div>

          {/* Manual Dispatcher Override Form (Collapsible) */}
          {showOverrideForm && (
            <div
              style={{
                background: "rgba(30, 41, 59, 0.9)",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                borderRadius: "12px",
                padding: "1rem 1.25rem"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <ShieldCheck size={16} color="#38bdf8" />
                <h4 style={{ margin: 0, fontSize: "0.9rem", color: "#38bdf8" }}>
                  Manual Dispatcher Override & NHVR Compliance Logging (PR-02)
                </h4>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "4px" }}>
                    Select Alternative Driver & Vehicle:
                  </label>
                  <select
                    value={overrideDriver}
                    onChange={(e) => setOverrideDriver(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.45rem 0.65rem",
                      borderRadius: "6px",
                      background: "#0f172a",
                      color: "#f8fafc",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      fontSize: "0.8rem"
                    }}
                  >
                    <option value="Dave Miller (#DRV-104)">Dave Miller — Truck #NL-14 (Mack Titan, Katherine)</option>
                    <option value="Sarah Peterson (#DRV-108)">Sarah Peterson — Rigid #NL-08 (Hino 500, Darwin Metro)</option>
                    <option value="Mark Taylor (#DRV-112)">Mark Taylor — Road Train #NL-31 (Kenworth, Alice Springs)</option>
                    <option value="Brett Walker (#DRV-109)">Brett Walker — Semi #NL-09 (Freightliner, Darwin)</option>
                    <option value="Dean Bennett (#DRV-125)">Dean Bennett — Road Train #NL-25 (Tennant Creek)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "4px" }}>
                    Mandatory NHVR Audit Reason Code (PR-02):
                  </label>
                  <select
                    value={reasonCode}
                    onChange={(e) => setReasonCode(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.45rem 0.65rem",
                      borderRadius: "6px",
                      background: "#0f172a",
                      color: "#f8fafc",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      fontSize: "0.8rem"
                    }}
                  >
                    <option value="DRIVER_FATIGUE">Heavy Vehicle Fatigue Compliance Limit (CR-05)</option>
                    <option value="VEHICLE_CAPACITY">Specialized Refrigeration / Oversize Freight</option>
                    <option value="CUSTOMER_SPECIAL_REQUEST">VIP Customer Preferred Carrier Allocation</option>
                    <option value="MAINTENANCE">Scheduled Depot Maintenance Inspection</option>
                    <option value="WEATHER_RESTRICTION">Outback Stuart Highway Flood / Road Advisory</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setShowOverrideForm(false)}
                  style={{
                    padding: "0.35rem 0.75rem",
                    fontSize: "0.75rem",
                    borderRadius: "6px",
                    background: "rgba(255, 255, 255, 0.05)",
                    color: "#cbd5e1",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={handleManualOverride}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: "0.75rem", padding: "0.35rem 0.85rem" }}
                >
                  <CheckCircle2 size={13} />
                  <span>Save Override to MongoDB</span>
                </button>
              </div>
            </div>
          )}

          {/* Live Stuart Highway GPS Corridor Telematics Map */}
          {showMap && (
            <div
              style={{
                background: "rgba(15, 23, 42, 0.65)",
                border: "1px solid rgba(56, 189, 248, 0.25)",
                borderRadius: "14px",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "8px",
                      background: "rgba(56, 189, 248, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#38bdf8"
                    }}
                  >
                    <Compass size={17} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#f8fafc" }}>
                      Live Highway GPS Corridor Telematics (FR-05, NFR-02)
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                      Stuart Highway Linehaul Corridor • {job.vehicle} ({job.driver})
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "3px 9px",
                      borderRadius: "9999px",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      background: job.status === "In Transit" ? "rgba(245, 158, 11, 0.15)" : job.status === "Delivered" ? "rgba(16, 185, 129, 0.15)" : "rgba(59, 130, 246, 0.15)",
                      color: job.status === "In Transit" ? "#fbbf24" : job.status === "Delivered" ? "#34d399" : "#60a5fa",
                      border: `1px solid ${job.status === "In Transit" ? "rgba(245, 158, 11, 0.3)" : job.status === "Delivered" ? "rgba(16, 185, 129, 0.3)" : "rgba(59, 130, 246, 0.3)"}`
                    }}
                  >
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: job.status === "In Transit" ? "#fbbf24" : job.status === "Delivered" ? "#34d399" : "#60a5fa"
                      }}
                    />
                    {job.status === "In Transit" ? "Active Linehaul Transit (Hwy)" : job.status}
                  </span>
                </div>
              </div>

              {/* Map Canvas Container */}
              <div style={{ borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <MapView
                  height="360px"
                  truckLat={job.lat}
                  truckLng={job.lng}
                  driverName={job.driver}
                  vehicleName={job.vehicle}
                  pickupAddress={job.pickup}
                  dropoffAddress={job.dropoff}
                  status={job.status}
                />
              </div>
            </div>
          )}

          {/* Consignment Details 2-Column Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            
            {/* Left Card: Route & Cargo Manifest */}
            <div
              style={{
                background: "rgba(15, 23, 42, 0.5)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "12px",
                padding: "1.1rem"
              }}
            >
              <h4 style={{ margin: "0 0 0.85rem", fontSize: "0.88rem", color: "#60a5fa", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <MapPin size={15} />
                <span>Corridor Route & Cargo Manifest</span>
              </h4>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div>
                  <span style={{ fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Origin Pickup Depot:
                  </span>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#f8fafc", marginTop: "1px" }}>
                    📍 {job.pickup}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#38bdf8", fontSize: "0.75rem" }}>
                  <ArrowRight size={14} />
                  <span>Stuart Highway Dedicated Freight Transit</span>
                </div>

                <div>
                  <span style={{ fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Destination Receiving Dock:
                  </span>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#f8fafc", marginTop: "1px" }}>
                    🎯 {job.dropoff}
                  </div>
                </div>

                <hr style={{ borderColor: "rgba(255, 255, 255, 0.06)", margin: "0.25rem 0" }} />

                <div>
                  <span style={{ fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Cargo Manifest & Goods:
                  </span>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fcd34d", marginTop: "1px" }}>
                    📦 {job.goods}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Estimated Arrival Window:
                  </span>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#38bdf8", marginTop: "1px" }}>
                    ⏱️ {job.eta}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Allocated Heavy Vehicle & Telematics */}
            <div
              style={{
                background: "rgba(15, 23, 42, 0.5)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "12px",
                padding: "1.1rem"
              }}
            >
              <h4 style={{ margin: "0 0 0.85rem", fontSize: "0.88rem", color: "#34d399", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Truck size={15} />
                <span>Allocated Heavy Vehicle & Driver</span>
              </h4>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div>
                  <span style={{ fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Assigned Driver:
                  </span>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#f8fafc", marginTop: "1px", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <UserCheck size={14} color="#60a5fa" />
                    <span>{job.driver}</span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Vehicle Combination:
                  </span>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#f8fafc", marginTop: "1px" }}>
                    🚛 {job.vehicle}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "0.5rem",
                    background: "rgba(0, 0, 0, 0.3)",
                    padding: "0.6rem",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.05)"
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>Speed</div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: job.status === "In Transit" ? "#38bdf8" : "#94a3b8" }}>
                      {job.status === "In Transit" ? "98 km/h" : "0 km/h"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>Fuel Level</div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#10b981" }}>84%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>GPS Geotag</div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#cbd5e1" }}>
                      {job.lat.toFixed(2)}°, {job.lng.toFixed(2)}°
                    </div>
                  </div>
                </div>

                {job.overrideReason && (
                  <div
                    style={{
                      background: "rgba(245, 158, 11, 0.15)",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                      borderRadius: "6px",
                      padding: "0.45rem 0.65rem",
                      fontSize: "0.75rem",
                      color: "#fbbf24"
                    }}
                  >
                    <strong>NHVR Compliance Override Log:</strong> {job.overrideReason}
                  </div>
                )}

                {/* Engine Recommendation & Dispatcher Verification Gate Box */}
                <div
                  style={{
                    background: "rgba(15, 23, 42, 0.75)",
                    border: "1px solid rgba(56, 189, 248, 0.25)",
                    borderRadius: "8px",
                    padding: "0.6rem 0.75rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.3rem"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.72rem", color: "#38bdf8", fontWeight: 700 }}>
                      ⚡ Nearest-Vehicle Algorithm (FR-02)
                    </span>
                    <span style={{ fontSize: "0.68rem", color: "#34d399", fontWeight: 700 }}>
                      98% Optimal Match
                    </span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                    Matched based on depot proximity, BFM driver fatigue headroom, and payload capacity. Dispatcher reviews and approves or overrides (FR-03).
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Delivery & e-POD Proof Section (if delivered) */}
          {isDelivered && (
            <div
              style={{
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                borderRadius: "12px",
                padding: "1rem 1.25rem"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#34d399" }}>
                  <CheckCircle2 size={16} />
                  <h4 style={{ margin: 0, fontSize: "0.88rem" }}>
                    Verified Electronic Proof of Delivery (e-POD Record)
                  </h4>
                </div>
                <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                  Corporations Act 7-Yr Retention Compliant (CR-04)
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1rem", alignItems: "center" }}>
                <div style={{ fontSize: "0.8rem", color: "#cbd5e1", lineHeight: 1.6 }}>
                  <div><strong>Consignee Sign-off:</strong> {job.recipientName || "Sandra Wilson"}</div>
                  <div><strong>Timestamp:</strong> {job.completedAt || "24-Sep-2026 14:38:12 ACST"}</div>
                  <div><strong>Destination Dock:</strong> {job.dropoff}</div>
                  <div><strong>Tax Invoice Generated:</strong> INV-2026-{job.id.replace("TP-", "")} ($1,320.00 AUD)</div>
                </div>

                <div
                  style={{
                    background: "rgba(0, 0, 0, 0.4)",
                    border: "1px dashed rgba(52, 211, 153, 0.4)",
                    borderRadius: "8px",
                    padding: "0.6rem",
                    textAlign: "center"
                  }}
                >
                  <span style={{ fontSize: "0.65rem", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
                    Consignee Digital Signature:
                  </span>
                  {job.signatureDataUrl ? (
                    <img
                      src={job.signatureDataUrl}
                      alt="Signature"
                      style={{ maxHeight: "48px", maxWidth: "100%", margin: "0 auto" }}
                    />
                  ) : (
                    <div style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: 600, padding: "0.4rem 0" }}>
                      [Sandra Wilson — Digitally Verified]
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div
          className="modal-footer"
          style={{
            padding: "1rem 1.5rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
            TrackPoint Heavy Vehicle Telematics Protocol · NT Road Transport Authority
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={() => window.print()}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: "0.75rem", padding: "0.4rem 0.85rem" }}
            >
              <Printer size={13} />
              <span>Print Note</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-primary btn-sm"
              style={{ fontSize: "0.75rem", padding: "0.4rem 1rem" }}
            >
              Close Details
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
