import { Router } from "express";

import { body, param, query } from "express-validator";
import validations from "../middleware/validations";
import authMiddleware from "../middleware/authMiddleware";
import projectsController from "../controllers/projectsController";
import validateRequest from "../middleware/validateRequest";

const router = Router();

router.use(authMiddleware);

// Project timeline endpoint
router.get(
  "/:id/timeline",
  [validations.mongoIdParam("id", "Invalid project id")],
  validateRequest,
  projectsController.getProjectTimeline
);

router.post(
  "/",
  [
    body("title").isString().trim().notEmpty().withMessage("Title is required"),
    validations.optionalMongoIdParam("client", "client must be a valid id"),
    validations.optionalNumber("budget", "budget must be a number"),
    body("currency").optional().isString(),
    body("startDate").optional().isISO8601().toDate(),
    body("endDate").optional().isISO8601().toDate(),
    body("status")
      .optional()
      .isIn(["draft", "active", "completed", "on_hold", "cancelled"]),
  ],
  validateRequest,
  projectsController.createProject
);

router.get("/", projectsController.getProjects);

router.get(
  "/:id",
  [validations.mongoIdParam("id", "Invalid project id")],
  validateRequest,
  projectsController.getProjectById
);

// Project stats endpoint
router.get(
  "/:id/stats",
  [validations.mongoIdParam("id", "Invalid project id")],
  validateRequest,
  projectsController.getProjectStats
);

router.put(
  "/:id",
  [validations.mongoIdParam("id", "Invalid project id")],
  validateRequest,
  projectsController.updateProject
);

router.patch(
  "/:id",
  [validations.mongoIdParam("id", "Invalid project id")],
  validateRequest,
  projectsController.updateProject
);

router.delete(
  "/:id",
  [validations.mongoIdParam("id", "Invalid project id")],
  validateRequest,
  projectsController.deleteProject
);

export default router;
