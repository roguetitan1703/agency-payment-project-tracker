import mongoose, { Document, Schema } from "mongoose";

export interface IClient extends Document {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
}

const ClientSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Client = mongoose.model<IClient>("Client", ClientSchema);
export default Client;
