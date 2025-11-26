import mongoose, { Document, Schema } from "mongoose";

export interface IPayment extends Document {
  project?: mongoose.Types.ObjectId;
  client?: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  method?: string;
  status?: string;
  date: Date;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
}

const PaymentSchema: Schema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    client: { type: Schema.Types.ObjectId, ref: "Client" },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: "USD" },
    method: { type: String },
    status: { type: String, default: "received" },
    date: { type: Date, default: Date.now },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);
export default Payment;
