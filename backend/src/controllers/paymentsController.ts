import { Response } from "express";
import { RequestWithUser } from "../middleware/authMiddleware";
import Payment from "../models/Payment";
import Project from "../models/Project";
import Expense from "../models/Expense";
import mongoose from "mongoose";
import response from "../utils/response";
import policy from "../config/responsePolicy";

export const createPayment = async (req: RequestWithUser, res: Response) => {
  const createdBy = req.userId as any;
  const { project: projectId, amount } = req.body as any;

  // Validate amount is a positive number
  if (amount == null || Number(amount) <= 0) {
    return response.validationError(
      res,
      { param: "amount", msg: "Amount must be greater than zero" },
      "Amount must be greater than zero"
    );
  }

  // Require project id
  if (!projectId) {
    return response.validationError(
      res,
      { param: "project", msg: "Project id is required" },
      "Project id is required"
    );
  }

  // Try to use a transaction where supported. If transactions are not
  // supported by the current MongoDB deployment, fall back to the existing
  // check-and-rollback approach.
  let session: mongoose.ClientSession | null = null;
  try {
    session = await mongoose.startSession();
    let usedTransaction = false;
    try {
      await session.withTransaction(async () => {
        usedTransaction = true;
        // Re-fetch project within transaction
        const project = await Project.findOne({
          _id: projectId,
          createdBy,
        }).session(session!);
        if (!project) {
          throw new Error("PROJECT_NOT_FOUND");
        }
        if (project && project.budget && project.budget > 0) {
          const payments = await Payment.find({ project: projectId }).session(
            session!
          );
          const expenses = await Expense.find({ project: projectId }).session(
            session!
          );
          const totalPayments = payments.reduce(
            (sum, p) => sum + (p.amount || 0),
            0
          );
          const totalExpenses = expenses.reduce(
            (sum, e) => sum + (e.amount || 0),
            0
          );
          if (totalPayments + totalExpenses + Number(amount) > project.budget) {
            throw new Error("PAYMENT_EXCEEDS_BUDGET");
          }
        }

        const payment = new Payment({ ...req.body, createdBy });
        await payment.save({ session: session! });

        // Auto-complete milestone if payment matches milestone amount and not completed
        if (payment.project && payment.amount) {
          const { Milestone } = require("../models/Milestone");
          const milestone = await Milestone.findOne({
            projectId: payment.project,
            amount: payment.amount,
            completed: false,
          }).session(session!);
          if (milestone) {
            milestone.status = "completed";
            milestone.completed = true;
            milestone.completedDate = new Date();
            await milestone.save({ session: session! });
          }
        }
        // Attach saved payment to the session-local variable via req (small hack)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (req as any)._txPayment = payment;
      });
    } catch (txErr) {
      if ((txErr as Error).message === "PAYMENT_EXCEEDS_BUDGET") {
        return response.conflict(
          res,
          "PAYMENT_EXCEEDS_BUDGET",
          "Payment would exceed project budget"
        );
      }
      if ((txErr as Error).message === "PROJECT_NOT_FOUND") {
        return response.notFound(res, "Project not found");
      }
      // If transactions aren't supported, withTransaction will throw. Fall
      // through to the non-transactional fallback below.
      if (!usedTransaction) throw txErr;
    }

    // If we used a transaction and have a saved payment attached, return it
    // (transaction committed)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((req as any)._txPayment) {
      const payment = (req as any)._txPayment;
      return response.created(res, payment);
    }
  } catch (err) {
    // Transaction infrastructure failed (likely unsupported). Fall back to
    // the original behavior below.
    // continue
  } finally {
    if (session) {
      session.endSession();
    }
  }

  // Fallback: non-transactional behavior (best-effort check then create then
  // post-save rollback if needed). This preserves existing behavior for
  // deployments without transactions.
  try {
    if (projectId && amount != null) {
      const project = await Project.findOne({ _id: projectId, createdBy });
      if (!project) {
        return response.notFound(res, "Project not found");
      }
      if (project && project.budget && project.budget > 0) {
        const payments = await Payment.find({ project: projectId });
        const expenses = await Expense.find({ project: projectId });
        const totalPayments = payments.reduce(
          (sum, p) => sum + (p.amount || 0),
          0
        );
        const totalExpenses = expenses.reduce(
          (sum, e) => sum + (e.amount || 0),
          0
        );
        const total = totalPayments + totalExpenses;
        if (total + Number(amount) > project.budget) {
          return response.conflict(
            res,
            "PAYMENT_EXCEEDS_BUDGET",
            "Payment would exceed project budget"
          );
        }
      }
    }

    const payment = new Payment({ ...req.body, createdBy });
    await payment.save();

    // Post-save: ensure payments total does not exceed project budget (handle race)
    if (projectId && amount != null) {
      const project = await Project.findOne({ _id: projectId, createdBy });
      if (project && project.budget && project.budget > 0) {
        const payments = await Payment.find({ project: projectId });
        const total = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        if (total > project.budget) {
          // Rollback: remove the payment we just created and report an error
          try {
            await Payment.findByIdAndDelete(payment._id);
          } catch (e) {
            // ignore
          }
          return response.conflict(
            res,
            "PAYMENT_EXCEEDS_BUDGET",
            "Payment would exceed project budget"
          );
        }
      }
    }

    // Auto-complete milestone if payment matches milestone amount and not completed
    if (payment.project && payment.amount) {
      const { Milestone } = require("../models/Milestone");
      const milestone = await Milestone.findOne({
        projectId: payment.project,
        amount: payment.amount,
        completed: false,
      });
      if (milestone) {
        milestone.status = "completed";
        milestone.completed = true;
        milestone.completedDate = new Date();
        await milestone.save();
      }
    }

    return response.created(res, payment);
  } catch (err) {
    return response.serverError(res, "Failed to create payment", err);
  }
};

export const getPayments = async (req: RequestWithUser, res: Response) => {
  try {
    const createdBy = req.userId as any;
    const payments = await Payment.find({ createdBy })
      .populate("client project")
      .sort({ date: -1 });
    return response.ok(res, payments);
  } catch (err) {
    // (Removed dev-only error logging before production)
    return response.serverError(res, "Failed to fetch payments", err);
  }
};

export const getPaymentById = async (req: RequestWithUser, res: Response) => {
  try {
    const { id } = req.params;
    const createdBy = req.userId as any;
    const payment = await Payment.findOne({ _id: id, createdBy }).populate(
      "client project"
    );
    if (!payment) return response.notFound(res, "Payment not found");
    return response.ok(res, payment);
  } catch (err) {
    // (Removed dev-only error logging before production)
    return response.serverError(res, "Failed to fetch payment", err);
  }
};

export const updatePayment = async (req: RequestWithUser, res: Response) => {
  const { id } = req.params;
  const createdBy = req.userId as any;
  const existing = await Payment.findOne({ _id: id, createdBy });
  if (!existing) return response.notFound(res, "Payment not found");

  // Determine resulting project and amount after update
  const newAmount =
    req.body.amount != null ? Number(req.body.amount) : existing.amount;
  const projectId =
    req.body.project != null ? req.body.project : existing.project;

  // Validate new amount is positive
  if (newAmount == null || Number(newAmount) <= 0) {
    return response.validationError(
      res,
      { param: "amount", msg: "Amount must be greater than zero" },
      "Amount must be greater than zero"
    );
  }

  // Try transaction-first approach similar to createPayment
  let session: mongoose.ClientSession | null = null;
  try {
    session = await mongoose.startSession();
    let usedTransaction = false;
    try {
      await session.withTransaction(async () => {
        usedTransaction = true;
        const project = await Project.findOne({
          _id: projectId,
          createdBy,
        }).session(session!);
        if (project && project.budget && project.budget > 0) {
          const payments = await Payment.find({ project: projectId }).session(
            session!
          );
          const expenses = await Expense.find({ project: projectId }).session(
            session!
          );
          const totalPaymentsExcluding = payments
            .filter((p) => p._id.toString() !== id)
            .reduce((sum, p) => sum + (p.amount || 0), 0);
          const totalExpenses = expenses.reduce(
            (sum, e) => sum + (e.amount || 0),
            0
          );
          if (
            totalPaymentsExcluding + totalExpenses + Number(newAmount) >
            project.budget
          ) {
            throw new Error("PAYMENT_EXCEEDS_BUDGET");
          }
        }

        const payment = await Payment.findOneAndUpdate(
          { _id: id, createdBy },
          req.body,
          { new: true, runValidators: true, context: "query", session }
        );
        if (!payment) throw new Error("NOT_FOUND");

        // Auto-complete milestone if payment matches milestone amount and not completed
        if (payment.project && payment.amount) {
          const { Milestone } = require("../models/Milestone");
          const milestone = await Milestone.findOne({
            projectId: payment.project,
            amount: payment.amount,
            completed: false,
          }).session(session!);
          if (milestone) {
            milestone.status = "completed";
            milestone.completed = true;
            milestone.completedDate = new Date();
            await milestone.save({ session: session! });
          }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (req as any)._txPayment = payment;
      });
    } catch (txErr) {
      if ((txErr as Error).message === "PAYMENT_EXCEEDS_BUDGET") {
        return response.conflict(
          res,
          "PAYMENT_EXCEEDS_BUDGET",
          "Updated payment would exceed project budget"
        );
      }
      if (!usedTransaction) throw txErr;
    }

    if ((req as any)._txPayment) {
      return response.ok(res, (req as any)._txPayment);
    }
  } catch (err) {
    // transaction infrastructure failed; fall back
  } finally {
    if (session) session.endSession();
  }

  // Fallback: non-transactional check and update
  try {
    if (projectId && newAmount != null) {
      const project = await Project.findOne({ _id: projectId, createdBy });
      if (project && project.budget && project.budget > 0) {
        const payments = await Payment.find({ project: projectId });
        const expenses = await Expense.find({ project: projectId });
        const totalPaymentsExcluding = payments
          .filter((p) => p._id.toString() !== id)
          .reduce((sum, p) => sum + (p.amount || 0), 0);
        const totalExpenses = expenses.reduce(
          (sum, e) => sum + (e.amount || 0),
          0
        );
        if (
          totalPaymentsExcluding + totalExpenses + Number(newAmount) >
          project.budget
        ) {
          return response.conflict(
            res,
            "PAYMENT_EXCEEDS_BUDGET",
            "Updated payment would exceed project budget"
          );
        }
      }
    }

    const payment = await Payment.findOneAndUpdate(
      { _id: id, createdBy },
      req.body,
      {
        new: true,
        runValidators: true,
        context: "query",
      }
    );

    if (!payment) return response.notFound(res, "Payment not found");

    // Post-update: ensure payments total does not exceed budget (handle race)
    if (payment.project && payment.amount) {
      const project = await Project.findOne({
        _id: payment.project,
        createdBy,
      });
      if (project && project.budget && project.budget > 0) {
        const payments = await Payment.find({ project: payment.project });
        const total = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        if (total > project.budget) {
          try {
            await Payment.findByIdAndUpdate(existing._id, {
              amount: existing.amount,
              project: existing.project,
            });
          } catch (e) {
            // ignore
          }
          return response.conflict(
            res,
            "PAYMENT_EXCEEDS_BUDGET",
            "Updated payment would exceed project budget"
          );
        }
      }
    }

    // Auto-complete milestone if payment matches milestone amount and not completed
    if (payment.project && payment.amount) {
      const { Milestone } = require("../models/Milestone");
      const milestone = await Milestone.findOne({
        projectId: payment.project,
        amount: payment.amount,
        completed: false,
      });
      if (milestone) {
        milestone.status = "completed";
        milestone.completed = true;
        milestone.completedDate = new Date();
        await milestone.save();
      }
    }

    return response.ok(res, payment);
  } catch (err) {
    return response.serverError(res, "Failed to update payment", err);
  }
};

export const deletePayment = async (req: RequestWithUser, res: Response) => {
  try {
    const { id } = req.params;
    const createdBy = req.userId as any;
    const payment = await Payment.findOneAndDelete({ _id: id, createdBy });
    if (!payment) return response.notFound(res, "Payment not found");
    return response.ok(res, { message: "Deleted" });
  } catch (err) {
    // (Removed dev-only error logging before production)
    return response.serverError(res, "Failed to delete payment", err);
  }
};

export default {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
};
