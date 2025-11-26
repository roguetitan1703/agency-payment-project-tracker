import { Response } from "express";
import policy from "../config/responsePolicy";

export const ok = (
  res: Response,
  data: unknown,
  status: number = policy.Status.OK
) => res.status(status).json({ success: true, data });

export const created = (res: Response, data: unknown) =>
  ok(res, data, policy.Status.CREATED as number);

export const error = (
  res: Response,
  status: number = policy.Status.BAD_REQUEST,
  code: string = "ERROR",
  message: string = "An error occurred",
  details?: unknown
) => {
  const payload: any = { success: false, error: { code, message } };
  if (details) payload.error.details = details;
  return res.status(status).json(payload);
};

// Convenience helpers following canonical policy
export const validationError = (
  res: Response,
  details?: unknown,
  message?: string
) =>
  error(
    res,
    policy.Status.VALIDATION,
    policy.Codes.VALIDATION_ERROR,
    message || policy.DefaultMessages[policy.Codes.VALIDATION_ERROR],
    details
  );

// Allow message-only calls like: notFound(res, "Project not found")
export const notFound = (res: Response, message?: string) =>
  error(
    res,
    policy.Status.NOT_FOUND,
    // canonical code for not found responses
    policy.Codes.NOT_FOUND,
    message || policy.DefaultMessages[policy.Codes.NOT_FOUND]
  );

export const unauthorized = (res: Response, code?: string, message?: string) =>
  error(
    res,
    policy.Status.UNAUTHORIZED,
    code || policy.Codes.UNAUTHORIZED,
    message || policy.DefaultMessages[policy.Codes.UNAUTHORIZED]
  );

export const forbidden = (res: Response, code?: string, message?: string) =>
  error(
    res,
    policy.Status.FORBIDDEN,
    code || policy.Codes.FORBIDDEN,
    message || policy.DefaultMessages[policy.Codes.FORBIDDEN]
  );

export const conflict = (
  res: Response,
  code: string,
  message?: string,
  details?: unknown
) => error(res, policy.Status.CONFLICT, code, message || undefined, details);

export const serverError = (
  res: Response,
  message?: string,
  details?: unknown
) =>
  error(
    res,
    policy.Status.SERVER_ERROR,
    policy.Codes.SERVER_ERROR,
    message || policy.DefaultMessages[policy.Codes.SERVER_ERROR],
    details
  );

export default {
  ok,
  created,
  error,
  validationError,
  notFound,
  unauthorized,
  forbidden,
  conflict,
  serverError,
};
