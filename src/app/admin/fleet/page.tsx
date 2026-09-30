"use client";

import React, { useState, useEffect } from "react";
import { Vehicle, fleetDB } from "@/lib/data";
import AdminFleetView from "@/components/AdminFleetView";

export default function AdminFleetPage() {
  const [fleet, setFleet] = useState<Vehicle[]>(fleetDB);

  useEffect(() => {
    const fetchFleet = async () => {
      try {
        const res = await fetch("/api/fleet");
        const data = await res.json();
        if (data.success && data.vehicles?.length > 0) {
          setFleet(data.vehicles);
        }
      } catch (err) {
        console.error("Fleet fetch error:", err);
      }
    };

    fetchFleet();
    const interval = setInterval(fetchFleet, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <AdminFleetView fleet={fleet} />
    </div>
  );
}
