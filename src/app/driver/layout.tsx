"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import DriverSidebar from "@/components/DriverSidebar";
import ClientOnly from "@/components/ClientOnly";
import { useToast } from "@/context/ToastContext";
import {
  Menu,
  Clock,
  LogOut,
  UserCheck,
  ChevronRight,
  Wifi,
  WifiOff,
  Truck,
  Zap,
  Package,
  Navigation,
  ShieldCheck
} from "lucide-react";
import { DRIVER_ACCOUNTS } from "@/lib/drivers";

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("Darwin ACST");

  const [userProfile, setUserProfile] = useState({
    name: "Dave Miller",
    org: "Mack Titan (Truck #NL-14)",
    email: "d.miller@northline.com.au"
  });

  // ACST Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-AU", {
          timeZone: "Australia/Darwin",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false
        }) + " ACST"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem("trackpoint_user");
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setUserProfile(u);
      } catch (e) {}
    }

    const savedSidebar = localStorage.getItem("trackpoint_driver_sidebar_collapsed");
    if (savedSidebar !== null) {
      setIsSidebarCollapsed(savedSidebar === "true");
    }
  }, []);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("trackpoint_driver_sidebar_collapsed", String(next));
      return next;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("trackpoint_token");
    localStorage.removeItem("trackpoint_user");
    router.push("/");
  };

  const getSectionTitle = () => {
    if (pathname?.includes("/driver/manifest")) return "My Daily Manifest Queue & Schedule";
    if (pathname?.includes("/driver/navigation")) return "Stuart Highway Corridor GPS Map";
    if (pathname?.includes("/driver/safety")) return "NHVR Fatigue Clock & Vehicle Rig Inspection";
    return "Active Drop & e-POD Signature Workflow";
  };

  return (
    <ClientOnly>
      <div className="flex min-h-screen bg-slate-950 text-slate-100 antialiased font-sans">
        
        {/* Left Driver In-Cab Navigation Sidebar */}
        <DriverSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
          isOffline={isOffline}
          userProfile={userProfile}
          onLogout={handleLogout}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          
          {/* Workspace Sticky Header */}
          <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-white/10 px-6 py-3.5 flex justify-between items-center gap-4">
            
            {/* Left: Mobile Toggle & Breadcrumbs */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={handleToggleSidebar}
                className="bg-white/5 border border-white/10 text-slate-400 hover:text-white rounded-lg p-2 cursor-pointer flex items-center justify-center transition"
                title="Toggle Sidebar"
              >
                <Menu size={18} />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span>Driver Console</span>
                  <ChevronRight size={12} />
                  <span className="text-emerald-400 font-semibold">{getSectionTitle()}</span>
                </div>
                <h1 className="text-lg font-extrabold text-slate-100 tracking-tight truncate m-0">
                  {getSectionTitle()}
                </h1>
              </div>
            </div>

            {/* Right: Quick Action Controls, Clock, 4G / Dead Zone, Profile */}
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              
              {/* ACST Clock */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 font-mono">
                <Clock size={13} className="text-emerald-400" />
                <span>{currentTime || "Darwin ACST"}</span>
              </div>

              {/* 4G / Dead Zone Toggle */}
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                  isOffline
                    ? "bg-red-500/15 border-red-500/40 text-red-300"
                    : "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                }`}
              >
                {isOffline ? <WifiOff size={13} /> : <Wifi size={13} />}
                <span>{isOffline ? "Offline Queue" : "4G Connected"}</span>
                <input
                  type="checkbox"
                  checked={isOffline}
                  onChange={(e) => {
                    setIsOffline(e.target.checked);
                    if (!e.target.checked) {
                      toast.success("Cellular Restored: Local offline e-POD queue synchronized to cloud!", "Connected");
                    } else {
                      toast.warning("Simulated cellular dead zone active. Deliveries cached locally.", "Offline Mode");
                    }
                  }}
                  className="cursor-pointer ml-1"
                  title="Simulate Remote Outback Cellular Dead Zone"
                />
              </div>

              {/* Driver Account Switcher Dropdown */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-600/15 border border-emerald-500/30 text-xs text-emerald-300 font-semibold">
                <UserCheck size={14} className="text-emerald-400 shrink-0" />
                <select
                  value={userProfile.email}
                  onChange={(e) => {
                    const selected = DRIVER_ACCOUNTS.find((d) => d.email === e.target.value);
                    if (selected) {
                      const updated = {
                        name: selected.name,
                        email: selected.email,
                        org: selected.vehicleName,
                        role: "driver",
                        userId: selected.id
                      };
                      setUserProfile(updated);
                      localStorage.setItem("trackpoint_user", JSON.stringify(updated));
                      window.dispatchEvent(new Event("storage"));
                      window.location.reload();
                    }
                  }}
                  className="bg-transparent border-none text-emerald-300 font-bold text-xs focus:outline-none cursor-pointer pr-1"
                  title="Switch Logged-In Driver Account"
                >
                  {DRIVER_ACCOUNTS.map((d) => (
                    <option key={d.id} value={d.email} className="bg-slate-900 text-slate-100">
                      Driver: {d.name} ({d.vehicleId} • {d.licenseClass})
                    </option>
                  ))}
                </select>
              </div>

              {/* Vehicle Badge */}
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
                <Truck size={13} className="text-sky-400" />
                <span className="truncate max-w-[180px]">{userProfile.org}</span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 rounded-lg p-2 cursor-pointer transition flex items-center justify-center"
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          </header>

          {/* Main Workspace Body */}
          <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </ClientOnly>
  );
}
