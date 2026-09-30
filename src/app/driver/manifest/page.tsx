"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Job, jobsDB } from "@/lib/data";
import Pagination from "@/components/Pagination";
import { Package, ArrowRight, Clock, MapPin, CheckCircle2, User, Truck, Filter } from "lucide-react";

export default function DriverManifestPage() {
  const [jobs, setJobs] = useState<Job[]>(jobsDB);
  const [scopeFilter, setScopeFilter] = useState<"MY_DROPS" | "ALL_DROPS">("MY_DROPS");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(4);
  const [currentDriverName, setCurrentDriverName] = useState("Dave Miller");

  useEffect(() => {
    // Read logged-in driver from localStorage
    const savedUser = localStorage.getItem("trackpoint_user");
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.name) setCurrentDriverName(u.name);
      } catch (e) {}
    }

    fetch("/api/jobs")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.jobs?.length > 0) {
          setJobs(data.jobs);
        }
      })
      .catch(console.error);
  }, []);

  // Filter jobs based on scope (My Drops vs All Fleet) and status
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      // Driver scope match
      if (scopeFilter === "MY_DROPS") {
        const dName = currentDriverName.toLowerCase();
        const matchesDriver =
          j.driver.toLowerCase().includes(dName) ||
          dName.includes(j.driver.toLowerCase()) ||
          (dName.includes("liam") && (j.driver.toLowerCase().includes("liam") || j.vehicle.toLowerCase().includes("nl-01"))) ||
          (dName.includes("dave") && (j.driver.toLowerCase().includes("dave") || j.vehicle.toLowerCase().includes("nl-14"))) ||
          (dName.includes("mick") && (j.driver.toLowerCase().includes("mick") || j.vehicle.toLowerCase().includes("nl-19"))) ||
          (dName.includes("mark") && (j.driver.toLowerCase().includes("mark") || j.vehicle.toLowerCase().includes("nl-31"))) ||
          (dName.includes("samira") && (j.driver.toLowerCase().includes("samira") || j.vehicle.toLowerCase().includes("nl-06"))) ||
          (dName.includes("chloe") && (j.driver.toLowerCase().includes("chloe") || j.vehicle.toLowerCase().includes("nl-02")));

        if (!matchesDriver) return false;
      }

      // Status match
      if (statusFilter === "ACTIVE") return j.status === "In Transit" || j.status === "Assigned";
      if (statusFilter === "DELIVERED") return j.status === "Delivered" || j.status === "Invoiced";
      return true;
    });
  }, [jobs, scopeFilter, statusFilter, currentDriverName]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [scopeFilter, statusFilter]);

  // Paginated slice
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredJobs.slice(start, start + pageSize);
  }, [filteredJobs, currentPage, pageSize]);

  const myDropsCount = jobs.filter((j) => {
    const dName = currentDriverName.toLowerCase();
    return (
      j.driver.toLowerCase().includes(dName) ||
      dName.includes(j.driver.toLowerCase()) ||
      (dName.includes("liam") && (j.driver.toLowerCase().includes("liam") || j.vehicle.toLowerCase().includes("nl-01"))) ||
      (dName.includes("dave") && (j.driver.toLowerCase().includes("dave") || j.vehicle.toLowerCase().includes("nl-14"))) ||
      (dName.includes("mick") && (j.driver.toLowerCase().includes("mick") || j.vehicle.toLowerCase().includes("nl-19"))) ||
      (dName.includes("mark") && (j.driver.toLowerCase().includes("mark") || j.vehicle.toLowerCase().includes("nl-31"))) ||
      (dName.includes("samira") && (j.driver.toLowerCase().includes("samira") || j.vehicle.toLowerCase().includes("nl-06"))) ||
      (dName.includes("chloe") && (j.driver.toLowerCase().includes("chloe") || j.vehicle.toLowerCase().includes("nl-02")))
    );
  }).length;

  return (
    <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 space-y-6 backdrop-blur-md">
      
      {/* Header and Controls */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight m-0">
              Daily Driver Manifest & Schedule
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
              Logged in: {currentDriverName}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 mb-0">
            Stuart Highway corridor scheduled drops, pre-staged freight manifests and delivery sequence
          </p>
        </div>

        {/* Scope and Status Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Driver Scope Toggle */}
          <div className="flex rounded-lg bg-slate-950 p-1 border border-white/10">
            <button
              type="button"
              onClick={() => setScopeFilter("MY_DROPS")}
              className={`px-3 py-1 rounded text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                scopeFilter === "MY_DROPS"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <User size={13} />
              <span>My Assigned Runs ({myDropsCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setScopeFilter("ALL_DROPS")}
              className={`px-3 py-1 rounded text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                scopeFilter === "ALL_DROPS"
                  ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Truck size={13} />
              <span>All Fleet Manifests ({jobs.length})</span>
            </button>
          </div>

          {/* Status Filter Pills */}
          <div className="flex gap-1.5">
            {["ALL", "ACTIVE", "DELIVERED"].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                  statusFilter === f
                    ? "bg-white/15 text-white border border-white/20"
                    : "bg-white/5 text-slate-400 border border-white/5 hover:text-white"
                }`}
              >
                {f === "ALL" ? "All" : f === "ACTIVE" ? "Active" : "Delivered"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Manifest Cards Grid */}
      {paginatedJobs.length === 0 ? (
        <div className="p-12 text-center bg-slate-950/60 rounded-xl border border-white/5 space-y-2">
          <Package size={32} className="mx-auto text-slate-500" />
          <h3 className="text-sm font-bold text-slate-200">No consignments found for this view</h3>
          <p className="text-xs text-slate-400">
            Switch to "All Fleet Manifests" or clear filters to view other scheduled corridor runs.
          </p>
          <button
            type="button"
            onClick={() => { setScopeFilter("ALL_DROPS"); setStatusFilter("ALL"); }}
            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition mt-2"
          >
            Show All Fleet Drops
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedJobs.map((job) => {
            const isDone = job.status === "Delivered" || job.status === "Invoiced";

            return (
              <div
                key={job.id}
                className="bg-slate-950/80 border border-white/10 hover:border-emerald-500/40 rounded-xl p-5 flex flex-col justify-between transition space-y-4 shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-emerald-400">#{job.id}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {job.priority}
                      </span>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        isDone
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <div>
                    <div className="font-bold text-sm text-slate-100">{job.customer}</div>
                    <div className="text-xs text-slate-300 mt-0.5">📦 {job.goods}</div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-400 pt-1 border-t border-white/5">
                    <div>📍 Origin: {job.pickup.split('(')[0]}</div>
                    <div className="text-emerald-400 font-semibold">➔ Dropoff: {job.dropoff.split('(')[0]}</div>
                  </div>

                  <div className="text-xs text-sky-400 flex items-center gap-1.5 pt-1">
                    <Truck size={13} />
                    <span>Allocated: {job.vehicle} ({job.driver})</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock size={13} className="text-emerald-400" />
                    <span>ETA: <strong className="text-slate-200">{job.eta}</strong></span>
                  </div>

                  <Link
                    href={`/driver/active?id=${job.id}`}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold no-underline flex items-center gap-1.5 transition shadow-md shadow-emerald-600/30"
                  >
                    <span>Drive Run</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredJobs.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[2, 4, 8, 12]}
        labelSingular="consignment drop"
        labelPlural="consignment drops"
      />

    </div>
  );
}
