import mongoose, { Document, Schema } from "mongoose";

export interface IAttachment extends Document {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  projectId?: mongoose.Types.ObjectId;
  milestoneId?: mongoose.Types.ObjectId;
  paymentId?: mongoose.Types.ObjectId;
  expenseId?: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    milestoneId: { type: Schema.Types.ObjectId, ref: "Milestone" },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
    expenseId: { type: Schema.Types.ObjectId, ref: "Expense" },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Attachment = mongoose.model<IAttachment>("Attachment", AttachmentSchema);
export default Attachment;
