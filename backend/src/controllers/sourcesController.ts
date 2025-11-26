import { Response } from "express";
import { RequestWithUser } from "../middleware/authMiddleware";
import Source from "../models/Source";
import response from "../utils/response";

export const createSource = async (req: RequestWithUser, res: Response) => {
  try {
    const createdBy = req.userId as any;
    const { name, description } = req.body;
    const src = new Source({ name, description, createdBy });
    await src.save();
    return response.created(res, src);
  } catch (err) {
    console.error("createSource error", err);
    return response.serverError(res, "Failed to create source", err);
  }
};

export const getSources = async (req: RequestWithUser, res: Response) => {
  try {
    const createdBy = req.userId as any;
    const list = await Source.find({ createdBy, isDeleted: false }).sort({
      createdAt: -1,
    });
    return response.ok(res, list);
  } catch (err) {
    console.error("getSources error", err);
    return response.serverError(res, "Failed to fetch sources", err);
  }
};

export const getSourceById = async (req: RequestWithUser, res: Response) => {
  try {
    const { id } = req.params;
    const createdBy = req.userId as any;
    const src = await Source.findOne({ _id: id, createdBy, isDeleted: false });
    if (!src) return response.notFound(res, "Source not found");
    return response.ok(res, src);
  } catch (err) {
    console.error("getSourceById error", err);
    return response.serverError(res, "Failed to fetch source", err);
  }
};

export const updateSource = async (req: RequestWithUser, res: Response) => {
  try {
    const { id } = req.params;
    const createdBy = req.userId as any;
    const src = await Source.findOneAndUpdate(
      { _id: id, createdBy },
      { $set: req.body },
      { new: true, runValidators: true, context: "query" }
    );
    if (!src) return response.notFound(res, "Source not found");
    return response.ok(res, src);
  } catch (err) {
    console.error("updateSource error", err);
    return response.serverError(res, "Failed to update source", err);
  }
};

export const deleteSource = async (req: RequestWithUser, res: Response) => {
  try {
    const { id } = req.params;
    const createdBy = req.userId as any;

    // If sources are referenced elsewhere, add logic here to block deletion if referenced
    // (No references found in Expense/Payment/Project models)

    const src = await Source.findOneAndUpdate(
      { _id: id, createdBy, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true, runValidators: true, context: "query" }
    );
    if (!src) return response.notFound(res, "Source not found");
    return response.ok(res, { message: "Deleted (soft)" });
  } catch (err) {
    console.error("deleteSource error", err);
    return response.serverError(res, "Failed to delete source", err);
  }
};

export default {
  createSource,
  getSources,
  getSourceById,
  updateSource,
  deleteSource,
};
