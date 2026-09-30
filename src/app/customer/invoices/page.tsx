"use client";

import React, { useState, useEffect } from "react";
import { Job, jobsDB } from "@/lib/data";
import InvoicingView from "@/components/InvoicingView";
import AdminInvoicesView from "@/components/AdminInvoicesView";

export default function CustomerInvoicesPage() {
  const [jobs, setJobs] = useState<Job[]>(jobsDB);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/jobs");
        const data = await res.json();
        if (data.success && data.jobs?.length > 0) {
          // Filter for customer jobs
          const customerJobs = data.jobs.filter((j: Job) =>
            j.customer.toLowerCase().includes("katherine mining") ||
            j.customer.toLowerCase().includes("sandra")
          );
          setJobs(customerJobs.length > 0 ? customerJobs : data.jobs);
        }
      } catch (err) {
        console.error("Customer invoices fetch:", err);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="space-y-6">
      <AdminInvoicesView jobs={jobs} />
    </div>
  );
}
