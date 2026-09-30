"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Job, jobsDB } from "@/lib/data";
import { Compass, Navigation, Radio, MapPin } from "lucide-react";

// Dynamically import MapView to prevent SSR window issues
const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function DriverNavigationPage() {
  const [activeJob, setActiveJob] = useState<Job>(jobsDB[0]);

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

          if (myJob) setActiveJob(myJob);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Left 8 Cols: Full Stuart Highway Map */}
      <div className="lg:col-span-8 bg-slate-900/90 border border-white/10 rounded-2xl overflow-hidden shadow-2xl min-h-[540px]">
        <MapView
          truckLat={activeJob.lat}
          truckLng={activeJob.lng}
          driverName={activeJob.driver}
          vehicleName={activeJob.vehicle}
          pickupAddress={activeJob.pickup}
          dropoffAddress={activeJob.dropoff}
          status={activeJob.status}
        />
      </div>

      {/* Right 4 Cols: Navigation Telematics Card */}
      <div className="lg:col-span-4 space-y-4">
        
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 space-y-4 backdrop-blur-md">
          <div className="flex items-center gap-2 text-emerald-400">
            <Compass size={18} />
            <h3 className="text-base font-extrabold m-0">Stuart Hwy Telematics</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/80 p-3 rounded-xl border border-white/5">
              <div className="text-[10px] text-slate-400 uppercase font-bold">SPEED (CAN-BUS)</div>
              <div className="text-lg font-extrabold text-emerald-400 mt-1">
                {activeJob.status === "In Transit" ? "88 km/h" : "0 km/h"}
              </div>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-white/5">
              <div className="text-[10px] text-slate-400 uppercase font-bold">EST. ARRIVAL</div>
              <div className="text-sm font-extrabold text-slate-100 mt-1">
                {activeJob.eta}
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

            <div className="flex items-center gap-2.5 text-slate-400">
              <span className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[10px]">○</span>
              <span>Katherine Receiving Dock (Final Delivery)</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
