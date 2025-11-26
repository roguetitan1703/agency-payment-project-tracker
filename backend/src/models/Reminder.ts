import mongoose, { Document, Schema } from "mongoose";

export type ReminderType = "overdue_project" | "upcoming_payment" | "custom";

export interface IReminder extends Document {
  user: mongoose.Types.ObjectId;
  type: ReminderType;
  title: string;
  message?: string;
  data?: any;
  read: boolean;
}

const ReminderSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["overdue_project", "upcoming_payment", "custom"],
      default: "custom",
    },
    title: { type: String, required: true },
    message: { type: String },
    data: { type: Schema.Types.Mixed },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Reminder = mongoose.model<IReminder>("Reminder", ReminderSchema);
