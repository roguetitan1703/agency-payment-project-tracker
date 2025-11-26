import mongoose, { Document, Schema } from "mongoose";

export interface ISource extends Document {
  name: string;
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  isDeleted?: boolean;
}

const SourceSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Source = mongoose.model<ISource>("Source", SourceSchema);
export default Source;
