import { Router } from "express";
import { body, param } from "express-validator";
import validations from "../middleware/validations";
import authMiddleware from "../middleware/authMiddleware";
import validateRequest from "../middleware/validateRequest";
import categoriesController from "../controllers/categoriesController";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  [body("name").isString().trim().notEmpty().withMessage("Name is required")],
  validateRequest,
  categoriesController.createCategory
);

router.get("/", categoriesController.getCategories);

router.get(
  "/:id",
  [validations.mongoIdParam("id", "Invalid category id")],
  validateRequest,
  categoriesController.getCategoryById
);

router.put(
  "/:id",
  [validations.mongoIdParam("id", "Invalid category id")],
  validateRequest,
  categoriesController.updateCategory
);

router.patch(
  "/:id",
  [validations.mongoIdParam("id", "Invalid category id")],
  validateRequest,
  categoriesController.updateCategory
);

router.delete(
  "/:id",
  [validations.mongoIdParam("id", "Invalid category id")],
  validateRequest,
  categoriesController.deleteCategory
);

export default router;
