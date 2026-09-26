"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { STUART_HIGHWAY_WAYPOINTS, NT_COORDINATES, getDestinationCoords } from "@/lib/data";
import { Play, Pause, RotateCcw, FastForward, Crosshair, Navigation, Gauge, MapPin } from "lucide-react";

interface MapViewProps {
  truckLat?: number;
  truckLng?: number;
  driverName?: string;
  vehicleName?: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  status?: string;
  height?: string;
}

// Master Stuart Highway Corridor sequence from North (Darwin) to South (Alice Springs)
const MASTER_STUART_CORRIDOR: { name: string; coords: [number, number] }[] = [
  { name: "Darwin Port / Depot", coords: [-12.4634, 130.8456] },
  { name: "Palmerston Arterial", coords: [-12.4935, 130.9850] },
  { name: "Manton Dam (Stuart Hwy)", coords: [-12.7845, 131.0560] },
  { name: "Adelaide River Roadhouse", coords: [-13.2384, 131.1065] },
  { name: "Hayes Creek / Emerald Springs", coords: [-13.5200, 131.4500] },
  { name: "Pine Creek Mining Basin", coords: [-13.8242, 131.8285] },
  { name: "Edith River Crossing", coords: [-14.1500, 132.0200] },
  { name: "Katherine Regional Depot", coords: [-14.4652, 132.2635] },
  { name: "Mataranka Thermal Basin", coords: [-14.9220, 133.0645] },
  { name: "Larrimah Wayside", coords: [-15.5760, 133.2140] },
  { name: "Daly Waters Historic Pub", coords: [-16.2550, 133.3680] },
  { name: "Elliott Community", coords: [-17.5580, 133.5420] },
  { name: "Tennant Creek Barkly Hub", coords: [-19.6459, 134.1915] },
  { name: "Barrow Creek Station", coords: [-21.5230, 133.8860] },
  { name: "Ti Tree Roadhouse", coords: [-22.1300, 133.4180] },
  { name: "Alice Springs Terminal", coords: [-23.6980, 133.8807] }
];

// Helper to interpolate smooth micro-steps between waypoints
function generateCorridorPoints(
  startCoords: [number, number],
  endCoords: [number, number],
  stepsPerSegment = 12
): [number, number][] {
  // Determine if trip is southbound (North to South, lat decreasing) or northbound
  const isSouthbound = startCoords[0] > endCoords[0];

  const corridorWaypoints: [number, number][] = [];
  corridorWaypoints.push(startCoords);

  const intermediate = MASTER_STUART_CORRIDOR.filter((wp) => {
    if (isSouthbound) {
      return wp.coords[0] < startCoords[0] && wp.coords[0] > endCoords[0];
    } else {
      return wp.coords[0] > startCoords[0] && wp.coords[0] < endCoords[0];
    }
  });

  if (!isSouthbound) {
    intermediate.reverse();
  }

  intermediate.forEach((wp) => corridorWaypoints.push(wp.coords));
  corridorWaypoints.push(endCoords);

  // Linear interpolation along segments
  const densePoints: [number, number][] = [];
  for (let i = 0; i < corridorWaypoints.length - 1; i++) {
    const p1 = corridorWaypoints[i];
    const p2 = corridorWaypoints[i + 1];
    for (let step = 0; step < stepsPerSegment; step++) {
      const t = step / stepsPerSegment;
      const lat = p1[0] + (p2[0] - p1[0]) * t;
      const lng = p1[1] + (p2[1] - p1[1]) * t;
      densePoints.push([lat, lng]);
    }
  }
  densePoints.push(endCoords);
  return densePoints;
}

export default function MapView({
  truckLat,
  truckLng,
  driverName = "Dave Miller",
  vehicleName = "Truck #NL-14 (Mack Titan)",
  pickupAddress = "Darwin Depot (120 Berrimah Rd, Darwin)",
  dropoffAddress = "Katherine Store (Katherine Terrace)",
  status = "In Transit",
  height = "500px"
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const truckMarkerRef = useRef<L.Marker | null>(null);
  const traveledPolylineRef = useRef<L.Polyline | null>(null);

  const isDelivered = status === "Delivered" || status === "Invoiced";
  const isInTransit = status === "In Transit";
  const isAssigned = status === "Assigned" || status === "Booked";

  const pickupCoords = useMemo(() => getDestinationCoords(pickupAddress), [pickupAddress]);
  const dropoffCoords = useMemo(() => getDestinationCoords(dropoffAddress), [dropoffAddress]);

  // Generate full corridor points
  const corridorPoints = useMemo(() => {
    return generateCorridorPoints(pickupCoords, dropoffCoords, 14);
  }, [pickupCoords, dropoffCoords]);

  // Live movement simulation state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [stepIndex, setStepIndex] = useState<number>(() => {
    // If in transit, start at roughly ~25% through the journey for instant demonstration
    if (isInTransit) return Math.min(15, Math.floor(corridorPoints.length * 0.25));
    if (isDelivered) return corridorPoints.length - 1;
    return 0;
  });

  const [currentSpeed, setCurrentSpeed] = useState<number>(88);
  const [autoCenter, setAutoCenter] = useState<boolean>(false);

  // Active coordinates
  const currentCoords = useMemo<[number, number]>(() => {
    if (isDelivered) return dropoffCoords;
    if (isAssigned) return pickupCoords;
    if (corridorPoints.length === 0) return [truckLat || -12.9540, truckLng || 131.7820];
    const safeIdx = Math.min(Math.max(0, stepIndex), corridorPoints.length - 1);
    return corridorPoints[safeIdx];
  }, [isDelivered, isAssigned, corridorPoints, stepIndex, dropoffCoords, pickupCoords, truckLat, truckLng]);

  // Calculate percentage of journey completed
  const progressPercent = useMemo(() => {
    if (isDelivered) return 100;
    if (isAssigned) return 0;
    if (corridorPoints.length <= 1) return 0;
    return Math.round((stepIndex / (corridorPoints.length - 1)) * 100);
  }, [stepIndex, corridorPoints.length, isDelivered, isAssigned]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true
    });
    mapInstanceRef.current = map;

    // Fast OpenStreetMap Tile Layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 18
    }).addTo(map);

    // Full Route Polyline (dashed corridor guide)
    const fullRoutePolyline = L.polyline(corridorPoints, {
      color: isDelivered ? "#10b981" : "#3b82f6",
      weight: 4,
      opacity: 0.65,
      dashArray: isDelivered ? undefined : "6, 8"
    }).addTo(map);

    // Traveled Route Polyline (solid bright line behind the truck)
    const traveledPolyline = L.polyline([], {
      color: "#10b981",
      weight: 5,
      opacity: 0.95
    }).addTo(map);
    traveledPolylineRef.current = traveledPolyline;

    // Origin Marker (Pickup)
    L.circleMarker(pickupCoords, {
      radius: 8,
      fillColor: isAssigned ? "#38bdf8" : "#10b981",
      color: "#ffffff",
      weight: 2,
      fillOpacity: 1
    }).addTo(map).bindPopup(
      `<b>Origin Pickup Depot:</b><br>${pickupAddress}<br><span style="color:#10b981;">● Departure Depot Staging</span>`
    );

    // Destination Marker (Dropoff)
    L.circleMarker(dropoffCoords, {
      radius: 9,
      fillColor: isDelivered ? "#10b981" : "#ef4444",
      color: "#ffffff",
      weight: 3,
      fillOpacity: 1
    }).addTo(map).bindPopup(
      `<b>Destination Dock:</b><br>${dropoffAddress}<br>${
        isDelivered ? "<b>✅ Status: Delivered & e-POD Signed</b>" : "<b>⏳ Pending Highway Linehaul Arrival</b>"
      }`
    );

    // Truck Marker
    const shortVehicleName = vehicleName.split("(")[0].trim() || vehicleName;

    const iconHtml = `
      <div style="
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(15, 23, 42, 0.95);
        color: #f8fafc;
        padding: 5px 12px;
        border-radius: 9999px;
        font-size: 11px;
        font-weight: 800;
        border: 2px solid ${isDelivered ? "#10b981" : isAssigned ? "#38bdf8" : "#60a5fa"};
        box-shadow: 0 0 16px ${isDelivered ? "rgba(16,185,129,0.8)" : isAssigned ? "rgba(56,189,248,0.8)" : "rgba(96,165,250,0.8)"};
        white-space: nowrap;
      ">
        <span style="
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${isDelivered ? "#10b981" : isAssigned ? "#38bdf8" : "#38bdf8"};
          box-shadow: 0 0 8px ${isDelivered ? "#10b981" : "#38bdf8"};
          display: inline-block;
          animation: pulse-green 1.2s infinite;
        "></span>
        <span>🚚 ${isDelivered ? "Docked: " : isAssigned ? "Staged: " : "Moving: "}${shortVehicleName}</span>
      </div>
    `;

    const truckIcon = L.divIcon({
      className: "custom-live-truck-icon",
      html: iconHtml,
      iconSize: [180, 32],
      iconAnchor: [90, 16]
    });

    const marker = L.marker(currentCoords, { icon: truckIcon }).addTo(map);
    truckMarkerRef.current = marker;

    // Fit map bounds with comfortable padding so the full active corridor is visible
    map.fitBounds(fullRoutePolyline.getBounds(), {
      padding: [45, 45],
      maxZoom: 12
    });

    const resizeTimer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize({ pan: false });
      }
    }, 200);

    const onResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize({ pan: false });
      }
    };
    window.addEventListener("resize", onResize);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize({ pan: false });
        }
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      if (resizeObserver) resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [corridorPoints, pickupCoords, dropoffCoords, isDelivered, isAssigned, vehicleName, pickupAddress, dropoffAddress]);

  // Live Movement Animation Loop (Runs when In Transit and isPlaying)
  useEffect(() => {
    if (!isInTransit || !isPlaying || corridorPoints.length === 0) return;

    // Timer interval scales with speedMultiplier
    const intervalMs = Math.max(120, Math.floor(800 / speedMultiplier));

    const timer = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= corridorPoints.length - 1) {
          // Loop seamlessly back to start of Stuart Highway for continuous demo
          return 0;
        }
        return prev + 1;
      });

      // Natural telematics speed fluctuation around 88 km/h
      const jitter = Math.floor(Math.random() * 7) - 3;
      setCurrentSpeed(88 + jitter);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isInTransit, isPlaying, speedMultiplier, corridorPoints.length]);

  // Synchronize Marker Position & Traveled Polyline
  useEffect(() => {
    if (!truckMarkerRef.current) return;

    truckMarkerRef.current.setLatLng(currentCoords);

    // Update marker popup content
    truckMarkerRef.current.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
        <strong style="color:#38bdf8; font-size: 13px;">${vehicleName}</strong><br/>
        <span>Driver: <b>${driverName}</b></span><br/>
        <span>Corridor Status: <b style="color:${isDelivered ? '#10b981' : '#38bdf8'};">${status}</b></span><br/>
        <span>Telemetry Speed: <b>${isInTransit ? `${currentSpeed} km/h` : '0 km/h'}</b></span><br/>
        <span>Route Progress: <b>${progressPercent}% Complete</b></span><br/>
        <span style="color:#94a3b8; font-size: 10px;">GPS: ${currentCoords[0].toFixed(4)}°, ${currentCoords[1].toFixed(4)}°</span>
      </div>
    `);

    // Update traveled green route polyline
    if (traveledPolylineRef.current && isInTransit) {
      const traveledSlice = corridorPoints.slice(0, stepIndex + 1);
      traveledPolylineRef.current.setLatLngs(traveledSlice);
    }

    // Auto-pan if enabled without animation stacking to prevent tile desynchronization
    if (autoCenter && mapInstanceRef.current && isInTransit) {
      mapInstanceRef.current.panTo(currentCoords, { animate: false });
    }
  }, [currentCoords, isInTransit, isDelivered, stepIndex, corridorPoints, vehicleName, driverName, status, currentSpeed, progressPercent, autoCenter]);

  // Recenter / Fit Route Bounds
  const handleFitRoute = () => {
    if (!mapInstanceRef.current || corridorPoints.length === 0) return;
    setAutoCenter(false);
    mapInstanceRef.current.invalidateSize({ pan: false });
    const polyline = L.polyline(corridorPoints);
    mapInstanceRef.current.fitBounds(polyline.getBounds(), { padding: [35, 35] });
  };

  // Toggle Auto-Follow Vehicle
  const handleToggleAutoFollow = () => {
    setAutoCenter((prev) => {
      const next = !prev;
      if (next && mapInstanceRef.current) {
        mapInstanceRef.current.setView(currentCoords, 9, { animate: false });
        mapInstanceRef.current.invalidateSize({ pan: false });
      } else if (!next && mapInstanceRef.current && corridorPoints.length > 0) {
        const polyline = L.polyline(corridorPoints);
        mapInstanceRef.current.fitBounds(polyline.getBounds(), { padding: [35, 35] });
        mapInstanceRef.current.invalidateSize({ pan: false });
      }
      return next;
    });
  };

  // Reset truck position to start
  const handleResetToStart = () => {
    setStepIndex(0);
    if (truckMarkerRef.current && corridorPoints.length > 0) {
      truckMarkerRef.current.setLatLng(corridorPoints[0]);
    }
    if (mapInstanceRef.current && corridorPoints.length > 0) {
      const polyline = L.polyline(corridorPoints);
      mapInstanceRef.current.fitBounds(polyline.getBounds(), { padding: [35, 35] });
      mapInstanceRef.current.invalidateSize({ pan: false });
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: height, minHeight: height, borderRadius: "14px", overflow: "hidden" }}>
      {/* Leaflet Canvas Container */}
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%", minHeight: height }} />

      {/* Top Overlay Telematics Header Badge */}
      <div
        className="map-overlay-badge"
        style={{
          background: "rgba(15, 23, 42, 0.94)",
          backdropFilter: "blur(8px)",
          border: `1px solid ${isDelivered ? "rgba(16, 185, 129, 0.4)" : isAssigned ? "rgba(56, 189, 248, 0.4)" : "rgba(96, 165, 250, 0.4)"}`,
          padding: "0.45rem 0.85rem",
          borderRadius: "9999px",
          position: "absolute",
          top: "14px",
          right: "14px",
          zIndex: 1000,
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}
      >
        {isDelivered ? (
          <span style={{ color: "#10b981", fontWeight: 700, fontSize: "0.78rem", display: "inline-flex", alignItems: "center", gap: "5px" }}>
            <span>✅</span> Delivered & Signed at Destination • Docked (0 km/h)
          </span>
        ) : isAssigned ? (
          <span style={{ color: "#38bdf8", fontWeight: 700, fontSize: "0.78rem", display: "inline-flex", alignItems: "center", gap: "5px" }}>
            <span>⏳</span> Depot Staging • Pre-Trip Checked (Halted 0 km/h)
          </span>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.78rem" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 8px #10b981", animation: "pulse-green 1s infinite" }}></span>
            <span style={{ color: "#38bdf8", fontWeight: 700 }}>Stuart Hwy Live Telematics:</span>
            <span style={{ color: "#f8fafc", fontWeight: 800 }}>{currentSpeed} km/h</span>
            <span style={{ color: "#94a3b8" }}>•</span>
            <span style={{ color: "#34d399", fontWeight: 700 }}>{progressPercent}% Complete</span>
            <span style={{ color: "#94a3b8" }}>({currentCoords[0].toFixed(3)}°, {currentCoords[1].toFixed(3)}°)</span>
          </div>
        )}
      </div>

      {/* Bottom Floating Interactive Simulation Controls Bar (for Live In-Transit runs) */}
      {isInTransit && (
        <div
          style={{
            position: "absolute",
            bottom: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            background: "rgba(15, 23, 42, 0.94)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(56, 189, 248, 0.35)",
            boxShadow: "0 6px 24px rgba(0,0,0,0.6)",
            padding: "0.4rem 0.85rem",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            flexWrap: "wrap",
            maxWidth: "92%"
          }}
        >
          {/* Play / Pause Toggle */}
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              background: isPlaying ? "rgba(16, 185, 129, 0.25)" : "rgba(245, 158, 11, 0.25)",
              border: `1px solid ${isPlaying ? "rgba(16, 185, 129, 0.5)" : "rgba(245, 158, 11, 0.5)"}`,
              color: isPlaying ? "#34d399" : "#fbbf24",
              borderRadius: "8px",
              padding: "0.35rem 0.65rem",
              fontSize: "0.72rem",
              fontWeight: 800,
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
            title={isPlaying ? "Pause real-time GPS simulation" : "Resume real-time GPS simulation"}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span>{isPlaying ? "Live Moving" : "Paused"}</span>
          </button>

          {/* Speed Multiplier Button (Cycles 1x -> 2x -> 5x -> 10x) */}
          <button
            type="button"
            onClick={() => {
              setSpeedMultiplier((prev) => (prev === 1 ? 2 : prev === 2 ? 5 : prev === 5 ? 10 : 1));
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#cbd5e1",
              borderRadius: "8px",
              padding: "0.35rem 0.6rem",
              fontSize: "0.72rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
            title="Toggle simulation animation speed"
          >
            <FastForward size={13} color="#38bdf8" />
            <span>{speedMultiplier}x Speed</span>
          </button>

          {/* Auto-Follow Camera Toggle */}
          <button
            type="button"
            onClick={handleToggleAutoFollow}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              background: autoCenter ? "rgba(56, 189, 248, 0.25)" : "rgba(255, 255, 255, 0.06)",
              border: `1px solid ${autoCenter ? "#38bdf8" : "rgba(255, 255, 255, 0.12)"}`,
              color: autoCenter ? "#38bdf8" : "#cbd5e1",
              borderRadius: "8px",
              padding: "0.35rem 0.6rem",
              fontSize: "0.72rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
            title="Toggle auto-follow camera tracking on vehicle"
          >
            <Crosshair size={13} color={autoCenter ? "#38bdf8" : "#60a5fa"} />
            <span>{autoCenter ? "Auto-Follow: ON" : "Follow Truck"}</span>
          </button>

          {/* Fit Full Corridor */}
          <button
            type="button"
            onClick={() => {
              setAutoCenter(false);
              handleFitRoute();
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#cbd5e1",
              borderRadius: "8px",
              padding: "0.35rem 0.6rem",
              fontSize: "0.72rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
            title="Fit full corridor view"
          >
            <Navigation size={13} color="#a78bfa" />
            <span>Full Corridor</span>
          </button>

          {/* Reset to Start */}
          <button
            type="button"
            onClick={handleResetToStart}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#94a3b8",
              borderRadius: "8px",
              padding: "0.35rem 0.55rem",
              fontSize: "0.72rem",
              fontWeight: 600,
              cursor: "pointer"
            }}
            title="Restart route from origin depot"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>

          {/* Progress Indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: "2px" }}>
            <div style={{ width: "60px", height: "5px", background: "rgba(255,255,255,0.1)", borderRadius: "9999px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #38bdf8, #10b981)",
                  borderRadius: "9999px",
                  transition: "width 0.4s ease"
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
