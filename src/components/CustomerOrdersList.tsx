"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Job, NORTHLINE_SERVICES, LogisticsServiceItem } from "@/lib/data";
import {
  PlusCircle,
  MapPin,
  Send,
  CheckCircle,
  Clock,
  Eye,
  PackageCheck,
  Truck,
  X,
  Search,
  SlidersHorizontal,
  ArrowRight,
  Zap,
  RotateCcw,
  Boxes,
  Layers,
  Activity,
  Filter,
  Snowflake,
  ShieldAlert,
  Anchor,
  Compass,
  Sparkles,
  Info
} from "lucide-react";
import Pagination from "./Pagination";
import { useToast } from "@/context/ToastContext";

interface CustomerOrdersListProps {
  jobs: Job[];
  onNewBooking: (newJob: Job) => void;
  onSelectJobForInvoice?: (job: Job) => void;
}

// Helper to determine freight category from goods description
function getFreightCategory(goods: string): string {
  const g = goods.toLowerCase();
  if (g.includes("mining") || g.includes("pump") || g.includes("drilling") || g.includes("valve")) return "Mining & Heavy Equipment";
  if (g.includes("timber") || g.includes("mesh") || g.includes("reinforcing") || g.includes("hardware")) return "Timber & Construction";
  if (g.includes("cattle") || g.includes("stock") || g.includes("fencing") || g.includes("pastoral")) return "Agriculture & Livestock";
  if (g.includes("mango") || g.includes("produce") || g.includes("chilled") || g.includes("food") || g.includes("groceries")) return "Cold-Chain & Food Produce";
  if (g.includes("vaccine") || g.includes("medical") || g.includes("hospital") || g.includes("health")) return "Medical & Pharmaceuticals";
  if (g.includes("marine") || g.includes("vessel") || g.includes("propulsion") || g.includes("naval")) return "Marine & Defence Parts";
  return "General & Dry Freight";
}

// Helper to determine fleet type from vehicle string
function getFleetType(vehicle: string): string {
  const v = vehicle.toLowerCase();
  if (v.includes("road train")) return "Road Train";
  if (v.includes("semi") || v.includes("titan") || v.includes("anthem") || v.includes("volvo") || v.includes("mack")) return "Semi-Trailer";
  if (v.includes("rigid") || v.includes("hino") || v.includes("fuso") || v.includes("isuzu")) return "Rigid Truck";
  if (v.includes("van") || v.includes("courier") || v.includes("hiace") || v.includes("sprinter")) return "Courier Van";
  return "Heavy Vehicle";
}

export default function CustomerOrdersList({
  jobs,
  onNewBooking,
  onSelectJobForInvoice
}: CustomerOrdersListProps) {
  const router = useRouter();
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showServicesCatalog, setShowServicesCatalog] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("scheduled-linehaul");

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusTab, setStatusTab] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [fleetTypeFilter, setFleetTypeFilter] = useState("ALL");
  const [corridorFilter, setCorridorFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Form State
  const [customer, setCustomer] = useState("Katherine Mining Supplies Ltd");
  const [pickup, setPickup] = useState("Darwin Depot (120 Berrimah Rd, Darwin)");
  const [dropoff, setDropoff] = useState("Katherine Store (Katherine Terrace)");
  const [goods, setGoods] = useState("6x Palletized Industrial Hardware & Supplies (4.5t)");
  const [priority, setPriority] = useState<"Standard" | "Express">("Standard");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Statistics calculation
  const totalCount = jobs.length;
  const inTransitCount = jobs.filter((j) => j.status === "In Transit").length;
  const assignedCount = jobs.filter((j) => j.status === "Assigned").length;
  const deliveredCount = jobs.filter((j) => j.status === "Delivered" || j.status === "Invoiced").length;
  const expressCount = jobs.filter((j) => j.priority === "Express").length;

  const handleSelectServiceToBook = (service: LogisticsServiceItem) => {
    setSelectedServiceId(service.id);
    setGoods(service.defaultGoods);
    setPickup(service.defaultPickup);
    setDropoff(service.defaultDropoff);
    setPriority(service.defaultPriority);
    setIsModalOpen(true);
  };

  const handleServiceTabChangeInModal = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const matched = NORTHLINE_SERVICES.find((s) => s.id === serviceId);
    if (matched) {
      setGoods(matched.defaultGoods);
      setPickup(matched.defaultPickup);
      setDropoff(matched.defaultDropoff);
      setPriority(matched.defaultPriority);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer, pickup, dropoff, goods, priority })
      });
      const data = await res.json();
      if (data.success && data.job) {
        onNewBooking(data.job);
        setIsModalOpen(false);
        toast.info(
          `Consignment #${data.job.id} registered! Our operations center is reviewing and allocating the linehaul unit.`,
          "Booking Submitted (Pending Admin Approval)"
        );
        router.push(`/customer/orders/${data.job.id}`);
      } else {
        toast.error("Failed to create booking. Please check inputs.", "Error");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error", "Booking Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFilterActive =
    searchQuery !== "" ||
    statusTab !== "ALL" ||
    categoryFilter !== "ALL" ||
    fleetTypeFilter !== "ALL" ||
    corridorFilter !== "ALL" ||
    priorityFilter !== "ALL";

  const resetAllFilters = () => {
    setSearchQuery("");
    setStatusTab("ALL");
    setCategoryFilter("ALL");
    setFleetTypeFilter("ALL");
    setCorridorFilter("ALL");
    setPriorityFilter("ALL");
  };

  // Filtered orders list
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      // Search
      const search = searchQuery.toLowerCase();
      const matchesSearch =
        search === "" ||
        j.id.toLowerCase().includes(search) ||
        j.customer.toLowerCase().includes(search) ||
        j.goods.toLowerCase().includes(search) ||
        j.pickup.toLowerCase().includes(search) ||
        j.dropoff.toLowerCase().includes(search) ||
        j.vehicle.toLowerCase().includes(search) ||
        j.driver.toLowerCase().includes(search);

      // Status Tab
      const matchesStatus =
        statusTab === "ALL" ||
        (statusTab === "EXPRESS" && j.priority === "Express") ||
        j.status.toUpperCase() === statusTab.toUpperCase();

      // Freight Category Filter
      const cat = getFreightCategory(j.goods);
      const matchesCategory =
        categoryFilter === "ALL" || cat.toLowerCase() === categoryFilter.toLowerCase();

      // Fleet Type Filter
      const fleet = getFleetType(j.vehicle);
      const matchesFleet =
        fleetTypeFilter === "ALL" || fleet.toLowerCase() === fleetTypeFilter.toLowerCase();

      // Route Corridor Filter
      const matchesCorridor =
        corridorFilter === "ALL" ||
        (corridorFilter === "DARWIN_KATHERINE" &&
          (j.pickup.includes("Darwin") || j.dropoff.includes("Katherine"))) ||
        (corridorFilter === "KATHERINE_TENNANT" &&
          (j.pickup.includes("Katherine") || j.dropoff.includes("Tennant"))) ||
        (corridorFilter === "TENNANT_ALICE" &&
          (j.pickup.includes("Tennant") || j.dropoff.includes("Alice"))) ||
        (corridorFilter === "DARWIN_METRO" &&
          j.pickup.includes("Darwin") && j.dropoff.includes("Darwin"));

      // Priority Filter
      const matchesPriority =
        priorityFilter === "ALL" || j.priority.toUpperCase() === priorityFilter.toUpperCase();

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory &&
        matchesFleet &&
        matchesCorridor &&
        matchesPriority
      );
    });
  }, [jobs, searchQuery, statusTab, categoryFilter, fleetTypeFilter, corridorFilter, priorityFilter]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusTab, categoryFilter, fleetTypeFilter, corridorFilter, priorityFilter]);

  // Paginated slice
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredJobs.slice(start, start + pageSize);
  }, [filteredJobs, currentPage, pageSize]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* 4 KPI Overview Metric Cards in Single Row */}
      <div className="metrics-grid">
        
        <div className="metric-card">
          <div className="metric-icon icon-primary">
            <PackageCheck size={22} />
          </div>
          <div className="metric-content">
            <div className="metric-label">Total Consignments</div>
            <div className="metric-value">{totalCount}</div>
            <div className="metric-sub text-muted">All active & past commercial orders</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon icon-accent">
            <Truck size={22} />
          </div>
          <div className="metric-content">
            <div className="metric-label">Active In-Transit</div>
            <div className="metric-value" style={{ color: "#38bdf8" }}>{inTransitCount}</div>
            <div className="metric-sub text-accent">Real-time Stuart Hwy GPS active</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon icon-success">
            <CheckCircle size={22} />
          </div>
          <div className="metric-content">
            <div className="metric-label">Delivered & Invoiced</div>
            <div className="metric-value" style={{ color: "#10b981" }}>{deliveredCount}</div>
            <div className="metric-sub text-success">e-POD signed & archived</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon icon-warning">
            <Zap size={22} />
          </div>
          <div className="metric-content">
            <div className="metric-label">Express Priority</div>
            <div className="metric-value" style={{ color: "#f59e0b" }}>{expressCount}</div>
            <div className="metric-sub text-warning">Same-day Stuart Hwy dispatch</div>
          </div>
        </div>

      </div>

      {/* ================= LOGISTICS SERVICES EXPLORATION SUITE ================= */}
      <div
        className="glass-card"
        style={{
          padding: "1.25rem 1.5rem",
          background: "linear-gradient(135deg, rgba(17, 29, 51, 0.9), rgba(15, 23, 42, 0.95))",
          borderColor: "rgba(56, 189, 248, 0.25)"
        }}
      >
        <div className="flex-between" style={{ flexWrap: "wrap", gap: "0.75rem", marginBottom: showServicesCatalog ? "1.25rem" : "0" }}>
          <div className="flex-align">
            <div className="header-icon icon-accent" style={{ width: "38px", height: "38px" }}>
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#f8fafc" }}>
                NorthLine Logistics Service Offerings & Capabilities
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                Select from 6 specialized freight services across the Northern Territory linehaul corridor
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.65rem", alignItems: "center" }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowServicesCatalog(!showServicesCatalog)}
              style={{ fontSize: "0.8rem", padding: "0.45rem 0.95rem" }}
            >
              <span>{showServicesCatalog ? "Hide Services Catalog" : "Explore All 6 Services"}</span>
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setSelectedServiceId("scheduled-linehaul");
                setIsModalOpen(true);
              }}
              style={{ fontSize: "0.8rem", padding: "0.45rem 1rem", boxShadow: "0 2px 10px rgba(37, 99, 235, 0.4)" }}
            >
              <PlusCircle size={15} />
              <span>Book Any Service</span>
            </button>
          </div>
        </div>

        {/* Expandable Services Grid */}
        {showServicesCatalog && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginTop: "1rem", borderTop: "1px solid var(--border-color)", paddingTop: "1.25rem" }}>
            {NORTHLINE_SERVICES.map((srv) => (
              <div
                key={srv.id}
                style={{
                  background: "rgba(15, 23, 42, 0.75)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "10px",
                  padding: "1.1rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "transform 0.2s, border-color 0.2s",
                  cursor: "pointer"
                }}
                onClick={() => handleSelectServiceToBook(srv)}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.4)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-color)")}
              >
                <div>
                  <div className="flex-between" style={{ marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "1.5rem" }}>{srv.icon}</span>
                    <span className="tag tag-blue" style={{ fontSize: "0.7rem", fontWeight: 700 }}>
                      {srv.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "0.98rem", fontWeight: 800, color: "#f8fafc", marginBottom: "0.35rem" }}>
                    {srv.title}
                  </h3>

                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.4, marginBottom: "0.75rem" }}>
                    {srv.description}
                  </p>

                  <div style={{ fontSize: "0.72rem", color: "#38bdf8", background: "rgba(56, 189, 248, 0.08)", padding: "0.4rem 0.6rem", borderRadius: "6px", marginBottom: "0.75rem" }}>
                    <strong>Ideal for:</strong> {srv.idealFor}
                  </div>
                </div>

                <div className="flex-between" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.75rem" }}>
                  <div>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Lead Time</div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#10b981" }}>{srv.leadTime}</div>
                  </div>

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectServiceToBook(srv);
                    }}
                    style={{ fontSize: "0.75rem", padding: "0.35rem 0.8rem", display: "inline-flex", gap: "0.25rem", alignItems: "center" }}
                  >
                    <span>Book Service</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Consignments & Orders Table Card */}
      <div className="glass-card" style={{ padding: "1.5rem" }}>
        
        {/* Top Header: Title on Left, "+ Create New Booking" on Right */}
        <div className="flex-between" style={{ paddingBottom: "1.25rem", borderBottom: "1px solid var(--border-color)", flexWrap: "wrap", gap: "1rem" }}>
          <div className="flex-align">
            <div className="header-icon icon-primary" style={{ width: "42px", height: "42px" }}>
              <PackageCheck size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.01em" }}>
                My Consignments & Orders (FR-06, FR-11)
              </h2>
              <p className="text-muted" style={{ fontSize: "0.82rem", marginTop: "2px" }}>
                Real-time commercial freight list, live Stuart Hwy GPS tracking & e-POD receipts
              </p>
            </div>
          </div>

          {/* Prominent Action Button: + Create New Booking */}
          <button
            className="btn btn-primary"
            onClick={() => {
              setSelectedServiceId("scheduled-linehaul");
              setIsModalOpen(true);
            }}
            style={{
              padding: "0.65rem 1.35rem",
              fontSize: "0.88rem",
              fontWeight: 700,
              boxShadow: "0 4px 16px rgba(37, 99, 235, 0.45)",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem"
            }}
          >
            <PlusCircle size={18} />
            <span>+ Create New Booking</span>
          </button>
        </div>

        {/* Status Filter Tabs Bar (Quick Filter Pills) */}
        <div className="filter-tabs-bar" style={{ marginTop: "1rem" }}>
          <button
            className={`tab-pill ${statusTab === "ALL" ? "active" : ""}`}
            onClick={() => setStatusTab("ALL")}
          >
            <Boxes size={14} />
            <span>All Orders ({totalCount})</span>
          </button>

          <button
            className={`tab-pill ${statusTab === "IN TRANSIT" ? "active" : ""}`}
            onClick={() => setStatusTab("IN TRANSIT")}
          >
            <Truck size={14} />
            <span>In Transit ({inTransitCount})</span>
          </button>

          <button
            className={`tab-pill ${statusTab === "ASSIGNED" ? "active" : ""}`}
            onClick={() => setStatusTab("ASSIGNED")}
          >
            <Clock size={14} />
            <span>Assigned ({assignedCount})</span>
          </button>

          <button
            className={`tab-pill ${statusTab === "DELIVERED" ? "active" : ""}`}
            onClick={() => setStatusTab("DELIVERED")}
          >
            <CheckCircle size={14} />
            <span>Delivered ({deliveredCount})</span>
          </button>

          <button
            className={`tab-pill ${statusTab === "EXPRESS" ? "active" : ""}`}
            onClick={() => setStatusTab("EXPRESS")}
          >
            <Zap size={14} />
            <span>Express Priority ({expressCount})</span>
          </button>
        </div>

        {/* Dedicated Advanced Filters Toolbar (Search + Type Dropdowns) */}
        <div className="filter-toolbar">
          
          {/* Left: Text Search Bar */}
          <div style={{ position: "relative", flex: "1 1 280px", minWidth: "240px" }}>
            <Search
              size={15}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#64748b"
              }}
            />
            <input
              type="text"
              placeholder="Search by Ref (#TP-...), cargo, corridor, driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                paddingLeft: "36px",
                paddingRight: "12px",
                fontSize: "0.85rem",
                background: "rgba(15, 23, 42, 0.7)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)"
              }}
            />
          </div>

          {/* Right: Type / Category Filters */}
          <div className="filter-group-right">
            
            {/* 1. Freight / Cargo Type Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                fontSize: "0.82rem",
                padding: "0.55rem 0.85rem",
                background: "rgba(15, 23, 42, 0.7)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                color: categoryFilter !== "ALL" ? "#38bdf8" : "inherit"
              }}
            >
              <option value="ALL">📦 All Cargo Types</option>
              <option value="Mining & Heavy Equipment">Mining Machinery & Spares</option>
              <option value="Timber & Construction">Timber & Building Materials</option>
              <option value="Agriculture & Livestock">Agriculture & Pastoral</option>
              <option value="Cold-Chain & Food Produce">Cold-Chain & Food Produce</option>
              <option value="Medical & Pharmaceuticals">Medical & Pharmaceuticals</option>
              <option value="Marine & Defence Parts">Marine & Defence Spares</option>
              <option value="General & Dry Freight">General Dry Freight</option>
            </select>

            {/* 2. Fleet / Vehicle Type Filter */}
            <select
              value={fleetTypeFilter}
              onChange={(e) => setFleetTypeFilter(e.target.value)}
              style={{
                fontSize: "0.82rem",
                padding: "0.55rem 0.85rem",
                background: "rgba(15, 23, 42, 0.7)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                color: fleetTypeFilter !== "ALL" ? "#38bdf8" : "inherit"
              }}
            >
              <option value="ALL">🚚 All Vehicle Types</option>
              <option value="Road Train">Road Train (Triple/Double)</option>
              <option value="Semi-Trailer">Semi-Trailer (22-24t)</option>
              <option value="Rigid Truck">Rigid Truck (6-10t)</option>
              <option value="Courier Van">Courier Van (1.5-2t)</option>
            </select>

            {/* 3. Route Corridor Filter */}
            <select
              value={corridorFilter}
              onChange={(e) => setCorridorFilter(e.target.value)}
              style={{
                fontSize: "0.82rem",
                padding: "0.55rem 0.85rem",
                background: "rgba(15, 23, 42, 0.7)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                color: corridorFilter !== "ALL" ? "#38bdf8" : "inherit"
              }}
            >
              <option value="ALL">🗺️ All Corridors</option>
              <option value="DARWIN_KATHERINE">Darwin ➔ Katherine</option>
              <option value="KATHERINE_TENNANT">Katherine ➔ Tennant Creek</option>
              <option value="TENNANT_ALICE">Tennant Creek ➔ Alice Springs</option>
              <option value="DARWIN_METRO">Darwin Metro & Port</option>
            </select>

            {/* 4. Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{
                fontSize: "0.82rem",
                padding: "0.55rem 0.85rem",
                background: "rgba(15, 23, 42, 0.7)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                color: priorityFilter !== "ALL" ? "#38bdf8" : "inherit"
              }}
            >
              <option value="ALL">⚡ All Priorities</option>
              <option value="STANDARD">Standard Linehaul</option>
              <option value="EXPRESS">Express Same-Day</option>
            </select>

            {/* Reset Filters button */}
            {isFilterActive && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={resetAllFilters}
                style={{
                  padding: "0.55rem 0.85rem",
                  fontSize: "0.8rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem"
                }}
                title="Reset all filters"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}

          </div>
        </div>

        {/* Consignments Data Table */}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: "130px" }}>Consignment Ref</th>
                <th style={{ width: "220px" }}>Freight Corridor</th>
                <th style={{ width: "260px" }}>Cargo Manifest & Category</th>
                <th style={{ width: "110px" }}>Priority</th>
                <th style={{ width: "200px" }}>Allocated Vehicle & Driver</th>
                <th style={{ width: "120px" }}>Status</th>
                <th style={{ width: "130px" }}>Live ETA</th>
                <th style={{ width: "150px", textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "3.5rem 1rem", color: "var(--text-muted)" }}>
                    <div style={{ marginBottom: "0.75rem", fontSize: "2rem" }}>📦</div>
                    <h3 style={{ fontSize: "1.05rem", color: "#f8fafc", marginBottom: "0.35rem" }}>
                      No Consignments Match Filter Criteria
                    </h3>
                    <p style={{ fontSize: "0.82rem", maxWidth: "400px", margin: "0 auto 1.25rem" }}>
                      Try selecting a different status tab, cargo type, or clear your search keyword.
                    </p>
                    <button className="btn btn-primary btn-sm" onClick={resetAllFilters}>
                      Reset All Filters
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedJobs.map((job) => {
                  const isDelivered = job.status === "Delivered" || job.status === "Invoiced";
                  const cargoCategory = getFreightCategory(job.goods);
                  const fleetType = getFleetType(job.vehicle);

                  return (
                    <tr
                      key={job.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => router.push(`/customer/orders/${job.id}`)}
                    >
                      {/* 1. Consignment Ref */}
                      <td>
                        <Link
                          href={`/customer/orders/${job.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="ref-badge"
                        >
                          #{job.id}
                        </Link>
                      </td>

                      {/* 2. Route Corridor */}
                      <td>
                        <div style={{ fontWeight: 700, color: "#f8fafc", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <span style={{ color: "#10b981", fontSize: "0.7rem" }}>●</span>
                          <span>{job.pickup.split('(')[0].trim()}</span>
                        </div>
                        <div className="text-xs text-muted" style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "3px" }}>
                          <span style={{ color: "#38bdf8" }}>➔</span>
                          <span>{job.dropoff.split('(')[0].trim()}</span>
                        </div>
                      </td>

                      {/* 3. Cargo Manifest & Category */}
                      <td>
                        <div style={{ fontWeight: 600, color: "#f8fafc", maxWidth: "280px" }}>
                          {job.goods}
                        </div>
                        <span className="cargo-tag">
                          {cargoCategory}
                        </span>
                      </td>

                      {/* 4. Priority */}
                      <td>
                        {job.priority === "Express" ? (
                          <span className="tag-express">
                            <Zap size={11} />
                            <span>Express</span>
                          </span>
                        ) : (
                          <span className="tag-standard">
                            <Clock size={11} />
                            <span>Standard</span>
                          </span>
                        )}
                      </td>

                      {/* 5. Allocated Vehicle & Driver */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, color: "#f8fafc" }}>
                          <Truck size={14} color="#60a5fa" />
                          <span>{job.vehicle.split('(')[0].trim()}</span>
                        </div>
                        <div className="text-xs text-muted" style={{ marginTop: "2px" }}>
                          {job.driver} • <span style={{ color: "#94a3b8" }}>{fleetType}</span>
                        </div>
                      </td>

                      {/* 6. Status */}
                      <td>
                        <span className={`badge-status ${job.status === "Cancelled" ? "cancelled" : isDelivered ? "delivered" : job.status === "Arrived" ? "arrived" : "in-transit"}`}>
                          {job.status}
                        </span>
                      </td>

                      {/* 7. Live ETA */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <Clock size={13} color="#38bdf8" />
                          <strong className="text-accent" style={{ fontSize: "0.85rem" }}>
                            {job.eta}
                          </strong>
                        </div>
                      </td>

                      {/* 8. Action Button (Track & Details) */}
                      <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                        <Link
                          href={`/customer/orders/${job.id}`}
                          className="btn btn-primary btn-sm"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.35rem",
                            padding: "0.45rem 0.85rem",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            textDecoration: "none"
                          }}
                        >
                          <Eye size={13} />
                          <span>Track & Details</span>
                          <ArrowRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div style={{ padding: "0 0.5rem" }}>
          <Pagination
            currentPage={currentPage}
            totalItems={filteredJobs.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[4, 6, 10, 20]}
            labelSingular="consignment"
            labelPlural="consignments"
          />
        </div>

        {/* Footer Statistics & Telemetry Status */}
        <div style={{ padding: "1.15rem 0.5rem 0.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", color: "var(--text-muted)", flexWrap: "wrap", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 8px #10b981" }}></span>
            <span>Stuart Highway Telematics GPS Stream Active (15s polling • NFR-02)</span>
          </div>
          <div>
            Showing <strong>{filteredJobs.length}</strong> of <strong>{totalCount}</strong> consignments
          </div>
        </div>

      </div>

      {/* ================= COMPREHENSIVE MULTI-SERVICE BOOKING MODAL (FR-01, FR-02) ================= */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-dialog" style={{ maxWidth: "640px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex-align">
                <div className="header-icon icon-primary" style={{ width: "36px", height: "36px" }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>New Delivery Booking (FR-01, FR-02)</h3>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Select freight service tier, cargo specifications, and auto-dispatch via Stuart Hwy GPS
                  </div>
                </div>
              </div>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="form-layout">
              <div className="modal-body" style={{ padding: "0.75rem 0" }}>
                
                {/* Step 1: Select Logistics Service Offering */}
                <div className="form-group mb-3">
                  <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#38bdf8", marginBottom: "0.4rem", display: "block" }}>
                    Select Logistics Service Tier:
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
                    {NORTHLINE_SERVICES.map((s) => {
                      const isSelected = selectedServiceId === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => handleServiceTabChangeInModal(s.id)}
                          style={{
                            background: isSelected ? "rgba(37, 99, 235, 0.25)" : "rgba(15, 23, 42, 0.6)",
                            border: `1px solid ${isSelected ? "#38bdf8" : "var(--border-color)"}`,
                            borderRadius: "8px",
                            padding: "0.6rem 0.5rem",
                            textAlign: "center",
                            cursor: "pointer",
                            color: isSelected ? "#f8fafc" : "var(--text-muted)",
                            transition: "all 0.15s ease"
                          }}
                        >
                          <div style={{ fontSize: "1.25rem", marginBottom: "2px" }}>{s.icon}</div>
                          <div style={{ fontSize: "0.75rem", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.title.split(' ')[0]} {s.title.split(' ')[1]}</div>
                          <div style={{ fontSize: "0.65rem", color: isSelected ? "#38bdf8" : "#64748b", marginTop: "2px" }}>{s.rateBase.split('/')[0]}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Customer Name */}
                <div className="form-group mb-2">
                  <label>Customer / Account Name</label>
                  <input
                    type="text"
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    required
                  />
                </div>

                {/* Corridor: Pickup and Destination */}
                <div className="form-row mb-2">
                  <div className="form-group">
                    <label>Pickup Origin Location</label>
                    <select value={pickup} onChange={(e) => setPickup(e.target.value)}>
                      <option value="Darwin Depot (120 Berrimah Rd, Darwin)">Darwin Depot (120 Berrimah Rd)</option>
                      <option value="Katherine Depot (Stuart Hwy)">Katherine Depot (Stuart Hwy)</option>
                      <option value="Alice Springs Hub (Smith St)">Alice Springs Hub (Smith St)</option>
                      <option value="Darwin Port Bulk Terminal">Darwin Port Terminal</option>
                      <option value="East Arm Logistics Precinct">East Arm Logistics Precinct</option>
                      <option value="Humpty Doo Packhouse Facility">Humpty Doo Packhouse Facility</option>
                      <option value="Royal Darwin Hospital Supply Centre">Royal Darwin Hospital Supply Centre</option>
                      <option value="Frances Bay Slipways">Frances Bay Slipways</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Delivery Destination</label>
                    <select value={dropoff} onChange={(e) => setDropoff(e.target.value)}>
                      <option value="Katherine Store (Katherine Terrace)">Katherine Store (Katherine Terrace)</option>
                      <option value="Tennant Creek Mine Site">Tennant Creek Mine Site</option>
                      <option value="Alice Springs Logistics Centre">Alice Springs Logistics Centre</option>
                      <option value="Darwin International Airport Freight">Darwin Airport Freight</option>
                      <option value="Jabiru Community Distribution">Jabiru Community Store</option>
                      <option value="Borroloola Mine Site Turnoff">Borroloola Mine Site Turnoff</option>
                      <option value="Darwin Naval Base HMAS Coonawarra">Darwin Naval Base</option>
                      <option value="Katherine District Hospital Clinic">Katherine District Hospital</option>
                    </select>
                  </div>
                </div>

                {/* Cargo Manifest & Priority */}
                <div className="form-row mb-2">
                  <div className="form-group">
                    <label>Cargo Manifest & Goods Description</label>
                    <input
                      type="text"
                      value={goods}
                      onChange={(e) => setGoods(e.target.value)}
                      placeholder="e.g. 4x Industrial Parts (2.5t)"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Service Priority Tier</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as "Standard" | "Express")}
                    >
                      <option value="Standard">Standard (Scheduled 24-48h Linehaul)</option>
                      <option value="Express">Express (Same-Day Hot-Shot Priority)</option>
                    </select>
                  </div>
                </div>

                {/* Automated Dispatch & Dynamic Quote Notice */}
                <div style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: "8px", padding: "0.85rem", marginTop: "0.75rem", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <div style={{ color: "#38bdf8", marginTop: "2px" }}>
                    <Truck size={18} />
                  </div>
                  <div style={{ fontSize: "0.78rem" }}>
                    <div style={{ fontWeight: 700, color: "#f8fafc", marginBottom: "2px" }}>
                      Automated Nearest Vehicle Allocation (FR-02)
                    </div>
                    <div style={{ color: "var(--text-muted)", lineHeight: 1.4 }}>
                      System algorithm will match the nearest available heavy vehicle in the corridor. Live telemetry will stream GPS coordinates every 15s to your portal upon confirmation.
                    </div>
                  </div>
                </div>

              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isSubmitting}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                >
                  <Send size={15} />
                  <span>{isSubmitting ? "Dispatching via Telematics..." : "Confirm & Dispatch Consignment"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
