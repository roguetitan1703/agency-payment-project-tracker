import mongoose, { Schema, Document } from "mongoose";

export type MilestoneStatus = "pending" | "in-progress" | "completed";
export interface IMilestone extends Document {
  projectId: mongoose.Types.ObjectId;
  name: string;
  amount: number;
  dueDate: Date;
  status: MilestoneStatus;
  completed: boolean;
  completedDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema = new Schema<IMilestone>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
    completed: { type: Boolean, default: false },
    completedDate: { type: Date },
    notes: { type: String, maxlength: 2000 },
  },
  { timestamps: true }
);

export const Milestone = mongoose.model<IMilestone>(
  "Milestone",
  MilestoneSchema
);
