import mongoose from "mongoose";
import { jobsDB, fleetDB, invoicesDB } from "./data";
import { JobModel } from "@/models/Job";
import { VehicleModel } from "@/models/Vehicle";
import { InvoiceModel } from "@/models/Invoice";

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Global cache for Mongoose connection in Next.js Serverless Environment
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    console.warn("⚠️ MONGODB_URI not found in environment. Using in-memory store.");
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then(async (mongooseInstance) => {
      console.log("✅ Successfully connected to MongoDB Atlas!");
      // Auto-seed initial data if collections are empty
      await autoSeedDatabase();
      return mongooseInstance;
    }).catch((err) => {
      console.warn("⚠️ MongoDB Atlas connection error (fallback to local mock store):", err.message);
      cached.promise = null;
      return null;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    return null;
  }

  return cached.conn;
}

/**
 * Auto-seeds MongoDB Atlas with initial NorthLine freight & NT fleet data if empty
 */
async function autoSeedDatabase() {
  try {
    const jobCount = await JobModel.countDocuments();
    if (jobCount === 0) {
      await JobModel.insertMany(jobsDB);
      console.log("🌱 Seeded initial jobs into MongoDB Atlas!");
    }

    const vehicleCount = await VehicleModel.countDocuments();
    if (vehicleCount === 0) {
      await VehicleModel.insertMany(fleetDB);
      console.log("🌱 Seeded initial 35-vehicle NT fleet into MongoDB Atlas!");
    }

    const invoiceCount = await InvoiceModel.countDocuments();
    if (invoiceCount === 0) {
      await InvoiceModel.insertMany(invoicesDB);
      console.log("🌱 Seeded initial tax invoices into MongoDB Atlas!");
    }
  } catch (err: any) {
    console.error("Auto-seed notice:", err.message);
  }
}
