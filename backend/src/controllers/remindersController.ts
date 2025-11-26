import { Request, Response } from "express";
import { Reminder } from "../models/Reminder";
import { param, validationResult } from "express-validator";
import response from "../utils/response";

// List reminders for authenticated user
export const getReminders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const reminders = await Reminder.find({ user: userId }).sort({
      createdAt: -1,
    });
    response.ok(res, reminders);
  } catch (err) {
    console.error(err);
    return response.serverError(res, "Failed to fetch reminders", err);
  }
};

export const getReminderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const reminder = await Reminder.findOne({ _id: id, user: userId });
    if (!reminder) return response.notFound(res, "Reminder not found");
    response.ok(res, reminder);
  } catch (err) {
    console.error(err);
    return response.serverError(res, "Failed to fetch reminder", err);
  }
};

export const createReminder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { type, title, message, data } = req.body;
    const reminder = new Reminder({ user: userId, type, title, message, data });
    await reminder.save();
    response.created(res, reminder);
  } catch (err) {
    console.error(err);
    return response.serverError(res, "Failed to create reminder", err);
  }
};

export const updateReminder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const updates = req.body;
    const reminder = await Reminder.findOneAndUpdate(
      { _id: id, user: userId },
      updates,
      { new: true, runValidators: true, context: "query" }
    );
    if (!reminder) return response.notFound(res, "Reminder not found");
    response.ok(res, reminder);
  } catch (err) {
    console.error(err);
    return response.serverError(res, "Failed to update reminder", err);
  }
};

export const deleteReminder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const r = await Reminder.findOneAndDelete({ _id: id, user: userId });
    if (!r) return response.notFound(res, "Reminder not found");
    return response.ok(res, { message: "Reminder deleted" });
  } catch (err) {
    console.error(err);
    return response.serverError(res, "Failed to delete reminder", err);
  }
};
