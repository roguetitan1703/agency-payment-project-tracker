import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import importExportController from "../controllers/importExportController";
import multer from "multer";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.use(authMiddleware);

// Mounted at /api/import
router.post("/csv", upload.single("file"), importExportController.importCSV);
router.post(
  "/projects",
  upload.single("file"),
  importExportController.importProjects
);
router.post(
  "/payments",
  upload.single("file"),
  importExportController.importPayments
);

export default router;
