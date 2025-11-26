import dotenv from "dotenv";
import app from "./app";
import connectDB from "./config/database";
import { initializeReminderJobs } from "./jobs/remindersJob";

dotenv.config();

const PORT = process.env.PORT || 3001;

const start = async () => {
  await connectDB();
  // initialize background jobs (reminders, recurring tasks etc.)
  try {
    initializeReminderJobs();
  } catch (e) {
    console.error("Failed to initialize jobs", e);
  }
  // mount swagger UI for API browsing (optional)
  // Swagger UI removed — no-op
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

start().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
