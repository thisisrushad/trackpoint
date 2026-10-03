"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Truck,
  PackageCheck,
  FileText,
  Boxes,
  PlusCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  LogOut,
  Sparkles,
  ShieldCheck
} from "lucide-react";

interface CustomerSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  consignmentsCount?: number;
  invoicesCount?: number;
  userProfile?: {
    name: string;
    org: string;
    email: string;
  };
  onLogout?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function CustomerSidebar({
  isCollapsed,
  onToggleCollapse,
  consignmentsCount: initialConsignmentsCount,
  invoicesCount: initialInvoicesCount,
  userProfile = {
    name: "Sandra Wilson",
    org: "Katherine Mining Supplies Ltd",
    email: "sandra.w@katherinemining.com.au"
  },
  onLogout,
  isMobileOpen,
  onCloseMobile
}: CustomerSidebarProps) {
  const pathname = usePathname();
  const [liveConsignmentsCount, setLiveConsignmentsCount] = React.useState<number | null>(null);
  const [liveInvoicesCount, setLiveInvoicesCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch("/api/jobs");
        const data = await res.json();
        if (data.success && Array.isArray(data.jobs)) {
          setLiveConsignmentsCount(data.jobs.length);
        }
      } catch (e) {}

      try {
        const resInv = await fetch("/api/invoices");
        const dataInv = await resInv.json();
        if (dataInv.success && Array.isArray(dataInv.invoices)) {
          setLiveInvoicesCount(dataInv.invoices.length);
        }
      } catch (e) {}
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 6000);
    return () => clearInterval(interval);
  }, []);

  const effectiveConsignmentsCount =
    liveConsignmentsCount !== null
      ? liveConsignmentsCount
      : initialConsignmentsCount !== undefined
      ? initialConsignmentsCount
      : 0;

  const effectiveInvoicesCount =
    liveInvoicesCount !== null
      ? liveInvoicesCount
      : initialInvoicesCount !== undefined
      ? initialInvoicesCount
      : 4;

  const navItems = [
    {
      href: "/customer",
      label: "Overview & Dashboard",
      icon: <Boxes size={19} />,
      badge: "Live",
      badgeColor: "#38bdf8"
    },
    {
      href: "/customer/orders",
      label: "Consignments & Booking",
      icon: <PackageCheck size={19} />,
      badge: `${effectiveConsignmentsCount}`,
      badgeColor: "#38bdf8"
    },
    {
      href: "/customer/invoices",
      label: "Tax Invoices & e-PODs",
      icon: <FileText size={19} />,
      badge: `${effectiveInvoicesCount}`,
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
          <Link href="/customer" className="flex items-center gap-3 overflow-hidden no-underline">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 shrink-0">
              <Truck size={22} />
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base text-slate-100 tracking-tight">
                    TrackPoint
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                    Client
                  </span>
                </div>
                <div className="text-xs text-slate-400 truncate">
                  Customer Portal
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

        {/* Action Button: + New Booking */}
        {!isCollapsed ? (
          <div className="p-3 pb-0">
            <Link
              href="/customer/orders"
              onClick={onCloseMobile}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 no-underline transition"
            >
              <PlusCircle size={15} />
              <span>+ Create New Booking</span>
            </Link>
          </div>
        ) : (
          <div className="p-2 flex justify-center">
            <Link
              href="/customer/orders"
              onClick={onCloseMobile}
              className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 no-underline transition"
              title="Create New Delivery Booking"
            >
              <PlusCircle size={18} />
            </Link>
          </div>
        )}

        {/* Navigation List */}
        <div className={`flex-1 overflow-y-auto flex flex-col gap-1.5 ${isCollapsed ? "p-2" : "p-3"}`}>
          {!isCollapsed && (
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 pt-2 pb-1">
              Customer Navigation
            </div>
          )}

          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === "/customer/orders" && pathname.startsWith("/customer/orders/"));
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
            href="/admin"
            className={`flex items-center gap-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition no-underline text-xs ${
              isCollapsed ? "py-2.5 justify-center" : "px-3 py-2 justify-start"
            }`}
            title="Open Admin Operations Console"
          >
            <div className="text-blue-400 shrink-0">
              <ShieldCheck size={15} />
            </div>
            {!isCollapsed && <span>Admin Portal (/admin)</span>}
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

        {/* Bottom Commercial Account & User Info */}
        <div className={`border-t border-white/10 p-3 bg-slate-950/60 flex flex-col gap-2 ${isCollapsed ? "items-center" : ""}`}>
          {!isCollapsed && (
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="text-[11px] text-sky-400 font-semibold">14 Days Net Credit</span>
              <span className="text-[10px] bg-sky-500/15 text-sky-300 px-1.5 py-0.5 rounded border border-sky-500/25">Tier 1 Account</span>
            </div>
          )}

          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                <UserCheck size={14} />
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-200 truncate">{userProfile.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{userProfile.org.split(' ')[0]}</div>
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
