"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Job, jobsDB } from "@/lib/data";
import CustomerPortal from "@/components/CustomerPortal";

export default function CustomerDashboardOverviewPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>(jobsDB);
  const [activeJob, setActiveJob] = useState<Job>(jobsDB[0]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/jobs");
        const data = await res.json();
        if (data.success && data.jobs?.length > 0) {
          setJobs(data.jobs);
          setActiveJob(data.jobs[0]);
        }
      } catch (err) {
        console.error("Customer overview fetch:", err);
      }
    };
    fetchJobs();
    const interval = setInterval(fetchJobs, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleNewBooking = (newJob: Job) => {
    setJobs((prev) => [newJob, ...prev]);
    setActiveJob(newJob);
  };

  const handleSelectJobToTrack = (job: Job) => {
    router.push(`/customer/orders/${job.id}`);
  };

  return (
    <div className="space-y-6">
      <CustomerPortal
        activeJob={activeJob}
        allJobs={jobs}
        onNewBooking={handleNewBooking}
        onSelectJobToTrack={handleSelectJobToTrack}
      />
    </div>
  );
}
