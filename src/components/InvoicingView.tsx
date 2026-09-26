"use client";

import React, { useEffect, useState } from "react";
import { Invoice, Job } from "@/lib/data";
import { Printer, CheckCircle, FileText } from "lucide-react";

interface InvoicingViewProps {
  activeJob: Job;
}

export default function InvoicingView({ activeJob }: InvoicingViewProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    fetch("/api/invoices")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setInvoices(data.invoices);
      })
      .catch(console.error);
  }, [activeJob]);

  const currentInvoice = invoices[0] || {
    id: `INV-2026-${activeJob.id.replace("TP-", "")}`,
    jobId: activeJob.id,
    customer: activeJob.customer,
    issueDate: "24-Sep-2026",
    dueDate: "08-Oct-2026",
    subtotal: 1200.00,
    gst: 120.00,
    total: 1320.00,
    status: activeJob.status === "Delivered" ? "Draft (Ready to Release)" : "Draft",
    recipientName: activeJob.recipientName || "Sandra Wilson",
    deliveryTimestamp: "24-Sep-2026 14:38:12 ACST"
  };

  return (
    <div className="glass-card">
      <div className="card-header flex-between">
        <div className="flex-align">
          <div className="header-icon icon-primary">
            <FileText size={20} />
          </div>
          <div>
            <h2>Automated Tax Invoicing & POD Verification (FR-08, PR-01, PR-05)</h2>
            <p className="text-muted">Invoices generated automatically upon digital POD sync — eliminates 9-day paper docket lag</p>
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
          <Printer size={16} />
          <span>Print / Export PDF</span>
        </button>
      </div>

      <div className="invoice-box">
        <div className="invoice-top">
          <div>
            <h1 className="inv-brand">NorthLine Freight & Logistics</h1>
            <p className="text-sm text-muted">ABN: 54 109 238 901 · 120 Berrimah Road, Darwin NT 0828</p>
          </div>
          <div className="inv-meta">
            <h2>TAX INVOICE</h2>
            <p><strong>Invoice No:</strong> <span>{currentInvoice.id}</span></p>
            <p><strong>Date Issued:</strong> {currentInvoice.issueDate}</p>
            <p><strong>Payment Terms:</strong> 14 Days Net (Due: {currentInvoice.dueDate})</p>
          </div>
        </div>

        <hr className="inv-divider" />

        <div className="inv-parties">
          <div className="inv-party">
            <span className="c-label">Billed To:</span>
            <strong>{activeJob.customer}</strong><br />
            {activeJob.dropoff}<br />
            Northern Territory
          </div>
          <div className="inv-party">
            <span className="c-label">Consignment Details:</span>
            <strong>Job Ref:</strong> <span>#{activeJob.id}</span><br />
            <strong>Corridor:</strong> {activeJob.pickup.split('(')[0]} → {activeJob.dropoff.split('(')[0]}<br />
            <strong>POD Verified By:</strong> {currentInvoice.recipientName || "Sandra Wilson"}
          </div>
        </div>

        <table className="inv-table">
          <thead>
            <tr>
              <th>Description of Freight Service</th>
              <th>Weight / Pallets</th>
              <th>Rate (AUD)</th>
              <th>Amount (ex GST)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Scheduled Linehaul Freight: {activeJob.pickup.split('(')[0]} to {activeJob.dropoff.split('(')[0]}</td>
              <td>3.40 Tonnes (2 Pallets)</td>
              <td>$320.00 / t</td>
              <td>$1,088.00</td>
            </tr>
            <tr>
              <td>Fuel Surcharge (Regional NT Corridor)</td>
              <td>Flat Rate</td>
              <td>—</td>
              <td>$112.00</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="text-right"><strong>Subtotal:</strong></td>
              <td>$1,200.00</td>
            </tr>
            <tr>
              <td colSpan={3} className="text-right"><strong>GST (10%):</strong></td>
              <td>$120.00</td>
            </tr>
            <tr className="inv-total-row">
              <td colSpan={3} className="text-right"><strong>Total Amount Due (AUD):</strong></td>
              <td><strong>$1,320.00</strong></td>
            </tr>
          </tfoot>
        </table>

        <div className="inv-pod-proof">
          <div className="flex-align mb-2">
            <CheckCircle size={16} color="#10b981" />
            <h4 style={{ margin: 0 }}>Attached Electronic Proof of Delivery (e-POD)</h4>
          </div>
          <div className="pod-proof-row">
            <div className="signature-box-preview">
              <span className="c-label">Digital Signature Captured:</span>
              <div className="sig-preview-img">
                {activeJob.signatureDataUrl ? (
                  <img src={activeJob.signatureDataUrl} style={{ maxHeight: "65px", maxWidth: "100%" }} alt="Signature" />
                ) : (
                  <span className="text-xs text-muted">[Sandra Wilson — Digitally Signed & Verified]</span>
                )}
              </div>
            </div>
            <div className="pod-audit-meta">
              <p><strong>Timestamp:</strong> 24-Sep-2026 14:38:12 ACST</p>
              <p><strong>GPS Geotag:</strong> -14.4652° S, 132.2635° E (Katherine Depot)</p>
              <p><strong>Driver Handset:</strong> Dave Miller (#DRV-104)</p>
              <p><strong>Compliance:</strong> Corporations Act 7-Yr Retention Compliant (CR-04)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
