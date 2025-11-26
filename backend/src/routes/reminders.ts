import { Router } from "express";
import { body, param } from "express-validator";
import validations from "../middleware/validations";
import authMiddleware from "../middleware/authMiddleware";
import validateRequest from "../middleware/validateRequest";
import * as remindersController from "../controllers/remindersController";

const router = Router();

router.use(authMiddleware);

router.get("/", remindersController.getReminders);

router.post(
  "/",
  [body("title").isString().trim().notEmpty().withMessage("Title is required")],
  validateRequest,
  remindersController.createReminder
);

router.get(
  "/:id",
  [validations.mongoIdParam("id", "Invalid reminder id")],
  validateRequest,
  remindersController.getReminderById
);

router.put(
  "/:id",
  [validations.mongoIdParam("id", "Invalid reminder id")],
  validateRequest,
  remindersController.updateReminder
);

router.patch(
  "/:id",
  [validations.mongoIdParam("id", "Invalid reminder id")],
  validateRequest,
  remindersController.updateReminder
);

router.delete(
  "/:id",
  [validations.mongoIdParam("id", "Invalid reminder id")],
  validateRequest,
  remindersController.deleteReminder
);

export default router;
