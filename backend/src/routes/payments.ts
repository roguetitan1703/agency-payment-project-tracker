import { Router } from "express";
import { body, param, query } from "express-validator";
import validations from "../middleware/validations";
import authMiddleware from "../middleware/authMiddleware";
import paymentsController from "../controllers/paymentsController";
import validateRequest from "../middleware/validateRequest";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  [
    body("amount").isNumeric().withMessage("amount must be a number"),
    body("currency").isString().withMessage("currency is required"),
    validations.optionalMongoIdBody("project", "project must be a valid id"),
    validations.optionalMongoIdBody("client", "client must be a valid id"),
    body("date").optional().isISO8601().toDate(),
  ],
  validateRequest,
  paymentsController.createPayment
);

router.get("/", paymentsController.getPayments);

router.get(
  "/:id",
  [validations.mongoIdParam("id", "Invalid payment id")],
  validateRequest,
  paymentsController.getPaymentById
);

router.put(
  "/:id",
  [validations.mongoIdParam("id", "Invalid payment id")],
  validateRequest,
  paymentsController.updatePayment
);

router.patch(
  "/:id",
  [validations.mongoIdParam("id", "Invalid payment id")],
  validateRequest,
  paymentsController.updatePayment
);

router.delete(
  "/:id",
  [validations.mongoIdParam("id", "Invalid payment id")],
  validateRequest,
  paymentsController.deletePayment
);

export default router;
