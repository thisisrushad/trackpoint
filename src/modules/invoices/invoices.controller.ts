import { NextResponse } from "next/server";
import { invoicesService } from "./invoices.service";

export class InvoicesController {
  async getInvoices(req: Request) {
    try {
      const invoices = await invoicesService.getAllInvoices();
      return NextResponse.json({
        success: true,
        count: invoices.length,
        invoices
      });
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
  }

  async getAll(req: Request) {
    return this.getInvoices(req);
  }
}

export const invoicesController = new InvoicesController();
