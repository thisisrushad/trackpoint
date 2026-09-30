"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AdminClientsView from "@/components/AdminClientsView";
import { useToast } from "@/context/ToastContext";

export default function AdminClientsPage() {
  const router = useRouter();
  const toast = useToast();

  const handleSelectClient = (clientName: string) => {
    toast.info(`Filtering consignments for client: ${clientName}`, "Client Selected");
    router.push(`/admin/consignments?client=${encodeURIComponent(clientName)}`);
  };

  return (
    <div className="space-y-6">
      <AdminClientsView onSelectClientToFilter={handleSelectClient} />
    </div>
  );
}
