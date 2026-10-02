"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Package,
  Truck,
  Building2,
  FileText,
  BarChart3,
  Database,
  RefreshCw,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  UserCheck,
  Radio,
  Layers,
  LayoutGrid,
  Sparkles
} from "lucide-react";

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  consignmentsCount?: number;
  fleetCount?: number;
  dbStatus?: "connected" | "syncing";
  onRefreshDB?: () => void;
  isRefreshing?: boolean;
  userProfile?: {
    name: string;
    org: string;
    email: string;
  };
  onLogout?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function AdminSidebar({
  isCollapsed,
  onToggleCollapse,
  consignmentsCount = 10,
  fleetCount = 35,
  dbStatus = "connected",
  onRefreshDB,
  isRefreshing = false,
  userProfile = {
    name: "Mahir Sadman",
    org: "NorthLine Darwin Ops Control (S395312)",
    email: "mahir.sadman17@gmail.com"
  },
  onLogout,
  isMobileOpen,
  onCloseMobile
}: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/admin/consignments",
      label: "Consignments & Queue",
      icon: <Package size={19} />,
      badge: `${consignmentsCount}`,
      badgeColor: "#38bdf8"
    },
    {
      href: "/admin/dispatch",
      label: "Dispatcher Board",
      icon: <LayoutGrid size={19} />,
      badge: "Auto (FR-02)",
      badgeColor: "#60a5fa"
    },
    {
      href: "/admin/fleet",
      label: "NT Fleet Telematics",
      icon: <Truck size={19} />,
      badge: `${fleetCount} Trucks`,
      badgeColor: "#34d399"
    },
    {
      href: "/admin/drivers",
      label: "Driver Management",
      icon: <UserCheck size={19} />,
      badge: "6 Roster",
      badgeColor: "#10b981"
    },
    {
      href: "/admin/clients",
      label: "Customer Management",
      icon: <Building2 size={19} />,
      badge: "8 B2B",
      badgeColor: "#818cf8"
    },
    {
      href: "/admin/invoices",
      label: "Invoices & e-POD Audit",
      icon: <FileText size={19} />,
      badge: "ATO Ready",
      badgeColor: "#fbbf24"
    },
    {
      href: "/admin/analytics",
      label: "Operations & Fuel Analytics",
      icon: <BarChart3 size={19} />,
      badge: "96.4% SLA",
      badgeColor: "#f472b6"
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        style={{
          width: isCollapsed ? "76px" : "280px"
        }}
        className="bg-gradient-to-b from-slate-900/98 to-slate-950/99 border-r border-white/10 flex flex-col h-screen sticky top-0 left-0 z-[9999] transition-all duration-300 shadow-2xl shrink-0"
      >
        {/* Top Header / Branding */}
        <div
          className={`border-b border-white/10 flex items-center ${
            isCollapsed ? "p-4 justify-center" : "p-5 justify-between"
          }`}
        >
          <Link href="/admin" className="flex items-center gap-3 overflow-hidden no-underline">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 shrink-0">
              <ShieldCheck size={22} />
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base text-slate-100 tracking-tight">
                    TrackPoint
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                    ERP
                  </span>
                </div>
                <div className="text-xs text-slate-400 truncate">
                  NorthLine Darwin Ops
                </div>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Button */}
          {!isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="bg-white/5 border border-white/10 text-slate-400 hover:text-white rounded-lg p-1.5 cursor-pointer flex items-center justify-center transition"
              title="Collapse Sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Collapsed Expand Trigger */}
        {isCollapsed && (
          <div className="p-2 flex justify-center">
            <button
              onClick={onToggleCollapse}
              className="bg-white/5 border border-white/10 text-sky-400 hover:text-white rounded-lg p-2 cursor-pointer flex items-center justify-center w-full transition"
              title="Expand Sidebar"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Navigation List */}
        <div className={`flex-1 overflow-y-auto flex flex-col gap-1.5 ${isCollapsed ? "p-2" : "p-3"}`}>
          {!isCollapsed && (
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 pt-2 pb-1">
              Operations Control
            </div>
          )}

          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === "/admin/consignments" && pathname === "/admin");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 w-full rounded-xl transition no-underline relative ${
                  isCollapsed ? "py-3 justify-center" : "px-3.5 py-2.5 justify-between"
                } ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600/30 to-sky-500/15 border border-sky-400/40 text-white shadow-sm"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
                }`}
                title={item.label}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r bg-sky-400 shadow-md shadow-sky-400" />
                )}

                <div className="flex items-center gap-3 min-w-0">
                  <div className={`${isActive ? "text-sky-400" : "text-slate-400"} shrink-0`}>
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <span className={`text-xs font-medium truncate ${isActive ? "font-bold text-white" : ""}`}>
                      {item.label}
                    </span>
                  )}
                </div>

                {!isCollapsed && item.badge && (
                  <span
                    style={{ color: item.badgeColor || "#cbd5e1" }}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      isActive ? "bg-sky-500/20 border-sky-400/30" : "bg-white/5 border-white/10"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <hr className="border-white/5 my-3" />

          {/* Quick Cross-Role Portals */}
          {!isCollapsed && (
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 pb-1">
              Portals Switcher
            </div>
          )}

          <Link
            href="/customer"
            className={`flex items-center gap-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition no-underline text-xs ${
              isCollapsed ? "py-2.5 justify-center" : "px-3 py-2 justify-start"
            }`}
            title="Open Customer Consignment Portal"
          >
            <div className="text-sky-400 shrink-0">
              <ExternalLink size={15} />
            </div>
            {!isCollapsed && <span>Customer Portal (/customer)</span>}
          </Link>

          <Link
            href="/driver"
            className={`flex items-center gap-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition no-underline text-xs ${
              isCollapsed ? "py-2.5 justify-center" : "px-3 py-2 justify-start"
            }`}
            title="Open Driver In-Cab Console"
          >
            <div className="text-emerald-400 shrink-0">
              <Truck size={15} />
            </div>
            {!isCollapsed && <span>Driver Console (/driver)</span>}
          </Link>
        </div>

        {/* Bottom Database & User Info */}
        <div className={`border-t border-white/10 p-3 bg-slate-950/60 flex flex-col gap-2 ${isCollapsed ? "items-center" : ""}`}>
          {!isCollapsed && (
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Database size={13} className={dbStatus === "connected" ? "text-emerald-400" : "text-amber-400"} />
                <span className="text-[11px]">MongoDB Atlas Live</span>
              </div>
              {onRefreshDB && (
                <button
                  onClick={onRefreshDB}
                  disabled={isRefreshing}
                  className="bg-transparent border-none text-sky-400 hover:text-sky-300 p-1 cursor-pointer flex items-center"
                  title="Refresh Database Cluster"
                >
                  <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
                </button>
              )}
            </div>
          )}

          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <UserCheck size={14} />
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-200 truncate">{userProfile.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{userProfile.org}</div>
                </div>
              )}
            </div>

            {!isCollapsed && onLogout && (
              <button
                onClick={onLogout}
                className="bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 rounded-lg p-1.5 cursor-pointer transition flex items-center justify-center"
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
