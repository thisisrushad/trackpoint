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

  // Cancellation modal
  const [cancelJob, setCancelJob] = useState<Job | null>(null);
  const [cancelReasonCode, setCancelReasonCode] = useState("WEATHER_ROAD_CLOSURE");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  // Dedicated Approval & Dispatch Allocation Modal
  const [approveModalJob, setApproveModalJob] = useState<Job | null>(null);
  const [approveSelectedDriver, setApproveSelectedDriver] = useState("Dave Miller (#DRV-104)");
  const [approveSelectedVehicle, setApproveSelectedVehicle] = useState("Truck #NL-14 (Mack Titan)");
  const [isSubmittingApprove, setIsSubmittingApprove] = useState(false);

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

  const handleApproveJob = (job: Job) => {
    // Determine suggested driver and vehicle
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

    setApproveModalJob(job);
    setApproveSelectedDriver(initialDriver);
    setApproveSelectedVehicle(initialVehicle);
  };

  const handleConfirmApproveModal = async () => {
    if (!approveModalJob) return;
    setIsSubmittingApprove(true);

    try {
      const res = await fetch(`/api/jobs/${approveModalJob.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Assigned",
          driver: approveSelectedDriver,
          vehicle: approveSelectedVehicle,
          eta: approveModalJob.priority === "Express" ? "13:30 ACST (Express)" : "14:45 ACST"
        })
      });
      const data = await res.json();
      if (data.success && data.job) {
        onJobUpdated(data.job);
        toast.success(
          `Consignment #${approveModalJob.id} confirmed! Assigned to ${approveSelectedDriver} (${approveSelectedVehicle}).`,
          "Allocation Approved & Dispatched (FR-02)"
        );
        setApproveModalJob(null);
      } else {
        toast.error("Failed to approve consignment in database.", "Error");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error", "Approval Failed");
    } finally {
      setIsSubmittingApprove(false);
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

  const handleConfirmCancel = async () => {
    if (!cancelJob) return;
    setIsSubmittingCancel(true);

    try {
      const res = await fetch(`/api/jobs/${cancelJob.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cancel",
          reasonCode: cancelReasonCode
        })
      });
      const data = await res.json();
      if (data.success && data.job) {
        onJobUpdated(data.job);
        toast.info(
          `Consignment #${cancelJob.id} has been CANCELLED. Reason code [${cancelReasonCode}] registered for compliance audit.`,
          "Consignment Cancelled"
        );
        setCancelJob(null);
      } else {
        toast.error("Failed to cancel consignment in database.", "Error");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error", "Cancellation Failed");
    } finally {
      setIsSubmittingCancel(false);
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
          {["ALL", "Booked", "Assigned", "In Transit", "Arrived", "Delivered", "Cancelled"].map((st) => {
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
                  const isArrived = job.status === "Arrived";
                  const isCancelled = job.status === "Cancelled";
                  const isBooked = job.status === "Booked";

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
                            background: isCancelled
                              ? "rgba(239, 68, 68, 0.22)"
                              : isDelivered
                              ? "rgba(16, 185, 129, 0.2)"
                              : isArrived
                              ? "rgba(168, 85, 247, 0.22)"
                              : isTransit
                              ? "rgba(245, 158, 11, 0.2)"
                              : isBooked
                              ? "rgba(249, 115, 22, 0.2)"
                              : "rgba(59, 130, 246, 0.2)",
                            color: isCancelled
                              ? "#fca5a5"
                              : isDelivered
                              ? "#6ee7b7"
                              : isArrived
                              ? "#d8b4fe"
                              : isTransit
                              ? "#fcd34d"
                              : isBooked
                              ? "#fdba74"
                              : "#93c5fd",
                            border: `1px solid ${
                              isCancelled
                                ? "rgba(239, 68, 68, 0.5)"
                                : isDelivered
                                ? "rgba(16, 185, 129, 0.4)"
                                : isArrived
                                ? "rgba(168, 85, 247, 0.45)"
                                : isTransit
                                ? "rgba(245, 158, 11, 0.4)"
                                : isBooked
                                ? "rgba(249, 115, 22, 0.4)"
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
                        <div style={{ display: "inline-flex", gap: "0.25rem", alignItems: "center" }}>
                          {job.status === "Booked" && (
                            <button
                              onClick={() => handleApproveJob(job)}
                              className="btn btn-sm"
                              style={{
                                padding: "0.25rem 0.5rem",
                                fontSize: "0.68rem",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.2rem",
                                background: "linear-gradient(135deg, #059669, #10b981)",
                                color: "#ffffff",
                                border: "1px solid #34d399",
                                fontWeight: 700,
                                borderRadius: "5px"
                              }}
                              title="Approve Suggested Match & Dispatch Linehaul"
                            >
                              <CheckCircle2 size={11} />
                              <span>Approve</span>
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedJobForModal(job)}
                            className="btn btn-secondary btn-sm"
                            style={{
                              padding: "0.25rem 0.45rem",
                              fontSize: "0.68rem",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.2rem",
                              color: isTransit ? "#38bdf8" : "#cbd5e1",
                              borderColor: isTransit ? "rgba(56, 189, 248, 0.4)" : "rgba(255, 255, 255, 0.1)",
                              background: isTransit ? "rgba(56, 189, 248, 0.1)" : "rgba(255, 255, 255, 0.04)",
                              borderRadius: "5px"
                            }}
                            title="Inspect Live Highway Map & Details"
                          >
                            <Navigation size={11} />
                            <span>{isTransit ? "Live" : "Map"}</span>
                          </button>

                          <button
                            onClick={() => setOverrideJob(job)}
                            className="btn btn-secondary btn-sm"
                            style={{
                              padding: "0.25rem 0.45rem",
                              fontSize: "0.68rem",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.2rem",
                              borderRadius: "5px",
                              color: "#cbd5e1"
                            }}
                            title="Manual Dispatcher Reassignment"
                          >
                            <RefreshCw size={11} />
                            <span>Override</span>
                          </button>

                          {job.status !== "Delivered" && job.status !== "Invoiced" && job.status !== "Cancelled" && (
                            <button
                              onClick={() => setCancelJob(job)}
                              className="btn btn-secondary btn-sm"
                              style={{
                                padding: "0.25rem 0.45rem",
                                fontSize: "0.68rem",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.2rem",
                                color: "#f87171",
                                borderColor: "rgba(239, 68, 68, 0.3)",
                                background: "rgba(239, 68, 68, 0.08)",
                                borderRadius: "5px"
                              }}
                              title="Cancel / Reject Consignment"
                            >
                              <X size={11} />
                              <span>Cancel</span>
                            </button>
                          )}

                          <button
                            onClick={() => handlePushRoute(job.id, job.driver)}
                            className="btn btn-primary btn-sm"
                            style={{
                              padding: "0.25rem 0.4rem",
                              fontSize: "0.68rem",
                              display: "inline-flex",
                              alignItems: "center",
                              borderRadius: "5px"
                            }}
                            title="Push Telemetry Route to Handset"
                          >
                            <Send size={11} />
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
        <div
          className="modal-backdrop"
          style={{ zIndex: 10000 }}
          onClick={() => setOverrideJob(null)}
        >
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
            onClick={(e) => e.stopPropagation()}
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

      {/* 5. Cancel Consignment Compliance Reason Modal */}
      {cancelJob && (
        <div
          className="modal-backdrop"
          style={{ zIndex: 10001 }}
          onClick={() => setCancelJob(null)}
        >
          <div
            className="modal-dialog"
            style={{
              maxWidth: "520px",
              background: "#1e293b",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              borderRadius: "12px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.7)",
              color: "#f8fafc"
            }}
            onClick={(e) => e.stopPropagation()}
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
                <ShieldAlert size={18} color="#ef4444" />
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>
                  Cancel Consignment #{cancelJob.id}
                </h3>
              </div>
              <button
                onClick={() => setCancelJob(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: "1.25rem" }}>
              <p style={{ fontSize: "0.82rem", color: "#94a3b8", marginTop: 0, marginBottom: "1rem" }}>
                Cancelling this consignment will withdraw linehaul allocation for customer <strong style={{ color: "#f8fafc" }}>{cancelJob.customer}</strong> and release any assigned assets.
              </p>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#cbd5e1", marginBottom: "4px", fontWeight: 600 }}>
                  Mandatory Cancellation Reason Code (ATO & NHVR Audit):
                </label>
                <select
                  value={cancelReasonCode}
                  onChange={(e) => setCancelReasonCode(e.target.value)}
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
                  <option value="WEATHER_ROAD_CLOSURE">Stuart Highway Flash Flooding / Severe Weather Hazard</option>
                  <option value="CARGO_EXCEEDS_CAPACITY">Cargo Exceeds GVM / Non-Compliant Weight</option>
                  <option value="CUSTOMER_REQUESTED">Customer Direct Cancellation Request</option>
                  <option value="VEHICLE_UNAVAILABLE">Mechanical Breakdown / No Alternative Linehaul Unit</option>
                  <option value="CREDIT_HOLD">Consignee Commercial Account on Credit Hold</option>
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
                onClick={() => setCancelJob(null)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: "0.75rem", padding: "0.4rem 0.85rem" }}
              >
                Keep Active
              </button>
              <button
                type="button"
                disabled={isSubmittingCancel}
                onClick={handleConfirmCancel}
                className="btn btn-sm"
                style={{
                  fontSize: "0.75rem",
                  padding: "0.4rem 1rem",
                  background: "#ef4444",
                  border: "1px solid #dc2626",
                  color: "#ffffff",
                  fontWeight: 700
                }}
              >
                <X size={13} />
                <span>{isSubmittingCancel ? "Cancelling..." : "Confirm Cancellation"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Dedicated Dispatcher Approval & Vehicle/Driver Allocation Modal */}
      {approveModalJob && (
        <div
          className="modal-backdrop"
          style={{ zIndex: 10002 }}
          onClick={() => setApproveModalJob(null)}
        >
          <div
            className="modal-dialog"
            style={{
              maxWidth: "580px",
              background: "linear-gradient(180deg, #1e293b, #0f172a)",
              border: "1px solid rgba(52, 211, 153, 0.4)",
              borderRadius: "14px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.85)",
              color: "#f8fafc"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-header"
              style={{
                padding: "1.1rem 1.35rem",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "rgba(16, 185, 129, 0.2)",
                    color: "#34d399",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700 }}>
                    Approve & Allocate Consignment #{approveModalJob.id}
                  </h3>
                  <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                    Chain of Responsibility Dispatch Approval (FR-01, FR-02)
                  </span>
                </div>
              </div>
              <button
                onClick={() => setApproveModalJob(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: "1.35rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Consignment Specs Summary Card */}
              <div
                style={{
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "10px",
                  padding: "0.85rem 1rem",
                  fontSize: "0.8rem",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.65rem"
                }}
              >
                <div>
                  <span style={{ color: "#94a3b8", display: "block", fontSize: "0.7rem", textTransform: "uppercase" }}>Customer</span>
                  <strong style={{ color: "#f8fafc" }}>{approveModalJob.customer}</strong>
                </div>
                <div>
                  <span style={{ color: "#94a3b8", display: "block", fontSize: "0.7rem", textTransform: "uppercase" }}>Priority</span>
                  <span style={{ color: approveModalJob.priority === "Express" ? "#f87171" : "#38bdf8", fontWeight: 700 }}>
                    {approveModalJob.priority} Linehaul
                  </span>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <span style={{ color: "#94a3b8", display: "block", fontSize: "0.7rem", textTransform: "uppercase" }}>Cargo / Goods</span>
                  <span style={{ color: "#cbd5e1" }}>📦 {approveModalJob.goods}</span>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <span style={{ color: "#94a3b8", display: "block", fontSize: "0.7rem", textTransform: "uppercase" }}>Freight Corridor</span>
                  <span style={{ color: "#93c5fd" }}>📍 {approveModalJob.pickup.split('(')[0]} → {approveModalJob.dropoff.split('(')[0]}</span>
                </div>
              </div>

              {/* Algorithm Recommendation Banner */}
              <div
                style={{
                  background: "rgba(56, 189, 248, 0.08)",
                  border: "1px solid rgba(56, 189, 248, 0.25)",
                  borderRadius: "8px",
                  padding: "0.75rem 0.9rem",
                  fontSize: "0.78rem",
                  color: "#e2e8f0"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#38bdf8", fontWeight: 700, marginBottom: "3px" }}>
                  <Zap size={14} />
                  <span>Algorithm Nearest-Depot Match (Suggested):</span>
                </div>
                <div style={{ fontSize: "0.82rem", color: "#f8fafc" }}>
                  {approveModalJob.vehicle.replace("Suggested: ", "")}
                </div>
              </div>

              {/* Driver & Vehicle Selection Dropdown */}
              <div>
                <label style={{ display: "block", fontSize: "0.76rem", color: "#cbd5e1", marginBottom: "5px", fontWeight: 600 }}>
                  Dispatcher Allocation (Confirm or Select Different Driver/Unit):
                </label>
                <select
                  value={approveSelectedDriver}
                  onChange={(e) => {
                    const drv = e.target.value;
                    setApproveSelectedDriver(drv);
                    if (drv.includes("Liam Chen")) setApproveSelectedVehicle("Van #NL-01 (HiAce Courier)");
                    else if (drv.includes("Dave Miller")) setApproveSelectedVehicle("Truck #NL-14 (Mack Titan)");
                    else if (drv.includes("Sarah Peterson")) setApproveSelectedVehicle("Rigid #NL-08 (Hino 500)");
                    else if (drv.includes("Samira Patel")) setApproveSelectedVehicle("Rigid #NL-06 (Fuso Fighter)");
                    else if (drv.includes("Wayne Campbell")) setApproveSelectedVehicle("Semi #NL-11 (Volvo FM)");
                    else if (drv.includes("Brett Walker")) setApproveSelectedVehicle("Semi #NL-09 (Freightliner)");
                    else if (drv.includes("Mark Taylor")) setApproveSelectedVehicle("Road Train #NL-31 (Kenworth T909)");
                    else if (drv.includes("Ian Stewart")) setApproveSelectedVehicle("Road Train #NL-29 (Kenworth C509)");
                  }}
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.85rem",
                    borderRadius: "8px",
                    background: "#0f172a",
                    color: "#f8fafc",
                    border: "1px solid rgba(56, 189, 248, 0.4)",
                    fontSize: "0.85rem",
                    fontWeight: 600
                  }}
                >
                  <option value="Liam Chen (#DRV-101)">Liam Chen (#DRV-101) — Van #NL-01 (HiAce Courier, Darwin Metro)</option>
                  <option value="Dave Miller (#DRV-104)">Dave Miller (#DRV-104) — Truck #NL-14 (Mack Titan, Katherine)</option>
                  <option value="Sarah Peterson (#DRV-108)">Sarah Peterson (#DRV-108) — Rigid #NL-08 (Hino 500, Darwin Metro)</option>
                  <option value="Samira Patel (#DRV-106)">Samira Patel (#DRV-106) — Rigid #NL-06 (Fuso Fighter, Darwin Metro)</option>
                  <option value="Wayne Campbell (#DRV-111)">Wayne Campbell (#DRV-111) — Semi #NL-11 (Volvo FM, Katherine Depot)</option>
                  <option value="Brett Walker (#DRV-109)">Brett Walker (#DRV-109) — Semi #NL-09 (Freightliner, Darwin Metro)</option>
                  <option value="Mark Taylor (#DRV-112)">Mark Taylor (#DRV-112) — Road Train #NL-31 (Kenworth T909, Alice Springs)</option>
                  <option value="Ian Stewart (#DRV-129)">Ian Stewart (#DRV-129) — Road Train #NL-29 (Kenworth C509, Alice Springs)</option>
                </select>
              </div>

              {/* Confirm Allocated Vehicle readout */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0.75rem", background: "rgba(255, 255, 255, 0.03)", borderRadius: "6px", fontSize: "0.75rem" }}>
                <span style={{ color: "#94a3b8" }}>Target Heavy Unit:</span>
                <strong style={{ color: "#38bdf8" }}>{approveSelectedVehicle}</strong>
              </div>
            </div>

            <div
              className="modal-footer"
              style={{
                padding: "0.9rem 1.35rem",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.6rem"
              }}
            >
              <button
                type="button"
                onClick={() => setApproveModalJob(null)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: "0.78rem", padding: "0.45rem 0.95rem" }}
              >
                Review Later
              </button>
              <button
                type="button"
                disabled={isSubmittingApprove}
                onClick={handleConfirmApproveModal}
                className="btn btn-sm"
                style={{
                  fontSize: "0.78rem",
                  padding: "0.45rem 1.15rem",
                  background: "linear-gradient(135deg, #059669, #10b981)",
                  border: "1px solid #34d399",
                  color: "#ffffff",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  boxShadow: "0 2px 10px rgba(16, 185, 129, 0.35)"
                }}
              >
                <CheckCircle2 size={14} />
                <span>{isSubmittingApprove ? "Allocating..." : "Confirm Allocation & Dispatch"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
