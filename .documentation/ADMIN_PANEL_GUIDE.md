# TrackPoint — Admin & Dispatch Operations Console Architecture & Operations Guide

> **Organization:** NorthLine Freight & Logistics (Darwin, NT)  
> **Course / Unit:** Charles Darwin University — PRT631  
> **Database:** MongoDB Atlas Live Cluster (`cluster0.h5lznjc.mongodb.net/trackPoint`) via Prisma ORM  
> **Notification Engine:** In-App Glassmorphism Toast Management System (Zero Browser Alerts)

---

## 1. Executive Summary: What is the Admin Panel and What Are We Doing?

In a commercial linehaul and logistics enterprise like NorthLine Freight & Logistics (operating across 35 heavy vehicles along the 1,500km Stuart Highway corridor between Darwin Port, Katherine, Tennant Creek, and Alice Springs), the **Admin Operations Console (`/admin`)** serves as the **central mission control room**.

### Core Responsibilities:
1. **Automated Dispatch Supervision (`FR-01`, `FR-02`)**: Monitor customer booking requests as they are ingested and allocated to the nearest available heavy vehicle combinations (Road Trains, B-Doubles, Semi-Trailers, Courier Vans, Refrigerated Reefers).
2. **Manual Dispatcher Override (`FR-03`, `PR-02`)**: Intervene and reassign drivers or vehicles when operational constraints occur (e.g., NHVR Heavy Vehicle driver fatigue limits, oversize permits, specialized cold-chain needs, or mechanical servicing) with mandatory compliance reason logging.
3. **CAN-Bus Fleet Telematics (`FR-05`)**: Real-time GPS tracking, speed, fuel %, battery %, and depot staging status for all 35 NT vehicles.
4. **Commercial Client Accounts Directory**: Manage enterprise B2B accounts (Katherine Mining Supplies, Red Centre Groceries, Arnhem Land Stores, Darwin Port Logistics) with custom credit terms (14/30 Days Net) and active job tracking.
5. **e-POD & Instant Billing Release (`FR-08`, `PR-01`, `PR-05`)**: Review consignee digital signatures captured on driver handsets and immediately release Australian Tax Invoices to accounts payable, eliminating the legacy 9-day paper docket delay.
6. **Operations & Fuel Analytics (`FR-10`, `RR-01..03`)**: Track SLA delivery performance (96.4%), corridor transit times, and heavy vehicle fuel efficiency.

---

## 2. Complete 5-Tab Menu, List & Details Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  🛡️ TrackPoint | Dispatcher & Fleet Operations Control (NorthLine Freight - 35 NT Vehicles)                 │
│  👤 Priya Sharma (Darwin Ops Control)  |  🟢 MongoDB Atlas Live  |  [Sign Out]                              │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  [ 📦 1. Consignments & Dispatch Queue ]  [ 🚛 2. NT Fleet Telematics & Map ]  [ 🏢 3. Commercial Accounts ] │
│  [ 🧾 4. Invoicing & e-POD Audit Release ] [ 📊 5. Operations & Fuel Analytics ]                           │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Menu 1: 📦 Consignments & Dispatch Queue (`AdminConsignmentsTable.tsx`)
- **Single-Row KPI Summary Strip**:
  - `Total Consignments` (10 active/delivered)
  - `In Transit (Hwy)` (Active Stuart Highway haulage)
  - `Assigned / Staging` (Depot staging & pre-trip inspection)
  - `Delivered (e-POD)` (Completed and signed deliveries)
  - `Express Priority` (Time-critical hot-shots)
- **Multi-Dimensional Filter & Search Toolbar**:
  - Text search: Consignment ID (`TP-1001`), Customer, Cargo description, Driver, Destination.
  - Corridor selector: `All NT Corridors`, `Darwin Metro`, `Katherine Hub`, `Tennant Creek`, `Alice Springs`.
  - Priority selector: `All Priorities`, `Express Priority`, `Standard Linehaul`.
  - Status pill tabs: `All Statuses`, `Assigned`, `In Transit`, `Delivered`.
- **Consignment Actions (List Row)**:
  - `[🔍 Details]`: Opens the **Consignment Details Modal** with full route GPS coordinates, assigned driver telematics, cargo manifest, and chain-of-custody milestones.
  - `[🔄 Override]`: Opens the **Manual Dispatcher Override Modal** to reassign driver/vehicle with mandatory NHVR Reason Code.
  - `[📲 Push Route]`: Transmits corridor route map to the driver handset with Toast confirmation.

---

### Menu 2: 🚛 NT Fleet Telematics & Live Map (`AdminFleetView.tsx`)
- **Interactive Stuart Highway Leaflet Map**:
  - Live GPS markers for 35 NT vehicles with custom icons (Road Trains, Reefers, Rigid trucks, Courier vans).
  - **Quick Territory Zoom Buttons**: `[Darwin Metro]`, `[Katherine Hub]`, `[Tennant Creek]`, `[Alice Springs]`, `[View All NT]`.
- **Fleet Statistics Strip**:
  - `28 In Transit On-Route` · `4 Loading / Depot Staging` · `3 Off Duty / Rest Break` · `0 NHVR Overtime Breaches`.
- **35-Vehicle Telematics Card Directory**:
  - Vehicle ID, Model, Base Depot, Active Driver.
  - Telematics badges: Speed (km/h), Fuel Level (%), Battery Status (V).
  - `[Map Focus]`: Centers map on that specific truck.
  - `[Ping OBD]`: Sends CAN-bus diagnostics request with Toast confirmation.

---

### Menu 3: 🏢 Commercial B2B Accounts Directory (`AdminClientsView.tsx`)
- **Enterprise Client Profiles**:
  - **Katherine Mining Supplies Ltd** (Heavy Mining & Earthmoving Spares — Tier 1 Enterprise)
  - **Red Centre Groceries** (Supermarket & Cold-Chain Retail — Tier 1 Enterprise)
  - **Top End Fresh Mango Export** (Agricultural Cold-Chain — Tier 2 Commercial)
  - **Arnhem Land Community Stores** (Remote Food & Merchandise — Government / Municipal)
  - **Darwin Harbour Marine Spares** (Defence & Marine Engineering — Government / Municipal)
  - **Barkly Regional Council Roadworks** (Civil Infrastructure — Municipal)
  - **Berrimah Timber & Building** (Construction Hardware — Tier 2 Commercial)
  - **Palmerston Cold Storage** (Perishable Dairy & Chilled — Tier 2 Commercial)
- **Account Data Points**:
  - Primary Contact Person, Phone, Email, Credit Terms (14/30 Days Net), YTD Freight Spend, Active Consignments Count.
  - **1-Click Filter Shortcut**: `[View Consignments for Katherine]` switches directly to the Consignments Queue filtered by that client.

---

### Menu 4: 🧾 Invoicing & e-POD Compliance Audit (`AdminInvoicesView.tsx`)
- **Horizontal Invoice Selector Strip**: Fast switching across all active tax invoices (`INV-2026-8842`, `INV-2026-8845`, etc.).
- **Official ATO Tax Invoice Sheet**:
  - Full company credentials: NorthLine Freight & Logistics Pty Ltd, ABN `54 109 238 901`, 120 Berrimah Road, Darwin NT 0828.
  - Consignment reference, billing address, itemized linehaul ($320/t), fuel surcharge, and 10% GST.
- **Attached Electronic Proof of Delivery (e-POD)**:
  - Digitally signed signature box preview.
  - ACST delivery timestamp, GPS accuracy coordinates, handset operator ID.
  - Legal non-repudiation audit note (Corporations Act 7-Year Retention Compliant).
- **Actions**:
  - `[Release Invoice to Client (FR-08)]`: Releases invoice to customer accounts payable EDI portal with Toast notification.
  - `[Print / Export PDF]`: Opens official printable PDF export.

---

### Menu 5: 📊 Operations & Fuel Analytics (`FleetAnalytics.tsx`)
- **Key Operational Performance Indicators**:
  - **96.4%** On-Time Delivery Rate (Target: 95.0%)
  - **2.1 km/L** Fleet Average Fuel Economy (Stuart Highway B-Doubles & Road Trains)
  - **85.7%** Active Vehicle Utilization Rate
  - **Instant (0 hrs)** Invoice Lag (reduced from 9 days)
- **Visual Trends**: Weekly tonnage volumes, corridor transit benchmarks (Darwin → Katherine 4.2h, Katherine → Alice Springs 12.8h), and depot staging efficiency.

---

## 3. Database Persistence Architecture (MongoDB Atlas via Prisma)

### Problem Identified & Fixed:
Previously, MongoDB Prisma connectors failed silently on queries using `where: { jobId: { equals: id, mode: "insensitive" } }` because MongoDB does not support Prisma's SQL `mode: "insensitive"` parameter.

### Solution Implemented:
- In `src/modules/jobs/jobs.service.ts`:
  - Replaced unsupported queries with exact and multi-case exact queries: `where: { jobId: { in: [cleanId, upperId] } }`.
  - All status updates, driver reassignments (`override`), new bookings (`createJob`), and e-POD signature uploads (`confirm_delivery`) write directly to MongoDB Atlas.
  - Re-fetched fresh MongoDB documents immediately after writing to return 100% persisted database state.
- In `src/app/api/...`:
  - Added `export const dynamic = "force-dynamic";` across all API route endpoints to ensure live database querying without Next.js build-time caching.

---

## 4. In-App Toast Management System (Zero Browser Alerts)

All blocking browser popup dialogues (`alert(...)` and `confirm(...)`) were removed and replaced with the reactive glassmorphism **Toast Notification System** (`ToastProvider` & `useToast()`):

```tsx
const toast = useToast();

// Success Notification (Green gradient, check icon, auto-dismiss in 4s)
toast.success("Consignment #TP-1002 reallocated to Driver Sarah Peterson.", "Driver Reassigned (FR-03)");

// Warning Notification (Amber gradient, warning icon)
toast.warning("Delivery recorded in offline cache. Auto-syncing on 4G restore.", "Offline Mode");

// Info Notification (Blue gradient, info icon)
toast.info("Transmitted route telemetry to driver handset.", "Route Pushed");

// Error Notification (Red gradient, alert icon)
toast.error("Database connection timeout. Retrying...", "Sync Error");
```
