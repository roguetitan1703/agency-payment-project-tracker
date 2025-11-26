import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import settingsController from "../controllers/settingsController";

const router = Router();

router.use(authMiddleware);

// Mounted at /api/settings
router.get("/", settingsController.getSettings);
router.put("/", settingsController.updateSettings);
router.patch("/", settingsController.updateSettings);

export default router;
