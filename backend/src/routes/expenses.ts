import { Router } from "express";
import { body, param } from "express-validator";
import authMiddleware from "../middleware/authMiddleware";
import expensesController from "../controllers/expensesController";
import validateRequest from "../middleware/validateRequest";
import validations from "../middleware/validations";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  [
    body("amount").isNumeric().withMessage("amount must be a number"),
    body("currency").isString().withMessage("currency is required"),
    validations.optionalMongoIdBody("category", "category must be a valid id"),
    validations.optionalMongoIdBody("project", "project must be a valid id"),
    body("date").optional().isISO8601().toDate(),
  ],
  validateRequest,
  expensesController.createExpense
);

router.get("/", expensesController.getExpenses);

router.get(
  "/:id",
  [validations.mongoIdParam("id", "Invalid expense id")],
  validateRequest,
  expensesController.getExpenseById
);

router.put(
  "/:id",
  [validations.mongoIdParam("id", "Invalid expense id")],
  validateRequest,
  expensesController.updateExpense
);

router.patch(
  "/:id",
  [validations.mongoIdParam("id", "Invalid expense id")],
  validateRequest,
  expensesController.updateExpense
);

router.delete(
  "/:id",
  [validations.mongoIdParam("id", "Invalid expense id")],
  validateRequest,
  expensesController.deleteExpense
);

export default router;
