import mongoose, { Document, Schema } from "mongoose";

export interface IExpense extends Document {
  project?: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  category?: mongoose.Types.ObjectId;
  date: Date;
  description?: string;
  receiptUrl?: string;
  createdBy: mongoose.Types.ObjectId;
}

const ExpenseSchema: Schema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: "USD" },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    date: { type: Date, default: Date.now },
    description: { type: String },
    receiptUrl: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Expense = mongoose.model<IExpense>("Expense", ExpenseSchema);
export default Expense;
