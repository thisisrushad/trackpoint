"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Job, STUART_HIGHWAY_WAYPOINTS, jobsDB } from "@/lib/data";
import {
  ArrowLeft,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Navigation,
  FileText,
  MessageSquare,
  ShieldCheck,
  User,
  Radio,
  Printer,
  Download,
  Calendar,
  Sparkles,
  Zap,
  Activity,
  UserCheck,
  LogOut,
  Layers,
  Thermometer,
  Compass
} from "lucide-react";
import { useToast } from "@/context/ToastContext";

// Dynamically import MapView to prevent SSR window issues
const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function ConsignmentDetailsPage() {
  const toast = useToast();
  const params = useParams();
  const router = useRouter();
  const jobId = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "TP-9363";

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState({
    name: "Sandra Wilson",
    org: "Katherine Mining Supplies Ltd",
    email: "sandra.w@katherinemining.com.au"
  });

  // Fetch consignment data
  useEffect(() => {
    const savedUser = localStorage.getItem("trackpoint_user");
    if (savedUser) {
      try {
        setUserProfile(JSON.parse(savedUser));
      } catch (e) {}
    }

    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        const data = await res.json();
        if (data.success && data.job) {
          setJob(data.job);
        } else {
          // Fallback to local DB search
          const found = jobsDB.find((j) => j.id.toLowerCase() === jobId.toLowerCase());
          if (found) setJob(found);
        }
      } catch (err) {
        console.error("Fetch job error:", err);
        const found = jobsDB.find((j) => j.id.toLowerCase() === jobId.toLowerCase());
        if (found) setJob(found);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
    const interval = setInterval(fetchJob, 10000);
    return () => clearInterval(interval);
  }, [jobId]);

  // Live Stuart Hwy GPS animation for In-Transit consignments only
  useEffect(() => {
    if (!job || job.status !== "In Transit") return;
    let progress = 0.35;
    const gpsInterval = setInterval(() => {
      progress += 0.015;
      if (progress > 0.95) progress = 0.1;

      const totalSegments = STUART_HIGHWAY_WAYPOINTS.length - 1;
      const globalProgress = progress * totalSegments;
      const currentSeg = Math.floor(globalProgress);
      const segFraction = globalProgress - currentSeg;

      const p1 = STUART_HIGHWAY_WAYPOINTS[currentSeg];
      const p2 = STUART_HIGHWAY_WAYPOINTS[currentSeg + 1] || p1;

      const currentLat = p1[0] + (p2[0] - p1[0]) * segFraction;
      const currentLng = p1[1] + (p2[1] - p1[1]) * segFraction;

      setJob((prev) => (prev ? { ...prev, lat: currentLat, lng: currentLng } : prev));
    }, 3000);

    return () => clearInterval(gpsInterval);
  }, [job?.id, job?.status]);

  const handleLogout = () => {
    localStorage.removeItem("trackpoint_token");
    localStorage.removeItem("trackpoint_user");
    router.push("/");
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div className="header-icon icon-primary" style={{ margin: "0 auto 1rem", animation: "pulse 1.5s infinite" }}>
            <Truck size={28} />
          </div>
          <h2 style={{ fontSize: "1.25rem", color: "var(--text-main)" }}>Loading Consignment Telemetry...</h2>
          <p className="text-muted" style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>Connecting to Stuart Hwy GPS stream</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="glass-card" style={{ maxWidth: "480px", textAlign: "center", padding: "2.5rem" }}>
          <AlertCircle size={40} color="#ef4444" style={{ margin: "0 auto 1rem" }} />
          <h2>Consignment Not Found</h2>
          <p className="text-muted" style={{ margin: "0.75rem 0 1.5rem" }}>
            We could not find any active booking or freight record matching reference <strong>#{jobId}</strong>.
          </p>
          <Link href="/customer" className="btn btn-primary">
            <ArrowLeft size={16} />
            <span>Return to Consignments List</span>
          </Link>
        </div>
      </div>
    );
  }

  const isDelivered = job.status === "Delivered" || job.status === "Invoiced";
  const isInTransit = job.status === "In Transit";
  const isAssigned = job.status === "Assigned" || job.status === "Booked";

  return (
    <>
      {/* App Header */}
      <header className="app-header">
        <div className="header-container">
          
          <div className="brand-group">
            <div className="brand-logo" style={{ background: "linear-gradient(135deg, #0284c7, #38bdf8)" }}>
              <Truck size={22} />
            </div>
            <div>
              <div className="brand-title">
                TrackPoint <span className="badge-tag" style={{ background: "rgba(2, 132, 199, 0.25)", color: "#38bdf8", borderColor: "rgba(56, 189, 248, 0.4)" }}>Customer Portal</span>
              </div>
              <div className="brand-sub">Consignment Details & Real-Time Stuart Hwy Telemetry</div>
            </div>
          </div>

          {/* User Profile & Sign Out */}
          <div className="header-status">
            <div className="status-pill profile-pill">
              <UserCheck size={14} color="#38bdf8" />
              <span>{userProfile.name} ({userProfile.org.split(' ')[0]})</span>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleLogout}
              style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>

        </div>

        {/* Sub-Navbar Navigation */}
        <div className="sub-navbar">
          <div className="sub-nav-container">
            <Link
              href="/customer"
              className="sub-nav-btn"
              style={{ textDecoration: "none", color: "#38bdf8", display: "inline-flex", alignItems: "center", gap: "0.4rem", fontWeight: 600 }}
            >
              <ArrowLeft size={15} />
              <span>← Back to All Consignments</span>
            </Link>
            <div style={{ color: "var(--border-color)", margin: "0 0.5rem" }}>|</div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Tracking: <strong style={{ color: "#f8fafc" }}>Consignment #{job.id}</strong> ({job.goods})
            </div>
          </div>
        </div>
      </header>

      {/* Main Details View */}
      <main className="main-content" style={{ padding: "1.5rem 2rem 3rem" }}>
        
        {/* Top Summary Banner */}
        <div
          className="glass-card"
          style={{
            marginBottom: "1.5rem",
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))",
            borderColor: "rgba(56, 189, 248, 0.25)"
          }}
        >
          <div className="card-header flex-between" style={{ flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.02em" }}>
                  Consignment #{job.id}
                </h1>
                <span
                  style={{
                    fontSize: "0.85rem",
                    padding: "0.3rem 0.8rem",
                    borderRadius: "999px",
                    fontWeight: 700,
                    background: isDelivered
                      ? "rgba(16, 185, 129, 0.2)"
                      : isInTransit
                      ? "rgba(245, 158, 11, 0.2)"
                      : job.status === "Booked"
                      ? "rgba(239, 68, 68, 0.2)"
                      : "rgba(59, 130, 246, 0.2)",
                    color: isDelivered
                      ? "#6ee7b7"
                      : isInTransit
                      ? "#fcd34d"
                      : job.status === "Booked"
                      ? "#fca5a5"
                      : "#93c5fd",
                    border: `1px solid ${
                      isDelivered
                        ? "rgba(16, 185, 129, 0.4)"
                        : isInTransit
                        ? "rgba(245, 158, 11, 0.4)"
                        : job.status === "Booked"
                        ? "rgba(239, 68, 68, 0.4)"
                        : "rgba(59, 130, 246, 0.4)"
                    }`
                  }}
                >
                  {job.status === "Booked" ? "Pending Approval" : job.status}
                </span>
                <span className={`tag ${job.priority === "Express" ? "tag-blue" : ""}`} style={{ fontSize: "0.8rem", padding: "0.25rem 0.65rem", fontWeight: 700 }}>
                  {job.priority} Linehaul
                </span>
              </div>
              <p className="text-muted" style={{ marginTop: "0.35rem", fontSize: "0.85rem" }}>
                Commercial Consignee: <strong style={{ color: "#38bdf8" }}>{job.customer}</strong> • {job.status === "Booked" ? "Awaiting Dispatcher Assignment" : "Telematics Feed Active (Stuart Hwy, NT)"}
              </p>
            </div>

            {/* Quick Actions */}
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => window.print()}
                style={{ display: "inline-flex", gap: "0.4rem", alignItems: "center" }}
              >
                <Printer size={14} />
                <span>Print Consignment Note</span>
              </button>
              {isDelivered && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    toast.info(`Preparing official signed e-POD receipt for Consignment #${job.id}...`, "Exporting e-POD");
                    window.print();
                  }}
                  style={{ display: "inline-flex", gap: "0.4rem", alignItems: "center" }}
                >
                  <Download size={14} />
                  <span>Download Signed e-POD</span>
                </button>
              )}
            </div>
          </div>

          {/* 4 Quick Telemetry Insight Cards */}
          <div className="consignment-bar" style={{ marginTop: "1rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
            
            <div className="c-info-item">
              <span className="c-label" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Truck size={13} color="#60a5fa" />
                Allocated Heavy Vehicle
              </span>
              <span className="c-val">{job.vehicle}</span>
            </div>

            <div className="c-info-item">
              <span className="c-label" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <User size={13} color="#10b981" />
                Assigned Linehaul Driver
              </span>
              <span className="c-val">{job.driver}</span>
            </div>

            <div className="c-info-item">
              <span className="c-label" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Clock size={13} color="#f59e0b" />
                Live Dynamic ETA
              </span>
              <span className="c-val text-accent" style={{ fontSize: "1.05rem" }}>{job.eta}</span>
            </div>

            <div className="c-info-item">
              <span className="c-label" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <ShieldCheck size={13} color="#38bdf8" />
                Freight Security & Type
              </span>
              <span className="c-val text-primary" style={{ fontSize: "0.85rem" }}>GPS Tracked & Geofenced</span>
            </div>

          </div>
        </div>

        {/* 2-Column Main Content: Left (Map + Milestones), Right (Manifest + Telemetry + SMS + Invoicing) */}
        <div className="view-grid grid-2col" style={{ alignItems: "start" }}>
          
          {/* ================= LEFT COLUMN ================= */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            {/* Live Stuart Highway GPS Map Card */}
            <div className="glass-card">
              <div className="card-header flex-between">
                <div className="flex-align">
                  <div className="header-icon icon-primary">
                    <Navigation size={20} />
                  </div>
                  <div>
                    <h2>Real-Time Stuart Hwy GPS Route (NFR-02)</h2>
                    <p className="text-muted">Live telemetry refreshed every 15 seconds from heavy vehicle transponder</p>
                  </div>
                </div>
                <div className="live-ping" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", padding: "0.25rem 0.65rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600 }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 8px #10b981" }}></span>
                  <span>Telemetry Live</span>
                </div>
              </div>

              <MapView
                truckLat={job.lat}
                truckLng={job.lng}
                driverName={job.driver}
                vehicleName={job.vehicle}
                pickupAddress={job.pickup}
                dropoffAddress={job.dropoff}
                status={job.status}
              />
            </div>

            {/* Consignment Milestone & Audit Trail Timeline (FR-06) */}
            <div className="glass-card">
              <div className="card-header flex-between">
                <div className="flex-align">
                  <div className="header-icon icon-success">
                    <Layers size={20} />
                  </div>
                  <div>
                    <h2>Consignment Milestone Timeline (FR-06)</h2>
                    <p className="text-muted">Complete end-to-end custody audit trail across Northern Territory transit</p>
                  </div>
                </div>
              </div>

              {/* Timeline Steps */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "0.5rem", position: "relative", paddingLeft: "1.5rem" }}>
                
                {/* Vertical connecting line */}
                <div
                  style={{
                    position: "absolute",
                    left: "25px",
                    top: "10px",
                    bottom: "20px",
                    width: "2px",
                    background: "rgba(56, 189, 248, 0.25)",
                    zIndex: 0
                  }}
                />

                {/* Milestone 1: Booking Received */}
                <div style={{ display: "flex", gap: "1rem", position: "relative", zIndex: 1 }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
                    <CheckCircle2 size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#f8fafc" }}>
                      1. Booking Created & Telematics Auto-Dispatched (FR-01, FR-02)
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
                      Matched to nearest heavy vehicle <strong>{job.vehicle}</strong> based on live GPS coordinates and Darwin corridor proximity.
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#38bdf8", marginTop: "4px" }}>
                      📍 Origin: {job.pickup} • Timestamp: 07:15 ACST
                    </div>
                  </div>
                </div>

                {/* Milestone 2: Loaded & Inspected */}
                <div style={{ display: "flex", gap: "1rem", position: "relative", zIndex: 1 }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
                    <CheckCircle2 size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#f8fafc" }}>
                      2. Freight Manifest Inspected & Loaded at Depot
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
                      Cargo <em>"{job.goods}"</em> secured with heavy-duty tension straps in line with NT Road Transport compliance.
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#38bdf8", marginTop: "4px" }}>
                      📍 Darwin Berrimah Freight Bay • Timestamp: 08:30 ACST
                    </div>
                  </div>
                </div>

                {/* Milestone 3: Stuart Hwy Linehaul In Transit */}
                <div style={{ display: "flex", gap: "1rem", position: "relative", zIndex: 1 }}>
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: isDelivered ? "#10b981" : "#0284c7",
                      boxShadow: isDelivered ? "none" : "0 0 12px #38bdf8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      flexShrink: 0
                    }}
                  >
                    {isDelivered ? <CheckCircle2 size={14} /> : <Truck size={13} />}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 700, color: isDelivered ? "#f8fafc" : "#38bdf8" }}>
                      3. Stuart Highway Linehaul Transit {isDelivered ? "(Completed)" : "(Active Now)"}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
                      {isDelivered
                        ? "Corridor linehaul run completed smoothly."
                        : `Heavy vehicle travelling along Stuart Highway corridor at ${job.priority === "Express" ? "92 km/h" : "88 km/h"}. GPS refreshed every 15s.`}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#38bdf8", marginTop: "4px" }}>
                      📍 Current GPS: {job.lat.toFixed(4)}, {job.lng.toFixed(4)} • Live Dynamic ETA: {job.eta}
                    </div>
                  </div>
                </div>

                {/* Milestone 4: Regional Depot Arrival */}
                <div style={{ display: "flex", gap: "1rem", position: "relative", zIndex: 1 }}>
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: isDelivered ? "#10b981" : "rgba(255,255,255,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: isDelivered ? "#fff" : "var(--text-muted)",
                      flexShrink: 0
                    }}
                  >
                    {isDelivered ? <CheckCircle2 size={14} /> : <Clock size={13} />}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 700, color: isDelivered ? "#f8fafc" : "var(--text-muted)" }}>
                      4. Regional Hub Staging & Inspection Checkpoint
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
                      Transit checkpoint at regional depot staging bay prior to final delivery run.
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                      📍 Regional Depot Hub
                    </div>
                  </div>
                </div>

                {/* Milestone 5: e-POD Sign-off & Delivery Completion */}
                <div style={{ display: "flex", gap: "1rem", position: "relative", zIndex: 1 }}>
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: isDelivered ? "#10b981" : "rgba(255,255,255,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: isDelivered ? "#fff" : "var(--text-muted)",
                      flexShrink: 0
                    }}
                  >
                    {isDelivered ? <CheckCircle2 size={14} /> : <FileText size={13} />}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 700, color: isDelivered ? "#10b981" : "var(--text-muted)" }}>
                      5. Electronic Proof of Delivery (e-POD) Sign-off (FR-07, FR-08, FR-11)
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
                      {isDelivered
                        ? `Consignee digital sign-off completed by ${job.recipientName || "Sandra Wilson"}. Tax Invoice & POD receipt generated automatically.`
                        : "Consignee digital touchscreen signature required upon freight arrival."}
                    </div>
                    {isDelivered && (
                      <div style={{ fontSize: "0.75rem", color: "#10b981", marginTop: "4px", fontWeight: 600 }}>
                        ✅ Signed on Handset: {job.completedAt || "24-Sep-2026 14:38:12 ACST"}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* ================= RIGHT COLUMN ================= */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            {/* Route & Cargo Manifest Details Card */}
            <div className="glass-card">
              <div className="card-header flex-between">
                <div className="flex-align">
                  <div className="header-icon icon-accent">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h2>Freight Routing & Manifest</h2>
                    <p className="text-muted">Origin, destination, and cargo consignment details</p>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginTop: "0.25rem" }}>
                
                <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "0.85rem 1rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
                    Origin / Pickup Depot
                  </div>
                  <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "#f8fafc", marginTop: "2px" }}>
                    📍 {job.pickup}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    Darwin Freight Hub • Loading Bay 4
                  </div>
                </div>

                <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "0.85rem 1rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                  <div style={{ fontSize: "0.72rem", color: "#38bdf8", fontWeight: 700, textTransform: "uppercase" }}>
                    Destination / Receiving Address
                  </div>
                  <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "#38bdf8", marginTop: "2px" }}>
                    🏁 {job.dropoff}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    Commercial Dock • Receiving Hours: 07:00 - 17:00 ACST
                  </div>
                </div>

                <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "0.85rem 1rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
                    Cargo Manifest & Handling
                  </div>
                  <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "#f8fafc", marginTop: "2px" }}>
                    📦 {job.goods}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    Service Tier: <strong>{job.priority} Linehaul</strong> • Heavy Vehicle Strapped
                  </div>
                </div>

              </div>
            </div>

            {/* Live Telemetry & Environmental Sensors Feed */}
            <div className="glass-card">
              <div className="card-header flex-between">
                <div className="flex-align">
                  <div className="header-icon icon-primary">
                    <Radio size={20} />
                  </div>
                  <div>
                    <h2>Vehicle Telemetry & Sensors (FR-05)</h2>
                    <p className="text-muted">Real-time heavy vehicle transponder readings</p>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "0.25rem" }}>
                
                <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700 }}>VEHICLE SPEED</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: isInTransit ? "#38bdf8" : "#94a3b8", marginTop: "2px" }}>
                    {isInTransit ? "88 km/h" : "0 km/h"}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                    {isInTransit ? "Moving (Cruise Controlled)" : isDelivered ? "Docked at Destination" : "Halted (Staging at Depot)"}
                  </div>
                </div>

                <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700 }}>TELEMETRY PING</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#10b981", marginTop: "2px" }}>
                    15s
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>NFR-02 Compliant</div>
                </div>

                <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700 }}>SATELLITE SIGNAL</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#f8fafc", marginTop: "2px" }}>
                    Telstra 4G
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#38bdf8" }}>Iridium Backup Link</div>
                </div>

                <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700 }}>CARGO COMPARTMENT</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#10b981", marginTop: "2px" }}>
                    Secure
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>NT Transit Compliant</div>
                </div>

              </div>
            </div>

            {/* Automated SMS Alerts Feed (FR-09) */}
            <div className="glass-card">
              <div className="card-header flex-between">
                <div className="flex-align">
                  <div className="header-icon icon-primary">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h2>Automated SMS Alerts (FR-09)</h2>
                    <p className="text-muted">Live simulated dispatch notification stream</p>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", marginTop: "0.25rem" }}>
                
                <div className="sms-preview-card">
                  <div className="sms-header">
                    <span className="sms-badge">
                      <MessageSquare size={12} style={{ display: "inline", marginRight: "4px" }} />
                      Dispatch Confirmation
                    </span>
                    <span className="sms-time">07:16 ACST</span>
                  </div>
                  <div className="sms-body">
                    "NorthLine Alert: Consignment #{job.id} booked & auto-assigned to {job.vehicle} ({job.driver}). ETA: {job.eta}. Live tracking: trackpoint.northline.com.au"
                  </div>
                </div>

                <div className="sms-preview-card">
                  <div className="sms-header">
                    <span className="sms-badge">
                      <MessageSquare size={12} style={{ display: "inline", marginRight: "4px" }} />
                      Corridor Departure
                    </span>
                    <span className="sms-time">08:45 ACST</span>
                  </div>
                  <div className="sms-body">
                    "NorthLine Alert: Vehicle departed Darwin depot heading South on Stuart Highway. Next checkpoint: Pine Creek."
                  </div>
                </div>

                {isDelivered && (
                  <div className="sms-preview-card" style={{ borderColor: "rgba(16, 185, 129, 0.4)" }}>
                    <div className="sms-header">
                      <span className="sms-badge" style={{ background: "rgba(16, 185, 129, 0.2)", color: "#10b981" }}>
                        <CheckCircle2 size={12} style={{ display: "inline", marginRight: "4px" }} />
                        Delivered & e-POD Signed
                      </span>
                      <span className="sms-time">14:38 ACST</span>
                    </div>
                    <div className="sms-body">
                      "NorthLine Alert: Consignment #{job.id} delivered at {job.dropoff}. Signed by {job.recipientName || 'Sandra Wilson'}. Tax Invoice available in portal."
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Commercial Tax Invoice & e-POD Card (FR-11) */}
            <div className="glass-card" id="invoice">
              <div className="card-header flex-between">
                <div className="flex-align">
                  <div className="header-icon icon-success">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h2>Official Tax Invoice & e-POD (FR-11)</h2>
                    <p className="text-muted">Direct commercial billing & signed proof of delivery</p>
                  </div>
                </div>
                <div className="badge-status delivered" style={{ fontSize: "0.75rem" }}>
                  {isDelivered ? "Invoice Issued" : "Pending POD"}
                </div>
              </div>

              <div style={{ background: "rgba(15, 23, 42, 0.75)", padding: "1.15rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                {/* Invoice Metadata Header */}
                <div className="flex-between" style={{ paddingBottom: "0.75rem", borderBottom: "1px solid var(--border-color)", marginBottom: "0.75rem" }}>
                  <div>
                    <div style={{ fontWeight: 800, color: "#f8fafc", fontSize: "0.95rem" }}>NorthLine Freight & Logistics</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>ABN: 88 123 456 789 • Darwin NT</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, color: "#38bdf8", fontSize: "0.9rem" }}>INV-2026-{job.id.replace("TP-", "")}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Payment Terms: 14 Days Net</div>
                  </div>
                </div>

                {/* Bill To */}
                <div style={{ marginBottom: "0.75rem", fontSize: "0.8rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>Billed To: </span>
                  <strong style={{ color: "#f8fafc" }}>{job.customer}</strong>
                </div>

                {/* Line Item Breakdown */}
                <div className="flex-between" style={{ marginBottom: "0.4rem", fontSize: "0.82rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>Stuart Hwy Linehaul Freight Rate ({job.priority}):</span>
                  <span>$1,200.00 AUD</span>
                </div>
                <div className="flex-between" style={{ marginBottom: "0.4rem", fontSize: "0.82rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>Australian Goods & Services Tax (10% GST):</span>
                  <span>$120.00 AUD</span>
                </div>
                <div className="flex-between" style={{ borderTop: "1px solid var(--border-color)", paddingTop: "0.6rem", marginTop: "0.6rem" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>Total Amount Payable:</span>
                  <strong style={{ fontSize: "1.15rem", color: "#10b981" }}>$1,320.00 AUD</strong>
                </div>

                {/* e-POD Digital Signature Display if Delivered */}
                {isDelivered && (
                  <div style={{ marginTop: "1rem", borderTop: "1px solid var(--border-color)", paddingTop: "0.85rem" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <CheckCircle2 size={13} color="#10b981" />
                      <span>Electronic Proof of Delivery (e-POD) Sign-Off:</span>
                    </div>
                    {job.signatureDataUrl ? (
                      <div style={{ background: "#0b1320", padding: "0.65rem", borderRadius: "6px", border: "1px solid rgba(56, 189, 248, 0.3)", textAlign: "center" }}>
                        <img src={job.signatureDataUrl} alt="Consignee Signature" style={{ maxHeight: "65px", maxWidth: "100%" }} />
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "4px" }}>
                          Signed by: <strong style={{ color: "#f8fafc" }}>{job.recipientName || "Sandra Wilson"}</strong> • {job.completedAt || "24-Sep-2026 14:38:12 ACST"}
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "0.65rem", borderRadius: "6px", fontSize: "0.8rem", color: "#10b981", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <CheckCircle2 size={16} />
                        <span>e-POD Signed digitally on Driver Mobile Handset by <strong>{job.recipientName || "Sandra Wilson"}</strong></span>
                      </div>
                    )}
                  </div>
                )}

                {/* Invoice Action Buttons */}
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, fontSize: "0.78rem" }}
                    onClick={() => window.print()}
                  >
                    <Printer size={13} />
                    <span>Print Invoice</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, fontSize: "0.78rem" }}
                    onClick={() => {
                      toast.info(`Generating ATO Tax Invoice & e-POD PDF for Consignment #${job.id}...`, "Exporting PDF");
                      window.print();
                    }}
                  >
                    <Download size={13} />
                    <span>Download e-POD PDF</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>
    </>
  );
}
