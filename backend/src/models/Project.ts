import mongoose, { Document, Schema } from "mongoose";

export type ProjectStatus =
  | "draft"
  | "active"
  | "completed"
  | "on_hold"
  | "cancelled";

export interface IProject extends Document {
  title: string;
  description?: string;
  client?: mongoose.Types.ObjectId;
  budget?: number;
  currency?: string;
  status: ProjectStatus;
  startDate?: Date;
  endDate?: Date;
  createdBy: mongoose.Types.ObjectId;
}

const ProjectSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    client: { type: Schema.Types.ObjectId, ref: "Client" },
    budget: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
    status: {
      type: String,
      enum: ["draft", "active", "completed", "on_hold", "cancelled"],
      default: "draft",
    },
    startDate: { type: Date },
    endDate: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Project = mongoose.model<IProject>("Project", ProjectSchema);
export default Project;
