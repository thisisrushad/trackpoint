# 🎯 TrackPoint — Live Demonstration & Presentation Guide
**End-to-End Operational Walkthrough: From Freight Booking to GPS Tracking & e-POD Delivery**  
**Client Organization:** NorthLine Freight & Logistics (Darwin, Northern Territory)  
**Academic Unit:** Charles Darwin University — PRT631 (Unit Deliverable)  
**Presenter:** Project Team Lead  
**Live System URL:** [https://trackpoint-platform.vercel.app](https://trackpoint-platform.vercel.app)

---

## 📽️ Presentation Overview & Demo Narrative

This presentation demonstrates how **TrackPoint** solves the real-world logistics challenges of the **Northern Territory’s 1,500 km Stuart Highway freight corridor** (Darwin $\leftrightarrow$ Katherine $\leftrightarrow$ Tennant Creek $\leftrightarrow$ Alice Springs).

You will demonstrate a live, end-to-end commercial freight run across **3 isolated role personas**:
1. **Sandra Wilson** — Commercial Customer (*Katherine Mining Supplies Ltd*)
2. **Priya Sharma** — Operations Fleet Dispatcher (*NorthLine Darwin Control Center*)
3. **Dave Miller** — Heavy Linehaul Driver (*Mack Titan #NL-14*)

---

## 📋 Slide-by-Slide Presentation Script & Live Demo Steps

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       5-STEP LIVE DEMONSTRATION FLOW                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. PERSONA LOGIN   ──►  2. CUSTOMER BOOKING  ──►  3. DISPATCHER OVERRIDE   │
│   (Role Portals)         (Auto GPS Match)          (Compliance Codes)       │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. LIVE GPS TRACK  ──►  5. DRIVER MOBILE e-POD ──►  6. INVOICE & POD CLOSE  │
│   (Stuart Hwy Map)       (Offline Dead-Zone)        (Tax Invoice & Sign)    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 🟢 SLIDE 1: Title & The Problem in Northern Territory Logistics
* **Screen to Show:** Login Screen ([`https://trackpoint-platform.vercel.app/`](https://trackpoint-platform.vercel.app/))
* **Key Concept:** Remote linehaul operations across the NT suffer from communication dead-zones, manual paper consignment notes, delayed invoicing, and lack of live telemetry.

> **🗣️ Presenter Script:**  
> *"Good morning everyone. Today we are presenting TrackPoint, an enterprise telematics, fleet dispatch, and electronic proof of delivery platform purpose-built for NorthLine Freight & Logistics here in Darwin.  
> Transporting critical mining, agricultural, and medical freight down the Stuart Highway across Katherine, Tennant Creek, and Alice Springs involves extreme distances and cellular black spots.  
> TrackPoint provides 100% visibility, automated GPS dispatching, offline-resilient digital signatures, and immediate tax invoicing. Let's begin by logging in as our commercial customer, Sandra Wilson."*

* **Live Action:** Click **"Login as Customer (Sandra Wilson)"** on the login screen.

---

### 🟢 SLIDE 2: Step 1 — Freight Exploration & Automated Telematics Booking
* **Screen to Show:** Customer Portal ([`https://trackpoint-platform.vercel.app/customer`](https://trackpoint-platform.vercel.app/customer))
* **Requirements Highlighted:** `FR-01` (Booking), `FR-02` (Nearest Vehicle GPS Auto-Dispatch), `FR-09` (SMS Feed).

> **🗣️ Presenter Script:**  
> *"We are now in the dedicated Customer Portal. Notice that Sandra has a single horizontal KPI bar showing all active consignments, and a multi-dimensional table where she can filter by freight type—such as Mining Machinery, Cold-Chain Produce, or Dangerous Goods.  
> NorthLine offers 6 specialized logistics service tiers. Clicking 'Explore All 6 Services' displays our transit SLAs and rates for Scheduled Linehaul, Express Hot-Shot, Refrigerated Cold-Chain, Heavy Road Trains, Medical DG, and Port Drayage.  
> Let's create a new delivery booking for urgent heavy mining parts needed in Katherine."*

* **Live Actions to Demonstrate:**
  1. Click **"Explore All 6 Services"** to reveal the services catalog cards.
  2. Click **`+ Create New Booking`**.
  3. Select **"Express Hot-Shot Linehaul"** (or Standard).
  4. Select **Pickup:** `Darwin Depot (120 Berrimah Rd)`.
  5. Select **Destination:** `Katherine Store (Katherine Terrace)`.
  6. Enter **Goods:** `2x Heavy Mining Replacement Parts (3.4t)`.
  7. Point out the notice: *"Automated Dispatch: System algorithm will match the nearest heavy vehicle in Darwin/Katherine corridor via GPS telemetry."*
  8. Click **`Confirm & Dispatch Consignment`**.
  9. Click **"OK"** on confirmation popup to navigate directly to the new order's Details page.

---

### 🟢 SLIDE 3: Step 2 — Dispatcher Fleet Monitoring & Compliance Override
* **Screen to Show:** Admin Dispatch Center ([`https://trackpoint-platform.vercel.app/admin`](https://trackpoint-platform.vercel.app/admin))
* **Requirements Highlighted:** `FR-03` (Manual Override), `FR-05` (35 Fleet Telematics), `FR-10` (Analytics), `PR-02` (Mandatory Reason Codes).

> **🗣️ Presenter Script:**  
> *"Now let's switch hats to Priya Sharma, our Operations Dispatcher in Darwin.  
> In the Dispatcher Portal, Priya has a real-time Stuart Highway telematics map monitoring all 35 heavy vehicles in our Northern Territory fleet—spanning Darwin, Katherine, Tennant Creek, and Alice Springs depots.  
> In our Auto-Dispatch Queue, the system automatically assigned our new booking to Mack Titan #NL-14 driven by Dave Miller.  
> However, if Dave Miller is approaching his maximum NHVR fatigue driving hours, Priya can execute a manual override. Notice that TrackPoint enforces compliance by mandating a structured reason code—such as DRIVER_FATIGUE, VEHICLE_BREAKDOWN, or CAPACITY_OVERLOAD."*

* **Live Actions to Demonstrate:**
  1. Open `/admin` in a new tab or navigate via sign-out $\rightarrow$ Login as Admin.
  2. Scroll to the **35-Vehicle Telematics Map** and point out vehicle statuses (*In Transit*, *Loading*, *Depot Staging*), speeds, fuel, and battery levels.
  3. In the **Auto-Dispatch Queue**, find the consignment and click **`Override / Reassign`**.
  4. Show the reason code dropdown (`DRIVER_FATIGUE`, `CAPACITY_OVERLOAD`, `WEATHER_DISRUPTION`).
  5. Save override to show how it updates the audit log in MongoDB Atlas.

---

### 🟢 SLIDE 4: Step 3 — Real-Time Stuart Highway GPS Tracking & Milestones
* **Screen to Show:** Consignment Details Page ([`https://trackpoint-platform.vercel.app/customer/orders/TP-8842`](https://trackpoint-platform.vercel.app/customer/orders/TP-8842) or newly created `#TP-XXXX`)
* **Requirements Highlighted:** `FR-05` (GPS Tracking), `FR-06` (5-Stage Milestone Timeline), `NFR-02` (15s Latency).

> **🗣️ Presenter Script:**  
> *"Back on the Customer Details page, Sandra can monitor her consignment in real time.  
> On the left, our OpenStreetMap Leaflet component displays the Stuart Highway corridor with live GPS coordinates refreshed every 15 seconds without persistent server dropouts (fulfilling NFR-02).  
> Below the map is our 5-stage Chain-of-Custody Milestone Timeline:  
> Stage 1: Booking Created & Auto-Dispatched.  
> Stage 2: Freight Loaded & Manifest Verified at Darwin Depot.  
> Stage 3: Stuart Highway Linehaul In-Transit—currently active with a live speed of 88 km/h.  
> On the right, we have environmental sensor telemetry, automated SMS dispatch feeds, and the commercial invoice status."*

* **Live Actions to Demonstrate:**
  1. Point out the pulsing truck marker traveling down the Stuart Highway between Darwin and Pine Creek.
  2. Point out the **Milestone Timeline** with active green status badges.
  3. Show the **Vehicle Telemetry & Environmental Sensors** card (Speed: 88 km/h, Telstra 4G / Iridium link, Cargo Compartment Secure).
  4. Show the **Automated SMS Alerts Feed** (`FR-09`).

---

### 🟢 SLIDE 5: Step 4 — Driver Mobile Handset, Outback Offline Mode & e-POD
* **Screen to Show:** Driver Mobile Handset ([`https://trackpoint-platform.vercel.app/driver`](https://trackpoint-platform.vercel.app/driver))
* **Requirements Highlighted:** `FR-04` (Manifest), `FR-07` (Offline Caching), `FR-08` (HTML5 Signature Pad), `NFR-01` (Offline Resilience).

> **🗣️ Presenter Script:**  
> *"Now let's step into the cab of Mack Titan #NL-14 with our linehaul driver, Dave Miller.  
> Dave's handset is optimized for high-vibration mobile touchscreens.  
> When Dave drives through remote Outback dead-zones between Pine Creek and Katherine with zero cellular coverage, he clicks 'Simulate Offline Dead-Zone'.  
> The app switches to offline mode, caching all transactions securely in local storage.  
> When Dave arrives at Katherine Mining Supplies Ltd, he hands the phone to Sandra. Sandra enters her name and draws her electronic signature on our HTML5 canvas pad."*

* **Live Actions to Demonstrate:**
  1. Open `/driver` (or sign out $\rightarrow$ Login as Driver).
  2. Click **`📡 Simulate Outback Offline Dead-Zone`** $\rightarrow$ Show the badge updating to *"Offline (Caching Locally)"*.
  3. Re-click to reconnect to live network $\rightarrow$ Show *"Online (Live Sync Active)"*.
  4. In the e-POD section, type Recipient Name: `Sandra Wilson`.
  5. Draw a signature on the **HTML5 Signature Canvas Pad**.
  6. Click **`Confirm Delivery & Save e-POD (FR-08)`**.
  7. Show the instant confirmation alert: *"✅ e-POD Saved! Consignment marked Delivered. Invoice auto-generated."*

---

### 🟢 SLIDE 6: Step 5 — Destination Pinning, Signed e-POD & Official Tax Invoice
* **Screen to Show:** Customer Consignment Details ([`https://trackpoint-platform.vercel.app/customer/orders/TP-8842`](https://trackpoint-platform.vercel.app/customer/orders/TP-8842))
* **Requirements Highlighted:** `FR-11` (Tax Invoicing & e-POD Receipt), Final Destination Pinning.

> **🗣️ Presenter Script:**  
> *"Let's return to Sandra's Customer Portal to observe what happened upon delivery.  
> First, notice the map: because the freight is delivered, the map no longer animates on the highway—it locks directly onto the exact destination at Katherine Store with a green 'Delivered & Signed at Destination' pin.  
> Second, our Milestone Timeline shows Stage 5 completed with a green checkmark and timestamp.  
> Third, in our Tax Invoice card, TrackPoint has automatically generated Official Tax Invoice #INV-2026-8842 with NorthLine's ABN, 10% Australian GST ($120.00 AUD), and total payable ($1,320.00 AUD).  
> It embeds Sandra's actual digital signature captured on Dave's handset moments ago, ready for 1-click PDF download or printing."*

* **Live Actions to Demonstrate:**
  1. Show the map pinned at the final destination receiving dock with the green badge.
  2. Scroll down to the **Official Tax Invoice & e-POD (FR-11)** card.
  3. Show NorthLine Freight ABN (`88 123 456 789`), line items, 10% GST, and total ($1,320.00 AUD).
  4. Show the rendered **Digital Signature image** with timestamp.
  5. Click **`Print Invoice`** or **`Download e-POD PDF`**.

---

### 🟢 SLIDE 7: Summary, Architecture & Academic Conclusion
* **Screen to Show:** Architecture Slide or Summary Card
* **Requirements Highlighted:** `NFR-01` to `NFR-04`, Unit PRT631 Deliverables.

> **🗣️ Presenter Script:**  
> *"To conclude our demonstration:  
> TrackPoint successfully fulfills all functional and non-functional requirements for Weeks 1 to 9 of unit PRT631:  
> 1. Next.js 15 modular full-stack architecture with Prisma ORM and MongoDB Atlas cloud database.  
> 2. Zero-watermark OpenStreetMap interactive telematics map.  
> 3. 100% offline-resilient e-POD sign-off with digital signature capture.  
> 4. Automated billing & tax invoicing with Australian GST compliance.  
> 5. Role-based security with JWT authentication and isolated dashboards.  
> Thank you, and we now welcome any questions."*

---

## 🎯 Quick Cheat-Sheet for Presenter

| Demo Stage | URL | Persona | Key Buttons to Click |
| :--- | :--- | :--- | :--- |
| **1. Login** | [`https://trackpoint-platform.vercel.app/`](https://trackpoint-platform.vercel.app/) | Any | Click *"Login as Customer"* |
| **2. Booking** | [`https://trackpoint-platform.vercel.app/customer`](https://trackpoint-platform.vercel.app/customer) | Sandra Wilson | Click *"+ Create New Booking"* $\rightarrow$ *Confirm & Dispatch* |
| **3. Tracking** | [`https://trackpoint-platform.vercel.app/customer/orders/TP-8842`](https://trackpoint-platform.vercel.app/customer/orders/TP-8842) | Sandra Wilson | Inspect Live GPS Map, Speed, Milestone Timeline |
| **4. Dispatcher**| [`https://trackpoint-platform.vercel.app/admin`](https://trackpoint-platform.vercel.app/admin) | Priya Sharma | Inspect 35-vehicle map $\rightarrow$ Click *Override* $\rightarrow$ Select Reason Code |
| **5. Driver POD**| [`https://trackpoint-platform.vercel.app/driver`](https://trackpoint-platform.vercel.app/driver) | Dave Miller | Click *Simulate Offline* $\rightarrow$ Sign on Canvas $\rightarrow$ *Confirm Delivery* |
| **6. Invoice** | [`https://trackpoint-platform.vercel.app/customer/orders/TP-8842`](https://trackpoint-platform.vercel.app/customer/orders/TP-8842) | Sandra Wilson | View Destination Pin $\rightarrow$ View Signed Tax Invoice $\rightarrow$ Click *Print Invoice* |

---
*TrackPoint Presentation Guide • Unit PRT631 • Charles Darwin University*
