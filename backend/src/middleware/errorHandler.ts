import { Request, Response, NextFunction } from "express";
import response from "../utils/response";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // If error already has status/code, use them; otherwise default to 500
  const status = err.status || 500;
  const code = err.code || "SERVER_ERROR";
  const message = err.message || "Internal server error";
  const details = err.details;
  return response.error(res, status, code, message, details);
};

export default errorHandler;
