import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import importExportController from "../controllers/importExportController";

const router = Router();

router.use(authMiddleware);

// Mounted at /api/export
router.get("/csv", importExportController.exportCSV);
router.get("/all", importExportController.exportAll);

export default router;
