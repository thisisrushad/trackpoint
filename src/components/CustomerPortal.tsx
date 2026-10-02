"use client";

import React, { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { Job } from "@/lib/data";
import Pagination from "./Pagination";
import {
  PlusCircle,
  MapPin,
  Send,
  MessageSquare,
  CheckCircle,
  Clock,
  Eye,
  PackageCheck,
  Truck,
  X,
  Search,
  SlidersHorizontal,
  Navigation
} from "lucide-react";
import { useToast } from "@/context/ToastContext";

// Dynamically import MapView to prevent SSR window issues
const MapView = dynamic(() => import("./MapView"), { ssr: false });

interface CustomerPortalProps {
  activeJob: Job;
  allJobs: Job[];
  onNewBooking: (newJob: Job) => void;
  onSelectJobToTrack: (job: Job) => void;
}

export default function CustomerPortal({
  activeJob,
  allJobs,
  onNewBooking,
  onSelectJobToTrack
}: CustomerPortalProps) {
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Form State
  const [customer, setCustomer] = useState("Katherine Mining Supplies Ltd");
  const [pickup, setPickup] = useState("Darwin Depot (120 Berrimah Rd, Darwin)");
  const [dropoff, setDropoff] = useState("Katherine Store (Katherine Terrace)");
  const [goods, setGoods] = useState("2x Heavy Mining Replacement Parts (3.4t)");
  const [priority, setPriority] = useState<"Standard" | "Express">("Standard");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // SMS status feed for selected consignment
  const [smsAlert, setSmsAlert] = useState(
    `NorthLine Alert: Consignment #${activeJob.id} dispatched. ${activeJob.vehicle} (${activeJob.driver}) en route. ETA: ${activeJob.eta}. Track live at trackpoint.northline.com.au`
  );

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer, pickup, dropoff, goods, priority })
      });
      const data = await res.json();
      if (data.success) {
        onNewBooking(data.job);
        setSmsAlert(
          `NorthLine Alert: Booking #${data.job.id} received. Queued for Dispatcher Approval. Algorithm suggested: ${data.job.vehicle}.`
        );
        setIsModalOpen(false);
        toast.info(
          `Consignment #${data.job.id} registered! Awaiting Dispatcher approval before driver assignment.`,
          "Booking Queued"
        );
      } else {
        toast.error("Failed to create booking.", "Error");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error", "Booking Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered orders list
  const filteredJobs = allJobs.filter((j) => {
    const matchesSearch =
      j.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.goods.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.pickup.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.dropoff.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || j.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredJobs.slice(start, start + pageSize);
  }, [filteredJobs, currentPage, pageSize]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* Top Split: Live GPS Map (Left) & Active Consignment + SMS Feed (Right) */}
      <div className="view-grid grid-2col">
        
        {/* Live Tracking Map Card */}
        <div className="glass-card">
          <div className="card-header flex-between">
            <div className="flex-align">
              <div className="header-icon icon-primary">
                <Navigation size={20} />
              </div>
              <div>
                <h2>Live Route Map: Consignment #{activeJob.id}</h2>
                <p className="text-muted">Real-time Stuart Hwy GPS coordinates refreshed every 15s (NFR-02)</p>
              </div>
            </div>
            <div className={`badge-status ${activeJob.status === "Delivered" ? "delivered" : "in-transit"}`}>
              {activeJob.status}
            </div>
          </div>

          <MapView
            key={`${activeJob.id}-${activeJob.status}`}
            truckLat={activeJob.lat}
            truckLng={activeJob.lng}
            driverName={activeJob.driver}
            vehicleName={activeJob.vehicle}
            pickupAddress={activeJob.pickup}
            dropoffAddress={activeJob.dropoff}
            status={activeJob.status}
          />
        </div>

        {/* Selected Consignment Details & SMS Alert Feed */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div className="card-header flex-between">
              <div className="flex-align">
                <div className="header-icon icon-success">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <h2>Active Consignment Telemetry (FR-05, FR-06)</h2>
                  <p className="text-muted">Selected tracking target from orders table below</p>
                </div>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setIsModalOpen(true)}
                style={{ boxShadow: "0 2px 10px rgba(37, 99, 235, 0.4)" }}
              >
                <PlusCircle size={15} />
                <span>+ New Booking</span>
              </button>
            </div>

            {/* Consignment Metrics Grid */}
            <div className="consignment-bar" style={{ gridTemplateColumns: "1fr 1fr", rowGap: "1rem" }}>
              <div className="c-info-item">
                <span className="c-label">Consignment ID</span>
                <span className="c-val text-primary">#{activeJob.id}</span>
              </div>
              <div className="c-info-item">
                <span className="c-label">Live Dynamic ETA</span>
                <span className="c-val text-accent">{activeJob.eta}</span>
              </div>
              <div className="c-info-item">
                <span className="c-label">Allocated Heavy Vehicle</span>
                <span className="c-val">{activeJob.vehicle}</span>
              </div>
              <div className="c-info-item">
                <span className="c-label">Assigned Driver</span>
                <span className="c-val">{activeJob.driver}</span>
              </div>
            </div>

            <div style={{ marginTop: "1rem", background: "rgba(15, 23, 42, 0.7)", padding: "0.85rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Freight Route</div>
              <div style={{ fontSize: "0.85rem", fontWeight: 600, marginTop: "2px" }}>📍 {activeJob.pickup}</div>
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#38bdf8", marginTop: "2px" }}>➔ {activeJob.dropoff}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "6px" }}>📦 {activeJob.goods} ({activeJob.priority})</div>
            </div>
          </div>

          {/* SMS Alert Feed */}
          <div className="sms-preview-card" style={{ marginTop: "1rem" }}>
            <div className="sms-header">
              <span className="sms-badge">
                <MessageSquare size={12} style={{ display: "inline", marginRight: "4px" }} />
                Automated SMS Notification Feed (FR-09)
              </span>
              <span className="sms-time">Live Sync</span>
            </div>
            <div className="sms-body">"{smsAlert}"</div>
          </div>
        </div>

      </div>

      {/* Main Bottom Section: Primary Orders & Consignments List Table (FR-06, FR-11, US-02, US-11) */}
      <div className="glass-card">
        <div className="card-header flex-between" style={{ flexWrap: "wrap", gap: "1rem" }}>
          <div className="flex-align">
            <div className="header-icon icon-primary">
              <PackageCheck size={20} />
            </div>
            <div>
              <h2>My Consignments & Orders (FR-06, FR-11)</h2>
              <p className="text-muted">Click "Track Live" on any consignment to inspect its real-time GPS stream on the map above</p>
            </div>
          </div>

          {/* Search, Filter & New Booking Button */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            {/* Search Input */}
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
              <input
                type="text"
                placeholder="Search orders, cargo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: "30px", paddingRight: "10px", fontSize: "0.8rem", width: "200px" }}
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ fontSize: "0.8rem", padding: "0.55rem 0.75rem" }}
            >
              <option value="ALL">All Statuses ({allJobs.length})</option>
              <option value="IN TRANSIT">In Transit</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="DELIVERED">Delivered</option>
            </select>

            {/* Prominent "+ Create New Booking" Button */}
            <button
              className="btn btn-primary"
              onClick={() => setIsModalOpen(true)}
              style={{ padding: "0.6rem 1.1rem", fontSize: "0.85rem" }}
            >
              <PlusCircle size={16} />
              <span>+ Create New Booking</span>
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Corridor / Route</th>
                <th>Cargo / Goods</th>
                <th>Priority</th>
                <th>Allocated Vehicle & Driver</th>
                <th>Status</th>
                <th>Live ETA</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedJobs.map((job) => {
                const isCurrentlyActive = job.id === activeJob.id;
                return (
                  <tr
                    key={job.id}
                    style={{
                      background: isCurrentlyActive ? "rgba(37, 99, 235, 0.15)" : "transparent",
                      transition: "background 0.2s"
                    }}
                  >
                    <td>
                      <strong style={{ color: isCurrentlyActive ? "#38bdf8" : "inherit" }}>
                        #{job.id}
                      </strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{job.pickup.split('(')[0]}</div>
                      <div className="text-xs text-muted">➔ {job.dropoff.split('(')[0]}</div>
                    </td>
                    <td>{job.goods}</td>
                    <td>
                      <span className={`tag ${job.priority === "Express" ? "tag-blue" : ""}`}>
                        {job.priority}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <Truck size={14} color="#60a5fa" />
                        <span>{job.vehicle.split('(')[0]}</span>
                      </div>
                      <div className="text-xs text-muted">{job.driver}</div>
                    </td>
                    <td>
                      <span
                        className={`badge-status ${
                          job.status === "Delivered" || job.status === "Invoiced"
                            ? "delivered"
                            : "in-transit"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td>
                      <strong className="text-accent">{job.eta}</strong>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`btn btn-sm ${isCurrentlyActive ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => onSelectJobToTrack(job)}
                        style={{ display: "inline-flex", gap: "0.3rem", alignItems: "center" }}
                      >
                        <Eye size={13} />
                        <span>{isCurrentlyActive ? "Tracking Live" : "Track Live"}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div style={{ padding: "0.5rem 0.75rem" }}>
          <Pagination
            currentPage={currentPage}
            totalItems={filteredJobs.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[3, 5, 10]}
            labelSingular="order"
            labelPlural="orders"
          />
        </div>
      </div>

      {/* ================= NEW BOOKING MODAL DIALOG (FR-01, FR-02) ================= */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: "560px" }}>
            <div className="modal-header">
              <div className="flex-align">
                <div className="header-icon icon-primary" style={{ width: "30px", height: "30px" }}>
                  <MapPin size={16} />
                </div>
                <h3>New Delivery Booking (FR-01)</h3>
              </div>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="form-layout">
              <div className="modal-body" style={{ padding: "0.5rem 0" }}>
                
                <div className="form-group mb-2">
                  <label>Customer / Company Name</label>
                  <input
                    type="text"
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row mb-2">
                  <div className="form-group">
                    <label>Pickup Location</label>
                    <select value={pickup} onChange={(e) => setPickup(e.target.value)}>
                      <option value="Darwin Depot (120 Berrimah Rd, Darwin)">Darwin Depot (120 Berrimah Rd)</option>
                      <option value="Katherine Depot (Stuart Hwy)">Katherine Depot (Stuart Hwy)</option>
                      <option value="Alice Springs Hub (Smith St)">Alice Springs Hub (Smith St)</option>
                      <option value="Darwin Port Terminal">Darwin Port Terminal</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Delivery Destination</label>
                    <select value={dropoff} onChange={(e) => setDropoff(e.target.value)}>
                      <option value="Katherine Store (Katherine Terrace)">Katherine Store (Katherine Terrace)</option>
                      <option value="Tennant Creek Mine Site">Tennant Creek Mine Site</option>
                      <option value="Alice Springs Logistics Centre">Alice Springs Logistics Centre</option>
                      <option value="Darwin Harbour Terminal">Darwin Harbour Terminal</option>
                      <option value="Jabiru Community Distribution">Jabiru Community Store</option>
                    </select>
                  </div>
                </div>

                <div className="form-row mb-2">
                  <div className="form-group">
                    <label>Goods / Cargo Description</label>
                    <input
                      type="text"
                      value={goods}
                      onChange={(e) => setGoods(e.target.value)}
                      placeholder="e.g. 4x Industrial Parts (2.5t)"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Service Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as "Standard" | "Express")}
                    >
                      <option value="Standard">Standard (Scheduled Linehaul)</option>
                      <option value="Express">Express (Same-Day Priority)</option>
                    </select>
                  </div>
                </div>

                <div className="booking-auto-notice" style={{ marginTop: "0.5rem" }}>
                  <Clock size={16} />
                  <span>Automated Dispatch: Nearest vehicle auto-allocated via live GPS (FR-02).</span>
                </div>

              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isSubmitting}
                >
                  <Send size={15} />
                  <span>{isSubmitting ? "Dispatching..." : "Confirm & Dispatch Consignment"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
