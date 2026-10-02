# TrackPoint — PRT631 Capstone Project Platform

**Student:** Mahir Sadman Rushad | S395312  
**Course:** PRT631 — Project (Master of Information Technology)  
**Institution:** Charles Darwin University  

---

## 🌟 Overview

**TrackPoint** is an integrated fleet dispatch, GPS telematics tracking, digital proof-of-delivery (e-POD), and automated invoicing platform engineered for **NorthLine Freight & Logistics** (Darwin, Northern Territory).

This repository contains:
1. **Interactive Web Application Prototype** covering all 5 core touchpoints across the delivery lifecycle.
2. **Updated Comprehensive Report (Weeks 1–9)** in `.docx` format stored in the `reports/` folder (automatically excluded via `.gitignore`).

---

## 🌐 Live Production Deployment

TrackPoint is deployed live on Vercel Serverless with MongoDB Atlas Cloud persistence:

* 🚀 **Live Production Application:** **[https://trackpoint-platform.vercel.app](https://trackpoint-platform.vercel.app)**
* 👤 **Customer Portal:** [https://trackpoint-platform.vercel.app/customer](https://trackpoint-platform.vercel.app/customer) (Sandra Wilson — Katherine Mining Supplies)
* 📡 **Dispatcher Control Center:** [https://trackpoint-platform.vercel.app/admin](https://trackpoint-platform.vercel.app/admin) (Priya Sharma — Fleet Dispatch)
* 📱 **Driver Mobile Handset:** [https://trackpoint-platform.vercel.app/driver](https://trackpoint-platform.vercel.app/driver) (Dave Miller — Truck #NL-14)

---

## 🚀 How to Run the Web Application Locally

```bash
# Install dependencies
npm install

# Run local development server
npm run dev
```

Then visit: **`http://localhost:3000/`** (or use the production link **[https://trackpoint-platform.vercel.app](https://trackpoint-platform.vercel.app)**)


---

## 📱 Features & Course Requirement Mapping

| Feature View | Key Functionalities | Mapped Requirements |
| :--- | :--- | :--- |
| **Customer Portal** | Real-time booking form, auto-dispatch calculation, live Stuart Hwy tracking map, SMS notification feed. | `FR-01`, `FR-02`, `FR-05`, `FR-06`, `FR-09` |
| **Dispatcher Board** | Unassigned jobs queue, interactive fleet telemetry map across 4 NT corridors, drag/click manual override modal with reason codes. | `FR-02`, `FR-03`, `UR-05`, `UR-06`, `PR-02` |
| **Driver Mobile App (e-POD)** | Turn-by-turn route info, **interactive HTML5 signature drawing pad**, photo upload preview, **Outback dead-zone offline simulator**. | `FR-04`, `FR-07`, `NFR-04`, `NFR-05`, `ER-01` |
| **Fleet Analytics** | Real-time **Chart.js** visualizations for On-Time Delivery Trends (94.2%), Depot Utilisation, and live Exception Logs. | `FR-10`, `RR-01`, `RR-02`, `RR-03` |
| **Invoicing & Billing** | Instant tax invoice generation upon digital POD confirmation, embedded digital signature preview, GST calculation, print/PDF export. | `FR-08`, `FR-11`, `PR-01`, `PR-05`, `CR-06` |

---

## 📄 Project Documentation

* The updated comprehensive Word document is located at:
  ```
  reports/PRT631_TrackPoint_Comprehensive_Report_Weeks_1_9.docx
  ```
* All `.docx` files and the `reports/` directory are tracked and excluded from Git commits via `.gitignore`.
