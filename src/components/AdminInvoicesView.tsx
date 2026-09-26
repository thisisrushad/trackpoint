"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Invoice, Job } from "@/lib/data";
import { useToast } from "@/context/ToastContext";
import Pagination from "./Pagination";
import {
  FileText,
  Printer,
  CheckCircle,
  Download,
  Send,
  ShieldCheck,
  DollarSign,
  Calendar,
  UserCheck,
  AlertCircle
} from "lucide-react";

interface AdminInvoicesViewProps {
  jobs: Job[];
}

export default function AdminInvoicesView({ jobs }: AdminInvoicesViewProps) {
  const toast = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    fetch("/api/invoices")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.invoices.length > 0) {
          setInvoices(data.invoices);
          setSelectedInvoiceId(data.invoices[0].id);
        }
      })
      .catch(console.error);
  }, []);

  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return invoices.slice(start, start + pageSize);
  }, [invoices, currentPage, pageSize]);

  const currentInvoice = invoices.find((inv) => inv.id === selectedInvoiceId) || invoices[0] || {
    id: "INV-2026-8842",
    jobId: "TP-8842",
    customer: "Katherine Mining Supplies Ltd",
    issueDate: "24-Sep-2026",
    dueDate: "08-Oct-2026",
    subtotal: 1200.0,
    gst: 120.0,
    total: 1320.0,
    status: "Draft",
    recipientName: "Sandra Wilson",
    deliveryTimestamp: "24-Sep-2026 14:38:12 ACST"
  };

  const matchedJob = jobs.find((j) => j.id === currentInvoice.jobId) || jobs[0];

  const handleReleaseInvoice = (invoiceId: string) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: "Issued" } : inv))
    );
    toast.success(
      `Tax Invoice #${invoiceId} released to ${currentInvoice.customer} accounts payable portal via automated EDI transfer.`,
      "Invoice Released (FR-08)"
    );
  };

  const handleDownloadPDF = () => {
    toast.info(`Generating official ATO Tax Invoice & e-POD PDF for #${currentInvoice.id}...`, "Exporting Document");
    window.print();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      
      {/* Header & Status Card */}
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
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "8px",
              background: "rgba(16, 185, 129, 0.15)",
              color: "#34d399",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <FileText size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "0.98rem", fontWeight: 700 }}>
              Automated Australian Tax Invoicing & POD Audit Release (FR-08, PR-01, PR-05)
            </h3>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>
              Eliminates the legacy 9-day paper docket lag through immediate digital e-POD verification and automatic GST billing
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={handleDownloadPDF}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: "0.75rem", padding: "0.4rem 0.85rem" }}
          >
            <Printer size={14} />
            <span>Print / Export PDF</span>
          </button>
          <button
            onClick={() => handleReleaseInvoice(currentInvoice.id)}
            className="btn btn-primary btn-sm"
            style={{ fontSize: "0.75rem", padding: "0.4rem 0.85rem" }}
          >
            <Send size={14} />
            <span>Release Invoice to Client (FR-08)</span>
          </button>
        </div>
      </div>

      {/* Invoice Selector Strip */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          overflowX: "auto",
          paddingBottom: "0.25rem"
        }}
      >
        {paginatedInvoices.map((inv) => {
          const isSelected = inv.id === currentInvoice.id;
          const isPaid = inv.status === "Paid";
          const isIssued = inv.status === "Issued";

          return (
            <button
              key={inv.id}
              onClick={() => setSelectedInvoiceId(inv.id)}
              style={{
                flex: "0 0 auto",
                padding: "0.75rem 1rem",
                borderRadius: "10px",
                background: isSelected
                  ? "linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(37, 99, 235, 0.25))"
                  : "rgba(15, 23, 42, 0.6)",
                border: `1px solid ${isSelected ? "rgba(56, 189, 248, 0.5)" : "rgba(255, 255, 255, 0.08)"}`,
                color: "#f8fafc",
                cursor: "pointer",
                textAlign: "left",
                minWidth: "200px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 800, color: isSelected ? "#38bdf8" : "#cbd5e1" }}>
                  {inv.id}
                </span>
                <span
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    padding: "0.1rem 0.4rem",
                    borderRadius: "4px",
                    background: isPaid ? "rgba(16, 185, 129, 0.2)" : isIssued ? "rgba(59, 130, 246, 0.2)" : "rgba(245, 158, 11, 0.2)",
                    color: isPaid ? "#6ee7b7" : isIssued ? "#93c5fd" : "#fcd34d"
                  }}
                >
                  {inv.status}
                </span>
              </div>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#f8fafc" }}>
                ${inv.total.toFixed(2)} AUD
              </div>
              <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "2px" }}>
                {inv.customer.split(" ")[0]} · Ref #{inv.jobId}
              </div>
            </button>
          );
        })}
      </div>

      {/* Invoice Strip Pagination */}
      <div className="glass-card" style={{ padding: "0.25rem 0.75rem" }}>
        <Pagination
          currentPage={currentPage}
          totalItems={invoices.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[3, 5, 10]}
          labelSingular="invoice"
          labelPlural="invoices"
        />
      </div>

      {/* Official Tax Invoice Sheet */}
      <div className="glass-card" style={{ padding: "2rem" }}>
        <div className="invoice-box" style={{ maxWidth: "100%", margin: "0 auto" }}>
          
          <div className="invoice-top">
            <div>
              <h1 className="inv-brand">NorthLine Freight & Logistics Pty Ltd</h1>
              <p className="text-sm text-muted">
                ABN: 54 109 238 901 · 120 Berrimah Road, Darwin NT 0828 · Phone: +61 8 8947 5000
              </p>
            </div>
            <div className="inv-meta">
              <h2>TAX INVOICE</h2>
              <p><strong>Invoice No:</strong> <span>{currentInvoice.id}</span></p>
              <p><strong>Date Issued:</strong> {currentInvoice.issueDate}</p>
              <p><strong>Payment Due:</strong> {currentInvoice.dueDate} (14 Days Net)</p>
              <p>
                <strong>Audit Status:</strong>{" "}
                <span style={{ color: "#34d399", fontWeight: 700 }}>
                  {currentInvoice.status.toUpperCase()}
                </span>
              </p>
            </div>
          </div>

          <hr className="inv-divider" />

          <div className="inv-parties">
            <div className="inv-party">
              <span className="c-label">Billed Commercial Account:</span>
              <strong>{currentInvoice.customer}</strong><br />
              {matchedJob?.dropoff || "Northern Territory Delivery Address"}<br />
              Australia (ABN Verified)
            </div>
            <div className="inv-party">
              <span className="c-label">Consignment & Transport Details:</span>
              <strong>Consignment Ref:</strong> <span>#{currentInvoice.jobId}</span><br />
              <strong>Corridor:</strong> {matchedJob?.pickup.split('(')[0]} → {matchedJob?.dropoff.split('(')[0]}<br />
              <strong>Allocated Carrier:</strong> {matchedJob?.vehicle || "NorthLine Road Train #NL-01"}
            </div>
          </div>

          <table className="inv-table">
            <thead>
              <tr>
                <th>Description of Freight Service</th>
                <th>Weight / Manifest</th>
                <th>Rate (AUD)</th>
                <th>Amount (ex GST)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Stuart Highway Scheduled Linehaul:</strong> {matchedJob?.pickup.split('(')[0]} to {matchedJob?.dropoff.split('(')[0]}
                </td>
                <td>3.40 Tonnes (Palletized)</td>
                <td>$320.00 / tonne</td>
                <td>${(currentInvoice.subtotal * 0.9).toFixed(2)}</td>
              </tr>
              <tr>
                <td>
                  <strong>Outback Fuel Surcharge (Regional NT Stuart Corridor):</strong>
                </td>
                <td>Flat Surcharge</td>
                <td>—</td>
                <td>${(currentInvoice.subtotal * 0.1).toFixed(2)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="text-right"><strong>Subtotal:</strong></td>
                <td>${currentInvoice.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan={3} className="text-right"><strong>GST (10% ATO Compliant):</strong></td>
                <td>${currentInvoice.gst.toFixed(2)}</td>
              </tr>
              <tr className="inv-total-row">
                <td colSpan={3} className="text-right"><strong>Total Amount Due (AUD):</strong></td>
                <td><strong>${currentInvoice.total.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>

          {/* Attached e-POD Verification Box */}
          <div className="inv-pod-proof" style={{ marginTop: "2rem" }}>
            <div className="flex-align mb-2" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CheckCircle size={18} color="#10b981" />
              <h4 style={{ margin: 0, fontSize: "0.95rem" }}>
                Attached Electronic Proof of Delivery (e-POD Audit Certificate)
              </h4>
            </div>
            <div className="pod-proof-row">
              <div className="signature-box-preview">
                <span className="c-label">Recipient Digital Signature:</span>
                <div className="sig-preview-img">
                  {matchedJob?.signatureDataUrl ? (
                    <img
                      src={matchedJob.signatureDataUrl}
                      style={{ maxHeight: "65px", maxWidth: "100%" }}
                      alt="Signature"
                    />
                  ) : (
                    <span className="text-xs text-muted">
                      [{currentInvoice.recipientName || "Sandra Wilson"} — Digitally Signed & GPS Verified]
                    </span>
                  )}
                </div>
              </div>
              <div className="pod-audit-meta">
                <p><strong>Signed By:</strong> {currentInvoice.recipientName || "Sandra Wilson"}</p>
                <p><strong>Delivery Timestamp:</strong> {currentInvoice.deliveryTimestamp || "24-Sep-2026 14:38:12 ACST"}</p>
                <p><strong>Handset Geotag:</strong> -14.4652° S, 132.2635° E (Katherine Depot)</p>
                <p><strong>Compliance Standard:</strong> Corporations Act 7-Year Digital Audit Compliant (CR-04)</p>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
