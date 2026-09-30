"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import CustomerSidebar from "@/components/CustomerSidebar";
import ClientOnly from "@/components/ClientOnly";
import {
  Menu,
  Clock,
  LogOut,
  UserCheck,
  ChevronRight,
  PlusCircle,
  PackageCheck,
  FileText,
  Boxes
} from "lucide-react";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("Darwin ACST");

  const [userProfile, setUserProfile] = useState({
    name: "Sandra Wilson",
    org: "Katherine Mining Supplies Ltd",
    email: "sandra.w@katherinemining.com.au"
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

    const savedSidebar = localStorage.getItem("trackpoint_customer_sidebar_collapsed");
    if (savedSidebar !== null) {
      setIsSidebarCollapsed(savedSidebar === "true");
    }
  }, []);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("trackpoint_customer_sidebar_collapsed", String(next));
      return next;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("trackpoint_token");
    localStorage.removeItem("trackpoint_user");
    router.push("/");
  };

  const getSectionTitle = () => {
    if (pathname?.includes("/customer/orders")) return "My Consignments & Booking";
    if (pathname?.includes("/customer/invoices")) return "Tax Invoices & e-POD Receipts";
    return "Customer Overview & Dashboard";
  };

  return (
    <ClientOnly>
      <div className="flex min-h-screen bg-slate-950 text-slate-100 antialiased font-sans">
        
        {/* Left Customer Navigation Sidebar */}
        <CustomerSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
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
                  <span>Customer Portal</span>
                  <ChevronRight size={12} />
                  <span className="text-sky-400 font-semibold">{getSectionTitle()}</span>
                </div>
                <h1 className="text-lg font-extrabold text-slate-100 tracking-tight truncate m-0">
                  {getSectionTitle()}
                </h1>
              </div>
            </div>

            {/* Right: Quick Action Controls, Clock, User Profile */}
            <div className="flex items-center gap-3 shrink-0">
              
              {/* ACST Clock */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 font-mono">
                <Clock size={13} className="text-sky-400" />
                <span>{currentTime || "Darwin ACST"}</span>
              </div>

              {/* Quick Booking Button */}
              <Link
                href="/customer/orders"
                className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs no-underline shadow-md shadow-sky-500/20 transition"
              >
                <PlusCircle size={14} />
                <span>+ New Booking</span>
              </Link>

              {/* User Profile Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-600/15 border border-sky-500/30 text-xs text-sky-300 font-semibold">
                <UserCheck size={14} className="text-sky-400" />
                <span className="truncate max-w-[140px]">{userProfile.name}</span>
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
