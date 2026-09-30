"use client";

import React, { useState, useEffect } from "react";
import { Coffee, Gauge, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function DriverSafetyPage() {
  const toast = useToast();
  const [drivingMinutes, setDrivingMinutes] = useState(225); // 3h 45m
  const [isResting, setIsResting] = useState(false);
  const [driverInfo, setDriverInfo] = useState({
    name: "Dave Miller",
    vehicle: "Mack Titan (Truck #NL-14)"
  });

  useEffect(() => {
    const saved = localStorage.getItem("trackpoint_user");
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u.name) setDriverInfo({ name: u.name, vehicle: u.org || "Assigned Heavy Vehicle" });
      } catch (e) {}
    }
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      
      {/* Left: NHVR Fatigue Management Card */}
      <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 space-y-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2.5 text-amber-400">
          <Coffee size={22} />
          <h3 className="text-lg font-extrabold m-0">
            NHVR Heavy Vehicle Fatigue Clock (CR-05)
          </h3>
        </div>

        <p className="text-xs text-slate-400 m-0">
          National Heavy Vehicle Regulator electronic work diary compliance along the Stuart Highway.
        </p>

        <div className="bg-slate-950/80 p-4 rounded-xl border border-white/10 space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">Continuous Driving Time:</span>
            <strong className="text-base font-extrabold text-amber-400">
              {Math.floor(drivingMinutes / 60)}h {drivingMinutes % 60}m / 5h 30m max
            </strong>
          </div>

          <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min(100, (drivingMinutes / 330) * 100)}%` }}
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
            />
          </div>

          <div className="text-[11px] text-sky-400 font-semibold">
            ⏱️ 1h 45m remaining before mandatory 15-minute rest break
          </div>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-xl border border-white/10 space-y-1">
          <div className="text-xs text-slate-400">Nearest Stuart Highway Rest Stop:</div>
          <div className="text-sm font-extrabold text-slate-100">
            ☕ Emerald Springs Roadhouse (28 km ahead)
          </div>
          <div className="text-xs text-emerald-400 font-semibold">
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
          className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition ${
            isResting
              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
              : "bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200"
          }`}
        >
          <Coffee size={15} />
          <span>{isResting ? "✓ End 15-Min Rest Break" : "Log 15-Min Rest Break Now"}</span>
        </button>
      </div>

      {/* Right: Vehicle Telematics & Pre-Trip Walkaround */}
      <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-6 space-y-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2.5 text-emerald-400">
          <Gauge size={22} />
          <h3 className="text-lg font-extrabold m-0">
            {driverInfo.vehicle} Telematics Diagnostics
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-white/5">
            <div className="text-[10px] text-slate-400 uppercase font-bold">FUEL LEVEL (DIESEL)</div>
            <div className="text-lg font-extrabold text-emerald-400 mt-1">
              74% (620 km)
            </div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-white/5">
            <div className="text-[10px] text-slate-400 uppercase font-bold">BRAKE AIR PRESSURE</div>
            <div className="text-lg font-extrabold text-sky-400 mt-1">
              8.4 Bar (Nominal)
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider m-0">
            Pre-Trip Safety Inspection Walkaround:
          </h4>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Steer & Drive Tyres Air Pressure Checked</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Turntable & Kingpin / Tow Coupling Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Load Restraint & Straps Tensioned</span>
            </div>
          </div>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Daily Pre-Start Walkaround verified by {driverInfo.name}.</span>
        </div>
      </div>

    </div>
  );
}
