import { fleetController } from "@/modules/fleet/fleet.controller";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return fleetController.getFleet(req);
}
