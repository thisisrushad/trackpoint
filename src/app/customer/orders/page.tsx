"use client";

import React, { useState, useEffect } from "react";
import { Job, jobsDB } from "@/lib/data";
import CustomerOrdersList from "@/components/CustomerOrdersList";

export default function CustomerOrdersPage() {
  const [jobs, setJobs] = useState<Job[]>(jobsDB);

  useEffect(() => {
    const fetchLatestData = async () => {
      try {
        const res = await fetch("/api/jobs");
        const data = await res.json();
        if (data.success && data.jobs?.length > 0) {
          setJobs(data.jobs);
        }
      } catch (err) {
        console.error("Customer poll:", err);
      }
    };

    fetchLatestData();
    const pollInterval = setInterval(fetchLatestData, 10000);
    return () => clearInterval(pollInterval);
  }, []);

  const handleNewBooking = (newJob: Job) => {
    setJobs((prev) => [newJob, ...prev]);
  };

  return (
    <div className="space-y-6">
      <CustomerOrdersList
        jobs={jobs}
        onNewBooking={handleNewBooking}
      />
    </div>
  );
}
