import { Router } from "express";
import { body, param, query } from "express-validator";
import validations from "../middleware/validations";
import authMiddleware from "../middleware/authMiddleware";
import * as milestonesController from "../controllers/milestonesController";
import validateRequest from "../middleware/validateRequest";

const router = Router();

router.use(authMiddleware);

// Top-level: create milestone and list milestones (optional projectId query)
router.post(
  "/",
  [
    validations.optionalMongoIdParam("projectId", "Invalid projectId"),
    body("name").isString().withMessage("Name is required"),
    validations.optionalNumber("amount", "Amount must be a number"),
    validations.isoDate("dueDate"),
  ],
  validateRequest,
  milestonesController.createMilestone
);

router.get(
  "/",
  [validations.optionalMongoIdQuery("projectId", "Invalid projectId")],
  validateRequest,
  milestonesController.getMilestones
);

router.get(
  "/:id",
  [validations.mongoIdParam("id", "Invalid milestone id")],
  validateRequest,
  milestonesController.getMilestoneById
);

router.patch(
  "/:id",
  [validations.mongoIdParam("id", "Invalid milestone id")],
  validateRequest,
  milestonesController.updateMilestone
);

router.put(
  "/:id",
  [validations.mongoIdParam("id", "Invalid milestone id")],
  validateRequest,
  milestonesController.updateMilestone
);

router.delete(
  "/:id",
  [validations.mongoIdParam("id", "Invalid milestone id")],
  validateRequest,
  milestonesController.deleteMilestone
);

export default router;
