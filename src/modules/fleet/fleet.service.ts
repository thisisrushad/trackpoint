import { prisma } from "@/lib/prisma";
import { fleetDB, Vehicle } from "@/lib/data";

export class FleetService {
  async getFleetVehicles(): Promise<Vehicle[]> {
    try {
      const vehicles = await prisma.vehicle.findMany({ orderBy: { vehicleId: "asc" } });
      if (vehicles && vehicles.length > 0) {
        return vehicles.map((v) => ({
          id: v.vehicleId,
          name: v.name,
          type: v.type,
          driver: v.driver,
          depot: (v.depot || "Darwin Metro") as any,
          lat: v.lat,
          lng: v.lng,
          status: v.status as any,
          speed: v.speed,
          battery: v.battery,
          fuelLevel: v.fuelLevel || "85%"
        }));
      }
    } catch (e) {
      console.error("Prisma getFleetVehicles error:", e);
    }
    return fleetDB;
  }
}

export const fleetService = new FleetService();
