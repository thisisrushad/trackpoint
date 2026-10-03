"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Job, jobsDB } from "@/lib/data";
import { useToast } from "@/context/ToastContext";
import { Compass, Navigation, Radio, MapPin, CheckCircle2, Lock, ArrowRight } from "lucide-react";

// Dynamically import MapView to prevent SSR window issues
const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function DriverNavigationPage() {
  const toast = useToast();
  const router = useRouter();
  const [activeJob, setActiveJob] = useState<Job>(jobsDB[0]);
  const [hasMapArrived, setHasMapArrived] = useState(false);
  const [mapProgress, setMapProgress] = useState(30);
  const [isUpdating, setIsUpdating] = useState(false);

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
          const dLower = currentDriver.toLowerCase();
          const myJob =
            data.jobs.find(
              (j: Job) =>
                (j.driver.toLowerCase().includes(dLower) ||
                  dLower.includes(j.driver.toLowerCase()) ||
                  (dLower.includes("liam") && (j.driver.toLowerCase().includes("liam") || j.vehicle.toLowerCase().includes("nl-01"))) ||
                  (dLower.includes("dave") && (j.driver.toLowerCase().includes("dave") || j.vehicle.toLowerCase().includes("nl-14")))) &&
                (j.status === "In Transit" || j.status === "Assigned")
            ) ||
            data.jobs.find((j: Job) => j.driver.toLowerCase().includes(dLower) || dLower.includes(j.driver.toLowerCase())) ||
            data.jobs[0];

          if (myJob) {
            setActiveJob(myJob);
            if (myJob.status === "Arrived" || myJob.status === "QC Passed" || myJob.status === "Delivered") {
              setHasMapArrived(true);
              setMapProgress(100);
            }
          }
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Left 8 Cols: Full Stuart Highway Map */}
      <div className="lg:col-span-8 bg-slate-900/90 border border-white/10 rounded-2xl overflow-hidden shadow-2xl min-h-[540px]">
        <MapView
          jobId={activeJob.id}
          truckLat={activeJob.lat}
          truckLng={activeJob.lng}
          driverName={activeJob.driver}
          vehicleName={activeJob.vehicle}
          pickupAddress={activeJob.pickup}
          dropoffAddress={activeJob.dropoff}
          status={activeJob.status}
          onPositionUpdate={(coords) => {
            setActiveJob((prev) => ({ ...prev, lat: coords[0], lng: coords[1] }));
          }}
          onProgressChange={(progress, hasArrived) => {
            setMapProgress(progress);
            if (hasArrived) {
              setHasMapArrived(true);
            }
          }}
          onArrival={async () => {
            setHasMapArrived(true);
            setMapProgress(100);
            toast.success("Truck reached destination receiving dock coordinates! Ready to mark dock arrival.", "Destination Reached");
            try {
              await fetch(`/api/jobs/${activeJob.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lat: activeJob.lat, lng: activeJob.lng })
              });
            } catch (e) {}
          }}
        />
      </div>

      {/* Right 4 Cols: Navigation Telematics Card */}
      <div className="lg:col-span-4 space-y-4">
        
        {/* Dock Arrival Action Card */}
        <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-5 space-y-3 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2 m-0">
              <MapPin size={16} className="text-purple-400" />
              <span>Receiving Bay Docking</span>
            </h3>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
              hasMapArrived || activeJob.status === "Arrived"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
            }`}>
              {hasMapArrived || activeJob.status === "Arrived" ? "Dock Ready" : `En Route (${mapProgress}%)`}
            </span>
          </div>

          {!hasMapArrived && activeJob.status === "In Transit" && (
            <div className="text-xs text-amber-200/90 bg-amber-500/10 border border-amber-500/25 p-2.5 rounded-xl flex items-start gap-2">
              <Lock size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <span>Arrival locked until vehicle reaches destination dock in the map. Use &apos;Reach Dock&apos; on map bar to test.</span>
            </div>
          )}

          {activeJob.status === "In Transit" && (
            <button
              type="button"
              disabled={isUpdating || !hasMapArrived}
              onClick={async () => {
                if (!hasMapArrived) {
                  toast.warning("Vehicle is still en route. Wait until destination coordinates are reached.", "Dock Arrival Locked");
                  return;
                }
                setIsUpdating(true);
                try {
                  const res = await fetch(`/api/jobs/${activeJob.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "Arrived" })
                  });
                  const data = await res.json();
                  if (data.success && data.job) {
                    setActiveJob(data.job);
                    toast.success("Status updated to Arrived! Proceeding to Driver Active Workflow...", "Dock Arrived");
                    setTimeout(() => {
                      router.push(`/driver/active?id=${data.job.id}`);
                    }, 800);
                  }
                } catch (e: any) {
                  toast.error("Failed to mark dock arrival", "Error");
                } finally {
                  setIsUpdating(false);
                }
              }}
              className={`w-full py-2.5 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition ${
                hasMapArrived
                  ? "bg-purple-600 hover:bg-purple-500 text-white cursor-pointer shadow-lg shadow-purple-500/30"
                  : "bg-purple-950/40 text-purple-300/40 border border-purple-500/20 cursor-not-allowed opacity-60"
              }`}
            >
              {!hasMapArrived ? <Lock size={14} /> : <CheckCircle2 size={14} />}
              <span>Mark Dock Arrival {!hasMapArrived ? "(Locked: En Route)" : "(Set Status: Arrived)"}</span>
            </button>
          )}

          {activeJob.status === "Arrived" && (
            <div className="space-y-2">
              <div className="text-xs text-purple-300 bg-purple-500/15 border border-purple-500/30 p-2.5 rounded-xl font-bold flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span>Vehicle Docked at Destination Bay</span>
              </div>
              <Link
                href={`/driver/active?id=${activeJob.id}`}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 no-underline transition"
              >
                <span>Proceed to Active Run & e-POD</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>

        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 space-y-4 backdrop-blur-md">
          <div className="flex items-center gap-2 text-emerald-400">
            <Compass size={18} />
            <h3 className="text-base font-extrabold m-0">Stuart Hwy Telematics</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/80 p-3 rounded-xl border border-white/5">
              <div className="text-[10px] text-slate-400 uppercase font-bold">SPEED (CAN-BUS)</div>
              <div className="text-lg font-extrabold text-emerald-400 mt-1">
                {activeJob.status === "In Transit" && !hasMapArrived ? "88 km/h" : "0 km/h (Docked)"}
              </div>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-white/5">
              <div className="text-[10px] text-slate-400 uppercase font-bold">EST. ARRIVAL</div>
              <div className="text-sm font-extrabold text-slate-100 mt-1">
                {hasMapArrived || activeJob.status === "Arrived" ? "Arrived" : activeJob.eta}
              </div>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-white/5">
            <div><strong>Corridor Waypoint:</strong> Adelaide River ➔ Pine Creek</div>
            <div><strong>Destination Dock:</strong> {activeJob.dropoff}</div>
            <div><strong>Heavy Vehicle:</strong> {activeJob.vehicle}</div>
          </div>
        </div>

        {/* Checkpoints */}
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 space-y-3 backdrop-blur-md">
          <h4 className="text-xs uppercase font-bold text-slate-400 m-0 tracking-wider">
            Route Checkpoints
          </h4>

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2.5 text-emerald-400 font-semibold">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">✓</span>
              <span>Darwin Berrimah Depot (Departed 08:30)</span>
            </div>

            <div className="flex items-center gap-2.5 text-emerald-300 font-bold">
              <span className="w-5 h-5 rounded-full bg-emerald-500/30 border border-emerald-400 flex items-center justify-center text-[10px] animate-pulse">●</span>
              <span>Stuart Hwy Km 114 (Adelaide River)</span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-400">
              <span className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[10px]">○</span>
              <span>Pine Creek Truck Stop Rest Bay</span>
            </div>

            <div className={`flex items-center gap-2.5 ${hasMapArrived || activeJob.status === "Arrived" ? "text-emerald-400 font-bold" : "text-slate-400"}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${hasMapArrived || activeJob.status === "Arrived" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-400" : "bg-white/5"}`}>
                {hasMapArrived || activeJob.status === "Arrived" ? "✓" : "○"}
              </span>
              <span>Katherine Receiving Dock (Final Delivery)</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
