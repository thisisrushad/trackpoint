"use client";

import React, { useState, useMemo, useEffect } from "react";
import { DriverAccount, loadStoredDrivers, saveStoredDrivers } from "@/lib/drivers";
import { fleetDB } from "@/lib/data";
import { useToast } from "@/context/ToastContext";
import Pagination from "./Pagination";
import {
  UserCheck,
  Truck,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Search,
  PlusCircle,
  Edit2,
  Clock,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  X,
  Coffee,
  BatteryCharging
} from "lucide-react";
import Link from "next/link";

export default function AdminDriversView() {
  const toast = useToast();
  const [drivers, setDrivers] = useState<DriverAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [depotFilter, setDepotFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [licenseFilter, setLicenseFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Modal states
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<DriverAccount | null>(null);

  // New Driver Form state
  const [newDriver, setNewDriver] = useState({
    name: "",
    email: "",
    phone: "",
    emergencyContact: "",
    licenseClass: "HC" as "MC" | "HC" | "HR" | "MR" | "C",
    licenseNumber: "",
    depot: "Darwin Metro & Port",
    vehicleId: "NL-14",
    specialization: ""
  });

  // Load drivers on mount & sync across tabs
  useEffect(() => {
    setDrivers(loadStoredDrivers());

    const handleUpdate = (e: any) => {
      if (e.detail) setDrivers(e.detail);
    };
    window.addEventListener("trackpoint_drivers_updated", handleUpdate);
    return () => window.removeEventListener("trackpoint_drivers_updated", handleUpdate);
  }, []);

  // Filtered drivers list
  const filteredDrivers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return drivers.filter((d) => {
      const matchesSearch =
        q === "" ||
        d.name.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        d.vehicleName.toLowerCase().includes(q) ||
        d.depot.toLowerCase().includes(q) ||
        d.specialization.toLowerCase().includes(q) ||
        d.licenseNumber.toLowerCase().includes(q);

      const matchesDepot = depotFilter === "ALL" || d.depot.toLowerCase().includes(depotFilter.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || d.status.toUpperCase() === statusFilter.toUpperCase();
      const matchesLicense = licenseFilter === "ALL" || d.licenseClass === licenseFilter;

      return matchesSearch && matchesDepot && matchesStatus && matchesLicense;
    });
  }, [drivers, searchQuery, depotFilter, statusFilter, licenseFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, depotFilter, statusFilter, licenseFilter]);

  const paginatedDrivers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDrivers.slice(start, start + pageSize);
  }, [filteredDrivers, currentPage, pageSize]);

  // Statistics
  const stats = useMemo(() => {
    const total = drivers.length;
    const active = drivers.filter((d) => d.status === "Active").length;
    const onBreak = drivers.filter((d) => d.status === "On Break").length;
    const offDuty = drivers.filter((d) => d.status === "Off Duty").length;
    return { total, active, onBreak, offDuty };
  }, [drivers]);

  // Quick Duty Status Switcher
  const handleStatusChange = (driverId: string, newStatus: "Active" | "On Break" | "Off Duty") => {
    const updated = drivers.map((d) => {
      if (d.id === driverId) {
        return { ...d, status: newStatus };
      }
      return d;
    });
    setDrivers(updated);
    saveStoredDrivers(updated);
    toast.success(`Driver status changed to ${newStatus}.`, "Roster Updated");
  };

  // Log Fatigue Break / Reset Timer
  const handleResetFatigue = (driver: DriverAccount) => {
    const updated = drivers.map((d) => {
      if (d.id === driver.id) {
        return { ...d, fatigueHours: "0.0 / 12 hrs", status: "Active" as const };
      }
      return d;
    });
    setDrivers(updated);
    saveStoredDrivers(updated);
    toast.success(
      `Mandatory BFM 30-minute rest logged for ${driver.name}. Driving hours reset.`,
      "NHVR Compliance Logged"
    );
  };

  // Submit Onboard New Driver
  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriver.name || !newDriver.email) {
      toast.error("Driver name and email are required.", "Validation Error");
      return;
    }

    const matchedVehicle = fleetDB.find((v) => v.id === newDriver.vehicleId) || fleetDB[0];
    const newId = `DRV-NL-${Math.floor(10 + Math.random() * 90)}`;

    const colors = [
      "linear-gradient(135deg, #10b981, #059669)",
      "linear-gradient(135deg, #38bdf8, #0284c7)",
      "linear-gradient(135deg, #f59e0b, #d97706)",
      "linear-gradient(135deg, #8b5cf6, #6d28d9)",
      "linear-gradient(135deg, #ec4899, #be185d)",
      "linear-gradient(135deg, #14b8a6, #0d9488)"
    ];
    const randomBg = colors[Math.floor(Math.random() * colors.length)];

    const created: DriverAccount = {
      id: newId,
      name: newDriver.name,
      email: newDriver.email,
      phone: newDriver.phone || "+61 488 000 111",
      emergencyContact: newDriver.emergencyContact || "Depot Dispatch Control (+61 8 8984 0000)",
      licenseClass: newDriver.licenseClass,
      licenseNumber: newDriver.licenseNumber || `NT-${Math.floor(10000 + Math.random() * 90000)}-${newDriver.licenseClass}`,
      depot: newDriver.depot,
      vehicleId: matchedVehicle.id,
      vehicleName: matchedVehicle.name,
      vehicleType: matchedVehicle.type,
      status: "Active",
      fatigueHours: "0.0 / 12 hrs",
      bfmCertified: true,
      avatarBg: randomBg,
      specialization: newDriver.specialization || "Regional Linehaul Corridor Freight"
    };

    const updated = [created, ...drivers];
    setDrivers(updated);
    saveStoredDrivers(updated);
    setIsOnboardModalOpen(false);
    toast.success(`Driver ${created.name} (#${created.id}) onboarded to NorthLine fleet.`, "Driver Onboarded");

    // Reset form
    setNewDriver({
      name: "",
      email: "",
      phone: "",
      emergencyContact: "",
      licenseClass: "HC",
      licenseNumber: "",
      depot: "Darwin Metro & Port",
      vehicleId: "NL-14",
      specialization: ""
    });
  };

  // Submit Edit Driver
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDriver) return;

    const matchedVehicle = fleetDB.find((v) => v.id === editingDriver.vehicleId);
    const updatedDriver: DriverAccount = {
      ...editingDriver,
      vehicleName: matchedVehicle ? matchedVehicle.name : editingDriver.vehicleName,
      vehicleType: matchedVehicle ? matchedVehicle.type : editingDriver.vehicleType
    };

    const updated = drivers.map((d) => (d.id === editingDriver.id ? updatedDriver : d));
    setDrivers(updated);
    saveStoredDrivers(updated);
    setEditingDriver(null);
    toast.success(`Profile updated for driver ${updatedDriver.name}.`, "Changes Saved");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      
      {/* KPI Overview Strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem"
        }}
      >
        <div className="glass-card" style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <UserCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Roster Drivers</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f8fafc" }}>{stats.total} Fleet Drivers</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Truck size={22} />
          </div>
          <div>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>On Duty / In Transit</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#10b981" }}>{stats.active} Active Runs</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Coffee size={22} />
          </div>
          <div>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>On Mandatory Break</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f59e0b" }}>{stats.onBreak} Drivers</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(129, 140, 248, 0.15)", color: "#818cf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>NHVR BFM Compliance</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#818cf8" }}>100% Certified</div>
          </div>
        </div>
      </div>

      {/* Action Header & Search Bar */}
      <div
        className="glass-card"
        style={{
          padding: "1rem 1.25rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "8px", background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <UserCheck size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#f8fafc" }}>
              Heavy Vehicle Driver Roster & Compliance (NHVR / BFM)
            </h3>
            <p style={{ margin: 0, fontSize: "0.76rem", color: "#94a3b8" }}>
              Commercial linehaul driver rosters, fatigue management timers, vehicle allocations & credentials
            </p>
          </div>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => setIsOnboardModalOpen(true)}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", boxShadow: "0 2px 10px rgba(37, 99, 235, 0.4)" }}
        >
          <PlusCircle size={15} />
          <span>+ Onboard Driver</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div
        className="glass-card"
        style={{
          padding: "0.85rem 1.25rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", minWidth: "260px", flex: "1 1 260px" }}>
          <Search size={15} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search driver name, license, vehicle, depot..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "32px", width: "100%", fontSize: "0.82rem", height: "36px" }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          {/* Depot Filter */}
          <select
            className="input-field"
            value={depotFilter}
            onChange={(e) => setDepotFilter(e.target.value)}
            style={{ width: "auto", fontSize: "0.8rem", height: "36px", padding: "0 0.6rem" }}
          >
            <option value="ALL">All Depots</option>
            <option value="Darwin">Darwin Metro & Port</option>
            <option value="Katherine">Katherine Corridor</option>
            <option value="Alice Springs">Alice Springs Hub</option>
          </select>

          {/* Status Filter */}
          <select
            className="input-field"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: "auto", fontSize: "0.8rem", height: "36px", padding: "0 0.6rem" }}
          >
            <option value="ALL">All Duty Statuses</option>
            <option value="ACTIVE">Active (On Duty)</option>
            <option value="ON BREAK">On Break</option>
            <option value="OFF DUTY">Off Duty</option>
          </select>

          {/* License Filter */}
          <select
            className="input-field"
            value={licenseFilter}
            onChange={(e) => setLicenseFilter(e.target.value)}
            style={{ width: "auto", fontSize: "0.8rem", height: "36px", padding: "0 0.6rem" }}
          >
            <option value="ALL">All License Classes</option>
            <option value="MC">MC — Multi Combination (Road Train)</option>
            <option value="HC">HC — Heavy Combination (Semi)</option>
            <option value="HR">HR — Heavy Rigid</option>
            <option value="MR">MR — Medium Rigid</option>
            <option value="C">C — Courier Light</option>
          </select>
        </div>
      </div>

      {/* Drivers Roster Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
          gap: "1.25rem"
        }}
      >
        {paginatedDrivers.map((driver) => {
          const isBreak = driver.status === "On Break";
          const isOff = driver.status === "Off Duty";
          const isActive = driver.status === "Active";

          return (
            <div
              key={driver.id}
              className="glass-card"
              style={{
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                border: isActive
                  ? "1px solid rgba(56, 189, 248, 0.3)"
                  : isBreak
                  ? "1px solid rgba(245, 158, 11, 0.3)"
                  : "1px solid rgba(255, 255, 255, 0.08)"
              }}
            >
              <div>
                {/* Top Strip: Avatar + Name + Duty Status */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.85rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: driver.avatarBg,
                        color: "#ffffff",
                        fontWeight: 800,
                        fontSize: "1rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
                      }}
                    >
                      {driver.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "1.02rem", color: "#f8fafc" }}>
                        {driver.name}
                      </div>
                      <div style={{ fontSize: "0.74rem", color: "#38bdf8", fontWeight: 700 }}>
                        {driver.id} • {driver.licenseClass} Class
                      </div>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={driver.status}
                    onChange={(e) => handleStatusChange(driver.id, e.target.value as any)}
                    style={{
                      background: isActive
                        ? "rgba(16, 185, 129, 0.15)"
                        : isBreak
                        ? "rgba(245, 158, 11, 0.15)"
                        : "rgba(148, 163, 184, 0.15)",
                      color: isActive ? "#34d399" : isBreak ? "#fbbf24" : "#94a3b8",
                      border: `1px solid ${isActive ? "rgba(16, 185, 129, 0.4)" : isBreak ? "rgba(245, 158, 11, 0.4)" : "rgba(148, 163, 184, 0.3)"}`,
                      borderRadius: "9999px",
                      padding: "0.25rem 0.65rem",
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      cursor: "pointer",
                      outline: "none"
                    }}
                  >
                    <option value="Active" style={{ background: "#0f172a", color: "#34d399" }}>● On Duty</option>
                    <option value="On Break" style={{ background: "#0f172a", color: "#fbbf24" }}>⏳ Rest Break</option>
                    <option value="Off Duty" style={{ background: "#0f172a", color: "#94a3b8" }}>○ Off Duty</option>
                  </select>
                </div>

                {/* Details Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.6rem",
                    background: "rgba(15, 23, 42, 0.6)",
                    padding: "0.85rem",
                    borderRadius: "10px",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    fontSize: "0.78rem",
                    marginBottom: "0.85rem"
                  }}
                >
                  <div>
                    <div style={{ color: "#64748b", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>Allocated Truck</div>
                    <div style={{ color: "#f8fafc", fontWeight: 700, marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Truck size={13} color="#38bdf8" />
                      <span className="truncate">{driver.vehicleName.split("(")[0]}</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ color: "#64748b", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>Home Depot</div>
                    <div style={{ color: "#f8fafc", fontWeight: 700, marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <MapPin size={13} color="#10b981" />
                      <span className="truncate">{driver.depot}</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ color: "#64748b", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>License No.</div>
                    <div style={{ color: "#f8fafc", fontWeight: 600, marginTop: "2px" }}>
                      {driver.licenseNumber}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: "#64748b", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>BFM Certified</div>
                    <div style={{ color: "#34d399", fontWeight: 700, marginTop: "2px", display: "flex", alignItems: "center", gap: "3px" }}>
                      <ShieldCheck size={13} />
                      <span>NHVR BFM OK</span>
                    </div>
                  </div>
                </div>

                {/* Fatigue Management & Driving Hours Strip */}
                <div style={{ marginBottom: "0.85rem", background: "rgba(255,255,255,0.02)", padding: "0.6rem 0.75rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.72rem", marginBottom: "4px" }}>
                    <span style={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={12} color="#38bdf8" /> Driving Hours Log:
                    </span>
                    <strong style={{ color: isBreak ? "#fbbf24" : "#34d399" }}>{driver.fatigueHours}</strong>
                  </div>
                  <div style={{ width: "100%", height: "5px", background: "rgba(255,255,255,0.08)", borderRadius: "9999px", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${Math.min(100, (parseFloat(driver.fatigueHours.split("/")[0]) / 12) * 100)}%`,
                        height: "100%",
                        background: isBreak ? "#f59e0b" : "linear-gradient(90deg, #38bdf8, #10b981)",
                        borderRadius: "9999px"
                      }}
                    />
                  </div>
                </div>

                {/* Contact & Specialization */}
                <div style={{ fontSize: "0.74rem", color: "#94a3b8", display: "flex", flexDirection: "column", gap: "3px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Phone size={12} color="#64748b" />
                    <span>{driver.phone}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Mail size={12} color="#64748b" />
                    <span className="truncate">{driver.email}</span>
                  </div>
                  <div style={{ marginTop: "4px", color: "#cbd5e1", fontSize: "0.72rem", fontStyle: "italic" }}>
                    ★ {driver.specialization}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.5rem",
                  marginTop: "1rem",
                  paddingTop: "0.85rem",
                  borderTop: "1px solid rgba(255, 255, 255, 0.08)"
                }}
              >
                {/* Reset Fatigue Break */}
                <button
                  type="button"
                  onClick={() => handleResetFatigue(driver)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: "0.72rem", padding: "0.3rem 0.55rem" }}
                  title="Log mandatory 30m break under National Heavy Vehicle Regulator BFM rules"
                >
                  <RotateCcw size={12} />
                  <span>Log BFM Rest</span>
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  {/* Edit Driver Button */}
                  <button
                    type="button"
                    onClick={() => setEditingDriver(driver)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: "0.72rem", padding: "0.3rem 0.55rem" }}
                    title="Edit driver license, depot or assigned vehicle"
                  >
                    <Edit2 size={12} />
                    <span>Edit</span>
                  </button>

                  {/* Open Driver Console */}
                  <Link
                    href={`/driver/manifest`}
                    target="_blank"
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: "0.72rem", padding: "0.3rem 0.55rem", display: "inline-flex", alignItems: "center", gap: "3px" }}
                    title="Open Driver Console to view this driver's workflow"
                  >
                    <span>Driver View</span>
                    <ExternalLink size={11} />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredDrivers.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
        pageSizeOptions={[6, 9, 12]}
        labelSingular="driver"
        labelPlural="drivers"
      />

      {/* ================= ONBOARD NEW DRIVER MODAL ================= */}
      {isOnboardModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-card" style={{ maxWidth: "560px", width: "95%", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <UserCheck size={20} color="#38bdf8" />
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>Onboard New Fleet Driver</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOnboardModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleOnboardSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div>
                  <label className="text-xs text-muted block mb-1">Driver Full Name *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. Jack Henderson"
                    value={newDriver.name}
                    onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Company Email (Login) *</label>
                  <input
                    type="email"
                    required
                    className="input-field"
                    placeholder="j.henderson@northline.com.au"
                    value={newDriver.email}
                    onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div>
                  <label className="text-xs text-muted block mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="+61 488 000 000"
                    value={newDriver.phone}
                    onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Name & Contact Phone"
                    value={newDriver.emergencyContact}
                    onChange={(e) => setNewDriver({ ...newDriver, emergencyContact: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div>
                  <label className="text-xs text-muted block mb-1">License Class</label>
                  <select
                    className="input-field"
                    value={newDriver.licenseClass}
                    onChange={(e) => setNewDriver({ ...newDriver, licenseClass: e.target.value as any })}
                  >
                    <option value="MC">MC — Multi Combination (Triple/Double Road Train)</option>
                    <option value="HC">HC — Heavy Combination (Semi-Trailer)</option>
                    <option value="HR">HR — Heavy Rigid Truck</option>
                    <option value="MR">MR — Medium Rigid Truck</option>
                    <option value="C">C — Courier Light Vehicle</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">License Number</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. NT-94812-MC"
                    value={newDriver.licenseNumber}
                    onChange={(e) => setNewDriver({ ...newDriver, licenseNumber: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div>
                  <label className="text-xs text-muted block mb-1">Assigned Vehicle</label>
                  <select
                    className="input-field"
                    value={newDriver.vehicleId}
                    onChange={(e) => setNewDriver({ ...newDriver, vehicleId: e.target.value })}
                  >
                    {fleetDB.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.type})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Home Depot Staging</label>
                  <select
                    className="input-field"
                    value={newDriver.depot}
                    onChange={(e) => setNewDriver({ ...newDriver, depot: e.target.value })}
                  >
                    <option value="Darwin Metro & Port">Darwin Metro & Port</option>
                    <option value="Katherine Corridor">Katherine Corridor</option>
                    <option value="Katherine Depot">Katherine Depot</option>
                    <option value="Alice Springs Hub">Alice Springs Hub</option>
                    <option value="Tennant Creek Barkly Hub">Tennant Creek Barkly Hub</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted block mb-1">Specialization / Freight Expertise</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Stuart Highway Double Road Train Outback Linehaul"
                  value={newDriver.specialization}
                  onChange={(e) => setNewDriver({ ...newDriver, specialization: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.75rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsOnboardModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT DRIVER MODAL ================= */}
      {editingDriver && (
        <div className="modal-overlay">
          <div className="modal-content glass-card" style={{ maxWidth: "560px", width: "95%", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Edit2 size={20} color="#38bdf8" />
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>Edit Driver Profile: {editingDriver.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingDriver(null)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div>
                  <label className="text-xs text-muted block mb-1">Driver Full Name</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={editingDriver.name}
                    onChange={(e) => setEditingDriver({ ...editingDriver, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Phone Number</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editingDriver.phone}
                    onChange={(e) => setEditingDriver({ ...editingDriver, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div>
                  <label className="text-xs text-muted block mb-1">License Class</label>
                  <select
                    className="input-field"
                    value={editingDriver.licenseClass}
                    onChange={(e) => setEditingDriver({ ...editingDriver, licenseClass: e.target.value as any })}
                  >
                    <option value="MC">MC — Multi Combination (Road Train)</option>
                    <option value="HC">HC — Heavy Combination (Semi)</option>
                    <option value="HR">HR — Heavy Rigid Truck</option>
                    <option value="MR">MR — Medium Rigid Truck</option>
                    <option value="C">C — Courier Light</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">License Number</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editingDriver.licenseNumber}
                    onChange={(e) => setEditingDriver({ ...editingDriver, licenseNumber: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div>
                  <label className="text-xs text-muted block mb-1">Assigned Vehicle</label>
                  <select
                    className="input-field"
                    value={editingDriver.vehicleId}
                    onChange={(e) => setEditingDriver({ ...editingDriver, vehicleId: e.target.value })}
                  >
                    {fleetDB.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.type})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Home Depot Staging</label>
                  <select
                    className="input-field"
                    value={editingDriver.depot}
                    onChange={(e) => setEditingDriver({ ...editingDriver, depot: e.target.value })}
                  >
                    <option value="Darwin Metro & Port">Darwin Metro & Port</option>
                    <option value="Katherine Corridor">Katherine Corridor</option>
                    <option value="Katherine Depot">Katherine Depot</option>
                    <option value="Alice Springs Hub">Alice Springs Hub</option>
                    <option value="Tennant Creek Barkly Hub">Tennant Creek Barkly Hub</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div>
                  <label className="text-xs text-muted block mb-1">Duty Status</label>
                  <select
                    className="input-field"
                    value={editingDriver.status}
                    onChange={(e) => setEditingDriver({ ...editingDriver, status: e.target.value as any })}
                  >
                    <option value="Active">● Active (On Duty)</option>
                    <option value="On Break">⏳ On Break</option>
                    <option value="Off Duty">○ Off Duty</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editingDriver.emergencyContact}
                    onChange={(e) => setEditingDriver({ ...editingDriver, emergencyContact: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted block mb-1">Specialization / Expertise</label>
                <input
                  type="text"
                  className="input-field"
                  value={editingDriver.specialization}
                  onChange={(e) => setEditingDriver({ ...editingDriver, specialization: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.75rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingDriver(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
