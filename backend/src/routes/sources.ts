import { Router } from "express";
import { body, param } from "express-validator";
import authMiddleware from "../middleware/authMiddleware";
import validateRequest from "../middleware/validateRequest";
import validations from "../middleware/validations";
import sourcesController from "../controllers/sourcesController";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  [body("name").isString().trim().notEmpty().withMessage("Name is required")],
  validateRequest,
  sourcesController.createSource
);

router.get("/", sourcesController.getSources);

router.get(
  "/:id",
  [validations.mongoIdParam("id", "Invalid source id")],
  validateRequest,
  sourcesController.getSourceById
);

router.put(
  "/:id",
  [validations.mongoIdParam("id", "Invalid source id")],
  validateRequest,
  sourcesController.updateSource
);

router.patch(
  "/:id",
  [validations.mongoIdParam("id", "Invalid source id")],
  validateRequest,
  sourcesController.updateSource
);

router.delete(
  "/:id",
  [validations.mongoIdParam("id", "Invalid source id")],
  validateRequest,
  sourcesController.deleteSource
);

export default router;
