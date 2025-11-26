import { Request, Response } from "express";
import User from "../models/User";
import response from "../utils/response";

const getSettings = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    return response.unauthorized(res, undefined, "Missing userId in request");
  }
  const user = await User.findById(userId).select("settings");
  response.ok(res, user?.settings || {});
};

const updateSettings = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    return response.unauthorized(res, undefined, "Missing userId in request");
  }
  const { settings } = req.body;
  const user = await User.findByIdAndUpdate(
    userId,
    { settings },
    { new: true, runValidators: true, context: "query" }
  );
  response.ok(res, user?.settings || {});
};

export default {
  getSettings,
  updateSettings,
};
