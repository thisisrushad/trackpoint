"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Truck,
  Zap,
  Package,
  Navigation,
  ShieldCheck,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  LogOut,
  Wifi,
  WifiOff
} from "lucide-react";

interface DriverSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  manifestCount?: number;
  isOffline?: boolean;
  onToggleOffline?: (val: boolean) => void;
  userProfile?: {
    name: string;
    org: string;
    email: string;
  };
  onLogout?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function DriverSidebar({
  isCollapsed,
  onToggleCollapse,
  manifestCount = 4,
  isOffline = false,
  onToggleOffline,
  userProfile = {
    name: "Dave Miller",
    org: "Mack Titan (Truck #NL-14)",
    email: "d.miller@northline.com.au"
  },
  onLogout,
  isMobileOpen,
  onCloseMobile
}: DriverSidebarProps) {
  const pathname = usePathname();

  const router = useRouter();

  const handleNavigate = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // If mobile menu is open, dismiss it
    if (onCloseMobile) {
      onCloseMobile();
    }
    // Prevent default Next.js link interruption and route reliably
    if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      router.push(href);
    }
  };

  const navItems = [
    {
      href: "/driver/active",
      label: "Active Drop & e-POD",
      icon: <Zap size={19} />,
      badge: "In-Cab",
      badgeColor: "#34d399"
    },
    {
      href: "/driver/manifest",
      label: "My Manifest Queue",
      icon: <Package size={19} />,
      badge: `${manifestCount} Drops`,
      badgeColor: "#38bdf8"
    },
    {
      href: "/driver/navigation",
      label: "Corridor Highway Map",
      icon: <Navigation size={19} />,
      badge: "GPS Live",
      badgeColor: "#60a5fa"
    },
    {
      href: "/driver/safety",
      label: "Fatigue & Rig Safety",
      icon: <ShieldCheck size={19} />,
      badge: "NHVR",
      badgeColor: "#fbbf24"
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
          <Link
            href="/driver/active"
            onClick={(e) => handleNavigate(e, "/driver/active")}
            className="flex items-center gap-3 overflow-hidden no-underline cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 shrink-0">
              <Truck size={22} />
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base text-slate-100 tracking-tight">
                    TrackPoint
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Driver
                  </span>
                </div>
                <div className="text-xs text-slate-400 truncate">
                  In-Cab Console
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
              className="bg-white/5 border border-white/10 text-emerald-400 hover:text-white rounded-lg p-2 cursor-pointer flex items-center justify-center w-full transition"
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
              Driver Operations
            </div>
          )}

          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === "/driver/active" && pathname === "/driver");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavigate(e, item.href)}
                className={`flex items-center gap-3 w-full rounded-xl transition no-underline relative cursor-pointer select-none ${
                  isCollapsed ? "py-3 justify-center" : "px-3.5 py-2.5 justify-between"
                } ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-600/30 to-teal-500/15 border border-emerald-400/40 text-white shadow-sm"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
                }`}
                title={item.label}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r bg-emerald-400 shadow-md shadow-emerald-400" />
                )}

                <div className="flex items-center gap-3 min-w-0">
                  <div className={`${isActive ? "text-emerald-400" : "text-slate-400"} shrink-0`}>
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
                      isActive ? "bg-emerald-500/20 border-emerald-400/30" : "bg-white/5 border-white/10"
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
            onClick={(e) => handleNavigate(e, "/customer")}
            className={`flex items-center gap-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition no-underline text-xs cursor-pointer select-none ${
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
            href="/admin"
            onClick={(e) => handleNavigate(e, "/admin")}
            className={`flex items-center gap-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition no-underline text-xs cursor-pointer select-none ${
              isCollapsed ? "py-2.5 justify-center" : "px-3 py-2 justify-start"
            }`}
            title="Open Admin Operations Console"
          >
            <div className="text-blue-400 shrink-0">
              <ShieldCheck size={15} />
            </div>
            {!isCollapsed && <span>Admin Portal (/admin)</span>}
          </Link>
        </div>

        {/* Bottom Driver Rig & Cellular Info */}
        <div className={`border-t border-white/10 p-3 bg-slate-950/60 flex flex-col gap-2 ${isCollapsed ? "items-center" : ""}`}>
          {!isCollapsed && (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400">
                {isOffline ? <WifiOff size={13} className="text-red-400" /> : <Wifi size={13} />}
                <span className="text-[11px]">{isOffline ? "Offline Queue" : "Telstra 4G Live"}</span>
              </div>
              <span className="text-[10px] bg-emerald-500/15 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/25">
                OBD-II OK
              </span>
            </div>
          )}

          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <UserCheck size={14} />
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-200 truncate">{userProfile.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{userProfile.org.split(' ')[0]} {userProfile.org.split(' ')[1] || ''}</div>
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
