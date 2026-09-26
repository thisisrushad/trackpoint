"use client";

import React, { useState, useMemo, useEffect } from "react";
import { COMMERCIAL_CLIENTS, CommercialClient } from "@/lib/data";
import { useToast } from "@/context/ToastContext";
import Pagination from "./Pagination";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Package,
  Award,
  Search,
  PlusCircle,
  Edit2,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  X,
  CreditCard,
  FileText,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

interface AdminClientsViewProps {
  onSelectClientToFilter?: (clientName: string) => void;
}

const STORAGE_KEY = "trackpoint_commercial_clients";

export default function AdminClientsView({ onSelectClientToFilter }: AdminClientsViewProps) {
  const toast = useToast();
  const [clients, setClients] = useState<CommercialClient[]>(COMMERCIAL_CLIENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [termsFilter, setTermsFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<CommercialClient | null>(null);

  // New Client Form
  const [newClient, setNewClient] = useState({
    name: "",
    industry: "",
    location: "Darwin Metro & Port",
    contactPerson: "",
    phone: "",
    email: "",
    creditTerms: "14 Days Net",
    creditLimit: "$150,000 AUD",
    contractTier: "Tier 1 Enterprise" as "Tier 1 Enterprise" | "Tier 2 Commercial" | "Government / Municipal",
    abn: "51 824 753 190"
  });

  // Load from localStorage or defaults
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setClients(parsed);
          return;
        }
      }
    } catch (e) {}

    // Initialize with status if missing
    const initialized = COMMERCIAL_CLIENTS.map((c) => ({
      ...c,
      status: c.status || ("Active" as const),
      creditLimit: c.creditLimit || "$150,000 AUD",
      abn: c.abn || `51 ${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)}`
    }));
    setClients(initialized);
  }, []);

  const saveClients = (data: CommercialClient[]) => {
    setClients(data);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  };

  // Filtered clients
  const filteredClients = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return clients.filter((c) => {
      const matchesSearch =
        q === "" ||
        c.name.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.contactPerson.toLowerCase().includes(q) ||
        (c.abn && c.abn.toLowerCase().includes(q));

      const matchesTier = tierFilter === "ALL" || c.contractTier === tierFilter;
      const matchesStatus = statusFilter === "ALL" || (c.status || "Active").toUpperCase() === statusFilter.toUpperCase();
      const matchesTerms = termsFilter === "ALL" || c.creditTerms.toLowerCase().includes(termsFilter.toLowerCase());

      return matchesSearch && matchesTier && matchesStatus && matchesTerms;
    });
  }, [clients, searchQuery, tierFilter, statusFilter, termsFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, tierFilter, statusFilter, termsFilter]);

  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredClients.slice(start, start + pageSize);
  }, [filteredClients, currentPage, pageSize]);

  // KPIs
  const stats = useMemo(() => {
    const total = clients.length;
    const activeOrders = clients.reduce((acc, c) => acc + (c.activeOrdersCount || 0), 0);
    const activeStatus = clients.filter((c) => (c.status || "Active") === "Active").length;
    const onHold = clients.filter((c) => c.status === "Credit Hold").length;
    return { total, activeOrders, activeStatus, onHold };
  }, [clients]);

  // Toggle Credit Hold
  const handleToggleCreditHold = (client: CommercialClient) => {
    const newStatus: "Active" | "Credit Hold" = client.status === "Credit Hold" ? "Active" : "Credit Hold";
    const updated: CommercialClient[] = clients.map((c) => (c.id === client.id ? { ...c, status: newStatus } : c));
    saveClients(updated);
    toast.info(
      `Account #${client.id} (${client.name}) status changed to ${newStatus}.`,
      newStatus === "Credit Hold" ? "Credit Hold Applied" : "Account Reactivated"
    );
  };

  // Submit Add Customer
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name || !newClient.contactPerson || !newClient.email) {
      toast.error("Company name, contact person and email are required.", "Validation Error");
      return;
    }

    const newId = `CLI-0${clients.length + 1}`;
    const created: CommercialClient = {
      id: newId,
      name: newClient.name,
      industry: newClient.industry || "General Commercial Freight",
      location: newClient.location,
      contactPerson: newClient.contactPerson,
      phone: newClient.phone || "+61 8 8984 0000",
      email: newClient.email,
      creditTerms: newClient.creditTerms,
      creditLimit: newClient.creditLimit,
      ytdSpend: "$0 AUD",
      activeOrdersCount: 0,
      rating: "⭐⭐⭐⭐⭐ Enterprise Account",
      status: "Active",
      contractTier: newClient.contractTier,
      abn: newClient.abn
    };

    const updated = [created, ...clients];
    saveClients(updated);
    setIsAddModalOpen(false);
    toast.success(`Client ${created.name} (#${created.id}) created successfully.`, "Customer Account Created");

    setNewClient({
      name: "",
      industry: "",
      location: "Darwin Metro & Port",
      contactPerson: "",
      phone: "",
      email: "",
      creditTerms: "14 Days Net",
      creditLimit: "$150,000 AUD",
      contractTier: "Tier 1 Enterprise",
      abn: "51 824 753 190"
    });
  };

  // Submit Edit Customer
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    const updated = clients.map((c) => (c.id === editingClient.id ? editingClient : c));
    saveClients(updated);
    setEditingClient(null);
    toast.success(`Account details saved for ${editingClient.name}.`, "Customer Updated");
  };

  const handleContactAction = (type: "phone" | "email", client: CommercialClient) => {
    if (type === "phone") {
      toast.info(`Calling primary contact: ${client.contactPerson} (${client.phone})...`, "Calling Client");
    } else {
      toast.info(`Opening dispatcher email compose to ${client.email}...`, "Email Client");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      
      {/* KPI Overview Strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem"
        }}
      >
        <div className="glass-card" style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Building2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Enterprise Accounts</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f8fafc" }}>{stats.total} Commercial B2B</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Package size={22} />
          </div>
          <div>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Active Freight Runs</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#10b981" }}>{stats.activeOrders} In Progress</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <DollarSign size={22} />
          </div>
          <div>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>YTD Contract Spend</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fbbf24" }}>$1.04M AUD</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(129, 140, 248, 0.15)", color: "#818cf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Account Health</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#818cf8" }}>{stats.activeStatus} Active • {stats.onHold} On Hold</div>
          </div>
        </div>
      </div>

      {/* Header & New Customer Action */}
      <div
        className="glass-card"
        style={{
          padding: "1rem 1.25rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "8px", background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Building2 size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#f8fafc" }}>
              Customer & Commercial B2B Accounts Management
            </h3>
            <p style={{ margin: 0, fontSize: "0.76rem", color: "#94a3b8" }}>
              Enterprise billing terms, credit limits, authorized contacts, and Stuart Highway priority allocations
            </p>
          </div>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => setIsAddModalOpen(true)}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", boxShadow: "0 2px 10px rgba(37, 99, 235, 0.4)" }}
        >
          <PlusCircle size={15} />
          <span>+ Add Customer</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div
        className="glass-card"
        style={{
          padding: "0.85rem 1.25rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", minWidth: "260px", flex: "1 1 260px" }}>
          <Search size={15} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search company name, industry, ABN, contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "32px", width: "100%", fontSize: "0.82rem", height: "36px" }}
          />
        </div>

        {/* Filter Dropdowns */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          {/* Contract Tier */}
          <select
            className="input-field"
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            style={{ width: "auto", fontSize: "0.8rem", height: "36px", padding: "0 0.6rem" }}
          >
            <option value="ALL">All Contract Tiers</option>
            <option value="Tier 1 Enterprise">Tier 1 Enterprise</option>
            <option value="Tier 2 Commercial">Tier 2 Commercial</option>
            <option value="Government / Municipal">Government / Municipal</option>
          </select>

          {/* Account Status */}
          <select
            className="input-field"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: "auto", fontSize: "0.8rem", height: "36px", padding: "0 0.6rem" }}
          >
            <option value="ALL">All Account Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="CREDIT HOLD">Credit Hold</option>
            <option value="REVIEW">Review</option>
          </select>

          {/* Terms */}
          <select
            className="input-field"
            value={termsFilter}
            onChange={(e) => setTermsFilter(e.target.value)}
            style={{ width: "auto", fontSize: "0.8rem", height: "36px", padding: "0 0.6rem" }}
          >
            <option value="ALL">All Credit Terms</option>
            <option value="7">7 Days Net</option>
            <option value="14">14 Days Net</option>
            <option value="30">30 Days Net</option>
          </select>
        </div>
      </div>

      {/* Customer Accounts Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
          gap: "1.25rem"
        }}
      >
        {paginatedClients.map((client) => {
          const isHold = client.status === "Credit Hold";
          const isReview = client.status === "Review";

          return (
            <div
              key={client.id}
              className="glass-card"
              style={{
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "0.85rem",
                border: isHold
                  ? "1px solid rgba(239, 68, 68, 0.4)"
                  : isReview
                  ? "1px solid rgba(245, 158, 11, 0.4)"
                  : "1px solid rgba(255, 255, 255, 0.08)",
                position: "relative"
              }}
            >
              <div>
                {/* Header: ID + Name + Tier Badge + Status Badge */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <div>
                    <span style={{ fontSize: "0.68rem", color: "#38bdf8", fontWeight: 800 }}>
                      ACCOUNT #{client.id}
                    </span>
                    <h4 style={{ margin: "2px 0 0", fontSize: "1.05rem", fontWeight: 800, color: "#f8fafc" }}>
                      {client.name}
                    </h4>
                    <div style={{ fontSize: "0.74rem", color: "#94a3b8", marginTop: "1px" }}>
                      {client.industry}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                    {/* Status Badge */}
                    <span
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 800,
                        padding: "0.2rem 0.6rem",
                        borderRadius: "9999px",
                        background: isHold
                          ? "rgba(239, 68, 68, 0.15)"
                          : isReview
                          ? "rgba(245, 158, 11, 0.15)"
                          : "rgba(16, 185, 129, 0.15)",
                        color: isHold ? "#ef4444" : isReview ? "#fbbf24" : "#10b981",
                        border: `1px solid ${isHold ? "rgba(239, 68, 68, 0.4)" : isReview ? "rgba(245, 158, 11, 0.4)" : "rgba(16, 185, 129, 0.4)"}`
                      }}
                    >
                      {client.status || "Active"}
                    </span>

                    {/* Tier Badge */}
                    <span
                      style={{
                        fontSize: "0.64rem",
                        fontWeight: 700,
                        padding: "0.15rem 0.5rem",
                        borderRadius: "4px",
                        background: "rgba(56, 189, 248, 0.1)",
                        color: "#38bdf8",
                        border: "1px solid rgba(56, 189, 248, 0.25)"
                      }}
                    >
                      {client.contractTier}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.6rem",
                    background: "rgba(15, 23, 42, 0.6)",
                    padding: "0.85rem",
                    borderRadius: "10px",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    fontSize: "0.78rem",
                    margin: "0.6rem 0"
                  }}
                >
                  <div>
                    <div style={{ color: "#64748b", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>Credit Terms</div>
                    <div style={{ color: "#34d399", fontWeight: 700, marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <CreditCard size={13} />
                      <span>{client.creditTerms}</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ color: "#64748b", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>Credit Limit</div>
                    <div style={{ color: "#f8fafc", fontWeight: 700, marginTop: "2px" }}>
                      {client.creditLimit || "$150,000 AUD"}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: "#64748b", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>YTD Spend</div>
                    <div style={{ color: "#fbbf24", fontWeight: 800, marginTop: "2px" }}>
                      {client.ytdSpend}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: "#64748b", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>Active Jobs</div>
                    <div style={{ color: "#38bdf8", fontWeight: 700, marginTop: "2px" }}>
                      {client.activeOrdersCount} Consignments
                    </div>
                  </div>
                </div>

                {/* Contact Strip */}
                <div style={{ fontSize: "0.76rem", color: "#cbd5e1", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 600, color: "#f8fafc" }}>👤 {client.contactPerson}</span>
                    <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>📍 {client.location}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#94a3b8", fontSize: "0.72rem" }}>
                    <span style={{ cursor: "pointer", color: "#38bdf8" }} onClick={() => handleContactAction("phone", client)}>
                      📞 {client.phone}
                    </span>
                    <span>•</span>
                    <span style={{ cursor: "pointer", color: "#38bdf8" }} onClick={() => handleContactAction("email", client)}>
                      ✉️ {client.email}
                    </span>
                  </div>
                  {client.abn && (
                    <div style={{ fontSize: "0.68rem", color: "#64748b", marginTop: "2px" }}>
                      ABN: {client.abn}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.5rem",
                  marginTop: "0.75rem",
                  paddingTop: "0.75rem",
                  borderTop: "1px solid rgba(255, 255, 255, 0.08)"
                }}
              >
                {/* Credit Hold Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleCreditHold(client)}
                  className="btn btn-secondary btn-sm"
                  style={{
                    fontSize: "0.72rem",
                    padding: "0.3rem 0.55rem",
                    color: isHold ? "#34d399" : "#ef4444",
                    borderColor: isHold ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)"
                  }}
                  title={isHold ? "Release credit hold" : "Suspend credit & dispatch for this account"}
                >
                  {isHold ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                  <span>{isHold ? "Release Hold" : "Credit Hold"}</span>
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  {/* Edit Customer */}
                  <button
                    type="button"
                    onClick={() => setEditingClient(client)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: "0.72rem", padding: "0.3rem 0.55rem" }}
                    title="Edit customer account details"
                  >
                    <Edit2 size={12} />
                    <span>Edit</span>
                  </button>

                  {/* View Active Orders */}
                  {onSelectClientToFilter ? (
                    <button
                      type="button"
                      onClick={() => onSelectClientToFilter(client.name)}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: "0.72rem", padding: "0.3rem 0.55rem" }}
                    >
                      <Package size={12} />
                      <span>View Orders</span>
                    </button>
                  ) : (
                    <Link
                      href={`/admin/consignments`}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: "0.72rem", padding: "0.3rem 0.55rem", display: "inline-flex", alignItems: "center", gap: "3px" }}
                    >
                      <span>Consignments</span>
                      <ExternalLink size={11} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredClients.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
        pageSizeOptions={[6, 9, 12]}
        labelSingular="account"
        labelPlural="accounts"
      />

      {/* ================= ADD NEW CUSTOMER MODAL ================= */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-card" style={{ maxWidth: "560px", width: "95%", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Building2 size={20} color="#38bdf8" />
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>Add Commercial B2B Customer</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div>
                  <label className="text-xs text-muted block mb-1">Company / Organization Name *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. Barkly Pastoral Freight Pty Ltd"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Industry Sector</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Agriculture / Mining / Retail"
                    value={newClient.industry}
                    onChange={(e) => setNewClient({ ...newClient, industry: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div>
                  <label className="text-xs text-muted block mb-1">Primary Contact Person *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. Marcus Vance (Supply Mgr)"
                    value={newClient.contactPerson}
                    onChange={(e) => setNewClient({ ...newClient, contactPerson: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Company Email *</label>
                  <input
                    type="email"
                    required
                    className="input-field"
                    placeholder="logistics@company.com.au"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div>
                  <label className="text-xs text-muted block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="+61 8 8900 0000"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Australian Business Number (ABN)</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="51 824 753 190"
                    value={newClient.abn}
                    onChange={(e) => setNewClient({ ...newClient, abn: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div>
                  <label className="text-xs text-muted block mb-1">Contract Tier</label>
                  <select
                    className="input-field"
                    value={newClient.contractTier}
                    onChange={(e) => setNewClient({ ...newClient, contractTier: e.target.value as any })}
                  >
                    <option value="Tier 1 Enterprise">Tier 1 Enterprise (Daily Linehaul)</option>
                    <option value="Tier 2 Commercial">Tier 2 Commercial</option>
                    <option value="Government / Municipal">Government / Municipal</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Credit Terms</label>
                  <select
                    className="input-field"
                    value={newClient.creditTerms}
                    onChange={(e) => setNewClient({ ...newClient, creditTerms: e.target.value })}
                  >
                    <option value="7 Days Net">7 Days Net</option>
                    <option value="14 Days Net">14 Days Net</option>
                    <option value="30 Days Net">30 Days Net</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div>
                  <label className="text-xs text-muted block mb-1">Credit Limit (AUD)</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="$150,000 AUD"
                    value={newClient.creditLimit}
                    onChange={(e) => setNewClient({ ...newClient, creditLimit: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Base Location / Depot Corridor</label>
                  <select
                    className="input-field"
                    value={newClient.location}
                    onChange={(e) => setNewClient({ ...newClient, location: e.target.value })}
                  >
                    <option value="Darwin Metro & Port">Darwin Metro & Port</option>
                    <option value="Katherine Depot Corridor">Katherine Depot Corridor</option>
                    <option value="Tennant Creek Hub">Tennant Creek Hub</option>
                    <option value="Alice Springs Terminal">Alice Springs Terminal</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.75rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Account Creation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT CUSTOMER MODAL ================= */}
      {editingClient && (
        <div className="modal-overlay">
          <div className="modal-content glass-card" style={{ maxWidth: "560px", width: "95%", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Edit2 size={20} color="#38bdf8" />
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>Edit Customer: {editingClient.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingClient(null)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div>
                  <label className="text-xs text-muted block mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={editingClient.name}
                    onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Primary Contact</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={editingClient.contactPerson}
                    onChange={(e) => setEditingClient({ ...editingClient, contactPerson: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div>
                  <label className="text-xs text-muted block mb-1">Contact Email</label>
                  <input
                    type="email"
                    required
                    className="input-field"
                    value={editingClient.email}
                    onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editingClient.phone}
                    onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div>
                  <label className="text-xs text-muted block mb-1">Contract Tier</label>
                  <select
                    className="input-field"
                    value={editingClient.contractTier}
                    onChange={(e) => setEditingClient({ ...editingClient, contractTier: e.target.value as any })}
                  >
                    <option value="Tier 1 Enterprise">Tier 1 Enterprise</option>
                    <option value="Tier 2 Commercial">Tier 2 Commercial</option>
                    <option value="Government / Municipal">Government / Municipal</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Credit Terms</label>
                  <select
                    className="input-field"
                    value={editingClient.creditTerms}
                    onChange={(e) => setEditingClient({ ...editingClient, creditTerms: e.target.value })}
                  >
                    <option value="7 Days Net">7 Days Net</option>
                    <option value="14 Days Net">14 Days Net</option>
                    <option value="30 Days Net">30 Days Net</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div>
                  <label className="text-xs text-muted block mb-1">Credit Limit</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editingClient.creditLimit || "$150,000 AUD"}
                    onChange={(e) => setEditingClient({ ...editingClient, creditLimit: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Account Status</label>
                  <select
                    className="input-field"
                    value={editingClient.status || "Active"}
                    onChange={(e) => setEditingClient({ ...editingClient, status: e.target.value as any })}
                  >
                    <option value="Active">Active (Good Standing)</option>
                    <option value="Credit Hold">Credit Hold (Suspended)</option>
                    <option value="Review">Under Review</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.75rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingClient(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
