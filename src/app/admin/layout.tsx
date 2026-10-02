"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import ClientOnly from "@/components/ClientOnly";
import { useToast } from "@/context/ToastContext";
import {
  Menu,
  Clock,
  RefreshCw,
  LogOut,
  UserCheck,
  ChevronRight,
  Package,
  Truck,
  Building2,
  FileText,
  BarChart3,
  LayoutGrid
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dbStatus, setDbStatus] = useState<"connected" | "syncing">("connected");
  const [currentTime, setCurrentTime] = useState<string>("");

  const [userProfile, setUserProfile] = useState({
    name: "Mahir Sadman",
    org: "NorthLine Darwin Ops Control (S395312)",
    email: "mahir.sadman17@gmail.com"
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

    const savedSidebar = localStorage.getItem("trackpoint_sidebar_collapsed");
    if (savedSidebar !== null) {
      setIsSidebarCollapsed(savedSidebar === "true");
    }
  }, []);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("trackpoint_sidebar_collapsed", String(next));
      return next;
    });
  };

  const handleRefreshDB = async () => {
    setIsRefreshing(true);
    setDbStatus("syncing");
    try {
      await Promise.all([fetch("/api/jobs"), fetch("/api/fleet")]);
      setDbStatus("connected");
      toast.success("Synchronized with MongoDB Atlas live cluster.", "Database Synced");
    } catch (err) {
      console.error(err);
      setDbStatus("connected");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("trackpoint_token");
    localStorage.removeItem("trackpoint_user");
    toast.info("Logged out of NorthLine Operations console.", "Signed Out");
    router.push("/");
  };

  // Section titles
  const getSectionTitle = () => {
    if (pathname?.includes("/admin/fleet")) return "NT Fleet Telematics & Live Map";
    if (pathname?.includes("/admin/drivers")) return "Driver Fleet Roster & BFM Compliance";
    if (pathname?.includes("/admin/clients") || pathname?.includes("/admin/customers")) return "Customer & Commercial Accounts Management";
    if (pathname?.includes("/admin/invoices")) return "Invoicing & e-POD Audit Release";
    if (pathname?.includes("/admin/analytics")) return "Operations & Fuel Analytics";
    if (pathname?.includes("/admin/dispatch")) return "Dispatcher Board & Automated Queue";
    return "Consignments & Dispatch Queue";
  };

  return (
    <ClientOnly>
      <div className="flex min-h-screen bg-slate-950 text-slate-100 antialiased font-sans">
        
        {/* Left Sidebar Navigation */}
        <AdminSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
          dbStatus={dbStatus}
          onRefreshDB={handleRefreshDB}
          isRefreshing={isRefreshing}
          userProfile={userProfile}
          onLogout={handleLogout}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Workspace */}
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          
          {/* Workspace Sticky Header */}
          <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-white/10 px-6 py-3.5 flex justify-between items-center gap-4">
            
            {/* Left: Mobile Toggle & Breadcrumb */}
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
                  <span>NorthLine Operations</span>
                  <ChevronRight size={12} />
                  <span className="text-sky-400 font-semibold">{getSectionTitle()}</span>
                </div>
                <h1 className="text-lg font-extrabold text-slate-100 tracking-tight truncate m-0">
                  {getSectionTitle()}
                </h1>
              </div>
            </div>

            {/* Right: Quick Action Controls, Clock, Operator */}
            <div className="flex items-center gap-3 shrink-0">
              
              {/* ACST Clock */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 font-mono">
                <Clock size={13} className="text-sky-400" />
                <span>{currentTime || "Darwin ACST"}</span>
              </div>

              {/* Atlas Sync Button */}
              <button
                onClick={handleRefreshDB}
                disabled={isRefreshing}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white cursor-pointer transition"
                title="Sync with MongoDB Atlas live cluster"
              >
                <RefreshCw size={13} className={isRefreshing ? "animate-spin text-sky-400" : "text-sky-400"} />
                <span>Sync DB</span>
              </button>

              {/* Operator Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/15 border border-blue-500/30 text-xs text-blue-300 font-semibold">
                <UserCheck size={14} className="text-blue-400" />
                <span className="truncate max-w-[120px]">{userProfile.name}</span>
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
