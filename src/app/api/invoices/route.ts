import { invoicesController } from "@/modules/invoices/invoices.controller";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return invoicesController.getAll(req);
}
