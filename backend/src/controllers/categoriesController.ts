import { Response } from "express";
import { RequestWithUser } from "../middleware/authMiddleware";
import Category from "../models/Category";
import response from "../utils/response";

export const createCategory = async (req: RequestWithUser, res: Response) => {
  try {
    const createdBy = req.userId as any;
    const { name, type, description } = req.body;
    const cat = new Category({
      name,
      type: type || "expense",
      description,
      createdBy,
    });
    await cat.save();
    return response.created(res, cat);
  } catch (err) {
    console.error(err);
    return response.serverError(res, "Failed to create category", err);
  }
};

export const getCategories = async (req: RequestWithUser, res: Response) => {
  try {
    const createdBy = req.userId as any;
    const list = await Category.find({ createdBy, isDeleted: false }).sort({
      createdAt: -1,
    });
    return response.ok(res, list);
  } catch (err) {
    console.error(err);
    return response.serverError(res, "Failed to fetch categories", err);
  }
};

export const getCategoryById = async (req: RequestWithUser, res: Response) => {
  try {
    const { id } = req.params;
    const createdBy = req.userId as any;
    const cat = await Category.findOne({
      _id: id,
      createdBy,
      isDeleted: false,
    });
    if (!cat) return response.notFound(res, "Category not found");
    return response.ok(res, cat);
  } catch (err) {
    console.error(err);
    return response.serverError(res, "Failed to fetch category", err);
  }
};

export const updateCategory = async (req: RequestWithUser, res: Response) => {
  try {
    const { id } = req.params;
    const createdBy = req.userId as any;
    const cat = await Category.findOneAndUpdate(
      { _id: id, createdBy },
      { $set: req.body },
      { new: true, runValidators: true, context: "query" }
    );
    if (!cat) return response.notFound(res, "Category not found");
    return response.ok(res, cat);
  } catch (err) {
    console.error(err);
    return response.serverError(res, "Failed to update category", err);
  }
};

import Expense from "../models/Expense";
export const deleteCategory = async (req: RequestWithUser, res: Response) => {
  try {
    const { id } = req.params;
    const createdBy = req.userId as any;

    // Block delete if referenced by any Expense
    const expenseCount = await Expense.countDocuments({ category: id });
    if (expenseCount > 0) {
      return response.error(
        res,
        400,
        "CATEGORY_DELETE_BLOCKED",
        "Cannot delete category: it is referenced by existing expenses."
      );
    }

    const cat = await Category.findOneAndUpdate(
      { _id: id, createdBy, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true, runValidators: true, context: "query" }
    );
    if (!cat) return response.notFound(res, "Category not found");
    return response.ok(res, { message: "Deleted (soft)" });
  } catch (err) {
    console.error(err);
    return response.serverError(res, "Failed to delete category", err);
  }
};

export default {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
