"use client";

import React, { useState, useRef, useEffect } from "react";
import { Job } from "@/lib/data";
import { Wifi, WifiOff, Camera, Check, Shield, FileText } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface DriverAppProps {
  activeJob: Job;
  onDeliveryConfirmed: (updatedJob: Job) => void;
  isOffline: boolean;
  setIsOffline: (val: boolean) => void;
}

export default function DriverApp({
  activeJob,
  onDeliveryConfirmed,
  isOffline,
  setIsOffline
}: DriverAppProps) {
  const toast = useToast();
  const [recipient, setRecipient] = useState("Sandra Wilson");
  const [hasDrawn, setHasDrawn] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    setHasDrawn(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getCanvasPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    if ("touches" in e) e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getCanvasPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDraw = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleConfirm = async () => {
    const signatureData = canvasRef.current ? canvasRef.current.toDataURL() : undefined;

    if (isOffline) {
      toast.warning(
        `Delivery for ${recipient} stored locally in encrypted offline cache. Will auto-sync when cellular signal returns.`,
        "Offline Sync Queued (NFR-05)"
      );
      const updated: Job = {
        ...activeJob,
        status: "Delivered",
        recipientName: recipient,
        signatureDataUrl: signatureData
      };
      onDeliveryConfirmed(updated);
    } else {
      try {
        const res = await fetch(`/api/jobs/${activeJob.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "confirm_delivery",
            recipientName: recipient,
            signatureDataUrl: signatureData
          })
        });
        const data = await res.json();
        if (data.success) {
          toast.success(
            `Signed by ${recipient}. Digital e-POD verified & Draft Tax Invoice auto-generated (INV-2026-${activeJob.id.replace("TP-", "")})!`,
            "Delivery Confirmed (FR-07, FR-08)"
          );
          onDeliveryConfirmed(data.job);
        } else {
          toast.error("Failed to confirm delivery on server.", "Submission Error");
        }
      } catch (err: any) {
        toast.error(err.message || "Network error", "Delivery Error");
      }
    }
  };

  return (
    <div className="driver-mobile-container">
      {/* Mobile Smartphone Frame */}
      <div className="mobile-frame">
        <div className="mobile-speaker"></div>

        <div className="mobile-screen">
          {/* Top Bar */}
          <div className="mobile-top-bar">
            <div>
              <span className="mobile-app-title">TrackPoint Driver</span>
              <span className="mobile-driver-name">Driver: Dave Miller (#DRV-104)</span>
            </div>
            <div className="connection-status-pill">
              {isOffline ? (
                <>
                  <span className="dot-status offline"></span>
                  <span>Offline (No Signal)</span>
                </>
              ) : (
                <>
                  <span className="dot-status online"></span>
                  <span>4G Connected</span>
                </>
              )}
            </div>
          </div>

          {/* Consignment Brief */}
          <div className="driver-card">
            <div className="driver-card-header">
              <span className="job-badge">Job Ref: #{activeJob.id}</span>
              <span className={`badge-status ${activeJob.status === "Delivered" ? "delivered" : "in-transit"}`}>
                {activeJob.status}
              </span>
            </div>

            <div className="driver-route-info">
              <div className="r-point">
                <span className="r-dot origin"></span>
                <div>
                  <div className="r-lbl">ORIGIN PICKUP</div>
                  <div className="r-val">{activeJob.pickup}</div>
                </div>
              </div>
              <div className="r-point">
                <span className="r-dot destination"></span>
                <div>
                  <div className="r-lbl">DESTINATION STORE</div>
                  <div className="r-val"><strong>{activeJob.dropoff}</strong></div>
                </div>
              </div>
            </div>

            <div className="driver-cargo-info">
              <div className="cargo-item">
                <span className="c-label">Customer Account:</span>
                <span className="c-val">{activeJob.customer}</span>
              </div>
              <div className="cargo-item">
                <span className="c-label">Cargo Manifest:</span>
                <span className="c-val">{activeJob.goods}</span>
              </div>
            </div>
          </div>

          {/* e-POD Signature Form */}
          <div className="pod-signature-section">
            <h4>Electronic Proof of Delivery (FR-07)</h4>
            <p className="text-xs text-muted mb-2">Capture consignee digital signature upon arrival</p>

            <div className="form-group mb-2">
              <label className="text-xs">Recipient Full Name</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Receiver name (e.g., Sandra Wilson)"
                className="input-sm"
              />
            </div>

            <label className="text-xs">Consignee Sign Here (Touch / Stylus):</label>
            <div className="signature-pad-wrapper">
              <canvas
                ref={canvasRef}
                width={280}
                height={110}
                className="signature-canvas"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={stopDraw}
              />
              {!hasDrawn && <div className="canvas-placeholder">Sign on the line above</div>}
              <button type="button" className="btn-clear-sign" onClick={clearCanvas}>
                Clear
              </button>
            </div>

            <div className="driver-actions">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => toast.info("Camera snapshot attached to POD record (FR-07).", "Photo Attached")}
              >
                <Camera size={14} />
                <span>Add Delivery Photo (1 Attached)</span>
              </button>
              <button
                type="button"
                className="btn btn-success btn-block"
                onClick={handleConfirm}
              >
                <Check size={16} />
                <span>Confirm Delivery & Generate Invoice</span>
              </button>
            </div>
          </div>

          {/* Offline Switch for Demo */}
          <div className="offline-demo-toggle">
            <label className="switch-label">
              <span>Simulate Outback Dead Zone:</span>
              <input
                type="checkbox"
                checked={isOffline}
                onChange={(e) => {
                  setIsOffline(e.target.checked);
                  if (!e.target.checked) {
                    toast.success("Cellular Reconnected: Local offline POD queue auto-synced to cloud!", "4G Restored");
                  } else {
                    toast.warning("Simulated cellular dead zone. PODs will cache locally.", "Offline Mode Active");
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Explanatory Sidebar */}
      <div className="driver-explanation glass-card">
        <div className="card-header">
          <div className="header-icon icon-accent">
            <Shield size={20} />
          </div>
          <div>
            <h3>Driver App Design & Compliance</h3>
            <p className="text-muted">Engineered for outdoor sunlight, gloved hands & offline resilience</p>
          </div>
        </div>
        <div className="explanation-points">
          <div className="point-item">
            <strong>Offline-First Resilience (NFR-05, ER-01):</strong>
            <p>On remote NT routes with zero mobile signal, POD signatures & geotags are encrypted locally in IndexedDB/SQLite storage and automatically dispatched the moment 4G is restored.</p>
          </div>
          <div className="point-item">
            <strong>Rugged Field Ergonomics (NFR-04):</strong>
            <p>High-contrast outdoor UI, minimum 48px touch targets for gloved fingers, simplified single-column action flow.</p>
          </div>
          <div className="point-item">
            <strong>Chain of Custody & Audit Trail (PR-04):</strong>
            <p>Every signature capture records UTC & ACST timestamps, GPS accuracy coordinates, and device ID for legal non-repudiation.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
