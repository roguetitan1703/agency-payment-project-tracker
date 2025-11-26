import { Router } from "express";
import { body, param } from "express-validator";
import validations from "../middleware/validations";
import authMiddleware from "../middleware/authMiddleware";
import * as milestonesController from "../controllers/milestonesController";
import validateRequest from "../middleware/validateRequest";

const router = Router({ mergeParams: true });

router.use(authMiddleware);

// List all milestones for a project
router.get(
  "/",
  [validations.mongoIdParam("projectId", "Invalid projectId")],
  validateRequest,
  milestonesController.getMilestonesForProject
);

// Create a milestone for a project
router.post(
  "/",
  [
    validations.mongoIdParam("projectId", "Invalid projectId"),
    body("name").isString().trim().notEmpty().withMessage("Name is required"),
    body("amount").isNumeric().withMessage("Amount must be a number"),
    body("dueDate").isISO8601().toDate().withMessage("Due date is required"),
  ],
  validateRequest,
  milestonesController.createMilestoneForProject
);

export default router;
