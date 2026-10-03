"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { Job, Vehicle, STUART_HIGHWAY_WAYPOINTS, NT_COORDINATES, jobsDB, fleetDB } from "@/lib/data";
import { useToast } from "@/context/ToastContext";
import {
  Truck,
  MapPin,
  CheckCircle2,
  Clock,
  Navigation,
  FileText,
  ShieldCheck,
  Camera,
  RotateCcw,
  Check,
  AlertTriangle,
  Radio,
  Wifi,
  WifiOff,
  Package,
  Layers,
  ArrowRight,
  Phone,
  Compass,
  Zap,
  Coffee,
  Gauge,
  Calendar,
  Eye,
  RefreshCw,
  Sparkles
} from "lucide-react";

// Dynamically import MapView to avoid SSR issues
const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export type DriverTabType = "active" | "manifest" | "navigation" | "vehicle";

interface DriverConsoleProps {
  initialJobs?: Job[];
  userProfile?: {
    name: string;
    org: string;
    email: string;
  };
}

export default function DriverConsole({
  initialJobs = jobsDB,
  userProfile = {
    name: "Dave Miller",
    org: "Mack Titan (Truck #NL-14)",
    email: "d.miller@northline.com.au"
  }
}: DriverConsoleProps) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<DriverTabType>("active");
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [activeJobId, setActiveJobId] = useState<string>("TP-8842");
  const [isOffline, setIsOffline] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [manifestFilter, setManifestFilter] = useState<string>("ALL");

  // e-POD Form State
  const [recipientName, setRecipientName] = useState("Sandra Wilson");
  const [deliveryNote, setDeliveryNote] = useState("Dock 2 Receiving - Heavy forklift required");
  const [photoAttached, setPhotoAttached] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  // Fatigue & Pre-Trip Checklist State
  const [preTripDone, setPreTripDone] = useState(true);
  const [drivingMinutes, setDrivingMinutes] = useState(225); // 3h 45m
  const [isResting, setIsResting] = useState(false);

  // Fetch live jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/jobs");
        const data = await res.json();
        if (data.success && data.jobs && data.jobs.length > 0) {
          setJobs(data.jobs);
        }
      } catch (err) {
        console.error("Driver fetch jobs error:", err);
      }
    };
    fetchJobs();
    const interval = setInterval(fetchJobs, 12000);
    return () => clearInterval(interval);
  }, []);

  // Active Job resolution
  const activeJob = useMemo(() => {
    const found = jobs.find((j) => j.id === activeJobId);
    if (found) return found;
    // Fallback: first job assigned to Dave Miller or first in list
    const myJob = jobs.find((j) => j.driver.toLowerCase().includes("dave") || j.driver.toLowerCase().includes("drv-104"));
    return myJob || jobs[0] || jobsDB[0];
  }, [jobs, activeJobId]);

  // Jobs relevant to this driver
  const driverJobs = useMemo(() => {
    return jobs.filter((j) => {
      return (
        j.driver.toLowerCase().includes("dave") ||
        j.driver.toLowerCase().includes("drv-104") ||
        j.vehicle.toLowerCase().includes("nl-14") ||
        j.id === "TP-8842" ||
        j.id === "TP-8843" ||
        j.id === "TP-8846" ||
        j.id === "TP-8851"
      );
    });
  }, [jobs]);

  // Filtered manifest
  const filteredManifest = useMemo(() => {
    return driverJobs.filter((j) => {
      if (manifestFilter === "ALL") return true;
      if (manifestFilter === "ACTIVE") return j.status === "In Transit" || j.status === "Assigned";
      if (manifestFilter === "DELIVERED") return j.status === "Delivered" || j.status === "Invoiced";
      return j.status.toUpperCase() === manifestFilter.toUpperCase();
    });
  }, [driverJobs, manifestFilter]);

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [activeTab, activeJob.id]);

  // Canvas Drawing Handlers
  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    setHasDrawn(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getCanvasPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    if ("touches" in e) e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getCanvasPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDraw = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // Status Lifecycle Handlers
  const handleStartTrip = async () => {
    setIsUpdating(true);
    try {
      if (isOffline) {
        toast.warning("Offline Mode: Trip departure stored locally. Will sync when 4G returns.", "Offline Cached");
        const updated = { ...activeJob, status: "In Transit" as const };
        setJobs((prev) => prev.map((j) => (j.id === activeJob.id ? updated : j)));
      } else {
        const res = await fetch(`/api/jobs/${activeJob.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "In Transit" })
        });
        const data = await res.json();
        if (data.success && data.job) {
          setJobs((prev) => prev.map((j) => (j.id === activeJob.id ? data.job : j)));
          toast.success(`Consignment #${activeJob.id} is now IN TRANSIT on Stuart Highway. Customer notified!`, "Trip Started");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update trip status", "Error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmPOD = async () => {
    const signatureData = canvasRef.current ? canvasRef.current.toDataURL() : undefined;

    if (!hasDrawn && !activeJob.signatureDataUrl) {
      toast.warning("Please capture consignee signature on the pad before confirming delivery.", "Signature Required");
      return;
    }

    setIsUpdating(true);
    const completedTimestamp = new Date().toISOString();

    if (isOffline) {
      toast.warning(
        `e-POD for ${recipientName} stored in local offline encrypted queue (NFR-05). Will auto-sync when cellular signal returns.`,
        "Offline POD Queued"
      );
      const updated: Job = {
        ...activeJob,
        status: "Delivered",
        recipientName: recipientName,
        signatureDataUrl: signatureData || activeJob.signatureDataUrl,
        completedAt: completedTimestamp
      };
      setJobs((prev) => prev.map((j) => (j.id === activeJob.id ? updated : j)));
      setIsUpdating(false);
    } else {
      try {
        const res = await fetch(`/api/jobs/${activeJob.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "confirm_delivery",
            recipientName: recipientName,
            signatureDataUrl: signatureData
          })
        });
        const data = await res.json();
        if (data.success && data.job) {
          setJobs((prev) => prev.map((j) => (j.id === activeJob.id ? data.job : j)));
          toast.success(
            `Signed by ${recipientName}. Official Tax Invoice generated (INV-2026-${activeJob.id.replace("TP-", "")}) & archived (FR-07, FR-08).`,
            "Delivery Confirmed!"
          );
        } else {
          toast.error("Failed to submit delivery confirmation.", "Submission Error");
        }
      } catch (err: any) {
        toast.error(err.message || "Network error", "Delivery Error");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const isDelivered = activeJob.status === "Delivered" || activeJob.status === "Invoiced";
  const isInTransit = activeJob.status === "In Transit";
  const isAssigned = activeJob.status === "Assigned" || activeJob.status === "Booked";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: "1280px", margin: "0 auto" }}>
      
      {/* 1. Driver In-Cab Console Top Navigation Header */}
      <div
        className="glass-card"
        style={{
          padding: "1rem 1.25rem",
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(11, 19, 32, 0.98))",
          borderColor: "rgba(56, 189, 248, 0.3)",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)"
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          
          {/* Driver & Vehicle Identity */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #0284c7, #38bdf8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 0 15px rgba(56, 189, 248, 0.4)"
              }}
            >
              <Truck size={24} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.01em" }}>
                  {userProfile.name}
                </h2>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    padding: "0.2rem 0.55rem",
                    borderRadius: "999px",
                    background: "rgba(16, 185, 129, 0.2)",
                    color: "#34d399",
                    border: "1px solid rgba(16, 185, 129, 0.4)"
                  }}
                >
                  On Duty • Shift Active
                </span>
              </div>
              <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#94a3b8" }}>
                Heavy Vehicle: <strong style={{ color: "#38bdf8" }}>{userProfile.org}</strong> · Linehaul Corridor (Darwin ➔ Katherine)
              </p>
            </div>
          </div>

          {/* Telemetry Status, Dead Zone Switch & Quick Stats */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            
            {/* 4G / Dead Zone Toggle */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                background: isOffline ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
                border: `1px solid ${isOffline ? "rgba(239, 68, 68, 0.4)" : "rgba(16, 185, 129, 0.4)"}`,
                padding: "0.35rem 0.75rem",
                borderRadius: "999px",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: isOffline ? "#fca5a5" : "#6ee7b7"
              }}
            >
              {isOffline ? <WifiOff size={14} /> : <Wifi size={14} />}
              <span>{isOffline ? "Outback Dead Zone (Offline Queue Active)" : "4G Connected (Telstra NT)"}</span>
              <input
                type="checkbox"
                checked={isOffline}
                onChange={(e) => {
                  setIsOffline(e.target.checked);
                  if (!e.target.checked) {
                    toast.success("4G Cellular Restored: Local offline e-POD queue automatically synchronized to cloud!", "Connected");
                  } else {
                    toast.warning("Simulated cellular dead zone. Signatures will be cached in encrypted storage.", "Offline Mode");
                  }
                }}
                style={{ cursor: "pointer", marginLeft: "4px" }}
                title="Toggle Outback Cellular Dead Zone Simulation"
              />
            </div>

            {/* Quick Manifest Counter */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "0.35rem 0.75rem",
                borderRadius: "8px",
                fontSize: "0.78rem",
                color: "#cbd5e1"
              }}
            >
              Today's Manifest: <strong style={{ color: "#38bdf8" }}>{driverJobs.length} Drops</strong>
            </div>

          </div>
        </div>

        {/* Console View Switcher Tabs (Large Glove-Friendly Touch Targets) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "0.5rem",
            marginTop: "1.1rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            paddingTop: "0.85rem"
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("active")}
            style={{
              padding: "0.65rem 0.75rem",
              borderRadius: "10px",
              background: activeTab === "active" ? "rgba(56, 189, 248, 0.2)" : "rgba(255, 255, 255, 0.03)",
              color: activeTab === "active" ? "#38bdf8" : "#94a3b8",
              border: `1px solid ${activeTab === "active" ? "rgba(56, 189, 248, 0.5)" : "rgba(255, 255, 255, 0.06)"}`,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              fontWeight: 700,
              fontSize: "0.85rem",
              transition: "all 0.2s ease"
            }}
          >
            <Zap size={16} />
            <span>1. Active Drop & e-POD</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("manifest")}
            style={{
              padding: "0.65rem 0.75rem",
              borderRadius: "10px",
              background: activeTab === "manifest" ? "rgba(56, 189, 248, 0.2)" : "rgba(255, 255, 255, 0.03)",
              color: activeTab === "manifest" ? "#38bdf8" : "#94a3b8",
              border: `1px solid ${activeTab === "manifest" ? "rgba(56, 189, 248, 0.5)" : "rgba(255, 255, 255, 0.06)"}`,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              fontWeight: 700,
              fontSize: "0.85rem",
              transition: "all 0.2s ease"
            }}
          >
            <Package size={16} />
            <span>2. My Manifest ({driverJobs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("navigation")}
            style={{
              padding: "0.65rem 0.75rem",
              borderRadius: "10px",
              background: activeTab === "navigation" ? "rgba(56, 189, 248, 0.2)" : "rgba(255, 255, 255, 0.03)",
              color: activeTab === "navigation" ? "#38bdf8" : "#94a3b8",
              border: `1px solid ${activeTab === "navigation" ? "rgba(56, 189, 248, 0.5)" : "rgba(255, 255, 255, 0.06)"}`,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              fontWeight: 700,
              fontSize: "0.85rem",
              transition: "all 0.2s ease"
            }}
          >
            <Navigation size={16} />
            <span>3. Corridor Route Map</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("vehicle")}
            style={{
              padding: "0.65rem 0.75rem",
              borderRadius: "10px",
              background: activeTab === "vehicle" ? "rgba(56, 189, 248, 0.2)" : "rgba(255, 255, 255, 0.03)",
              color: activeTab === "vehicle" ? "#38bdf8" : "#94a3b8",
              border: `1px solid ${activeTab === "vehicle" ? "rgba(56, 189, 248, 0.5)" : "rgba(255, 255, 255, 0.06)"}`,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              fontWeight: 700,
              fontSize: "0.85rem",
              transition: "all 0.2s ease"
            }}
          >
            <ShieldCheck size={16} />
            <span>4. Fatigue & Vehicle</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: ACTIVE DELIVERY & e-POD ================= */}
      {activeTab === "active" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "1.25rem", alignItems: "start" }}>
          
          {/* Left Column: Consignment Info & Lifecycle Action Flow */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            
            {/* Step Lifecycle Action Hero Card */}
            <div
              className="glass-card"
              style={{
                padding: "1.35rem",
                background: "linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))",
                border: "1px solid rgba(56, 189, 248, 0.25)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span style={{ fontSize: "1.15rem", fontWeight: 800, color: "#38bdf8" }}>
                    Consignment #{activeJob.id}
                  </span>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      padding: "0.2rem 0.55rem",
                      borderRadius: "6px",
                      background: activeJob.priority === "Express" ? "rgba(239, 68, 68, 0.2)" : "rgba(59, 130, 246, 0.2)",
                      color: activeJob.priority === "Express" ? "#fca5a5" : "#93c5fd"
                    }}
                  >
                    {activeJob.priority} Linehaul
                  </span>
                </div>

                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    padding: "0.25rem 0.75rem",
                    borderRadius: "999px",
                    background: isDelivered
                      ? "rgba(16, 185, 129, 0.25)"
                      : isInTransit
                      ? "rgba(245, 158, 11, 0.25)"
                      : "rgba(59, 130, 246, 0.25)",
                    color: isDelivered ? "#6ee7b7" : isInTransit ? "#fcd34d" : "#93c5fd",
                    border: `1px solid ${isDelivered ? "rgba(16, 185, 129, 0.4)" : isInTransit ? "rgba(245, 158, 11, 0.4)" : "rgba(59, 130, 246, 0.4)"}`
                  }}
                >
                  Status: {activeJob.status}
                </span>
              </div>

              {/* Trip Progression Step Bar */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", marginBottom: "1.25rem" }}>
                <div
                  style={{
                    background: "rgba(15, 23, 42, 0.8)",
                    border: `1px solid ${!isAssigned ? "#10b981" : "#38bdf8"}`,
                    borderRadius: "8px",
                    padding: "0.6rem 0.75rem",
                    textAlign: "center"
                  }}
                >
                  <div style={{ fontSize: "0.68rem", color: "#94a3b8", textTransform: "uppercase" }}>Step 1</div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: !isAssigned ? "#10b981" : "#38bdf8" }}>
                    {!isAssigned ? "✓ Loaded & Departed" : "Depot Staging"}
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(15, 23, 42, 0.8)",
                    border: `1px solid ${isInTransit ? "#fbbf24" : isDelivered ? "#10b981" : "rgba(255,255,255,0.1)"}`,
                    borderRadius: "8px",
                    padding: "0.6rem 0.75rem",
                    textAlign: "center"
                  }}
                >
                  <div style={{ fontSize: "0.68rem", color: "#94a3b8", textTransform: "uppercase" }}>Step 2</div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: isInTransit ? "#fbbf24" : isDelivered ? "#10b981" : "#94a3b8" }}>
                    {isDelivered ? "✓ Transit Done" : isInTransit ? "⚡ Stuart Hwy Linehaul" : "En Route"}
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(15, 23, 42, 0.8)",
                    border: `1px solid ${isDelivered ? "#10b981" : "rgba(255,255,255,0.1)"}`,
                    borderRadius: "8px",
                    padding: "0.6rem 0.75rem",
                    textAlign: "center"
                  }}
                >
                  <div style={{ fontSize: "0.68rem", color: "#94a3b8", textTransform: "uppercase" }}>Step 3</div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: isDelivered ? "#10b981" : "#94a3b8" }}>
                    {isDelivered ? "✓ e-POD Signed" : "Dock Sign-Off"}
                  </div>
                </div>
              </div>

              {/* Dynamic Action Buttons depending on status */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {isAssigned && (
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={handleStartTrip}
                    className="btn btn-primary btn-block"
                    style={{
                      padding: "0.85rem",
                      fontSize: "0.95rem",
                      fontWeight: 800,
                      boxShadow: "0 4px 15px rgba(37, 99, 235, 0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem"
                    }}
                  >
                    <Truck size={18} />
                    <span>Start Trip & Depart Depot (Set In-Transit)</span>
                  </button>
                )}

                {isInTransit && (
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button
                      type="button"
                      onClick={() => {
                        toast.info("Dock arrival notification transmitted to customer receiving department.", "Arrival Pushed");
                      }}
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: "0.75rem", fontSize: "0.85rem", fontWeight: 700 }}
                    >
                      <MapPin size={16} />
                      <span>Notify Store: 15 Mins Away</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const podEl = document.getElementById("pod-signature-box");
                        podEl?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="btn btn-primary"
                      style={{ flex: 1, padding: "0.75rem", fontSize: "0.85rem", fontWeight: 700 }}
                    >
                      <CheckCircle2 size={16} />
                      <span>Proceed to Sign e-POD ➔</span>
                    </button>
                  </div>
                )}

                {isDelivered && (
                  <div
                    style={{
                      background: "rgba(16, 185, 129, 0.15)",
                      border: "1px solid rgba(16, 185, 129, 0.4)",
                      borderRadius: "8px",
                      padding: "0.85rem 1rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#34d399", fontSize: "0.85rem", fontWeight: 700 }}>
                      <CheckCircle2 size={18} />
                      <span>Delivery Completed & e-POD Verified ({activeJob.completedAt || "Today"})</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab("manifest")}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: "0.75rem", padding: "0.4rem 0.85rem" }}
                    >
                      <span>Next Job in Queue ➔</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Routing & Cargo Specifications Card */}
            <div
              className="glass-card"
              style={{
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem"
              }}
            >
              <h3 style={{ margin: 0, fontSize: "0.95rem", color: "#f8fafc", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <MapPin size={16} color="#38bdf8" />
                <span>Stuart Highway Route & Customer Dock</span>
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "0.75rem 0.9rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>
                    Pickup Origin Depot
                  </div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#cbd5e1", marginTop: "2px" }}>
                    📍 {activeJob.pickup}
                  </div>
                </div>

                <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "0.75rem 0.9rem", borderRadius: "8px", border: "1px solid rgba(56, 189, 248, 0.2)" }}>
                  <div style={{ fontSize: "0.7rem", color: "#38bdf8", textTransform: "uppercase", fontWeight: 700 }}>
                    Destination Receiving Store & Dock
                  </div>
                  <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#f8fafc", marginTop: "2px" }}>
                    🏁 {activeJob.dropoff}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "3px" }}>
                    Consignee Account: <strong style={{ color: "#cbd5e1" }}>{activeJob.customer}</strong>
                  </div>
                </div>

                <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "0.75rem 0.9rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>
                    Cargo Manifest & Handling
                  </div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#fcd34d", marginTop: "2px" }}>
                    📦 {activeJob.goods}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "2px" }}>
                    Special Instruction: Heavy forklift required at dock bay
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <a
                  href="tel:+61889721144"
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, textDecoration: "none", fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem" }}
                >
                  <Phone size={13} />
                  <span>Call Receiving Dock</span>
                </a>
                <button
                  type="button"
                  onClick={() => setActiveTab("navigation")}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem" }}
                >
                  <Navigation size={13} />
                  <span>View Highway Map</span>
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: e-POD Interactive Touch Signature Box */}
          <div
            id="pod-signature-box"
            className="glass-card"
            style={{
              padding: "1.35rem",
              background: "linear-gradient(135deg, rgba(20, 27, 45, 0.95), rgba(15, 23, 42, 0.98))",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              boxShadow: "0 15px 30px rgba(0, 0, 0, 0.6)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", color: "#34d399" }}>
                <CheckCircle2 size={18} />
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800 }}>
                  Electronic Proof of Delivery (FR-07)
                </h3>
              </div>
              <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                Corporations Act (CR-04)
              </span>
            </div>

            <p style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: 0, marginBottom: "1rem" }}>
              Capture receiver's name and digital touchscreen signature upon freight handover.
            </p>

            {/* Recipient Input */}
            <div style={{ marginBottom: "0.85rem" }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "4px" }}>
                Receiver Full Name:
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Receiver name (e.g. Sandra Wilson)"
                style={{
                  width: "100%",
                  padding: "0.6rem 0.85rem",
                  borderRadius: "8px",
                  background: "#0f172a",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#f8fafc",
                  fontSize: "0.85rem"
                }}
              />
            </div>

            {/* Delivery Note */}
            <div style={{ marginBottom: "0.85rem" }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "4px" }}>
                Receiving Dock Note / Bay #:
              </label>
              <input
                type="text"
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                placeholder="E.g. Dock 2, Forklift Bay"
                style={{
                  width: "100%",
                  padding: "0.55rem 0.85rem",
                  borderRadius: "8px",
                  background: "#0f172a",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#f8fafc",
                  fontSize: "0.82rem"
                }}
              />
            </div>

            {/* Touch Signature Canvas Pad */}
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#cbd5e1" }}>
                  Consignee Sign Here (Touch / Stylus / Mouse):
                </label>
                {hasDrawn && (
                  <button
                    type="button"
                    onClick={clearCanvas}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#f87171",
                      fontSize: "0.72rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "2px"
                    }}
                  >
                    <RotateCcw size={11} />
                    <span>Clear Signature</span>
                  </button>
                )}
              </div>

              <div
                style={{
                  position: "relative",
                  background: "#090d16",
                  border: "1.5px dashed rgba(56, 189, 248, 0.4)",
                  borderRadius: "10px",
                  height: "140px",
                  overflow: "hidden"
                }}
              >
                <canvas
                  ref={canvasRef}
                  width={420}
                  height={140}
                  style={{ width: "100%", height: "100%", touchAction: "none", cursor: "crosshair" }}
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={stopDraw}
                />

                {!hasDrawn && !activeJob.signatureDataUrl && (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      fontSize: "0.78rem",
                      color: "#64748b",
                      pointerEvents: "none",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <span>✍️ Sign directly on screen</span>
                    <span style={{ fontSize: "0.68rem", opacity: 0.7 }}>(Receiver signature required)</span>
                  </div>
                )}

                {activeJob.signatureDataUrl && !hasDrawn && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)" }}>
                    <img src={activeJob.signatureDataUrl} alt="Verified Signature" style={{ maxHeight: "80px" }} />
                  </div>
                )}
              </div>
            </div>

            {/* Photo & Delivery Action Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={() => {
                  setPhotoAttached(true);
                  toast.success("Delivery dock cargo snapshot attached to e-POD manifest.", "Photo Attached");
                }}
                className="btn btn-secondary"
                style={{
                  padding: "0.65rem",
                  fontSize: "0.82rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem"
                }}
              >
                <Camera size={15} />
                <span>{photoAttached ? "✓ Cargo Photo Attached (1 Image)" : "+ Attach Delivery Dock Photo"}</span>
              </button>

              <button
                type="button"
                disabled={isUpdating}
                onClick={handleConfirmPOD}
                className="btn btn-success btn-block"
                style={{
                  padding: "0.85rem",
                  fontSize: "0.92rem",
                  fontWeight: 800,
                  boxShadow: "0 4px 18px rgba(16, 185, 129, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem"
                }}
              >
                <Check size={18} />
                <span>{isUpdating ? "Submitting e-POD..." : "Confirm Delivery & Release Tax Invoice"}</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ================= TAB 2: MY MANIFEST & QUEUE ================= */}
      {activeTab === "manifest" && (
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#f8fafc" }}>
                Driver Manifest & Shift Schedule
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#94a3b8" }}>
                All deliveries and linehaul runs assigned to <strong>{userProfile.name}</strong> ({userProfile.org})
              </p>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: "flex", gap: "0.4rem" }}>
              {["ALL", "ACTIVE", "DELIVERED"].map((f) => (
                <button
                  key={f}
                  onClick={() => setManifestFilter(f)}
                  style={{
                    padding: "0.35rem 0.75rem",
                    fontSize: "0.75rem",
                    borderRadius: "999px",
                    fontWeight: 700,
                    background: manifestFilter === f ? "rgba(56, 189, 248, 0.2)" : "rgba(255, 255, 255, 0.05)",
                    color: manifestFilter === f ? "#38bdf8" : "#94a3b8",
                    border: `1px solid ${manifestFilter === f ? "rgba(56, 189, 248, 0.4)" : "rgba(255, 255, 255, 0.08)"}`,
                    cursor: "pointer"
                  }}
                >
                  {f === "ALL" ? `All Runs (${driverJobs.length})` : f === "ACTIVE" ? "In-Progress / Upcoming" : "Completed"}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1rem" }}>
            {filteredManifest.map((job) => {
              const isSelected = job.id === activeJob.id;
              const isDone = job.status === "Delivered" || job.status === "Invoiced";

              return (
                <div
                  key={job.id}
                  onClick={() => {
                    setActiveJobId(job.id);
                    setActiveTab("active");
                    toast.info(`Switched active focus to Consignment #${job.id}.`, "Manifest Selected");
                  }}
                  style={{
                    background: isSelected ? "rgba(56, 189, 248, 0.12)" : "rgba(15, 23, 42, 0.75)",
                    border: `1.5px solid ${isSelected ? "#38bdf8" : "rgba(255, 255, 255, 0.08)"}`,
                    borderRadius: "12px",
                    padding: "1.1rem",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <span style={{ fontSize: "0.95rem", fontWeight: 800, color: isSelected ? "#38bdf8" : "#f8fafc" }}>
                          #{job.id}
                        </span>
                        <span
                          style={{
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            padding: "0.15rem 0.45rem",
                            borderRadius: "4px",
                            background: job.priority === "Express" ? "rgba(239, 68, 68, 0.2)" : "rgba(59, 130, 246, 0.2)",
                            color: job.priority === "Express" ? "#fca5a5" : "#93c5fd"
                          }}
                        >
                          {job.priority}
                        </span>
                      </div>

                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          padding: "0.2rem 0.55rem",
                          borderRadius: "999px",
                          background: isDone ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)",
                          color: isDone ? "#6ee7b7" : "#fcd34d"
                        }}
                      >
                        {job.status}
                      </span>
                    </div>

                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#f8fafc", marginBottom: "0.35rem" }}>
                      {job.customer}
                    </div>

                    <div style={{ fontSize: "0.78rem", color: "#cbd5e1", marginBottom: "0.5rem" }}>
                      📦 {job.goods}
                    </div>

                    <div style={{ fontSize: "0.72rem", color: "#94a3b8", display: "flex", flexDirection: "column", gap: "2px" }}>
                      <div>📍 {job.pickup.split('(')[0]}</div>
                      <div style={{ color: "#38bdf8" }}>➔ {job.dropoff.split('(')[0]}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.75rem" }}>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                      ETA: <strong style={{ color: "#38bdf8" }}>{job.eta}</strong>
                    </div>

                    <button
                      type="button"
                      className={`btn btn-sm ${isSelected ? "btn-primary" : "btn-secondary"}`}
                      style={{ fontSize: "0.72rem", padding: "0.3rem 0.75rem" }}
                    >
                      <span>{isSelected ? "Current Focus" : "Select Run ➔"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 3: CORRIDOR NAVIGATION & MAP ================= */}
      {activeTab === "navigation" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.25rem" }}>
          
          {/* Main Map Frame */}
          <div className="glass-card" style={{ padding: 0, overflow: "hidden", minHeight: "520px" }}>
            <MapView
              jobId={activeJob.id}
              truckLat={activeJob.lat}
              truckLng={activeJob.lng}
              driverName={activeJob.driver}
              vehicleName={activeJob.vehicle}
              pickupAddress={activeJob.pickup}
              dropoffAddress={activeJob.dropoff}
              status={activeJob.status}
            />
          </div>

          {/* Right Navigation Telematics Summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            
            <div className="glass-card" style={{ padding: "1.15rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#38bdf8", marginBottom: "0.75rem" }}>
                <Compass size={16} />
                <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>
                  Stuart Highway Telematics (FR-05)
                </h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", marginBottom: "0.85rem" }}>
                <div style={{ background: "rgba(15, 23, 42, 0.7)", padding: "0.65rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: "0.68rem", color: "#94a3b8" }}>SPEED (CAN-BUS)</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: isInTransit ? "#38bdf8" : "#94a3b8" }}>
                    {isInTransit ? "88 km/h" : "0 km/h"}
                  </div>
                </div>

                <div style={{ background: "rgba(15, 23, 42, 0.7)", padding: "0.65rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: "0.68rem", color: "#94a3b8" }}>EST. ARRIVAL</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#10b981" }}>
                    {activeJob.eta}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: "0.78rem", color: "#cbd5e1", lineHeight: 1.5 }}>
                <div><strong>Corridor Waypoint:</strong> Adelaide River ➔ Pine Creek</div>
                <div><strong>Transponder Ping:</strong> 15s interval (Telstra 4G)</div>
                <div><strong>Destination:</strong> {activeJob.dropoff}</div>
              </div>
            </div>

            {/* Turn-by-Turn Corridor Checkpoints */}
            <div className="glass-card" style={{ padding: "1.15rem", flex: 1 }}>
              <h4 style={{ margin: "0 0 0.75rem", fontSize: "0.85rem", color: "#94a3b8", textTransform: "uppercase" }}>
                Route Corridor Checkpoints
              </h4>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", fontSize: "0.78rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#10b981" }}>
                  <span>✓</span>
                  <span>Darwin Berrimah Logistics Bay (Departed)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#38bdf8", fontWeight: 700 }}>
                  <span>●</span>
                  <span>Stuart Highway Km 114 (Adelaide River)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#94a3b8" }}>
                  <span>○</span>
                  <span>Pine Creek Truck Stop & Rest Area</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#94a3b8" }}>
                  <span>○</span>
                  <span>Katherine Receiving Dock (Final Drop)</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ================= TAB 4: FATIGUE & VEHICLE HEALTH ================= */}
      {activeTab === "vehicle" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
          
          {/* Left: NHVR Fatigue Management Card */}
          <div className="glass-card" style={{ padding: "1.35rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#fbbf24", marginBottom: "1rem" }}>
              <Coffee size={20} />
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800 }}>
                NHVR Heavy Vehicle Fatigue Clock (CR-05)
              </h3>
            </div>

            <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: 0, marginBottom: "1.25rem" }}>
              National Heavy Vehicle Regulator compliance for Standard Work & Rest Hours along the Stuart Highway.
            </p>

            <div style={{ background: "rgba(15, 23, 42, 0.75)", padding: "1rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>Continuous Driving Time:</span>
                <strong style={{ fontSize: "1.1rem", color: drivingMinutes > 300 ? "#ef4444" : "#fbbf24" }}>
                  {Math.floor(drivingMinutes / 60)}h {drivingMinutes % 60}m / 5h 30m max
                </strong>
              </div>

              {/* Progress bar */}
              <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "999px", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${Math.min(100, (drivingMinutes / 330) * 100)}%`,
                    height: "100%",
                    background: drivingMinutes > 300 ? "#ef4444" : "#fbbf24",
                    borderRadius: "999px"
                  }}
                />
              </div>

              <div style={{ fontSize: "0.72rem", color: "#38bdf8", marginTop: "6px" }}>
                ⏱️ 1h 45m remaining before mandatory 15-minute rest break
              </div>
            </div>

            <div style={{ background: "rgba(15, 23, 42, 0.75)", padding: "1rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "4px" }}>
                Nearest Stuart Highway Rest Area:
              </div>
              <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#f8fafc" }}>
                ☕ Emerald Springs Roadhouse (28 km ahead)
              </div>
              <div style={{ fontSize: "0.72rem", color: "#10b981", marginTop: "2px" }}>
                Heavy Vehicle Road Train bay available • 24hr amenities
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsResting(!isResting);
                if (!isResting) {
                  toast.success("15-minute mandatory rest break logged in NHVR electronic diary.", "Rest Break Started");
                } else {
                  toast.info("Resuming linehaul shift.", "Shift Resumed");
                }
              }}
              className={`btn btn-block ${isResting ? "btn-success" : "btn-secondary"}`}
              style={{ padding: "0.65rem", fontSize: "0.82rem", fontWeight: 700 }}
            >
              <Coffee size={15} />
              <span>{isResting ? "✓ End 15-Min Rest Break" : "Log 15-Min Rest Break Now"}</span>
            </button>
          </div>

          {/* Right: Vehicle Telematics & Pre-Trip Walkaround */}
          <div className="glass-card" style={{ padding: "1.35rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#38bdf8", marginBottom: "1rem" }}>
              <Gauge size={20} />
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800 }}>
                Mack Titan (Truck #NL-14) Telematics
              </h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div style={{ background: "rgba(15, 23, 42, 0.7)", padding: "0.85rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>FUEL TANK (DIESEL)</div>
                <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#10b981", marginTop: "2px" }}>
                  74% (620 km)
                </div>
              </div>

              <div style={{ background: "rgba(15, 23, 42, 0.7)", padding: "0.85rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>BRAKE AIR PRESSURE</div>
                <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#38bdf8", marginTop: "2px" }}>
                  8.4 Bar (Nominal)
                </div>
              </div>
            </div>

            <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "#cbd5e1" }}>
              Pre-Trip Heavy Vehicle Safety Walkaround:
            </h4>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", fontSize: "0.78rem", color: "#cbd5e1", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ color: "#10b981" }}>✓</span>
                <span>Steer & Drive Tyres Pressure Inspected</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ color: "#10b981" }}>✓</span>
                <span>Turntable & Kingpin Locking Verified</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ color: "#10b981" }}>✓</span>
                <span>Load Restraint Tension Straps Compliant</span>
              </div>
            </div>

            <div
              style={{
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                padding: "0.65rem 0.85rem",
                borderRadius: "8px",
                fontSize: "0.75rem",
                color: "#6ee7b7"
              }}
            >
              ✅ Daily Pre-Start Check completed at 06:30 ACST by Dave Miller.
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
