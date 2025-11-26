import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
  type: "expense" | "income";
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  isDeleted?: boolean;
}

const CategorySchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["expense", "income"], default: "expense" },
    description: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Category = mongoose.model<ICategory>("Category", CategorySchema);
export default Category;
