import { Router } from "express";
import { body, param } from "express-validator";
import validations from "../middleware/validations";
import authMiddleware from "../middleware/authMiddleware";
import clientsController from "../controllers/clientsController";
import validateRequest from "../middleware/validateRequest";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  [validations.requiredString("name", "Name is required")],
  validateRequest,
  clientsController.createClient
);

router.get("/", clientsController.getClients);

router.get(
  "/:id",
  [validations.mongoIdParam("id", "Invalid client id")],
  validateRequest,
  clientsController.getClientById
);

router.put(
  "/:id",
  [
    validations.mongoIdParam("id", "Invalid client id"),
    body("name").optional().isString().trim(),
    body("email").optional().isEmail().withMessage("Invalid email"),
  ],
  validateRequest,
  clientsController.updateClient
);

router.patch(
  "/:id",
  [
    validations.mongoIdParam("id", "Invalid client id"),
    body("name").optional().isString().trim(),
    body("email").optional().isEmail().withMessage("Invalid email"),
  ],
  validateRequest,
  clientsController.updateClient
);

router.delete(
  "/:id",
  [validations.mongoIdParam("id", "Invalid client id")],
  validateRequest,
  clientsController.deleteClient
);

router.get(
  "/:id/projects",
  [validations.mongoIdParam("id", "Invalid client id")],
  validateRequest,
  clientsController.getClientProjects
);

router.get(
  "/:id/stats",
  [validations.mongoIdParam("id", "Invalid client id")],
  validateRequest,
  clientsController.getClientStats
);

export default router;
