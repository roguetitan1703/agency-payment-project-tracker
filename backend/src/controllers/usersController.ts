import { Request, Response } from "express";
import User from "../models/User";
import response from "../utils/response";

const getMe = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    return response.unauthorized(res, undefined, "Missing userId in request");
  }
  const user = await User.findById(userId).select("-password");
  if (!user) {
    return response.error(res, 404, "USER_NOT_FOUND", "User not found");
  }
  response.ok(res, user);
};

export default {
  getMe,
};
