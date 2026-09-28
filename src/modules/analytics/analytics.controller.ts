import { NextResponse } from "next/server";
import { analyticsService } from "./analytics.service";

export class AnalyticsController {
  async getAnalytics(req: Request) {
    try {
      const data = await analyticsService.getMetrics();
      return NextResponse.json({
        success: true,
        ...data
      });
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
  }
}

export const analyticsController = new AnalyticsController();
