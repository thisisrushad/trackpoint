"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Job, jobsDB } from "@/lib/data";
import { useToast } from "@/context/ToastContext";
import {
  Truck,
  MapPin,
  CheckCircle2,
  Phone,
  Camera,
  RotateCcw,
  Check,
  Zap,
  Navigation,
  ArrowRight,
  Clock,
  Lock,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

// Dynamically import MapView to avoid SSR issues
const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function DriverActiveRunContent() {
  const toast = useToast();
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id");

  const [job, setJob] = useState<Job>(jobsDB[0]);
  const [recipientName, setRecipientName] = useState("Sandra Wilson");
  const [deliveryNote, setDeliveryNote] = useState("Dock 2 Receiving - Heavy forklift required");
  const [photoAttached, setPhotoAttached] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasMapArrived, setHasMapArrived] = useState(false);
  const [mapProgress, setMapProgress] = useState(30);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    let currentDriver = "Dave Miller";
    const savedUser = typeof window !== "undefined" ? localStorage.getItem("trackpoint_user") : null;
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.name) currentDriver = u.name;
      } catch (e) {}
    }

    fetch("/api/jobs")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.jobs?.length > 0) {
          let selected = null;
          if (queryId) {
            selected = data.jobs.find((j: Job) => j.id.toLowerCase() === queryId.toLowerCase());
          }
          if (!selected) {
            const dLower = currentDriver.toLowerCase();
            // Prioritize active/assigned job for this specific driver
            selected =
              data.jobs.find(
                (j: Job) =>
                  (j.driver.toLowerCase().includes(dLower) ||
                    dLower.includes(j.driver.toLowerCase()) ||
                    (dLower.includes("liam") && (j.driver.toLowerCase().includes("liam") || j.vehicle.toLowerCase().includes("nl-01"))) ||
                    (dLower.includes("dave") && (j.driver.toLowerCase().includes("dave") || j.vehicle.toLowerCase().includes("nl-14"))) ||
                    (dLower.includes("mick") && (j.driver.toLowerCase().includes("mick") || j.vehicle.toLowerCase().includes("nl-19"))) ||
                    (dLower.includes("mark") && (j.driver.toLowerCase().includes("mark") || j.vehicle.toLowerCase().includes("nl-31")))) &&
                  (j.status === "Assigned" || j.status === "In Transit")
              ) ||
              data.jobs.find(
                (j: Job) =>
                  j.driver.toLowerCase().includes(dLower) ||
                  dLower.includes(j.driver.toLowerCase())
              );
          }
          if (!selected) {
            selected = data.jobs[0];
          }
          if (selected) {
            setJob(selected);
            if (selected.status === "Arrived" || selected.status === "QC Passed" || selected.status === "Delivered" || selected.status === "Invoiced") {
              setHasMapArrived(true);
              setMapProgress(100);
            }
          }
        }
      })
      .catch(console.error);
  }, [queryId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#34d399";
    ctx.lineWidth = 2.8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [job.id]);

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

  const handleStartTrip = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "In Transit" })
      });
      const data = await res.json();
      if (data.success && data.job) {
        setJob(data.job);
        toast.success(`Consignment #${job.id} is now IN TRANSIT on Stuart Highway. Customer notified!`, "Trip Started");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update trip status", "Error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmPOD = async () => {
    if (job.status !== "QC Passed") {
      if (job.status === "Arrived") {
        toast.warning(
          "Receiving dock inspection pending. Admin or Depot Supervisor must approve Quality Check (QC Passed) before customer signature can be collected.",
          "QC Approval Required"
        );
      } else {
        toast.warning(
          "Consignment must be docked at destination receiving bay and pass Admin/Depot QC inspection before e-POD can be signed.",
          "QC & Arrival Required"
        );
      }
      return;
    }

    const signatureData = canvasRef.current ? canvasRef.current.toDataURL() : undefined;

    if (!hasDrawn && !job.signatureDataUrl) {
      toast.warning("Please capture consignee signature on the pad before confirming delivery.", "Signature Required");
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
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
        setJob(data.job);
        toast.success(
          `Signed by ${recipientName}. Official Tax Invoice generated (INV-2026-${job.id.replace("TP-", "")}) & archived (FR-07, FR-08).`,
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
  };

  const isDelivered = job.status === "Delivered" || job.status === "Invoiced";
  const isQcPassed = job.status === "QC Passed";
  const isQcFailed = job.status === "QC Failed";
  const isArrived = job.status === "Arrived";
  const isInTransit = job.status === "In Transit";
  const isAssigned = job.status === "Assigned" || job.status === "Booked";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Left 7 Cols: Consignment Brief & Action Flow */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Step Lifecycle Action Hero Card */}
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-emerald-500/25 rounded-2xl p-6 shadow-xl backdrop-blur-md">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xl font-extrabold text-emerald-400">
                Consignment #{job.id}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {job.priority} Linehaul
              </span>
            </div>

            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                isDelivered
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : isQcPassed
                  ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                  : isQcFailed
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/50"
                  : isArrived
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                  : isInTransit
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-blue-500/20 text-blue-300 border-blue-500/40"
              }`}
            >
              Status: {job.status}
            </span>
          </div>

          {/* Trip Progression Step Bar - 5 Comprehensive Stages */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-5">
            <div className="bg-slate-900/80 border border-emerald-500/40 rounded-xl p-2.5 text-center">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Step 1</div>
              <div className="text-xs font-bold text-emerald-400 mt-0.5">
                {!isAssigned ? "✓ Departed" : "Depot Staging"}
              </div>
            </div>

            <div className={`bg-slate-900/80 border rounded-xl p-2.5 text-center ${isInTransit ? "border-amber-400/60" : isArrived || isQcPassed || isDelivered ? "border-emerald-500/40" : "border-white/10"}`}>
              <div className="text-[9px] text-slate-400 uppercase font-bold">Step 2</div>
              <div className={`text-xs font-bold mt-0.5 ${isArrived || isQcPassed || isDelivered ? "text-emerald-400" : isInTransit ? "text-amber-400" : "text-slate-400"}`}>
                {isArrived || isQcPassed || isDelivered ? "✓ Corridor Done" : isInTransit ? "⚡ In Transit" : "En Route"}
              </div>
            </div>

            <div className={`bg-slate-900/80 border rounded-xl p-2.5 text-center ${isArrived ? "border-purple-400/60" : isQcPassed || isDelivered ? "border-emerald-500/40" : "border-white/10"}`}>
              <div className="text-[9px] text-slate-400 uppercase font-bold">Step 3</div>
              <div className={`text-xs font-bold mt-0.5 ${isQcPassed || isDelivered ? "text-emerald-400" : isArrived ? "text-purple-300" : "text-slate-400"}`}>
                {isQcPassed || isDelivered ? "✓ Docked" : isArrived ? "🏁 Docked" : "Dock Arrival"}
              </div>
            </div>

            <div className={`bg-slate-900/80 border rounded-xl p-2.5 text-center ${isQcPassed ? "border-sky-400/60" : isDelivered ? "border-emerald-500/40" : "border-white/10"}`}>
              <div className="text-[9px] text-slate-400 uppercase font-bold">Step 4</div>
              <div className={`text-xs font-bold mt-0.5 ${isDelivered ? "text-emerald-400" : isQcPassed ? "text-sky-300" : isArrived ? "text-amber-300" : "text-slate-400"}`}>
                {isDelivered ? "✓ QC Passed" : isQcPassed ? "🛡️ QC Approved" : isArrived ? "⏳ QC Pending" : "QC Inspection"}
              </div>
            </div>

            <div className={`bg-slate-900/80 border rounded-xl p-2.5 text-center ${isDelivered ? "border-emerald-500/40" : "border-white/10"}`}>
              <div className="text-[9px] text-slate-400 uppercase font-bold">Step 5</div>
              <div className={`text-xs font-bold mt-0.5 ${isDelivered ? "text-emerald-400" : isQcPassed ? "text-emerald-400" : "text-slate-400"}`}>
                {isDelivered ? "✓ e-POD Signed" : isQcPassed ? "✍️ Ready to Sign" : "e-POD Receipt"}
              </div>
            </div>
          </div>

          {/* Dynamic Action Buttons */}
          <div className="flex flex-col gap-3">
            {isAssigned && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleStartTrip}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <Truck size={18} />
                <span>Start Trip & Depart Depot (Set In-Transit)</span>
              </button>
            )}

            {isInTransit && (
              <div className="space-y-3">
                {/* Lockout Notice when truck has not reached destination yet */}
                {!hasMapArrived && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-200">
                    <Lock size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <strong className="text-amber-300 font-bold block mb-0.5">
                        Dock Arrival Locked — Heavy Vehicle En Route ({mapProgress}% along Stuart Hwy)
                      </strong>
                      The vehicle has not arrived at the destination yet. Mark Dock Arrival unlocks automatically once the truck reaches the destination receiving dock coordinates on the corridor map.
                    </div>
                  </div>
                )}

                {hasMapArrived && (
                  <div className="bg-emerald-500/15 border border-emerald-500/40 rounded-xl p-3 flex items-start gap-2.5 text-xs text-emerald-200 animate-pulse">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div className="leading-relaxed font-semibold">
                      <strong className="text-emerald-300 font-bold block mb-0.5">
                        GPS Geo-Fence Reached Destination!
                      </strong>
                      Heavy vehicle detected at receiving bay coordinates. You can now confirm Dock Arrival.
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    disabled={isUpdating || !hasMapArrived}
                    onClick={async () => {
                      if (!hasMapArrived) {
                        toast.warning(
                          "Vehicle has not reached destination receiving dock coordinates yet. Please wait until arrival on the map.",
                          "Dock Arrival Locked"
                        );
                        return;
                      }
                      setIsUpdating(true);
                      try {
                        const res = await fetch(`/api/jobs/${job.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ status: "Arrived" })
                        });
                        const data = await res.json();
                        if (data.success && data.job) {
                          setJob(data.job);
                          toast.success(`Vehicle docked at destination receiving bay. Ready for Receiving Dock QC & e-POD sign-off.`, "Arrived at Destination");
                        }
                      } catch (err: any) {
                        toast.error("Failed to update status to Arrived", "Error");
                      } finally {
                        setIsUpdating(false);
                      }
                    }}
                    className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition ${
                      hasMapArrived
                        ? "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/30 cursor-pointer"
                        : "bg-purple-950/40 text-purple-300/40 border border-purple-500/20 cursor-not-allowed opacity-60"
                    }`}
                    title={!hasMapArrived ? "Disabled until truck reaches destination receiving dock on the map" : "Mark Dock Arrival"}
                  >
                    {!hasMapArrived ? <Lock size={15} /> : <MapPin size={15} />}
                    <span>Mark Dock Arrival {!hasMapArrived ? "(Locked: En Route)" : "(Set Status: Arrived)"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toast.info("Dock arrival notification transmitted to customer receiving department.", "Arrival Pushed")}
                    className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    <Phone size={14} className="text-emerald-400" />
                    <span>Alert Dock</span>
                  </button>
                </div>
              </div>
            )}

            {isArrived && (
              <div className="bg-purple-500/15 border border-purple-500/40 rounded-xl p-3.5 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 text-purple-300 text-xs font-bold">
                  <Clock size={16} />
                  <span>Vehicle Docked at Receiving Bay — Awaiting Receiving Dock QC Approval (QC Passed)</span>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setIsUpdating(true);
                    try {
                      const res = await fetch(`/api/jobs/${job.id}`);
                      const data = await res.json();
                      if (data.job) {
                        setJob(data.job);
                        if (data.job.status === "QC Passed") {
                          toast.success("QC has been approved by Operations! Signature pad is now unlocked.", "QC Passed");
                        } else if (data.job.status === "QC Failed") {
                          toast.error("Quality Check was flagged as FAILED by dock inspector. Awaiting Admin review.", "QC Failed");
                        } else {
                          toast.info("Status is still awaiting QC approval by Admin/Depot Inspector.", "QC In Progress");
                        }
                      }
                    } catch (e) {
                      toast.error("Failed to check QC status.", "Error");
                    } finally {
                      setIsUpdating(false);
                    }
                  }}
                  className="py-2 px-3.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Check QC Status 🔄
                </button>
              </div>
            )}

            {isQcFailed && (
              <div className="bg-rose-500/15 border border-rose-500/40 rounded-xl p-3.5 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
                  <ShieldCheck size={16} className="text-rose-400" />
                  <span>QC Inspection FAILED — Consignment blocked for delivery. Awaiting Operations Admin review.</span>
                </div>
                <button
                  type="button"
                  onClick={() => toast.info("Operations dispatch center has been notified of the QC failure hold.", "Admin Alerted")}
                  className="py-2 px-3.5 rounded-lg bg-rose-600/30 hover:bg-rose-600/40 border border-rose-500/40 text-rose-200 font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Escalate to Admin ⚠️
                </button>
              </div>
            )}

            {isQcPassed && (
              <div className="bg-sky-500/15 border border-sky-500/40 rounded-xl p-3.5 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 text-sky-300 text-xs font-bold">
                  <CheckCircle2 size={16} />
                  <span>Quality Check Passed! Consignee may now inspect goods & sign digital e-POD below.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("pod-signature-box");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="py-2 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Collect Signature ➔
                </button>
              </div>
            )}

            {isDelivered && (
              <div className="bg-emerald-500/15 border border-emerald-500/40 rounded-xl p-3.5 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                  <CheckCircle2 size={16} />
                  <span>Delivery Completed & e-POD Verified ({job.completedAt || "Today"})</span>
                </div>

                <Link
                  href="/driver/manifest"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold no-underline transition"
                >
                  Next Job in Queue ➔
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Routing & Cargo Specifications Card */}
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 space-y-4 backdrop-blur-md">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 m-0">
            <MapPin size={16} className="text-emerald-400" />
            <span>Stuart Highway Route & Customer Dock</span>
          </h3>

          <div className="space-y-3">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Pickup Origin Depot</div>
              <div className="text-sm font-semibold text-slate-200 mt-0.5">📍 {job.pickup}</div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-emerald-500/20">
              <div className="text-[10px] text-emerald-400 uppercase font-bold">Destination Receiving Dock</div>
              <div className="text-sm font-bold text-slate-100 mt-0.5">🏁 {job.dropoff}</div>
              <div className="text-xs text-slate-400 mt-1">
                Account: <strong className="text-slate-200">{job.customer}</strong>
              </div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Cargo Manifest</div>
              <div className="text-sm font-semibold text-amber-300 mt-0.5">📦 {job.goods}</div>
            </div>
          </div>

          {/* Live Stuart Highway GPS Corridor Mini-Map */}
          <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg bg-slate-950">
            <div className="bg-slate-950/90 px-3.5 py-2 border-b border-white/10 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Navigation size={13} className="text-emerald-400" />
                <span>Live Route Corridor GPS Tracking</span>
              </span>
              <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                hasMapArrived || isArrived || isDelivered
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
              }`}>
                {hasMapArrived || isArrived || isDelivered ? "🏁 Destination Dock Reached" : `🚚 ${mapProgress}% Complete En Route`}
              </span>
            </div>
            <MapView
              jobId={job.id}
              truckLat={job.lat}
              truckLng={job.lng}
              driverName={job.driver}
              vehicleName={job.vehicle}
              pickupAddress={job.pickup}
              dropoffAddress={job.dropoff}
              status={job.status}
              height="260px"
              onPositionUpdate={(coords) => {
                // Keep local job lat/lng synchronized only if actually changed
                setJob((prev) => {
                  if (prev.lat === coords[0] && prev.lng === coords[1]) return prev;
                  return { ...prev, lat: coords[0], lng: coords[1] };
                });
              }}
              onProgressChange={(progress, hasArrived) => {
                setMapProgress((prev) => (prev === progress ? prev : progress));
                if (hasArrived) {
                  setHasMapArrived((prev) => (prev ? prev : true));
                }
              }}
              onArrival={async () => {
                setHasMapArrived(true);
                setMapProgress(100);
                toast.success("Truck reached destination receiving dock coordinates on map! Dock arrival is now unlocked.", "Destination Reached");
                // Persist reached destination coordinates to database
                try {
                  await fetch(`/api/jobs/${job.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ lat: job.lat, lng: job.lng })
                  });
                } catch (e) {}
              }}
            />
          </div>

          <div className="flex gap-3">
            <a
              href="tel:+61889721144"
              className="flex-1 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold no-underline flex items-center justify-center gap-1.5 transition"
            >
              <Phone size={13} className="text-emerald-400" />
              <span>Call Receiving Dock</span>
            </a>
            <Link
              href="/driver/navigation"
              className="flex-1 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold no-underline flex items-center justify-center gap-1.5 transition"
            >
              <Navigation size={13} className="text-emerald-400" />
              <span>Full Highway Map</span>
            </Link>
          </div>
        </div>

      </div>

      {/* Right 5 Cols: e-POD Signature Box */}
      <div
        id="pod-signature-box"
        className="lg:col-span-5 bg-gradient-to-br from-slate-900/95 to-slate-950/98 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-4 backdrop-blur-md"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 size={18} />
            <h3 className="text-base font-extrabold m-0">e-POD Digital Signature</h3>
          </div>
          <span className="text-[10px] text-slate-400">FR-07 Compliant</span>
        </div>

        <p className="text-xs text-slate-400 m-0">
          Capture consignee receiver name and touchscreen signature upon delivery.
        </p>

        {/* Recipient Input */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300">Receiver Full Name:</label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="Receiver name (e.g. Sandra Wilson)"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-slate-100 text-sm focus:outline-none focus:border-emerald-400 transition"
          />
        </div>

        {/* Delivery Note */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300">Receiving Dock / Bay #:</label>
          <input
            type="text"
            value={deliveryNote}
            onChange={(e) => setDeliveryNote(e.target.value)}
            placeholder="E.g. Dock 2, Forklift Bay"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/15 text-slate-100 text-xs focus:outline-none focus:border-emerald-400 transition"
          />
        </div>

        {/* Canvas */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-300">Consignee Sign Here (Touch / Stylus):</label>
            {hasDrawn && (
              <button
                type="button"
                onClick={clearCanvas}
                className="bg-transparent border-none text-red-400 hover:text-red-300 text-xs cursor-pointer flex items-center gap-1"
              >
                <RotateCcw size={11} />
                <span>Clear</span>
              </button>
            )}
          </div>

          <div className="relative bg-slate-950 border-2 border-dashed border-emerald-500/40 rounded-xl h-36 overflow-hidden">
            <canvas
              ref={canvasRef}
              width={420}
              height={144}
              className={`w-full h-full touch-none ${isQcPassed ? "cursor-crosshair" : "cursor-not-allowed opacity-40"}`}
              onMouseDown={isQcPassed ? startDraw : undefined}
              onMouseMove={isQcPassed ? draw : undefined}
              onMouseUp={isQcPassed ? stopDraw : undefined}
              onMouseLeave={isQcPassed ? stopDraw : undefined}
              onTouchStart={isQcPassed ? startDraw : undefined}
              onTouchMove={isQcPassed ? draw : undefined}
              onTouchEnd={isQcPassed ? stopDraw : undefined}
            />

            {!hasDrawn && !job.signatureDataUrl && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 text-xs pointer-events-none gap-1">
                {isQcPassed ? (
                  <>
                    <span>✍️ Sign directly on screen</span>
                    <span className="text-[10px] opacity-75">(Receiver signature required)</span>
                  </>
                ) : isArrived ? (
                  <>
                    <span className="text-amber-400 font-bold">🔒 Locked: Quality Check Pending</span>
                    <span className="text-[10px] text-slate-400">Admin must approve QC before signature can be collected</span>
                  </>
                ) : (
                  <>
                    <span className="text-amber-400 font-bold">🔒 Locked: Vehicle in Transit</span>
                    <span className="text-[10px] text-slate-400">Truck must arrive and pass QC first</span>
                  </>
                )}
              </div>
            )}

            {job.signatureDataUrl && !hasDrawn && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <img src={job.signatureDataUrl} alt="Verified Signature" className="max-h-20" />
              </div>
            )}
          </div>
        </div>

        {/* Lockout Notice when still in transit or assigned */}
        {!isArrived && !isQcPassed && !isDelivered && (
          <div className="bg-amber-500/15 border border-amber-500/40 rounded-xl p-3 text-xs text-amber-300 flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span>
              <strong>e-POD Locked in Transit:</strong> Consignment must arrive at destination bay and pass Quality Check before receiver can sign off.
            </span>
          </div>
        )}

        {/* Lockout Notice when Arrived but QC Pending */}
        {isArrived && (
          <div className="bg-purple-500/15 border border-purple-500/40 rounded-xl p-3 text-xs text-purple-300 flex items-center gap-2">
            <span className="text-base">🛡️</span>
            <span>
              <strong>Quality Inspection Required:</strong> Vehicle docked. Awaiting Admin / Depot Receiving Inspector to certify seals & cold-chain and mark status <em>"QC Passed"</em>.
            </span>
          </div>
        )}

        {/* Unlocked Notice when QC Passed */}
        {isQcPassed && (
          <div className="bg-emerald-500/15 border border-emerald-500/40 rounded-xl p-3 text-xs text-emerald-300 flex items-center gap-2">
            <span className="text-base">✅</span>
            <span>
              <strong>QC Verified & Passed:</strong> Pad unlocked. Please collect Consignee signature and confirm delivery to generate official tax invoice.
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            disabled={!isQcPassed && !isDelivered}
            onClick={() => {
              setPhotoAttached(true);
              toast.success("Delivery dock cargo snapshot attached.", "Photo Attached");
            }}
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Camera size={14} className="text-emerald-400" />
            <span>{photoAttached ? "✓ Cargo Photo Attached (1 Image)" : "+ Attach Delivery Dock Photo"}</span>
          </button>

          <button
            type="button"
            disabled={isUpdating || !isQcPassed}
            onClick={handleConfirmPOD}
            className={`w-full py-3.5 rounded-xl font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 transition ${
              isQcPassed
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/30 cursor-pointer"
                : "bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed"
            }`}
          >
            <Check size={18} />
            <span>
              {isUpdating
                ? "Submitting e-POD..."
                : isDelivered
                ? "✓ Delivery Already Finalized"
                : isQcPassed
                ? "Sign e-POD & Complete Delivery"
                : isArrived
                ? "🔒 e-POD Locked (Awaiting QC Passed)"
                : "🔒 e-POD Locked (In Transit)"}
            </span>
          </button>
        </div>

      </div>

    </div>
  );
}

export default function DriverActiveRunPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading active consignment...</div>}>
      <DriverActiveRunContent />
    </Suspense>
  );
}

