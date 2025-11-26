import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import usersController from "../controllers/usersController";

const router = Router();

router.use(authMiddleware);

router.get("/me", usersController.getMe);

export default router;
