import multer from "multer";
import { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import response from "../utils/response";
import policy from "../config/responsePolicy";

// Configure upload dir and ensure it exists. Use absolute path to avoid path
// traversal issues when joining paths elsewhere in the app.
const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";
const UPLOAD_DIR_ABS = path.resolve(process.cwd(), UPLOAD_DIR);
if (!fs.existsSync(UPLOAD_DIR_ABS)) {
  fs.mkdirSync(UPLOAD_DIR_ABS, { recursive: true });
}

// Sanitize filename to avoid path traversal and dangerous characters.
const sanitizeFilename = (name: string) => {
  // Keep extension and replace any characters except alphanum, dot, dash, underscore
  const ext = path.extname(name);
  const base = path.basename(name, ext);
  const safeBase = base.replace(/[^a-zA-Z0-9-_\.]/g, "_").slice(0, 240);
  return `${safeBase}${ext}`;
};

// Simple disk storage setup (uploads/). Keep filename unique using timestamp and a
// sanitized original name.
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR_ABS),
  filename: (req, file, cb) => {
    const safeOriginal = sanitizeFilename(file.originalname || "file");
    const unique = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}-${safeOriginal}`;
    cb(null, unique);
  },
});

// Accept common types (images, PDFs, docs). Reject executables.
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/csv",
    "text/plain",
    // Keep application/octet-stream for legacy clients but still enforce
    // extension checks below.
    "application/octet-stream",
  ];
  // Deny dangerous extensions explicitly
  const deniedExts = [".exe", ".bat", ".sh", ".dll", ".com", ".ps1"];
  const ext = path.extname(file.originalname || "").toLowerCase();
  if (!allowed.includes(file.mimetype) || deniedExts.includes(ext)) {
    // Reject the file silently so multer does not throw an error that may abort
    // the request stream unexpectedly; the downstream `ensureFile` middleware
    // will respond with a 400.
    // Mark the request so callers can return a specific error if desired.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).fileValidationError = "INVALID_FILE_TYPE";
    return cb(null, false);
  }
  cb(null, true);
};

// Limit to 10MB by default (configurable via env)
const DEFAULT_MAX_BYTES = parseInt(
  process.env.UPLOAD_MAX_BYTES || "10485760",
  10
);
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: DEFAULT_MAX_BYTES },
});

// Helper factory to get single-file middleware for a field name
export const uploadSingle = (fieldName = "file") => {
  const middleware = upload.single(fieldName);
  return (req: Request, res: Response, next: NextFunction) => {
    middleware(req, res, (err: any) => {
      if (err) {
        console.error("Upload middleware error:", err);
        if (err.message === "INVALID_FILE_TYPE") {
          return response.error(
            res,
            policy.Status.VALIDATION,
            policy.Codes.INVALID_FILE_TYPE,
            policy.DefaultMessages[policy.Codes.INVALID_FILE_TYPE]
          );
        }
        if (err.code === "LIMIT_FILE_SIZE") {
          return response.error(
            res,
            policy.Status.VALIDATION,
            policy.Codes.FILE_TOO_LARGE,
            policy.DefaultMessages[policy.Codes.FILE_TOO_LARGE]
          );
        }
        return response.error(
          res,
          policy.Status.SERVER_ERROR,
          policy.Codes.UPLOAD_ERROR,
          err.message || policy.DefaultMessages[policy.Codes.UPLOAD_ERROR]
        );
      }
      next();
    });
  };
};

// Middleware to ensure file exists on the request (after multer runs)
export const ensureFile = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return response.error(
      res,
      policy.Status.VALIDATION,
      policy.Codes.NO_FILE,
      policy.DefaultMessages[policy.Codes.NO_FILE]
    );
  }
  return next();
};

export default upload;
