"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Job, Vehicle, jobsDB, fleetDB } from "@/lib/data";
import { useToast } from "@/context/ToastContext";
import ClientOnly from "@/components/ClientOnly";
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Truck,
  MapPin,
  Clock,
  Search,
  RotateCcw,
  LogOut,
  AlertTriangle,
  FileText,
  UserCheck,
  Eye,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ClipboardList
} from "lucide-react";

export default function QCDashboardPage() {
  const router = useRouter();
  const toast = useToast();

  const [jobs, setJobs] = useState<Job[]>(jobsDB);
  const [fleet, setFleet] = useState<Vehicle[]>(fleetDB);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Arrived" | "QC Passed" | "QC Failed">("ALL");

  // Inspection Modal State
  const [inspectingJob, setInspectingJob] = useState<Job | null>(null);
  const [inspectorName, setInspectorName] = useState("Marcus Vance (QC Lead)");
  const [dockBayNumber, setDockBayNumber] = useState("Bay 3 - Receiving Dock");
  const [sealIntact, setSealIntact] = useState(true);
  const [tempCompliant, setTempCompliant] = useState(true);
  const [cargoIntact, setCargoIntact] = useState(true);
  const [inspectorNotes, setInspectorNotes] = useState("");
  const [failureReason, setFailureReason] = useState("SEAL_TAMPERED");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User Profile
  const [userProfile, setUserProfile] = useState({
    name: "Marcus Vance",
    org: "NorthLine Receiving Dock Quality Assurance",
    email: "qc.receiving@northline.com.au",
    role: "qc"
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("trackpoint_user");
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setUserProfile(u);
        setInspectorName(`${u.name} (QC Inspector)`);
      } catch (e) {}
    }
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      if (data.success && data.jobs?.length > 0) {
        setJobs(data.jobs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("trackpoint_token");
    localStorage.removeItem("trackpoint_user");
    toast.info("Logged out of Receiving Dock QC system.", "Signed Out");
    router.push("/");
  };

  // Open Inspection Modal
  const openInspectModal = (job: Job) => {
    setInspectingJob(job);
    setSealIntact(true);
    setTempCompliant(true);
    setCargoIntact(true);
    setInspectorNotes("");
    setFailureReason("SEAL_TAMPERED");
  };

  // Execute QC Pass
  const handleApproveQC = async () => {
    if (!inspectingJob) return;
    setIsSubmitting(true);
    const timestamp = new Date().toISOString();
    const reasonText = `QC_PASSED: Dock=${dockBayNumber} | Inspector=${inspectorName} | Seal=${sealIntact ? "INTACT" : "FAILED"} | Temp=${tempCompliant ? "COMPLIANT(+4C)" : "OUT_OF_RANGE"} | Packaging=${cargoIntact ? "INTACT" : "DAMAGED"} | Notes=${inspectorNotes || "Full compliance confirmed. Unlocked for consignee e-POD."} | ${timestamp}`;

    try {
      const res = await fetch(`/api/jobs/${inspectingJob.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "QC Passed",
          overrideReason: reasonText
        })
      });
      const data = await res.json();
      if (data.success && data.job) {
        setJobs((prev) => prev.map((j) => (j.id === data.job.id ? data.job : j)));
        toast.success(
          `Quality Check PASSED for Consignment #${inspectingJob.id}! Status is now "QC Passed". Handset e-POD signature pad has been unlocked for driver.`,
          "QC Certified"
        );
        setInspectingJob(null);
      } else {
        toast.error("Failed to update QC status on server.", "Error");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error", "QC Update Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Execute QC Fail
  const handleRejectQC = async () => {
    if (!inspectingJob) return;
    setIsSubmitting(true);
    const timestamp = new Date().toISOString();
    const reasonText = `QC_FAILED:${failureReason} | Dock=${dockBayNumber} | Inspector=${inspectorName} | Notes=${inspectorNotes || "Flagged for Admin review. Driver e-POD blocked."} | ${timestamp}`;

    try {
      const res = await fetch(`/api/jobs/${inspectingJob.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "QC Failed",
          overrideReason: reasonText
        })
      });
      const data = await res.json();
      if (data.success && data.job) {
        setJobs((prev) => prev.map((j) => (j.id === data.job.id ? data.job : j)));
        toast.error(
          `Consignment #${inspectingJob.id} marked as QC FAILED (${failureReason}). Admin alerted for formal investigation. Driver delivery blocked.`,
          "QC Rejected & Escalated"
        );
        setInspectingJob(null);
      } else {
        toast.error("Failed to record QC failure on server.", "Error");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error", "QC Update Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered QC Consignments
  const qcRelevantJobs = useMemo(() => {
    return jobs.filter((j) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        j.id.toLowerCase().includes(q) ||
        j.customer.toLowerCase().includes(q) ||
        j.goods.toLowerCase().includes(q) ||
        j.driver.toLowerCase().includes(q) ||
        j.dropoff.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "ALL"
          ? j.status === "Arrived" || j.status === "QC Passed" || j.status === "QC Failed"
          : j.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchQuery, statusFilter]);

  // Metrics
  const stats = useMemo(() => {
    const arrivedPending = jobs.filter((j) => j.status === "Arrived").length;
    const qcPassedCount = jobs.filter((j) => j.status === "QC Passed").length;
    const qcFailedCount = jobs.filter((j) => j.status === "QC Failed").length;
    const totalDelivered = jobs.filter((j) => j.status === "Delivered").length;
    return { arrivedPending, qcPassedCount, qcFailedCount, totalDelivered };
  }, [jobs]);

  return (
    <ClientOnly>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-purple-500/20 px-6 py-3.5 flex justify-between items-center gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-slate-100">TrackPoint</span>
                <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Receiving Dock QC Team
                </span>
              </div>
              <p className="text-xs text-slate-400 m-0">
                Gate & Receiving Quality Control • Segregation of Duties (SoD)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/consignments"
              className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold no-underline flex items-center gap-1.5 transition"
            >
              <span>Admin Console</span>
              <ExternalLink size={13} />
            </Link>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-300">
              <UserCheck size={14} className="text-purple-400" />
              <span>{userProfile.name}</span>
            </div>

            <button
              onClick={handleLogout}
              className="py-1.5 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-purple-950/60 via-slate-900/90 to-slate-900/90 border border-purple-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 max-w-3xl">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
                <ClipboardList size={15} />
                <span>Cargo Verification & Quality Certification Gateway</span>
              </div>
              <h2 className="text-2xl font-black text-slate-100 tracking-tight mb-2">
                Receiving Dock Inspection Dashboard
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed m-0">
                To guarantee cargo integrity and prevent falsification, <strong>drivers cannot obtain consignee e-POD signatures while in transit or awaiting inspection</strong>. The QC team must physically verify container tamper seals, cold-chain thermals, and pallet conditions before certifying a consignment as <strong>QC Passed</strong> or flagging it as <strong>QC Failed</strong>.
              </p>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            
            <div className="bg-slate-900/80 border border-purple-500/30 rounded-xl p-4 flex items-center gap-3.5 backdrop-blur-md">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase">Awaiting QC (Arrived)</div>
                <div className="text-2xl font-extrabold text-purple-300 mt-0.5">{stats.arrivedPending}</div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-sky-500/30 rounded-xl p-4 flex items-center gap-3.5 backdrop-blur-md">
              <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase">QC Passed (Ready for e-POD)</div>
                <div className="text-2xl font-extrabold text-sky-300 mt-0.5">{stats.qcPassedCount}</div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-rose-500/30 rounded-xl p-4 flex items-center gap-3.5 backdrop-blur-md">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0">
                <ShieldAlert size={24} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase">QC Failed (Escalated)</div>
                <div className="text-2xl font-extrabold text-rose-400 mt-0.5">{stats.qcFailedCount}</div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3.5 backdrop-blur-md">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                <Truck size={24} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase">Delivered via e-POD</div>
                <div className="text-2xl font-extrabold text-emerald-400 mt-0.5">{stats.totalDelivered}</div>
              </div>
            </div>

          </div>

          {/* Filter Bar */}
          <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Consignment #, Cargo, Driver..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-white/15 text-slate-100 text-xs focus:outline-none focus:border-purple-400 transition"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {(["ALL", "Arrived", "QC Passed", "QC Failed"] as const).map((filter) => {
                const isActive = statusFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`py-1.5 px-3.5 rounded-full text-xs font-bold border transition cursor-pointer shrink-0 ${
                      isActive
                        ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30"
                        : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {filter === "ALL" ? `All QC Consignments (${qcRelevantJobs.length})` : filter}
                  </button>
                );
              })}
            </div>

          </div>

          {/* Consignments List Table */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-white/10 text-slate-400 uppercase font-bold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Ref & Priority</th>
                    <th className="py-3 px-4">Customer & Cargo Manifest</th>
                    <th className="py-3 px-4">Destination Receiving Bay</th>
                    <th className="py-3 px-4">Linehaul Driver & Truck</th>
                    <th className="py-3 px-4">Current Status</th>
                    <th className="py-3 px-4 text-right">QC Team Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {qcRelevantJobs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <ShieldCheck size={36} className="mx-auto text-slate-600 mb-2" />
                        <div className="font-bold text-sm text-slate-300">No Consignments in QC Queue</div>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                          Consignments will automatically populate here as heavy vehicles arrive at destination receiving bays.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    qcRelevantJobs.map((job) => {
                      const isArrived = job.status === "Arrived";
                      const isQcPassed = job.status === "QC Passed";
                      const isQcFailed = job.status === "QC Failed";

                      return (
                        <tr key={job.id} className="hover:bg-white/[0.02] transition">
                          
                          {/* ID & Priority */}
                          <td className="py-3.5 px-4">
                            <span className="font-extrabold text-sky-400">{job.id}</span>
                            <div className="mt-0.5">
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                  job.priority === "Express"
                                    ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                                    : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                }`}
                              >
                                {job.priority}
                              </span>
                            </div>
                          </td>

                          {/* Customer & Goods */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-bold text-slate-100">{job.customer}</div>
                            <div className="text-[11px] text-slate-400 truncate mt-0.5">
                              📦 {job.goods}
                            </div>
                          </td>

                          {/* Destination */}
                          <td className="py-3.5 px-4">
                            <div className="text-slate-200 font-medium">📍 {job.dropoff}</div>
                            <div className="text-[11px] text-purple-400 mt-0.5">
                              Dock Bay: {dockBayNumber}
                            </div>
                          </td>

                          {/* Driver & Vehicle */}
                          <td className="py-3.5 px-4">
                            <div className="text-slate-200 font-semibold">{job.driver}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">🚛 {job.vehicle}</div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                                isQcPassed
                                  ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                                  : isQcFailed
                                  ? "bg-rose-500/20 text-rose-300 border-rose-500/50"
                                  : isArrived
                                  ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                                  : "bg-slate-800 text-slate-400 border-white/10"
                              }`}
                            >
                              {job.status}
                            </span>
                            {isQcFailed && (
                              <div className="text-[10px] text-rose-400 font-semibold mt-1">
                                ⚠️ Admin Escalation Active
                              </div>
                            )}
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3.5 px-4 text-right">
                            {isArrived && (
                              <button
                                onClick={() => openInspectModal(job)}
                                className="py-1.5 px-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 cursor-pointer inline-flex items-center gap-1.5 transition"
                              >
                                <ShieldCheck size={14} />
                                <span>Inspect Cargo (QC)</span>
                              </button>
                            )}

                            {isQcPassed && (
                              <div className="inline-flex items-center gap-1.5 text-xs text-sky-400 font-semibold">
                                <CheckCircle2 size={15} />
                                <span>QC Passed (Driver Can Sign)</span>
                              </div>
                            )}

                            {isQcFailed && (
                              <button
                                onClick={() => openInspectModal(job)}
                                className="py-1.5 px-2.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold cursor-pointer inline-flex items-center gap-1 transition"
                              >
                                <RotateCcw size={12} />
                                <span>Re-Inspect</span>
                              </button>
                            )}
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </main>

        {/* Modal: Inspection & Certification Dialog */}
        {inspectingJob && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-purple-500/40 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
              
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-100 m-0">
                      Receiving Dock Cargo Quality Inspection
                    </h3>
                    <p className="text-xs text-slate-400 m-0">
                      Consignment #{inspectingJob.id} • {inspectingJob.goods}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setInspectingJob(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Consignment Brief Box */}
              <div className="bg-slate-950/70 border border-white/10 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer:</span>
                  <span className="font-bold text-slate-200">{inspectingJob.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vehicle & Driver:</span>
                  <span className="font-bold text-slate-200">{inspectingJob.vehicle} ({inspectingJob.driver})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Delivery Destination:</span>
                  <span className="font-semibold text-emerald-400">{inspectingJob.dropoff}</span>
                </div>
              </div>

              {/* Quality Checklist */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Mandatory QC Verifications:
                </label>

                <label className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/40 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={sealIntact}
                    onChange={(e) => setSealIntact(e.target.checked)}
                    className="w-4 h-4 accent-purple-600 rounded"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-200 block">Security Container Seal Intact (#SL-9942)</span>
                    <span className="text-[11px] text-slate-400">Tamper-evident bolt seal unbroken and matches manifest</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/40 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={tempCompliant}
                    onChange={(e) => setTempCompliant(e.target.checked)}
                    className="w-4 h-4 accent-purple-600 rounded"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-200 block">Temperature & Cold-Chain Spec Compliant</span>
                    <span className="text-[11px] text-slate-400">Transponder logged inside safe thermal window (+4°C ± 1.5°C)</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/40 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={cargoIntact}
                    onChange={(e) => setCargoIntact(e.target.checked)}
                    className="w-4 h-4 accent-purple-600 rounded"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-200 block">Packaging & Pallet Structural Integrity</span>
                    <span className="text-[11px] text-slate-400">Zero outer crush damage, shifting, or liquid leakage detected</span>
                  </div>
                </label>
              </div>

              {/* Inspector Input */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Dock Inspector:</label>
                  <input
                    type="text"
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-white/15 text-slate-200 text-xs focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Receiving Bay #:</label>
                  <input
                    type="text"
                    value={dockBayNumber}
                    onChange={(e) => setDockBayNumber(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-white/15 text-slate-200 text-xs focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              {/* If any check failed, select failure reason */}
              {(!sealIntact || !tempCompliant || !cargoIntact) && (
                <div className="bg-rose-500/15 border border-rose-500/40 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
                    <AlertTriangle size={15} />
                    <span>Inspection Failure Detected — Select Escalation Code:</span>
                  </div>
                  <select
                    value={failureReason}
                    onChange={(e) => setFailureReason(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-rose-500/40 text-slate-100 text-xs"
                  >
                    <option value="SEAL_TAMPERED">Seal Tampered / Broken Bolt Lock</option>
                    <option value="COLD_CHAIN_BREACH">Reefer Temp Breach (&gt; +8°C Out of Compliance)</option>
                    <option value="PHYSICAL_CARGO_DAMAGE">Physical Damage / Crushed Pallets / Water Ingress</option>
                    <option value="QUANTITY_DISCREPANCY">Discrepancy in Box Count vs Manifest</option>
                  </select>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Audit Notes & Observations:</label>
                <textarea
                  rows={2}
                  value={inspectorNotes}
                  onChange={(e) => setInspectorNotes(e.target.value)}
                  placeholder="Record container number, seal serials, or defect notes..."
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-white/15 text-slate-200 text-xs focus:outline-none focus:border-purple-400 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRejectQC}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition disabled:opacity-50"
                >
                  <XCircle size={15} />
                  <span>Reject (Mark QC Failed)</span>
                </button>

                <button
                  type="button"
                  onClick={handleApproveQC}
                  disabled={isSubmitting || !sealIntact || !tempCompliant || !cargoIntact}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                    sealIntact && tempCompliant && cargoIntact
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 cursor-pointer"
                      : "bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5"
                  }`}
                >
                  <CheckCircle2 size={15} />
                  <span>Certify & Set QC Passed ➔</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </ClientOnly>
  );
}
