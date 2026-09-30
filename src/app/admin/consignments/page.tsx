"use client";

import React, { useState, useEffect } from "react";
import { Job, Vehicle, jobsDB, fleetDB } from "@/lib/data";
import AdminConsignmentsTable from "@/components/AdminConsignmentsTable";

export default function AdminConsignmentsPage() {
  const [jobs, setJobs] = useState<Job[]>(jobsDB);
  const [fleet, setFleet] = useState<Vehicle[]>(fleetDB);

  useEffect(() => {
    const fetchLatestData = async () => {
      try {
        const [jobsRes, fleetRes] = await Promise.all([
          fetch("/api/jobs"),
          fetch("/api/fleet")
        ]);
        const jobsData = await jobsRes.json();
        const fleetData = await fleetRes.json();

        if (jobsData.success && jobsData.jobs?.length > 0) {
          setJobs(jobsData.jobs);
        }
        if (fleetData.success && fleetData.vehicles?.length > 0) {
          setFleet(fleetData.vehicles);
        }
      } catch (err) {
        console.error("Admin fetch error:", err);
      }
    };

    fetchLatestData();
    const interval = setInterval(fetchLatestData, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleJobUpdate = (updatedJob: Job) => {
    setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
  };

  return (
    <div className="space-y-6">
      <AdminConsignmentsTable
        jobs={jobs}
        fleet={fleet}
        onJobUpdated={handleJobUpdate}
      />
    </div>
  );
}
