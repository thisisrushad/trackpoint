"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { STUART_HIGHWAY_WAYPOINTS, NT_COORDINATES, getDestinationCoords } from "@/lib/data";
import { Play, Pause, RotateCcw, FastForward, Crosshair, Navigation, Gauge, MapPin } from "lucide-react";

interface MapViewProps {
  jobId?: string;
  truckLat?: number;
  truckLng?: number;
  driverName?: string;
  vehicleName?: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  status?: string;
  height?: string;
  onArrival?: () => void;
  onProgressChange?: (progress: number, hasArrived: boolean) => void;
  onPositionUpdate?: (coords: [number, number], stepIdx: number) => void;
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
  stepsPerSegment = 48
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
  jobId,
  truckLat,
  truckLng,
  driverName = "Dave Miller",
  vehicleName = "Truck #NL-14 (Mack Titan)",
  pickupAddress = "Darwin Depot (120 Berrimah Rd, Darwin)",
  dropoffAddress = "Katherine Store (Katherine Terrace)",
  status = "In Transit",
  height = "500px",
  onArrival,
  onProgressChange,
  onPositionUpdate
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const truckMarkerRef = useRef<L.Marker | null>(null);
  const traveledPolylineRef = useRef<L.Polyline | null>(null);

  const isDelivered = status === "Delivered" || status === "Invoiced";
  const isInTransit = status === "In Transit";
  const isAssigned = status === "Assigned" || status === "Booked";
  const isArrivedStatus = status === "Arrived";

  const pickupCoords = useMemo(() => getDestinationCoords(pickupAddress), [pickupAddress]);
  const dropoffCoords = useMemo(() => getDestinationCoords(dropoffAddress), [dropoffAddress]);

  // Generate full corridor points
  const corridorPoints = useMemo(() => {
    return generateCorridorPoints(pickupCoords, dropoffCoords, 14);
  }, [pickupCoords, dropoffCoords]);

  // Live movement simulation state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [hasReachedDestination, setHasReachedDestination] = useState<boolean>(isDelivered || isArrivedStatus);
  const [stepIndex, setStepIndex] = useState<number>(() => {
    if (isDelivered || isArrivedStatus) return corridorPoints.length - 1;

    // 1. Check persistent localStorage saved stepIndex for this job / vehicle
    if (typeof window !== "undefined") {
      const storageKey = jobId ? `trackpoint_step_${jobId}` : `trackpoint_step_${vehicleName}`;
      const savedStep = localStorage.getItem(storageKey);
      if (savedStep !== null) {
        const parsed = parseInt(savedStep, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed < corridorPoints.length) {
          return parsed;
        }
      }
    }

    // 2. If truckLat & truckLng provided and not origin, find closest index in corridorPoints
    if (truckLat !== undefined && truckLng !== undefined && corridorPoints.length > 0) {
      let closestIdx = -1;
      let minDistance = Infinity;
      for (let i = 0; i < corridorPoints.length; i++) {
        const [pLat, pLng] = corridorPoints[i];
        const dist = Math.hypot(pLat - truckLat, pLng - truckLng);
        if (dist < minDistance) {
          minDistance = dist;
          closestIdx = i;
        }
      }
      // If within 0.1 degrees (~11km) of corridor, snap to closest waypoint
      if (closestIdx !== -1 && minDistance < 0.15) {
        return closestIdx;
      }
    }

    // 3. Fallback default for in-transit
    if (isInTransit) return Math.min(corridorPoints.length - 1, Math.floor(corridorPoints.length * 0.3));
    return 0;
  });

  const [currentSpeed, setCurrentSpeed] = useState<number>(() => (isDelivered || isArrivedStatus ? 0 : 86));
  const [autoCenter, setAutoCenter] = useState<boolean>(false);

  // Effective status accounting for local live arrival
  const effectiveStatus = hasReachedDestination || isArrivedStatus
    ? "Arrived & Docked"
    : isDelivered
    ? "Delivered"
    : status;

  const isActuallyDocked = isDelivered || hasReachedDestination || isArrivedStatus;

  // Active coordinates
  const currentCoords = useMemo<[number, number]>(() => {
    if (isActuallyDocked) return dropoffCoords;
    if (isAssigned) return pickupCoords;
    if (corridorPoints.length === 0) return [truckLat || -12.9540, truckLng || 131.7820];
    const safeIdx = Math.min(Math.max(0, stepIndex), corridorPoints.length - 1);
    return corridorPoints[safeIdx];
  }, [isActuallyDocked, isAssigned, corridorPoints, stepIndex, dropoffCoords, pickupCoords, truckLat, truckLng]);

  // Calculate percentage of journey completed
  const progressPercent = useMemo(() => {
    if (isActuallyDocked) return 100;
    if (isAssigned) return 0;
    if (corridorPoints.length <= 1) return 0;
    return Math.round((stepIndex / (corridorPoints.length - 1)) * 100);
  }, [stepIndex, corridorPoints.length, isActuallyDocked, isAssigned]);

  // Persist current location & step index to localStorage and notify callbacks
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storageKey = jobId ? `trackpoint_step_${jobId}` : `trackpoint_step_${vehicleName}`;
      localStorage.setItem(storageKey, stepIndex.toString());
      if (jobId) {
        localStorage.setItem(`trackpoint_coords_${jobId}`, JSON.stringify(currentCoords));
        localStorage.setItem(`trackpoint_arrived_${jobId}`, isActuallyDocked ? "true" : "false");
      }
    }
    if (onPositionUpdate) {
      onPositionUpdate(currentCoords, stepIndex);
    }
  }, [stepIndex, currentCoords, jobId, vehicleName, isActuallyDocked, onPositionUpdate]);

  // Notify parent of progress or arrival changes
  useEffect(() => {
    if (onProgressChange) {
      onProgressChange(progressPercent, isActuallyDocked);
    }
  }, [progressPercent, isActuallyDocked, onProgressChange]);

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
      fillColor: isActuallyDocked ? "#10b981" : "#ef4444",
      color: "#ffffff",
      weight: 3,
      fillOpacity: 1
    }).addTo(map).bindPopup(
      `<b>Destination Dock:</b><br>${dropoffAddress}<br>${
        isActuallyDocked ? "<b>✅ Status: Arrived at Receiving Dock</b>" : "<b>⏳ Pending Highway Linehaul Arrival</b>"
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
        border: 2px solid ${isActuallyDocked ? "#10b981" : isAssigned ? "#38bdf8" : "#60a5fa"};
        box-shadow: 0 0 16px ${isActuallyDocked ? "rgba(16,185,129,0.8)" : isAssigned ? "rgba(56,189,248,0.8)" : "rgba(96,165,250,0.8)"};
        white-space: nowrap;
      ">
        <span style="
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${isActuallyDocked ? "#10b981" : "#38bdf8"};
          box-shadow: 0 0 8px ${isActuallyDocked ? "#10b981" : "#38bdf8"};
          display: inline-block;
          animation: pulse-green 1.2s infinite;
        "></span>
        <span>🚚 ${isActuallyDocked ? "Docked: " : isAssigned ? "Staged: " : "En Route: "}${shortVehicleName}</span>
      </div>
    `;

    const truckIcon = L.divIcon({
      className: "custom-live-truck-icon",
      html: iconHtml,
      iconSize: [195, 32],
      iconAnchor: [97, 16]
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
  }, [corridorPoints, pickupCoords, dropoffCoords, isDelivered, isActuallyDocked, isAssigned, vehicleName, pickupAddress, dropoffAddress]);

  // Live Movement Animation Loop: Smooth, steady, real-time pace
  useEffect(() => {
    if (!isInTransit || !isPlaying || hasReachedDestination || corridorPoints.length === 0) return;

    // Smooth, perceptible tick cadence: ~650ms base interval scaled by speedMultiplier
    const intervalMs = Math.max(160, Math.floor(650 / speedMultiplier));

    const timer = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= corridorPoints.length - 1) {
          // Reached destination! Update status and stop rather than looping instantly
          setHasReachedDestination(true);
          setCurrentSpeed(0);
          if (onArrival) {
            onArrival();
          }
          return corridorPoints.length - 1;
        }
        return prev + 1;
      });

      // Natural telematics highway speed fluctuation (82 - 90 km/h)
      const jitter = Math.floor(Math.random() * 5) - 2;
      setCurrentSpeed(86 + jitter);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isInTransit, isPlaying, hasReachedDestination, speedMultiplier, corridorPoints.length, onArrival]);

  // Synchronize Marker Position, Custom HTML Icon, & Traveled Polyline
  useEffect(() => {
    if (!truckMarkerRef.current) return;

    truckMarkerRef.current.setLatLng(currentCoords);

    // Update marker custom icon when docking status changes
    const shortVehicleName = vehicleName.split("(")[0].trim() || vehicleName;
    const updatedIconHtml = `
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
        border: 2px solid ${isActuallyDocked ? "#10b981" : isAssigned ? "#38bdf8" : "#60a5fa"};
        box-shadow: 0 0 16px ${isActuallyDocked ? "rgba(16,185,129,0.8)" : isAssigned ? "rgba(56,189,248,0.8)" : "rgba(96,165,250,0.8)"};
        white-space: nowrap;
      ">
        <span style="
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${isActuallyDocked ? "#10b981" : "#38bdf8"};
          box-shadow: 0 0 8px ${isActuallyDocked ? "#10b981" : "#38bdf8"};
          display: inline-block;
          animation: pulse-green 1.2s infinite;
        "></span>
        <span>🚚 ${isActuallyDocked ? "Docked: " : isAssigned ? "Staged: " : "En Route: "}${shortVehicleName}</span>
      </div>
    `;

    truckMarkerRef.current.setIcon(
      L.divIcon({
        className: "custom-live-truck-icon",
        html: updatedIconHtml,
        iconSize: [195, 32],
        iconAnchor: [97, 16]
      })
    );

    // Update marker popup content
    truckMarkerRef.current.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
        <strong style="color:#38bdf8; font-size: 13px;">${vehicleName}</strong><br/>
        <span>Driver: <b>${driverName}</b></span><br/>
        <span>Corridor Status: <b style="color:${isActuallyDocked ? '#10b981' : '#38bdf8'};">${effectiveStatus}</b></span><br/>
        <span>Telemetry Speed: <b>${isActuallyDocked ? '0 km/h (Docked)' : `${currentSpeed} km/h`}</b></span><br/>
        <span>Route Progress: <b>${progressPercent}% Complete</b></span><br/>
        <span style="color:#94a3b8; font-size: 10px;">GPS: ${currentCoords[0].toFixed(4)}°, ${currentCoords[1].toFixed(4)}°</span>
      </div>
    `);

    // Update traveled green route polyline
    if (traveledPolylineRef.current) {
      if (isActuallyDocked) {
        traveledPolylineRef.current.setLatLngs(corridorPoints);
      } else if (isInTransit) {
        const traveledSlice = corridorPoints.slice(0, stepIndex + 1);
        traveledPolylineRef.current.setLatLngs(traveledSlice);
      }
    }

    // Auto-pan if enabled without animation stacking to prevent tile desynchronization
    if (autoCenter && mapInstanceRef.current && isInTransit && !isActuallyDocked) {
      mapInstanceRef.current.panTo(currentCoords, { animate: false });
    }
  }, [currentCoords, isInTransit, isActuallyDocked, isAssigned, stepIndex, corridorPoints, vehicleName, driverName, effectiveStatus, currentSpeed, progressPercent, autoCenter]);

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
    setHasReachedDestination(false);
    setCurrentSpeed(86);
    setIsPlaying(true);
    if (typeof window !== "undefined") {
      const storageKey = jobId ? `trackpoint_step_${jobId}` : `trackpoint_step_${vehicleName}`;
      localStorage.setItem(storageKey, "0");
      if (jobId) {
        localStorage.setItem(`trackpoint_arrived_${jobId}`, "false");
        if (corridorPoints.length > 0) {
          localStorage.setItem(`trackpoint_coords_${jobId}`, JSON.stringify(corridorPoints[0]));
        }
      }
    }
    if (truckMarkerRef.current && corridorPoints.length > 0) {
      truckMarkerRef.current.setLatLng(corridorPoints[0]);
    }
    if (mapInstanceRef.current && corridorPoints.length > 0) {
      const polyline = L.polyline(corridorPoints);
      mapInstanceRef.current.fitBounds(polyline.getBounds(), { padding: [35, 35] });
      mapInstanceRef.current.invalidateSize({ pan: false });
    }
  };

  // Jump truck directly to destination receiving dock
  const handleJumpToDestination = () => {
    if (corridorPoints.length === 0) return;
    const finalIdx = corridorPoints.length - 1;
    setStepIndex(finalIdx);
    setHasReachedDestination(true);
    setCurrentSpeed(0);
    setIsPlaying(false);
    if (typeof window !== "undefined") {
      const storageKey = jobId ? `trackpoint_step_${jobId}` : `trackpoint_step_${vehicleName}`;
      localStorage.setItem(storageKey, finalIdx.toString());
      if (jobId) {
        localStorage.setItem(`trackpoint_arrived_${jobId}`, "true");
        localStorage.setItem(`trackpoint_coords_${jobId}`, JSON.stringify(corridorPoints[finalIdx]));
      }
    }
    if (truckMarkerRef.current) {
      truckMarkerRef.current.setLatLng(corridorPoints[finalIdx]);
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(corridorPoints[finalIdx], 12, { animate: true });
    }
    if (onArrival) {
      onArrival();
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
          border: `1px solid ${isActuallyDocked ? "rgba(16, 185, 129, 0.4)" : isAssigned ? "rgba(56, 189, 248, 0.4)" : "rgba(96, 165, 250, 0.4)"}`,
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
        {isActuallyDocked ? (
          <span style={{ color: "#10b981", fontWeight: 700, fontSize: "0.78rem", display: "inline-flex", alignItems: "center", gap: "5px" }}>
            <span>✅</span> {hasReachedDestination ? "Linehaul Completed • Docked at Destination" : "Delivered & Signed at Destination • Docked"} (0 km/h)
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

          {/* Jump to Destination Dock */}
          {!hasReachedDestination && (
            <button
              type="button"
              onClick={handleJumpToDestination}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                background: "rgba(16, 185, 129, 0.2)",
                border: "1px solid rgba(16, 185, 129, 0.4)",
                color: "#6ee7b7",
                borderRadius: "8px",
                padding: "0.35rem 0.55rem",
                fontSize: "0.72rem",
                fontWeight: 700,
                cursor: "pointer"
              }}
              title="Fast-forward truck to destination receiving dock (simulates physical arrival)"
            >
              <MapPin size={12} />
              <span>Reach Dock</span>
            </button>
          )}

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
