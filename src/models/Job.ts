import mongoose, { Schema, model, models } from "mongoose";

export interface IJob {
  id: string;
  customer: string;
  pickup: string;
  dropoff: string;
  goods: string;
  priority: "Standard" | "Express";
  driver: string;
  vehicle: string;
  status: "Booked" | "Assigned" | "In Transit" | "Arrived" | "QC Passed" | "QC Failed" | "Delivered" | "Invoiced" | "Cancelled";
  eta: string;
  lat: number;
  lng: number;
  recipientName?: string;
  signatureDataUrl?: string;
  photoUrl?: string;
  completedAt?: string;
  overrideReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const JobSchema = new Schema<IJob>(
  {
    id: { type: String, required: true, unique: true },
    customer: { type: String, required: true },
    pickup: { type: String, required: true },
    dropoff: { type: String, required: true },
    goods: { type: String, required: true },
    priority: { type: String, enum: ["Standard", "Express"], default: "Standard" },
    driver: { type: String, required: true },
    vehicle: { type: String, required: true },
    status: {
      type: String,
      enum: ["Booked", "Assigned", "In Transit", "Arrived", "QC Passed", "QC Failed", "Delivered", "Invoiced", "Cancelled"],
      default: "Assigned"
    },
    eta: { type: String, default: "14:45 ACST" },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    recipientName: { type: String },
    signatureDataUrl: { type: String },
    photoUrl: { type: String },
    completedAt: { type: String },
    overrideReason: { type: String }
  },
  { timestamps: true }
);

export const JobModel = models.Job || model<IJob>("Job", JobSchema);
