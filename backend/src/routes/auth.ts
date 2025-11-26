import { Router } from "express";
import { body } from "express-validator";
import {
  register,
  login,
  logout,
  refresh,
} from "../controllers/authController";
import validateRequest from "../middleware/validateRequest";

const router = Router();

router.post(
  "/register",
  [
    body("name").isString().trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ],
  validateRequest,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validateRequest,
  login
);

router.post("/logout", logout);
router.post("/refresh", refresh);

export default router;
