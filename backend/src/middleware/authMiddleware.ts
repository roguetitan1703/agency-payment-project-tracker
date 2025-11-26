import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import tokenBlacklist from "../services/tokenBlacklist";
import response from "../utils/response";
import policy from "../config/responsePolicy";

export interface RequestWithUser extends Request {
  userId?: string;
}

export const authMiddleware = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return response.unauthorized(
      res,
      undefined,
      "Missing or invalid authorization header"
    );
  }

  const token = authHeader.split(" ")[1];
  try {
    const secret = process.env.JWT_SECRET || "dev-secret";
    const payload = jwt.verify(token, secret as jwt.Secret) as {
      userId?: string;
      id?: string;
    } | null;
    if (await tokenBlacklist.has(token)) {
      return response.error(
        res,
        policy.Status.UNAUTHORIZED,
        policy.Codes.TOKEN_BLACKLISTED,
        policy.DefaultMessages[policy.Codes.TOKEN_BLACKLISTED]
      );
    }
    const userId = payload && (payload.userId || payload.id);
    if (!userId) {
      return response.unauthorized(
        res,
        policy.Codes.INVALID_TOKEN,
        "Invalid token payload"
      );
    }
    req.userId = userId as string;
    return next();
  } catch (err: any) {
    // Log error for debugging but avoid logging tokens in production
    // (Removed dev-only error logging before production)
    return response.error(
      res,
      policy.Status.UNAUTHORIZED,
      policy.Codes.INVALID_TOKEN,
      policy.DefaultMessages[policy.Codes.INVALID_TOKEN]
    );
  }
};

export default authMiddleware;
