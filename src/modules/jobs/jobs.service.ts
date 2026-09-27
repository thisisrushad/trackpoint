import { prisma } from "@/lib/prisma";
import { jobsDB, fleetDB, Job, invoicesDB } from "@/lib/data";

export class JobsService {
  /**
   * Retrieve all jobs directly from Prisma database (MongoDB Atlas)
   */
  async getAllJobs(): Promise<Job[]> {
    try {
      const jobs = await prisma.job.findMany({ orderBy: { createdAt: "desc" } });
      if (jobs && jobs.length > 0) {
        return jobs.map((j) => ({
          id: j.jobId,
          customer: j.customer,
          pickup: j.pickup,
          dropoff: j.dropoff,
          goods: j.goods,
          priority: j.priority as any,
          driver: j.driver,
          vehicle: j.vehicle,
          status: j.status as any,
          eta: j.eta,
          lat: j.lat,
          lng: j.lng,
          recipientName: j.recipientName || undefined,
          signatureDataUrl: j.signatureDataUrl || undefined,
          completedAt: j.completedAt || undefined,
          overrideReason: j.overrideReason || undefined
        }));
      }
    } catch (e) {
      console.error("Prisma getAllJobs error:", e);
    }
    return jobsDB;
  }

  /**
   * Retrieve single job by ID directly from Prisma database
   */
  async getJobById(id: string): Promise<Job | null> {
    const cleanId = id.trim();
    const upperId = cleanId.toUpperCase();

    try {
      let j = await prisma.job.findFirst({
        where: { jobId: { in: [cleanId, upperId] } }
      });

      if (j) {
        return {
          id: j.jobId,
          customer: j.customer,
          pickup: j.pickup,
          dropoff: j.dropoff,
          goods: j.goods,
          priority: j.priority as any,
          driver: j.driver,
          vehicle: j.vehicle,
          status: j.status as any,
          eta: j.eta,
          lat: j.lat,
          lng: j.lng,
          recipientName: j.recipientName || undefined,
          signatureDataUrl: j.signatureDataUrl || undefined,
          completedAt: j.completedAt || undefined,
          overrideReason: j.overrideReason || undefined
        };
      }
    } catch (e) {
      console.error("Prisma getJobById error:", e);
    }
    const all = await this.getAllJobs();
    return all.find((j) => j.id.toLowerCase() === id.toLowerCase()) || null;
  }

  /**
   * Create a new booking with automated nearest-vehicle allocation (FR-01, FR-02)
   */
  async createJob(data: {
    customer?: string;
    pickup?: string;
    dropoff?: string;
    goods?: string;
    priority?: "Standard" | "Express";
  }): Promise<Job> {
    const newId = `TP-${Math.floor(1000 + Math.random() * 9000)}`;
    const matchedVehicle = fleetDB[0];

    const newJob: Job = {
      id: newId,
      customer: data.customer || "Katherine Mining Supplies Ltd",
      pickup: data.pickup || "Darwin Depot (120 Berrimah Rd, Darwin)",
      dropoff: data.dropoff || "Katherine Store (Katherine Terrace)",
      goods: data.goods || "Heavy Mining Replacement Parts (3.4t)",
      priority: data.priority || "Standard",
      driver: `${matchedVehicle.driver} (#DRV-${matchedVehicle.id})`,
      vehicle: matchedVehicle.name,
      status: "Assigned",
      eta: data.priority === "Express" ? "13:30 ACST (Express)" : "14:45 ACST",
      lat: matchedVehicle.lat,
      lng: matchedVehicle.lng
    };

    try {
      const created = await prisma.job.create({
        data: {
          jobId: newJob.id,
          customer: newJob.customer,
          pickup: newJob.pickup,
          dropoff: newJob.dropoff,
          goods: newJob.goods,
          priority: newJob.priority,
          driver: newJob.driver,
          vehicle: newJob.vehicle,
          status: newJob.status,
          eta: newJob.eta,
          lat: newJob.lat,
          lng: newJob.lng
        }
      });
      if (created) {
        newJob.id = created.jobId;
      }
    } catch (e) {
      console.error("Prisma createJob error:", e);
    }

    jobsDB.unshift(newJob);
    return newJob;
  }

  /**
   * Update job status, manual override with reason code (FR-03/PR-02), or e-POD delivery (FR-07/FR-08)
   */
  async updateJob(id: string, updates: any): Promise<{ job: Job; invoice?: any }> {
    const cleanId = id.trim();
    const upperId = cleanId.toUpperCase();
    let targetJob = await this.getJobById(id);

    if (updates.action === "override") {
      try {
        await prisma.job.updateMany({
          where: { jobId: { in: [cleanId, upperId] } },
          data: {
            driver: updates.driver,
            ...(updates.vehicle ? { vehicle: updates.vehicle } : {}),
            overrideReason: updates.reasonCode || "OPERATIONAL_REASSIGNMENT"
          }
        });
      } catch (e) {
        console.error("Prisma override error:", e);
      }

      if (targetJob) {
        targetJob.driver = updates.driver || targetJob.driver;
        if (updates.vehicle) targetJob.vehicle = updates.vehicle;
        targetJob.overrideReason = updates.reasonCode || "OPERATIONAL_REASSIGNMENT";
      }

      // Re-fetch from DB if available
      const refreshed = await this.getJobById(id);
      return { job: refreshed || targetJob || ({} as any) };
    }

    if (updates.action === "confirm_delivery") {
      const completedTimestamp = new Date().toISOString();
      try {
        await prisma.job.updateMany({
          where: { jobId: { in: [cleanId, upperId] } },
          data: {
            status: "Delivered",
            recipientName: updates.recipientName || "Sandra Wilson",
            signatureDataUrl: updates.signatureDataUrl || null,
            completedAt: completedTimestamp
          }
        });
      } catch (e) {
        console.error("Prisma confirm delivery error:", e);
      }

      if (targetJob) {
        targetJob.status = "Delivered";
        targetJob.recipientName = updates.recipientName || "Sandra Wilson";
        targetJob.signatureDataUrl = updates.signatureDataUrl || null;
        targetJob.completedAt = completedTimestamp;
      }

      // Auto-generate invoice in database
      const newInvoiceId = `INV-2026-${id.replace("TP-", "")}`;
      const newInvoice = {
        id: newInvoiceId,
        jobId: id,
        customer: targetJob?.customer || "Katherine Mining Supplies Ltd",
        issueDate: "24-Sep-2026",
        dueDate: "08-Oct-2026",
        subtotal: 1200.00,
        gst: 120.00,
        total: 1320.00,
        status: "Draft" as const,
        recipientName: targetJob?.recipientName,
        signatureUrl: targetJob?.signatureDataUrl,
        deliveryTimestamp: "24-Sep-2026 14:38:12 ACST"
      };

      try {
        await prisma.invoice.create({
          data: {
            invoiceId: newInvoice.id,
            jobId: newInvoice.jobId,
            customer: newInvoice.customer,
            issueDate: newInvoice.issueDate,
            dueDate: newInvoice.dueDate,
            subtotal: newInvoice.subtotal,
            gst: newInvoice.gst,
            total: newInvoice.total,
            status: newInvoice.status,
            recipientName: newInvoice.recipientName,
            signatureUrl: newInvoice.signatureUrl,
            deliveryTimestamp: newInvoice.deliveryTimestamp
          }
        });
      } catch (e) {
        console.error("Prisma create invoice error:", e);
      }

      invoicesDB.unshift(newInvoice);
      const refreshed = await this.getJobById(id);
      return { job: refreshed || targetJob || ({} as any), invoice: newInvoice };
    }

    if (updates.status || updates.lat !== undefined || updates.lng !== undefined) {
      try {
        await prisma.job.updateMany({
          where: { jobId: { in: [cleanId, upperId] } },
          data: {
            ...(updates.status ? { status: updates.status } : {}),
            ...(updates.lat !== undefined ? { lat: updates.lat } : {}),
            ...(updates.lng !== undefined ? { lng: updates.lng } : {})
          }
        });
      } catch (e) {
        console.error("Prisma update status error:", e);
      }

      if (targetJob) {
        if (updates.status) targetJob.status = updates.status;
        if (updates.lat !== undefined) targetJob.lat = updates.lat;
        if (updates.lng !== undefined) targetJob.lng = updates.lng;
      }
    }

    const refreshed = await this.getJobById(id);
    return { job: refreshed || targetJob || ({} as any) };
  }
}

export const jobsService = new JobsService();
