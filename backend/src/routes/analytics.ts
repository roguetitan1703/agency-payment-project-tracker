import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import analyticsController from "../controllers/analyticsController";

const router = Router();

router.use(authMiddleware);

// Mounted at /api/analytics
router.get("/dashboard/stats", analyticsController.getDashboardStats);
router.get("/reports", analyticsController.getReports);
router.get("/trends", analyticsController.getTrends);

export default router;
