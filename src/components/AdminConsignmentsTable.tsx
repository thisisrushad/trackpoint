"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Job, Vehicle } from "@/lib/data";
import { useToast } from "@/context/ToastContext";
import AdminConsignmentModal from "./AdminConsignmentModal";
import Pagination from "./Pagination";
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  Truck,
  UserCheck,
  CheckCircle2,
  Clock,
  Eye,
  RefreshCw,
  Send,
  Zap,
  Package,
  Layers,
  Activity,
  AlertCircle,
  ShieldAlert,
  Navigation,
  X
} from "lucide-react";

interface AdminConsignmentsTableProps {
  jobs: Job[];
  fleet: Vehicle[];
  onJobUpdated: (updatedJob: Job) => void;
  initialCustomerFilter?: string;
}

export default function AdminConsignmentsTable({
  jobs,
  fleet,
  onJobUpdated,
  initialCustomerFilter
}: AdminConsignmentsTableProps) {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState(initialCustomerFilter || "");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [corridorFilter, setCorridorFilter] = useState<string>("ALL");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Inspection modal
  const [selectedJobForModal, setSelectedJobForModal] = useState<Job | null>(null);

  // Quick Reassignment modal
  const [overrideJob, setOverrideJob] = useState<Job | null>(null);
  const [overrideDriver, setOverrideDriver] = useState("Dave Miller (#DRV-104)");
  const [reasonCode, setReasonCode] = useState("DRIVER_FATIGUE");
  const [isSubmittingOverride, setIsSubmittingOverride] = useState(false);

  // KPI Calculations
  const stats = useMemo(() => {
    const total = jobs.length;
    const inTransit = jobs.filter((j) => j.status === "In Transit").length;
    const assigned = jobs.filter((j) => j.status === "Assigned" || j.status === "Booked").length;
    const delivered = jobs.filter((j) => j.status === "Delivered").length;
    const express = jobs.filter((j) => j.priority === "Express").length;
    return { total, inTransit, assigned, delivered, express };
  }, [jobs]);

  // Filtering Logic
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        j.id.toLowerCase().includes(q) ||
        j.customer.toLowerCase().includes(q) ||
        j.goods.toLowerCase().includes(q) ||
        j.driver.toLowerCase().includes(q) ||
        j.dropoff.toLowerCase().includes(q) ||
        j.pickup.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "ALL" || j.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesPriority =
        priorityFilter === "ALL" || j.priority.toLowerCase() === priorityFilter.toLowerCase();

      const matchesCorridor =
        corridorFilter === "ALL" ||
        (corridorFilter === "darwin" && (j.pickup.toLowerCase().includes("darwin") || j.dropoff.toLowerCase().includes("darwin"))) ||
        (corridorFilter === "katherine" && (j.pickup.toLowerCase().includes("katherine") || j.dropoff.toLowerCase().includes("katherine"))) ||
        (corridorFilter === "alice" && (j.pickup.toLowerCase().includes("alice") || j.dropoff.toLowerCase().includes("alice"))) ||
        (corridorFilter === "tennant" && (j.pickup.toLowerCase().includes("tennant") || j.dropoff.toLowerCase().includes("tennant")));

      return matchesSearch && matchesStatus && matchesPriority && matchesCorridor;
    });
  }, [jobs, searchQuery, statusFilter, priorityFilter, corridorFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, priorityFilter, corridorFilter]);

  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredJobs.slice(start, start + pageSize);
  }, [filteredJobs, currentPage, pageSize]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setPriorityFilter("ALL");
    setCorridorFilter("ALL");
    setCurrentPage(1);
    toast.info("Consignment search filters reset to default.", "Filters Cleared");
  };

  const handlePushRoute = (jobId: string, driverName: string) => {
    toast.info(`Consignment #${jobId} route map sent to handset of ${driverName}.`, "Route Pushed");
  };

  const handleApproveJob = async (job: Job) => {
    // Parse recommended vehicle/driver if available
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
        onJobUpdated(data.job);
        toast.success(
          `Consignment #${job.id} approved by Dispatcher! Allocated to ${targetVehicle} (${targetDriver}).`,
          "Booking Approved & Dispatched"
        );
      } else {
        toast.error("Failed to approve consignment in database.", "Error");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error", "Approval Failed");
    }
  };

  const handleConfirmOverride = async () => {
    if (!overrideJob) return;
    setIsSubmittingOverride(true);

    try {
      const res = await fetch(`/api/jobs/${overrideJob.id}`, {
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
          `Consignment #${overrideJob.id} reallocated to ${overrideDriver}. Compliance Reason [${reasonCode}] saved to MongoDB Atlas.`,
          "Driver Reallocated (FR-03)"
        );
        setOverrideJob(null);
      } else {
        toast.error("Failed to update database record. Please try again.", "Error");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error", "Override Failed");
    } finally {
      setIsSubmittingOverride(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      
      {/* 1. Single-Row KPI Summary Metrics Strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem"
        }}
      >
        <div
          className="glass-card"
          style={{
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.85rem",
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8))",
            border: "1px solid rgba(56, 189, 248, 0.2)"
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "rgba(56, 189, 248, 0.15)",
              color: "#38bdf8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Package size={22} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>
              Total Consignments
            </div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f8fafc" }}>
              {stats.total}
            </div>
          </div>
        </div>

        <div
          className="glass-card"
          style={{
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.85rem",
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8))",
            border: "1px solid rgba(245, 158, 11, 0.2)"
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "rgba(245, 158, 11, 0.15)",
              color: "#fbbf24",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Truck size={22} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>
              In Transit (Hwy)
            </div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fbbf24" }}>
              {stats.inTransit}
            </div>
          </div>
        </div>

        <div
          className="glass-card"
          style={{
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.85rem",
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8))",
            border: "1px solid rgba(59, 130, 246, 0.2)"
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "rgba(59, 130, 246, 0.15)",
              color: "#60a5fa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>
              Assigned / Staging
            </div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#60a5fa" }}>
              {stats.assigned}
            </div>
          </div>
        </div>

        <div
          className="glass-card"
          style={{
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.85rem",
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8))",
            border: "1px solid rgba(16, 185, 129, 0.2)"
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "rgba(16, 185, 129, 0.15)",
              color: "#34d399",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>
              Delivered (e-POD)
            </div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#34d399" }}>
              {stats.delivered}
            </div>
          </div>
        </div>

        <div
          className="glass-card"
          style={{
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.85rem",
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8))",
            border: "1px solid rgba(239, 68, 68, 0.2)"
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "rgba(239, 68, 68, 0.15)",
              color: "#f87171",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Zap size={22} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>
              Express Priority
            </div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f87171" }}>
              {stats.express}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filter & Multi-Dimensional Search Toolbar */}
      <div
        className="glass-card"
        style={{
          padding: "1rem 1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.85rem"
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", justifyContent: "space-between" }}>
          
          {/* Search Bar */}
          <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
            <Search
              size={16}
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
            />
            <input
              type="text"
              placeholder="Search by Job #, Client, Driver, Route, Cargo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "0.55rem 0.75rem 0.55rem 2.25rem",
                borderRadius: "8px",
                background: "rgba(15, 23, 42, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#f8fafc",
                fontSize: "0.85rem"
              }}
            />
          </div>

          {/* Corridor Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Corridor:</span>
            <select
              value={corridorFilter}
              onChange={(e) => setCorridorFilter(e.target.value)}
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: "8px",
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#f8fafc",
                fontSize: "0.8rem"
              }}
            >
              <option value="ALL">All NT Corridors</option>
              <option value="darwin">Darwin Metro & Port Hub</option>
              <option value="katherine">Katherine Regional Corridor</option>
              <option value="tennant">Tennant Creek Cross-Corridor</option>
              <option value="alice">Alice Springs South Terminal</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: "8px",
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#f8fafc",
                fontSize: "0.8rem"
              }}
            >
              <option value="ALL">All Priorities</option>
              <option value="Express">⚡ Express Priority</option>
              <option value="Standard">Standard Linehaul</option>
            </select>
          </div>

          {(searchQuery || statusFilter !== "ALL" || priorityFilter !== "ALL" || corridorFilter !== "ALL") && (
            <button
              onClick={handleResetFilters}
              className="btn btn-secondary btn-sm"
              style={{ padding: "0.45rem 0.75rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.3rem" }}
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}

        </div>

        {/* Status Pill Tabs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
          {["ALL", "Assigned", "In Transit", "Delivered"].map((st) => {
            const isActive = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: "0.35rem 0.85rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  borderRadius: "999px",
                  background: isActive ? "rgba(56, 189, 248, 0.2)" : "rgba(255, 255, 255, 0.05)",
                  color: isActive ? "#38bdf8" : "#94a3b8",
                  border: `1px solid ${isActive ? "rgba(56, 189, 248, 0.4)" : "rgba(255, 255, 255, 0.08)"}`,
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                {st === "ALL" ? `All Statuses (${jobs.length})` : st}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Comprehensive Data Table */}
      <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "1rem 1.25rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Layers size={18} color="#38bdf8" />
            <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>
              Active Consignments & Dispatch Control Queue
            </h3>
          </div>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
            Showing <strong>{filteredJobs.length}</strong> of {jobs.length} Consignments
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "rgba(15, 23, 42, 0.7)", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#94a3b8", textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: "0.05em" }}>
                <th style={{ padding: "0.85rem 1rem" }}>Consignment #</th>
                <th style={{ padding: "0.85rem 1rem" }}>Client & Cargo</th>
                <th style={{ padding: "0.85rem 1rem" }}>Corridor Route</th>
                <th style={{ padding: "0.85rem 1rem" }}>Allocated Driver & Truck</th>
                <th style={{ padding: "0.85rem 1rem" }}>Status</th>
                <th style={{ padding: "0.85rem 1rem" }}>ETA Window</th>
                <th style={{ padding: "0.85rem 1rem", textAlign: "right" }}>Dispatcher Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "3rem 1rem", textAlign: "center", color: "#94a3b8" }}>
                    <AlertCircle size={32} style={{ margin: "0 auto 0.5rem", opacity: 0.5 }} />
                    <p style={{ margin: 0 }}>No consignments match your current search criteria.</p>
                  </td>
                </tr>
              ) : (
                paginatedJobs.map((job) => {
                  const isDelivered = job.status === "Delivered";
                  const isTransit = job.status === "In Transit";

                  return (
                    <tr
                      key={job.id}
                      style={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                        transition: "background 0.15s ease"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Consignment ID + Priority */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle" }}>
                        <div style={{ fontWeight: 800, color: "#38bdf8", fontSize: "0.85rem" }}>
                          {job.id}
                        </div>
                        <span
                          style={{
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            padding: "0.15rem 0.45rem",
                            borderRadius: "4px",
                            background: job.priority === "Express" ? "rgba(239, 68, 68, 0.2)" : "rgba(59, 130, 246, 0.15)",
                            color: job.priority === "Express" ? "#fca5a5" : "#93c5fd",
                            marginTop: "2px",
                            display: "inline-block"
                          }}
                        >
                          {job.priority}
                        </span>
                      </td>

                      {/* Client & Cargo */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle", maxWidth: "220px" }}>
                        <div style={{ fontWeight: 700, color: "#f8fafc" }}>
                          {job.customer}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#94a3b8", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                          📦 {job.goods}
                        </div>
                      </td>

                      {/* Corridor Route */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle", maxWidth: "240px" }}>
                        <div style={{ fontSize: "0.78rem", color: "#cbd5e1" }}>
                          📍 {job.pickup.split('(')[0]}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#60a5fa", marginTop: "1px" }}>
                          → {job.dropoff.split('(')[0]}
                        </div>
                      </td>

                      {/* Allocated Driver & Truck */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle" }}>
                        <div style={{ fontWeight: 600, color: "#f8fafc", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <UserCheck size={13} color="#60a5fa" />
                          <span>{job.driver}</span>
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "1px" }}>
                          🚛 {job.vehicle}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle" }}>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            padding: "0.2rem 0.6rem",
                            borderRadius: "999px",
                            background: isDelivered
                              ? "rgba(16, 185, 129, 0.2)"
                              : isTransit
                              ? "rgba(245, 158, 11, 0.2)"
                              : "rgba(59, 130, 246, 0.2)",
                            color: isDelivered ? "#6ee7b7" : isTransit ? "#fcd34d" : "#93c5fd",
                            border: `1px solid ${
                              isDelivered
                                ? "rgba(16, 185, 129, 0.4)"
                                : isTransit
                                ? "rgba(245, 158, 11, 0.4)"
                                : "rgba(59, 130, 246, 0.4)"
                            }`
                          }}
                        >
                          {job.status}
                        </span>
                      </td>

                      {/* ETA */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle", fontSize: "0.75rem", color: "#cbd5e1" }}>
                        ⏱️ {job.eta}
                      </td>

                      {/* Action Buttons */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle", textAlign: "right" }}>
                          {job.status === "Booked" && (
                            <button
                              onClick={() => handleApproveJob(job)}
                              className="btn btn-sm"
                              style={{
                                padding: "0.3rem 0.65rem",
                                fontSize: "0.72rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.25rem",
                                background: "linear-gradient(135deg, #059669, #10b981)",
                                color: "#ffffff",
                                border: "1px solid #34d399",
                                fontWeight: 700
                              }}
                              title="Approve Suggested Match & Dispatch Linehaul"
                            >
                              <CheckCircle2 size={12} />
                              <span>Approve</span>
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedJobForModal(job)}
                            className="btn btn-secondary btn-sm"
                            style={{
                              padding: "0.3rem 0.6rem",
                              fontSize: "0.72rem",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              color: isTransit ? "#38bdf8" : undefined,
                              borderColor: isTransit ? "rgba(56, 189, 248, 0.4)" : undefined,
                              background: isTransit ? "rgba(56, 189, 248, 0.1)" : undefined
                            }}
                            title="Inspect Live Highway Map & Details"
                          >
                            <Navigation size={12} />
                            <span>{isTransit ? "Track Live" : "View Map"}</span>
                          </button>

                          <button
                            onClick={() => setOverrideJob(job)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: "0.3rem 0.6rem", fontSize: "0.72rem", display: "flex", alignItems: "center", gap: "0.25rem" }}
                            title="Manual Dispatcher Reassignment"
                          >
                            <RefreshCw size={12} />
                            <span>Override</span>
                          </button>

                          <button
                            onClick={() => handlePushRoute(job.id, job.driver)}
                            className="btn btn-primary btn-sm"
                            style={{ padding: "0.3rem 0.6rem", fontSize: "0.72rem", display: "flex", alignItems: "center", gap: "0.25rem" }}
                            title="Push Telemetry Route to Handset"
                          >
                            <Send size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Master Consignments Pagination Controls */}
        <div style={{ padding: "0.5rem 1rem" }}>
          <Pagination
            currentPage={currentPage}
            totalItems={filteredJobs.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[5, 8, 15, 25]}
            labelSingular="consignment"
            labelPlural="consignments"
          />
        </div>
      </div>

      {/* Consignment Full Details Modal */}
      {selectedJobForModal && (
        <AdminConsignmentModal
          job={selectedJobForModal}
          onClose={() => setSelectedJobForModal(null)}
          onJobUpdated={(updated) => {
            onJobUpdated(updated);
            setSelectedJobForModal(updated);
          }}
        />
      )}

      {/* Quick Dispatcher Reassignment Modal */}
      {overrideJob && (
        <div className="modal-backdrop" style={{ zIndex: 10000 }}>
          <div
            className="modal-dialog"
            style={{
              maxWidth: "520px",
              background: "linear-gradient(180deg, #1e293b, #0f172a)",
              border: "1px solid rgba(56, 189, 248, 0.4)",
              borderRadius: "14px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.8)",
              color: "#f8fafc"
            }}
          >
            <div
              className="modal-header"
              style={{
                padding: "1rem 1.25rem",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ShieldAlert size={18} color="#38bdf8" />
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>
                  Manual Dispatcher Override (FR-03)
                </h3>
              </div>
              <button
                onClick={() => setOverrideJob(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer"
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: "1.25rem" }}>
              <p style={{ fontSize: "0.82rem", color: "#94a3b8", marginTop: 0, marginBottom: "1rem" }}>
                Reassigning automated driver allocation for Consignment <strong style={{ color: "#38bdf8" }}>#{overrideJob.id}</strong> ({overrideJob.customer}).
              </p>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#cbd5e1", marginBottom: "4px", fontWeight: 600 }}>
                  Select Alternative Driver & Vehicle:
                </label>
                <select
                  value={overrideDriver}
                  onChange={(e) => setOverrideDriver(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "6px",
                    background: "#0f172a",
                    color: "#f8fafc",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    fontSize: "0.82rem"
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
                <label style={{ display: "block", fontSize: "0.75rem", color: "#cbd5e1", marginBottom: "4px", fontWeight: 600 }}>
                  Mandatory NHVR Audit Reason Code (PR-02):
                </label>
                <select
                  value={reasonCode}
                  onChange={(e) => setReasonCode(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "6px",
                    background: "#0f172a",
                    color: "#f8fafc",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    fontSize: "0.82rem"
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

            <div
              className="modal-footer"
              style={{
                padding: "0.85rem 1.25rem",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.5rem"
              }}
            >
              <button
                type="button"
                onClick={() => setOverrideJob(null)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: "0.75rem", padding: "0.4rem 0.85rem" }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingOverride}
                onClick={handleConfirmOverride}
                className="btn btn-primary btn-sm"
                style={{ fontSize: "0.75rem", padding: "0.4rem 1rem" }}
              >
                <CheckCircle2 size={13} />
                <span>Confirm & Update DB</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
