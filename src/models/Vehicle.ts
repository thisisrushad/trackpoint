import mongoose, { Schema, model, models } from "mongoose";

export interface IVehicle {
  id: string;
  name: string;
  type: string;
  driver: string;
  lat: number;
  lng: number;
  status: "In Transit" | "Depot Staging" | "Loading" | "Delivering" | "Off Duty";
  speed: string;
  battery: string;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    driver: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    status: {
      type: String,
      enum: ["In Transit", "Depot Staging", "Loading", "Delivering", "Off Duty"],
      default: "In Transit"
    },
    speed: { type: String, default: "0 km/h" },
    battery: { type: String, default: "100%" }
  },
  { timestamps: true }
);

export const VehicleModel = models.Vehicle || model<IVehicle>("Vehicle", VehicleSchema);
