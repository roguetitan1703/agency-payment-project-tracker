import { Response } from "express";
import { RequestWithUser } from "../middleware/authMiddleware";
import Expense from "../models/Expense";
import Project from "../models/Project";
import Payment from "../models/Payment";
import response from "../utils/response";
import policy from "../config/responsePolicy";

export const createExpense = async (req: RequestWithUser, res: Response) => {
  try {
    const createdBy = req.userId as any;
    const { project: projectId, amount } = req.body as any;

    // Validate amount is a positive number
    if (amount == null || Number(amount) <= 0) {
      return response.validationError(
        res,
        { param: "amount", msg: "Amount must be greater than zero" },
        "Amount must be greater than zero"
      );
    }

    // Require project id
    if (!projectId) {
      return response.validationError(
        res,
        { param: "project", msg: "Project id is required" },
        "Project id is required"
      );
    }

    // If expense is for a project with budget, ensure total expenses (not payments) don't exceed budget
    if (projectId && amount != null) {
      const project = await Project.findOne({ _id: projectId, createdBy });
      if (!project) {
        return response.notFound(res, "Project not found");
      }
      // If a category was supplied, ensure it exists and belongs to the user
      if (req.body && req.body.category) {
        try {
          const Category = require("../models/Category").default;
          const cat = await Category.findOne({
            _id: req.body.category,
            createdBy,
          });
          if (!cat) {
            return response.notFound(res, "Category not found");
          }
        } catch (e) {
          // If Category model is not available or invalid id, treat as not found
          return response.notFound(res, "Category not found");
        }
      }
      if (project && project.budget && project.budget > 0) {
        const expenses = await Expense.find({ project: projectId });
        const totalExpenses = expenses.reduce(
          (sum, e) => sum + (e.amount || 0),
          0
        );
        if (totalExpenses + Number(amount) > project.budget) {
          return response.conflict(
            res,
            "EXPENSE_EXCEEDS_BUDGET",
            "Expense would exceed project budget"
          );
        }
      }
    }

    const expense = new Expense({ ...req.body, createdBy });
    await expense.save();
    return response.created(res, expense);
  } catch (err) {
    // (Removed dev-only error logging before production)
    return response.serverError(res, "Failed to create expense", err);
  }
};

export const getExpenses = async (req: RequestWithUser, res: Response) => {
  try {
    const createdBy = req.userId as any;
    const expenses = await Expense.find({ createdBy })
      .populate("project category")
      .sort({ date: -1 });
    return response.ok(res, expenses);
  } catch (err) {
    return response.serverError(res, "Failed to fetch expenses", err);
  }
};

export const getExpenseById = async (req: RequestWithUser, res: Response) => {
  try {
    const { id } = req.params;
    const createdBy = req.userId as any;
    const expense = await Expense.findOne({ _id: id, createdBy }).populate(
      "project category"
    );
    if (!expense) return response.notFound(res, "Expense not found");
    return response.ok(res, expense);
  } catch (err) {
    return response.serverError(res, "Failed to fetch expense", err);
  }
};

export const updateExpense = async (req: RequestWithUser, res: Response) => {
  try {
    const { id } = req.params;
    const createdBy = req.userId as any;
    // Perform budget check for updates: compute resulting expense amount and project
    const existing = await Expense.findOne({ _id: id, createdBy });
    if (!existing) return response.notFound(res, "Expense not found");

    const newAmount =
      req.body.amount != null ? Number(req.body.amount) : existing.amount;
    const projectIdAfter =
      req.body.project != null ? req.body.project : existing.project;
    // Validate new amount is positive
    if (newAmount == null || Number(newAmount) <= 0) {
      return response.validationError(
        res,
        { param: "amount", msg: "Amount must be greater than zero" },
        "Amount must be greater than zero"
      );
    }

    if (projectIdAfter && newAmount != null) {
      const project = await Project.findOne({ _id: projectIdAfter, createdBy });
      if (!project) {
        return response.notFound(res, "Project not found");
      }
      if (project && project.budget && project.budget > 0) {
        const expenses = await Expense.find({ project: projectIdAfter });
        const totalExcluding = expenses
          .filter((e) => e._id.toString() !== id)
          .reduce((sum, e) => sum + (e.amount || 0), 0);
        if (totalExcluding + Number(newAmount) > project.budget) {
          return response.conflict(
            res,
            "EXPENSE_EXCEEDS_BUDGET",
            "Updated expense would exceed project budget"
          );
        }
      }
    }

    const expense = await Expense.findOneAndUpdate(
      { _id: id, createdBy },
      req.body,
      { new: true, runValidators: true, context: "query" }
    );
    if (!expense) return response.notFound(res, "Expense not found");
    return response.ok(res, expense);
  } catch (err) {
    return response.serverError(res, "Failed to update expense", err);
  }
};

export const deleteExpense = async (req: RequestWithUser, res: Response) => {
  try {
    const { id } = req.params;
    const createdBy = req.userId as any;
    const expense = await Expense.findOneAndDelete({ _id: id, createdBy });
    if (!expense) return response.notFound(res, "Expense not found");
    return response.ok(res, { message: "Deleted" });
  } catch (err) {
    return response.serverError(res, "Failed to delete expense", err);
  }
};

export default {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};
