// Canonical response policy: status codes and standard error codes/messages
export const Status = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  VALIDATION: 422,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
} as const;

export const Codes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  SERVER_ERROR: "SERVER_ERROR",
  UPLOAD_ERROR: "UPLOAD_ERROR",
  INVALID_FILE_TYPE: "INVALID_FILE_TYPE",
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  NO_FILE: "NO_FILE",
  TOKEN_BLACKLISTED: "TOKEN_BLACKLISTED",
  INVALID_TOKEN: "INVALID_TOKEN",
  PROJECT_DELETE_BLOCKED: "PROJECT_DELETE_BLOCKED",
} as const;

export const DefaultMessages: Record<string, string> = {
  [Codes.VALIDATION_ERROR]: "Validation failed",
  [Codes.NOT_FOUND]: "Resource not found",
  [Codes.UNAUTHORIZED]: "Authentication required",
  [Codes.FORBIDDEN]: "Access denied",
  [Codes.SERVER_ERROR]: "An internal server error occurred",
  [Codes.UPLOAD_ERROR]: "File upload failed",
  [Codes.INVALID_FILE_TYPE]: "File type not allowed",
  [Codes.FILE_TOO_LARGE]: "File size exceeds limit",
  [Codes.NO_FILE]: "No file uploaded",
  [Codes.TOKEN_BLACKLISTED]: "Token has been revoked",
  [Codes.INVALID_TOKEN]: "Token verification failed",
  [Codes.PROJECT_DELETE_BLOCKED]:
    "Cannot delete project with related payments or expenses",
};

export default { Status, Codes, DefaultMessages };
