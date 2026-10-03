"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Vehicle } from "@/lib/data";

interface DispatcherMapProps {
  vehicles: Vehicle[];
  centerTarget?: [number, number] | null;
  zoomLevel?: number;
}

export default function DispatcherMap({
  vehicles,
  centerTarget,
  zoomLevel = 6
}: DispatcherMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  // Maintain markers map for smooth updates without tearing down all DOM markers
  const markersByIdRef = useRef<Map<string, { marker: L.Marker; baseLat: number; baseLng: number; inTransit: boolean }>>(new Map());

  const syncVehicleMarkers = (map: L.Map, vList: Vehicle[]) => {
    if (!map) return;
    const currentMap = markersByIdRef.current;
    const activeIds = new Set(vList.map((v) => v.id));

    currentMap.forEach((entry, id) => {
      if (!activeIds.has(id)) {
        entry.marker.remove();
        currentMap.delete(id);
      }
    });

    vList.forEach((v) => {
      const isInTransit = v.status.includes("Transit");
      if (currentMap.has(v.id)) {
        const entry = currentMap.get(v.id)!;
        entry.baseLat = v.lat;
        entry.baseLng = v.lng;
        entry.inTransit = isInTransit;
      } else {
        const vIcon = L.divIcon({
          className: "fleet-vehicle-icon",
          html: `<div style="background:${isInTransit ? "#2563eb" : "#10b981"};color:white;padding:3px 7px;border-radius:10px;font-size:10px;font-weight:700;border:1.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);white-space:nowrap;display:inline-flex;align-items:center;gap:4px;">
            <span style="width:6px;height:6px;border-radius:50%;background:${isInTransit ? "#38bdf8" : "#34d399"};box-shadow:0 0 6px ${isInTransit ? "#38bdf8" : "#34d399"};display:inline-block;"></span>
            <span>🚛 ${v.id} (${v.driver.split(" ")[0]})</span>
          </div>`,
          iconSize: [110, 24],
          iconAnchor: [55, 12]
        });

        const marker = L.marker([v.lat, v.lng], { icon: vIcon }).addTo(map);
        marker.bindPopup(`<b>${v.name}</b><br>Driver: ${v.driver}<br>Type: ${v.type}<br>Depot: ${v.depot}<br>Status: ${v.status}<br>Speed: ${v.speed}<br>Fuel: ${v.fuelLevel}`);
        currentMap.set(v.id, { marker, baseLat: v.lat, baseLng: v.lng, inTransit: isInTransit });
      }
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current).setView([-16.5, 132.5], 6);
    mapInstanceRef.current = map;

    // Standard OpenStreetMap Tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 18
    }).addTo(map);

    syncVehicleMarkers(map, vehicles);

    return () => {
      markersByIdRef.current.clear();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update vehicle markers when vehicles change
  useEffect(() => {
    if (mapInstanceRef.current) {
      syncVehicleMarkers(mapInstanceRef.current, vehicles);
    }
  }, [vehicles]);

  // Live telematics coordinate simulation for in-transit vehicles
  useEffect(() => {
    let tick = 0;
    const interval = setInterval(() => {
      tick++;
      markersByIdRef.current.forEach((entry) => {
        if (entry.inTransit) {
          // Subtle realistic drift along the Stuart Highway corridor axis (south-east/north-west angle)
          const offsetLat = Math.sin((tick + entry.baseLat * 100) * 0.4) * 0.0025;
          const offsetLng = Math.cos((tick + entry.baseLng * 100) * 0.4) * 0.0025;
          entry.marker.setLatLng([entry.baseLat + offsetLat, entry.baseLng + offsetLng]);
        }
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // Center when button clicked
  useEffect(() => {
    if (mapInstanceRef.current && centerTarget) {
      mapInstanceRef.current.setView(centerTarget, zoomLevel);
    }
  }, [centerTarget, zoomLevel]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", minHeight: "480px", borderRadius: "10px", overflow: "hidden" }}>
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%", minHeight: "480px" }} />
    </div>
  );
}
