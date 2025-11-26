import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import response from "../utils/response";

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((e) => ({ param: e.param, msg: e.msg }));
    return response.validationError(res, details);
  }
  return next();
};

export default validateRequest;
