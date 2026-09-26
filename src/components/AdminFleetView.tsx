"use client";

import React, { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { Vehicle, NT_COORDINATES } from "@/lib/data";
import { useToast } from "@/context/ToastContext";
import Pagination from "./Pagination";
import {
  Truck,
  Navigation,
  Battery,
  Fuel,
  Gauge,
  UserCheck,
  Search,
  SlidersHorizontal,
  MapPin,
  Eye,
  Activity,
  CheckCircle2,
  X,
  Radio
} from "lucide-react";

const DispatcherMap = dynamic(() => import("./DispatcherMap"), { ssr: false });

interface AdminFleetViewProps {
  fleet: Vehicle[];
}

export default function AdminFleetView({ fleet }: AdminFleetViewProps) {
  const toast = useToast();
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [zoomLevel, setZoomLevel] = useState(6);
  const [searchQuery, setSearchQuery] = useState("");
  const [depotFilter, setDepotFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Filtered vehicles
  const filteredFleet = useMemo(() => {
    return fleet.filter((v) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        v.id.toLowerCase().includes(q) ||
        v.name.toLowerCase().includes(q) ||
        v.driver.toLowerCase().includes(q) ||
        v.type.toLowerCase().includes(q);

      const matchesDepot = depotFilter === "ALL" || v.depot.toLowerCase() === depotFilter.toLowerCase();
      const matchesStatus = statusFilter === "ALL" || v.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesDepot && matchesStatus;
    });
  }, [fleet, searchQuery, depotFilter, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, depotFilter, statusFilter]);

  const paginatedFleet = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredFleet.slice(start, start + pageSize);
  }, [filteredFleet, currentPage, pageSize]);

  const handleInspectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setMapCenter([vehicle.lat, vehicle.lng]);
    setZoomLevel(11);
    toast.info(`Focused map view on Vehicle #${vehicle.id} (${vehicle.name}).`, "Telematics Focused");
  };

  const handlePingOBD = (vehicle: Vehicle) => {
    toast.success(`CAN-bus OBD-II telematics ping acknowledged by Truck #${vehicle.id}. Engine diagnostics nominal.`, "OBD-II Telemetry Synced");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      
      {/* 1. Map & Territory Fast Zoom Strip */}
      <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "1rem 1.25rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "rgba(56, 189, 248, 0.15)",
                color: "#38bdf8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Navigation size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>
                Northern Territory Stuart Highway Live Telematics (FR-05)
              </h3>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>
                35 CAN-bus telemetry fitted commercial vehicles across 4 main NT hubs
              </p>
            </div>
          </div>

          {/* Quick Depot Buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
            <button
              onClick={() => { setMapCenter(NT_COORDINATES.darwin); setZoomLevel(11); }}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: "0.72rem", padding: "0.3rem 0.65rem" }}
            >
              Darwin Metro
            </button>
            <button
              onClick={() => { setMapCenter(NT_COORDINATES.katherine); setZoomLevel(11); }}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: "0.72rem", padding: "0.3rem 0.65rem" }}
            >
              Katherine Hub
            </button>
            <button
              onClick={() => { setMapCenter(NT_COORDINATES.tennantCreek); setZoomLevel(11); }}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: "0.72rem", padding: "0.3rem 0.65rem" }}
            >
              Tennant Creek
            </button>
            <button
              onClick={() => { setMapCenter(NT_COORDINATES.aliceSprings); setZoomLevel(11); }}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: "0.72rem", padding: "0.3rem 0.65rem" }}
            >
              Alice Springs
            </button>
            <button
              onClick={() => { setMapCenter([-18.0, 133.0]); setZoomLevel(6); }}
              className="btn btn-primary btn-sm"
              style={{ fontSize: "0.72rem", padding: "0.3rem 0.75rem" }}
            >
              View All NT
            </button>
          </div>
        </div>

        {/* Dynamic Leaflet Map */}
        <DispatcherMap vehicles={fleet} centerTarget={mapCenter} zoomLevel={zoomLevel} />

        {/* Fleet Status Strip */}
        <div
          style={{
            padding: "0.75rem 1.25rem",
            background: "rgba(15, 23, 42, 0.8)",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            flexWrap: "wrap",
            gap: "1.5rem",
            fontSize: "0.78rem"
          }}
        >
          <div style={{ color: "#34d399", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#34d399", display: "inline-block" }}></span>
            <strong>28</strong> In Transit On-Route
          </div>
          <div style={{ color: "#38bdf8", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#38bdf8", display: "inline-block" }}></span>
            <strong>4</strong> Loading / Depot Staging
          </div>
          <div style={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#94a3b8", display: "inline-block" }}></span>
            <strong>3</strong> Off Duty / Rest Break
          </div>
          <div style={{ color: "#fbbf24", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#fbbf24", display: "inline-block" }}></span>
            <strong>0</strong> NHVR Overtime Breaches
          </div>
        </div>
      </div>

      {/* 2. Fleet Search & Filter Bar */}
      <div
        className="glass-card"
        style={{
          padding: "1rem 1.25rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
          <Search
            size={16}
            style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
          />
          <input
            type="text"
            placeholder="Search vehicle #, driver, model (Kenworth, Mack, Hino)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem 0.5rem 2.25rem",
              borderRadius: "8px",
              background: "rgba(15, 23, 42, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#f8fafc",
              fontSize: "0.82rem"
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Depot:</span>
          <select
            value={depotFilter}
            onChange={(e) => setDepotFilter(e.target.value)}
            style={{
              padding: "0.45rem 0.7rem",
              borderRadius: "6px",
              background: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#f8fafc",
              fontSize: "0.78rem"
            }}
          >
            <option value="ALL">All Depots</option>
            <option value="Darwin Metro">Darwin Metro</option>
            <option value="Katherine Depot">Katherine Depot</option>
            <option value="Tennant Creek">Tennant Creek</option>
            <option value="Alice Springs">Alice Springs</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "0.45rem 0.7rem",
              borderRadius: "6px",
              background: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#f8fafc",
              fontSize: "0.78rem"
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="In Transit">In Transit</option>
            <option value="Depot Staging">Depot Staging</option>
            <option value="Loading">Loading</option>
            <option value="Off Duty">Off Duty</option>
          </select>
        </div>
      </div>

      {/* 3. 35 Vehicles Card Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1rem"
        }}
      >
        {paginatedFleet.map((v) => {
          const isTransit = v.status === "In Transit";
          const isStaging = v.status === "Depot Staging";

          return (
            <div
              key={v.id}
              className="glass-card"
              style={{
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                background: "linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.7))",
                transition: "transform 0.15s ease, border-color 0.15s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span style={{ fontSize: "0.7rem", color: "#38bdf8", fontWeight: 800 }}>
                    TRUCK #{v.id}
                  </span>
                  <h4 style={{ margin: "2px 0 0", fontSize: "0.88rem", fontWeight: 700, color: "#f8fafc" }}>
                    {v.name}
                  </h4>
                </div>
                <span
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    padding: "0.15rem 0.5rem",
                    borderRadius: "999px",
                    background: isTransit
                      ? "rgba(16, 185, 129, 0.2)"
                      : isStaging
                      ? "rgba(56, 189, 248, 0.2)"
                      : "rgba(245, 158, 11, 0.2)",
                    color: isTransit ? "#6ee7b7" : isStaging ? "#7dd3fc" : "#fcd34d",
                    border: `1px solid ${
                      isTransit
                        ? "rgba(16, 185, 129, 0.4)"
                        : isStaging
                        ? "rgba(56, 189, 248, 0.4)"
                        : "rgba(245, 158, 11, 0.4)"
                    }`
                  }}
                >
                  {v.status}
                </span>
              </div>

              <div style={{ fontSize: "0.78rem", color: "#cbd5e1", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <UserCheck size={13} color="#60a5fa" />
                <span>{v.driver}</span>
              </div>

              <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                📍 Base Depot: <strong>{v.depot}</strong>
              </div>

              {/* Telematics Bar */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "0.3rem",
                  background: "rgba(0, 0, 0, 0.3)",
                  padding: "0.45rem",
                  borderRadius: "6px",
                  fontSize: "0.7rem"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#38bdf8" }}>
                  <Gauge size={12} />
                  <span>{v.speed}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#34d399" }}>
                  <Fuel size={12} />
                  <span>{v.fuelLevel}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#a78bfa" }}>
                  <Battery size={12} />
                  <span>{v.battery}</span>
                </div>
              </div>

              {/* Card Action Buttons */}
              <div style={{ display: "flex", gap: "0.4rem", marginTop: "auto", paddingTop: "0.4rem" }}>
                <button
                  onClick={() => handleInspectVehicle(v)}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, padding: "0.3rem 0.5rem", fontSize: "0.72rem" }}
                >
                  <Eye size={12} />
                  <span>Map Focus</span>
                </button>
                <button
                  onClick={() => handlePingOBD(v)}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, padding: "0.3rem 0.5rem", fontSize: "0.72rem" }}
                >
                  <Radio size={12} />
                  <span>Ping OBD</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fleet Grid Pagination Controls */}
      <div className="glass-card" style={{ padding: "0.5rem 1rem" }}>
        <Pagination
          currentPage={currentPage}
          totalItems={filteredFleet.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[6, 8, 12, 18, 35]}
          labelSingular="heavy vehicle"
          labelPlural="heavy vehicles"
        />
      </div>

    </div>
  );
}
