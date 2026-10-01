/**
 * TrackPoint — Fleet Dispatch, GPS Tracking & Management Platform
 * Charles Darwin University — PRT631 Capstone Platform
 */

// Application Global State
const appState = {
  activeJob: {
    id: "TP-8842",
    customer: "Katherine Mining Supplies Ltd",
    pickup: "Darwin Depot (120 Berrimah Rd)",
    dropoff: "Katherine Store (Lot 44 Katherine Tce)",
    goods: "2x Heavy Mining Replacement Parts (3.4t)",
    driver: "Dave Miller (#DRV-104)",
    vehicle: "Truck #NL-14 (Mack Titan)",
    status: "In Transit",
    eta: "14:45 ACST",
    lat: -12.9540,
    lng: 131.7820,
    podSigned: false,
    signatureDataUrl: null
  },
  unassignedJobs: [
    { id: "TP-8843", customer: "Berrimah Timber & Hardware", route: "Darwin Metro → Palmerston", cargo: "Building Timbers (1.8t)", suggestedDriver: "Sarah Peterson (#DRV-108)" },
    { id: "TP-8844", customer: "Alice Springs Pastoral Co.", route: "Katherine → Tennant Creek", cargo: "Fencing & Animal Feed (4.2t)", suggestedDriver: "Mark Taylor (#DRV-112)" },
    { id: "TP-8845", customer: "Top End Fresh Produce", route: "Humpty Doo → Darwin Port", cargo: "Chilled Mango Export (5.0t)", suggestedDriver: "Dave Miller (#DRV-104)" }
  ],
  fleetVehicles: [
    { id: "NL-14", name: "Truck #NL-14 (Mack Titan)", driver: "Dave Miller", lat: -12.9540, lng: 131.7820, status: "In Transit", speed: "88 km/h" },
    { id: "NL-08", name: "Rigid #NL-08 (Hino 500)", driver: "Sarah Peterson", lat: -12.4634, lng: 130.8456, status: "Loading (Darwin Depot)", speed: "0 km/h" },
    { id: "NL-31", name: "Road Train #NL-31 (Kenworth)", driver: "Mark Taylor", lat: -19.6459, lng: 134.1915, status: "In Transit (Tennant Creek)", speed: "92 km/h" },
    { id: "NL-02", name: "Van #NL-02 (Mercedes Sprinter)", driver: "Liam Chen", lat: -12.4935, lng: 130.9850, status: "Delivering (Palmerston)", speed: "45 km/h" },
    { id: "NL-22", name: "Linehaul #NL-22 (Volvo FH16)", driver: "Gary Adams", lat: -23.6980, lng: 133.8807, status: "Staging (Alice Springs)", speed: "0 km/h" }
  ],
  isOffline: false
};

// Maps & Markers references
let customerMap = null;
let dispatcherMap = null;
let customerTruckMarker = null;
let dispatcherMarkers = [];
let routePolyline = null;
let animationInterval = null;

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initCustomerMap();
  initDispatcherMap();
  initSignaturePad();
  initCharts();
  initEventListeners();
  renderDispatcherJobs();
  startSimulatedGPSTelemetry();
});

/* ================= NAVIGATION TABS ================= */
function initNavigation() {
  const tabs = document.querySelectorAll(".nav-btn");
  const panels = document.querySelectorAll(".view-panel");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const targetView = tab.getAttribute("data-view");
      
      tabs.forEach(t => t.classList.remove("active"));
      panels.forEach(p => p.classList.remove("active"));

      tab.classList.add("active");
      const activePanel = document.getElementById(targetView);
      if (activePanel) {
        activePanel.classList.add("active");
        
        // Invalidate Leaflet map size on tab switch to avoid rendering glitches
        setTimeout(() => {
          if (targetView === "customer-view" && customerMap) customerMap.invalidateSize();
          if (targetView === "dispatcher-view" && dispatcherMap) dispatcherMap.invalidateSize();
        }, 150);
      }
    });
  });
}

/* ================= LEAFLET MAPS ================= */
// Northern Territory Coordinates: Darwin [-12.4634, 130.8456], Katherine [-14.4652, 132.2635]
const NT_COORDS = {
  darwin: [-12.4634, 130.8456],
  adelaideRiver: [-13.2384, 131.1065],
  pineCreek: [-13.8242, 131.8285],
  katherine: [-14.4652, 132.2635],
  tennantCreek: [-19.6459, 134.1915],
  aliceSprings: [-23.6980, 133.8807]
};

// Route line along Stuart Highway
const stuartHwyRoute = [
  NT_COORDS.darwin,
  [-12.7845, 131.0560],
  NT_COORDS.adelaideRiver,
  [-13.5200, 131.4500],
  NT_COORDS.pineCreek,
  [-14.1500, 132.0200],
  NT_COORDS.katherine
];

function initCustomerMap() {
  const mapElement = document.getElementById("customerMap");
  if (!mapElement) return;

  customerMap = L.map('customerMap').setView([-13.4, 131.5], 7);

  // Dark OpenStreetMap Tiles
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    maxZoom: 18
  }).addTo(customerMap);

  // Draw Highway Route
  routePolyline = L.polyline(stuartHwyRoute, {
    color: '#2563eb',
    weight: 4,
    opacity: 0.8,
    dashArray: '8, 8'
  }).addTo(customerMap);

  // Start Marker (Darwin Depot)
  L.circleMarker(NT_COORDS.darwin, {
    radius: 7,
    fillColor: '#10b981',
    color: '#ffffff',
    weight: 2,
    fillOpacity: 1
  }).addTo(customerMap).bindPopup("<b>Pickup:</b> NorthLine Darwin Depot");

  // End Marker (Katherine Store)
  L.circleMarker(NT_COORDS.katherine, {
    radius: 7,
    fillColor: '#ef4444',
    color: '#ffffff',
    weight: 2,
    fillOpacity: 1
  }).addTo(customerMap).bindPopup("<b>Destination:</b> Katherine Mining Supplies Ltd");

  // Moving Truck Marker
  const truckIcon = L.divIcon({
    className: 'custom-truck-icon',
    html: `<div style="background:#2563eb;color:white;padding:4px 8px;border-radius:12px;font-size:11px;font-weight:700;border:2px solid white;box-shadow:0 0 10px rgba(37,99,235,0.8);white-space:nowrap;">🚚 Truck #NL-14</div>`,
    iconSize: [110, 30],
    iconAnchor: [55, 15]
  });

  customerTruckMarker = L.marker([appState.activeJob.lat, appState.activeJob.lng], { icon: truckIcon }).addTo(customerMap);
  customerTruckMarker.bindPopup("<b>Dave Miller</b><br>Mack Titan (#NL-14)<br>Speed: 88 km/h<br>Live Telemetry OK");
}

function initDispatcherMap() {
  const mapElement = document.getElementById("dispatcherMap");
  if (!mapElement) return;

  dispatcherMap = L.map('dispatcherMap').setView([-16.5, 132.5], 6);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    maxZoom: 18
  }).addTo(dispatcherMap);

  // Render all NT Fleet Vehicles
  appState.fleetVehicles.forEach(v => {
    const vIcon = L.divIcon({
      className: 'fleet-vehicle-icon',
      html: `<div style="background:${v.status.includes('Transit') ? '#2563eb' : '#10b981'};color:white;padding:3px 6px;border-radius:10px;font-size:10px;font-weight:700;border:1.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);white-space:nowrap;">🚛 ${v.id}</div>`,
      iconSize: [80, 24],
      iconAnchor: [40, 12]
    });

    const marker = L.marker([v.lat, v.lng], { icon: vIcon }).addTo(dispatcherMap);
    marker.bindPopup(`<b>${v.name}</b><br>Driver: ${v.driver}<br>Status: ${v.status}<br>Speed: ${v.speed}`);
    dispatcherMarkers.push(marker);
  });
}

/* ================= SIMULATED LIVE GPS MOVEMENT ================= */
let routeIndex = 0;
let routeProgress = 0.3;

function startSimulatedGPSTelemetry() {
  if (animationInterval) clearInterval(animationInterval);

  animationInterval = setInterval(() => {
    if (appState.isOffline) return; // Freeze GPS updates if offline

    // Smoothly interpolate position along Stuart Highway
    routeProgress += 0.015;
    if (routeProgress > 0.95) routeProgress = 0.1; // loop simulation

    const totalSegments = stuartHwyRoute.length - 1;
    const globalProgress = routeProgress * totalSegments;
    const currentSeg = Math.floor(globalProgress);
    const segFraction = globalProgress - currentSeg;

    const p1 = stuartHwyRoute[currentSeg];
    const p2 = stuartHwyRoute[currentSeg + 1] || stuartHwyRoute[currentSeg];

    const currentLat = p1[0] + (p2[0] - p1[0]) * segFraction;
    const currentLng = p1[1] + (p2[1] - p1[1]) * segFraction;

    appState.activeJob.lat = currentLat;
    appState.activeJob.lng = currentLng;

    if (customerTruckMarker) {
      customerTruckMarker.setLatLng([currentLat, currentLng]);
    }

    // Update fleet list position for Dave Miller (NL-14)
    if (dispatcherMarkers[0]) {
      dispatcherMarkers[0].setLatLng([currentLat, currentLng]);
    }
  }, 3000);
}

/* ================= HTML5 SIGNATURE PAD ================= */
let isDrawing = false;
let sigCanvas, sigCtx;

function initSignaturePad() {
  sigCanvas = document.getElementById("signaturePad");
  if (!sigCanvas) return;
  sigCtx = sigCanvas.getContext("2d");

  sigCtx.strokeStyle = "#38bdf8";
  sigCtx.lineWidth = 2.5;
  sigCtx.lineCap = "round";
  sigCtx.lineJoin = "round";

  const placeholder = document.getElementById("canvasPlaceholder");

  function getCanvasPos(e) {
    const rect = sigCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (sigCanvas.width / rect.width),
      y: (clientY - rect.top) * (sigCanvas.height / rect.height)
    };
  }

  function startDraw(e) {
    isDrawing = true;
    if (placeholder) placeholder.style.display = "none";
    const pos = getCanvasPos(e);
    sigCtx.beginPath();
    sigCtx.moveTo(pos.x, pos.y);
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getCanvasPos(e);
    sigCtx.lineTo(pos.x, pos.y);
    sigCtx.stroke();
  }

  function stopDraw() {
    if (isDrawing) {
      isDrawing = false;
      appState.activeJob.signatureDataUrl = sigCanvas.toDataURL();
    }
  }

  sigCanvas.addEventListener("mousedown", startDraw);
  sigCanvas.addEventListener("mousemove", draw);
  sigCanvas.addEventListener("mouseup", stopDraw);
  sigCanvas.addEventListener("mouseleave", stopDraw);

  sigCanvas.addEventListener("touchstart", startDraw);
  sigCanvas.addEventListener("touchmove", draw);
  sigCanvas.addEventListener("touchend", stopDraw);

  // Clear button
  document.getElementById("btnClearSign")?.addEventListener("click", () => {
    sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
    if (placeholder) placeholder.style.display = "block";
    appState.activeJob.signatureDataUrl = null;
  });
}

/* ================= DISPATCHER QUEUE & MODAL OVERRIDE ================= */
function renderDispatcherJobs() {
  const list = document.getElementById("dispatcherJobList");
  if (!list) return;

  list.innerHTML = "";
  appState.unassignedJobs.forEach((job, index) => {
    const card = document.createElement("div");
    card.className = "job-card-item";
    card.innerHTML = `
      <div class="j-top">
        <span class="j-id">${job.id}</span>
        <span class="badge-status in-transit">Auto-Matched</span>
      </div>
      <div class="j-route"><strong>${job.customer}</strong></div>
      <div class="j-meta">
        <span>📍 ${job.route}</span>
        <span>📦 ${job.cargo}</span>
      </div>
      <div class="j-meta" style="margin-top:4px; color:#60a5fa;">
        <span>🎯 Suggested: ${job.suggestedDriver}</span>
      </div>
      <div class="j-actions">
        <button class="btn btn-secondary btn-sm" onclick="openOverrideModal('${job.id}')">Override / Reassign (FR-03)</button>
        <button class="btn btn-primary btn-sm" onclick="confirmJobAssignment('${job.id}', ${index})">Confirm Dispatch</button>
      </div>
    `;
    list.appendChild(card);
  });

  const countBadge = document.getElementById("unassignedCount");
  if (countBadge) countBadge.innerText = `${appState.unassignedJobs.length} In Queue`;
}

window.openOverrideModal = function(jobId) {
  const modal = document.getElementById("overrideModal");
  const modalJobId = document.getElementById("modalJobId");
  if (modalJobId) modalJobId.innerText = jobId;
  if (modal) modal.style.display = "flex";
};

window.confirmJobAssignment = function(jobId, index) {
  alert(`Consignment ${jobId} dispatched! Push notification sent to driver's handset.`);
  appState.unassignedJobs.splice(index, 1);
  renderDispatcherJobs();
};

/* ================= EVENT LISTENERS ================= */
function initEventListeners() {
  // Booking Form Submission
  const bookingForm = document.getElementById("bookingForm");
  if (bookingForm) {
    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const client = document.getElementById("clientName").value;
      const goods = document.getElementById("goodsDescription").value;
      const priority = document.getElementById("priorityType").value;
      const newId = `TP-${Math.floor(1000 + Math.random() * 9000)}`;

      // Update state
      appState.activeJob.id = newId;
      appState.activeJob.customer = client;
      appState.activeJob.goods = goods;

      // Update UI elements
      document.getElementById("activeJobId").innerText = `#${newId}`;
      document.getElementById("invJobRef").innerText = `#${newId}`;
      document.getElementById("invClient").innerText = client;

      // Simulated SMS Alert update
      const smsFeed = document.getElementById("smsText");
      if (smsFeed) {
        smsFeed.innerText = `"NorthLine Alert: New Booking #${newId} confirmed (${priority}). Truck #NL-14 auto-allocated. ETA: 14:45 ACST."`;
      }
      document.getElementById("smsTimestamp").innerText = "Just now";

      alert(`✅ Booking Confirmed for ${client}!\nConsignment #${newId} created.\nNearest vehicle (Truck #NL-14, Dave Miller) auto-assigned via GPS (FR-02).`);
    });
  }

  // Driver Confirm Delivery (e-POD)
  const btnConfirm = document.getElementById("btnConfirmDelivery");
  if (btnConfirm) {
    btnConfirm.addEventListener("click", () => {
      const recipient = document.getElementById("recipientName").value || "Recipient";
      
      if (appState.isOffline) {
        alert(`💾 OFFLINE SYNC QUEUED (NFR-05):\nDelivery for ${recipient} recorded locally.\nSignature and GPS geotag stored in encrypted offline cache. Will auto-sync when cellular signal returns.`);
      } else {
        alert(`🎉 DELIVERY CONFIRMED (FR-07, FR-08):\nSigned by: ${recipient}\nDigital POD verified.\n⚡ Draft Tax Invoice auto-generated in Invoicing System (INV-2026-8842)!`);
        
        // Update job badge
        const badge = document.getElementById("jobStatusBadge");
        if (badge) {
          badge.className = "badge-status delivered";
          badge.innerText = "Delivered & Invoiced";
        }

        // Render signature in invoice
        const previewBox = document.getElementById("invoiceSignaturePreview");
        if (previewBox && appState.activeJob.signatureDataUrl) {
          previewBox.innerHTML = `<img src="${appState.activeJob.signatureDataUrl}" style="max-height:70px; max-width:100%;" alt="Signature">`;
        }
      }
    });
  }

  // Offline Simulation Toggle
  const offlineToggle = document.getElementById("offlineToggle");
  if (offlineToggle) {
    offlineToggle.addEventListener("change", (e) => {
      appState.isOffline = e.target.checked;
      const banner = document.getElementById("offlineBanner");
      const statusDot = document.getElementById("statusDot");
      const connectionText = document.getElementById("connectionText");

      if (appState.isOffline) {
        banner.style.display = "flex";
        statusDot.className = "dot-status offline";
        connectionText.innerText = "Offline (Outback No Signal)";
      } else {
        banner.style.display = "none";
        statusDot.className = "dot-status online";
        connectionText.innerText = "4G Connected";
        alert("📶 Cellular Reconnected: Local offline POD queue automatically synced to TrackPoint cloud!");
      }
    });
  }

  // Map Centering Buttons
  document.getElementById("btnCenterDarwin")?.addEventListener("click", () => {
    if (dispatcherMap) dispatcherMap.setView(NT_COORDS.darwin, 11);
  });
  document.getElementById("btnCenterNT")?.addEventListener("click", () => {
    if (dispatcherMap) dispatcherMap.setView([-16.5, 132.5], 6);
  });

  // Modal Controls
  document.getElementById("btnCloseModal")?.addEventListener("click", () => {
    document.getElementById("overrideModal").style.display = "none";
  });
  document.getElementById("btnCancelOverride")?.addEventListener("click", () => {
    document.getElementById("overrideModal").style.display = "none";
  });
  document.getElementById("btnConfirmOverride")?.addEventListener("click", () => {
    const sel = document.getElementById("modalDriverSelect").value;
    const reason = document.getElementById("modalReasonCode").value;
    alert(`Dispatcher Override Applied (FR-03):\nReassigned to ${sel}.\nReason code [${reason}] logged for compliance audit (PR-02).`);
    document.getElementById("overrideModal").style.display = "none";
  });
}

/* ================= CHART.JS ANALYTICS ================= */
function initCharts() {
  // On-Time Delivery Line Chart (RR-01)
  const ctxOnTime = document.getElementById("onTimeChart")?.getContext("2d");
  if (ctxOnTime) {
    new Chart(ctxOnTime, {
      type: "line",
      data: {
        labels: ["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5", "Wk 6", "Wk 7", "Wk 8", "Wk 9"],
        datasets: [{
          label: "On-Time Delivery % (Target: 95%)",
          data: [88.5, 89.2, 90.0, 91.4, 91.8, 92.5, 93.1, 93.8, 94.2],
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          borderWidth: 3,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: "#10b981",
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { min: 85, max: 100, grid: { color: "rgba(255,255,255,0.06)" }, ticks: { color: "#94a3b8" } },
          x: { grid: { display: false }, ticks: { color: "#94a3b8" } }
        }
      }
    });
  }

  // Fleet Utilisation Bar Chart by Depot (RR-02)
  const ctxUtil = document.getElementById("utilisationChart")?.getContext("2d");
  if (ctxUtil) {
    new Chart(ctxUtil, {
      type: "bar",
      data: {
        labels: ["Darwin Metro", "Katherine Depot", "Tennant Creek", "Alice Springs"],
        datasets: [
          {
            label: "Active Running %",
            data: [82, 79, 74, 78],
            backgroundColor: "#2563eb",
            borderRadius: 6
          },
          {
            label: "Idle / Loading %",
            data: [18, 21, 26, 22],
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: "#94a3b8", font: { size: 11 } } }
        },
        scales: {
          y: { stacked: true, max: 100, grid: { color: "rgba(255,255,255,0.06)" }, ticks: { color: "#94a3b8" } },
          x: { stacked: true, grid: { display: false }, ticks: { color: "#94a3b8" } }
        }
      }
    });
  }
}
