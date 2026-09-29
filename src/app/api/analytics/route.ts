import { analyticsController } from "@/modules/analytics/analytics.controller";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return analyticsController.getAnalytics(req);
}
