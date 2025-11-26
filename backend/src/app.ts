import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRouter from "./routes/auth";
import clientsRouter from "./routes/clients";
import projectsRouter from "./routes/projects";
import paymentsRouter from "./routes/payments";
import expensesRouter from "./routes/expenses";
import sourcesRouter from "./routes/sources";
import categoriesRouter from "./routes/categories";
import milestonesRouter from "./routes/milestones";
import projectMilestonesRouter from "./routes/projectMilestones";
import attachmentsRouter from "./routes/attachments";
import usersRouter from "./routes/users";
import settingsRouter from "./routes/settings";
import analyticsRouter from "./routes/analytics";
import importsRouter from "./routes/imports";
import exportsRouter from "./routes/exports";
import remindersRouter from "./routes/reminders";

import errorHandler from "./middleware/errorHandler";
import * as response from "./utils/response";

dotenv.config();

const app = express();

// Simple request logger to make incoming requests visible in the server console
app.use((req, _res, next) => {
  try {
    const now = new Date().toISOString();
    console.log(`[req] ${now} ${req.method} ${req.originalUrl} from ${req.ip}`);
  } catch (e) {
    console.log("[req] logger error", e);
  }
  return next();
});

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

// Health check endpoint (canonicalized to use response helper)
app.get("/health", (_req: Request, res: Response) => {
  const uptime = process.uptime();
  response.ok(res, {
    status: "ok",
    uptimeSeconds: Math.floor(uptime),
    env: process.env.NODE_ENV || "development",
  });
});

// API routes
app.use("/api/auth", authRouter);
app.use("/api/clients", clientsRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/expenses", expensesRouter);
app.use("/api/sources", sourcesRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/milestones", milestonesRouter);
app.use("/api/projects/:projectId/milestones", projectMilestonesRouter);
app.use("/api/attachments", attachmentsRouter);
app.use("/api/users", usersRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/import", importsRouter);
app.use("/api/export", exportsRouter);
app.use("/api/reminders", remindersRouter);

// Global error handler (standardize error responses)
app.use(errorHandler);

export default app;
