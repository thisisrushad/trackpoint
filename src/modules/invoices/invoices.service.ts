import { prisma } from "@/lib/prisma";
import { invoicesDB, Invoice } from "@/lib/data";

export class InvoicesService {
  async getAllInvoices(): Promise<Invoice[]> {
    try {
      const invoices = await prisma.invoice.findMany({ orderBy: { createdAt: "desc" } });
      if (invoices && invoices.length > 0) {
        return invoices.map((inv) => ({
          id: inv.invoiceId,
          jobId: inv.jobId,
          customer: inv.customer,
          issueDate: inv.issueDate,
          dueDate: inv.dueDate,
          subtotal: inv.subtotal,
          gst: inv.gst,
          total: inv.total,
          status: inv.status as any,
          recipientName: inv.recipientName || undefined,
          signatureUrl: inv.signatureUrl || undefined,
          deliveryTimestamp: inv.deliveryTimestamp || undefined
        }));
      }
    } catch (e) {
      console.error("Prisma getAllInvoices error:", e);
    }
    return invoicesDB;
  }
}

export const invoicesService = new InvoicesService();
