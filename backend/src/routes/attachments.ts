import { Router } from "express";
import { param } from "express-validator";
import validations from "../middleware/validations";
import authMiddleware from "../middleware/authMiddleware";
import validateRequest from "../middleware/validateRequest";
import attachmentsController from "../controllers/attachmentsController";
import { uploadSingle, ensureFile } from "../middleware/uploadMiddleware";

const router = Router();

router.use(authMiddleware);

// ==================== PROJECT ATTACHMENTS ====================
router.post(
  "/projects/:projectId",
  [validations.mongoIdParam("projectId", "Invalid projectId")],
  validateRequest,
  uploadSingle("file"),
  ensureFile,
  attachmentsController.uploadProjectAttachment
);

router.get(
  "/projects/:projectId",
  [validations.mongoIdParam("projectId", "Invalid projectId")],
  validateRequest,
  attachmentsController.listProjectAttachments
);

// ==================== MILESTONE ATTACHMENTS ====================
router.post(
  "/milestones/:milestoneId",
  [validations.mongoIdParam("milestoneId", "Invalid milestoneId")],
  validateRequest,
  uploadSingle("file"),
  ensureFile,
  attachmentsController.uploadMilestoneAttachment
);

router.get(
  "/milestones/:milestoneId",
  [validations.mongoIdParam("milestoneId", "Invalid milestoneId")],
  validateRequest,
  attachmentsController.listMilestoneAttachments
);

// ==================== PAYMENT ATTACHMENTS ====================
router.post(
  "/payments/:paymentId",
  [validations.mongoIdParam("paymentId", "Invalid paymentId")],
  validateRequest,
  uploadSingle("file"),
  ensureFile,
  attachmentsController.uploadPaymentAttachment
);

router.get(
  "/payments/:paymentId",
  [validations.mongoIdParam("paymentId", "Invalid paymentId")],
  validateRequest,
  attachmentsController.listPaymentAttachments
);

// ==================== EXPENSE ATTACHMENTS ====================
router.post(
  "/expenses/:expenseId",
  [validations.mongoIdParam("expenseId", "Invalid expenseId")],
  validateRequest,
  uploadSingle("file"),
  ensureFile,
  attachmentsController.uploadExpenseAttachment
);

router.get(
  "/expenses/:expenseId",
  [validations.mongoIdParam("expenseId", "Invalid expenseId")],
  validateRequest,
  attachmentsController.listExpenseAttachments
);

// ==================== GENERIC ATTACHMENT OPERATIONS ====================
// Download attachment by ID
router.get(
  "/:id/download",
  [validations.mongoIdParam("id", "Invalid attachment id")],
  validateRequest,
  attachmentsController.downloadAttachment
);

// Delete attachment by ID
router.delete(
  "/:id",
  [validations.mongoIdParam("id", "Invalid attachment id")],
  validateRequest,
  attachmentsController.deleteAttachment
);

export default router;
