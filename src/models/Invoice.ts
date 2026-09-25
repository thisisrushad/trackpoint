import mongoose, { Schema, model, models } from "mongoose";

export interface IInvoice {
  id: string;
  jobId: string;
  customer: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  gst: number;
  total: number;
  status: "Draft" | "Issued" | "Paid";
  signatureUrl?: string;
  recipientName?: string;
  deliveryTimestamp?: string;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    id: { type: String, required: true, unique: true },
    jobId: { type: String, required: true },
    customer: { type: String, required: true },
    issueDate: { type: String, required: true },
    dueDate: { type: String, required: true },
    subtotal: { type: Number, required: true },
    gst: { type: Number, required: true },
    total: { type: Number, required: true },
    status: { type: String, enum: ["Draft", "Issued", "Paid"], default: "Draft" },
    signatureUrl: { type: String },
    recipientName: { type: String },
    deliveryTimestamp: { type: String }
  },
  { timestamps: true }
);

export const InvoiceModel = models.Invoice || model<IInvoice>("Invoice", InvoiceSchema);
