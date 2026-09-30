"use client";

import React, { useState, useEffect } from "react";
import { Job, jobsDB } from "@/lib/data";
import AdminInvoicesView from "@/components/AdminInvoicesView";

export default function AdminInvoicesPage() {
  const [jobs, setJobs] = useState<Job[]>(jobsDB);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/jobs");
        const data = await res.json();
        if (data.success && data.jobs?.length > 0) {
          setJobs(data.jobs);
        }
      } catch (err) {
        console.error("Invoices fetch error:", err);
      }
    };

    fetchJobs();
    const interval = setInterval(fetchJobs, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <AdminInvoicesView jobs={jobs} />
    </div>
  );
}
