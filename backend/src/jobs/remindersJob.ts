import { Reminder } from "../models/Reminder";
import Project from "../models/Project";

// Simple reminders job - runs every hour (in real deployments use node-cron)
const HOURLY_MS = 1000 * 60 * 60;

export const initializeReminderJobs = () => {
  console.log("Initializing reminder jobs...");
  // Run immediately then every hour
  runReminderCheck().catch((e) => console.error("Reminder job error", e));
  setInterval(() => {
    runReminderCheck().catch((e) => console.error("Reminder job error", e));
  }, HOURLY_MS);
};

const runReminderCheck = async () => {
  console.log("Running reminder check...");
  const now = new Date();

  // Overdue projects: endDate exists, endDate < now, and status is active
  const overdueProjects = await Project.find({
    endDate: { $lt: now },
    status: "active",
  }).limit(100);

  for (const p of overdueProjects) {
    // create a reminder for project owner if not already created in last 7 days
    const exists = await Reminder.findOne({
      user: p.createdBy,
      type: "overdue_project",
      "data.projectId": p._id,
      createdAt: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });
    if (!exists) {
      await Reminder.create({
        user: p.createdBy,
        type: "overdue_project",
        title: `Project overdue: ${p.title}`,
        message: `Project '${
          p.title
        }' passed its end date (${p.endDate?.toISOString()}).`,
        data: { projectId: p._id },
      });
      console.log(`Created overdue reminder for project ${p._id}`);
    }
  }
};
