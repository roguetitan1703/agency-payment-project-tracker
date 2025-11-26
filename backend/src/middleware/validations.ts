import { param, body, query } from "express-validator";

export const mongoIdParam = (name = "id", message?: string) =>
  param(name)
    .isMongoId()
    .withMessage(message || `Invalid ${name}`);

export const optionalMongoIdParam = (name = "id", message?: string) =>
  param(name)
    .optional()
    .isMongoId()
    .withMessage(message || `Invalid ${name}`);

export const mongoIdQuery = (name = "id", message?: string) =>
  query(name)
    .isMongoId()
    .withMessage(message || `Invalid ${name}`);

export const optionalMongoIdQuery = (name = "id", message?: string) =>
  query(name)
    .optional()
    .isMongoId()
    .withMessage(message || `Invalid ${name}`);

export const requiredString = (name: string, message?: string) =>
  body(name)
    .isString()
    .trim()
    .notEmpty()
    .withMessage(message || `${name} is required`);

export const optionalString = (name: string) =>
  body(name).optional().isString();

export const optionalNumber = (name: string, message?: string) =>
  body(name)
    .optional()
    .isNumeric()
    .withMessage(message || `${name} must be a number`);

export const isoDate = (name: string) =>
  body(name).optional().isISO8601().withMessage(`Invalid ${name}`);

export const mongoIdBody = (name = "id", message?: string) =>
  body(name)
    .isMongoId()
    .withMessage(message || `Invalid ${name}`);

export const optionalMongoIdBody = (name = "id", message?: string) =>
  body(name)
    .optional()
    .isMongoId()
    .withMessage(message || `Invalid ${name}`);

export default {
  mongoIdParam,
  optionalMongoIdParam,
  mongoIdQuery,
  optionalMongoIdQuery,
  requiredString,
  optionalString,
  optionalNumber,
  isoDate,
  mongoIdBody,
  optionalMongoIdBody,
};
