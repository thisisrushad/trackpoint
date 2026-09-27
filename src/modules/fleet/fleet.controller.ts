import { NextResponse } from "next/server";
import { fleetService } from "./fleet.service";

export class FleetController {
  async getFleet(req: Request) {
    try {
      const vehicles = await fleetService.getFleetVehicles();
      return NextResponse.json({
        success: true,
        totalFleetCount: 35,
        activeReportingCount: vehicles.length,
        vehicles
      });
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
  }
}

export const fleetController = new FleetController();
