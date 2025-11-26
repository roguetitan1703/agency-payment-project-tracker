import response from "../utils/response";
import policy from "../config/responsePolicy";
// Get project timeline (chronological events)
export const getProjectTimeline = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const { id } = req.params;
    const createdBy = req.userId as any;
    const project = await Project.findOne({ _id: id, createdBy });
    if (!project) {
      return response.notFound(res, "Project not found");
    }

    // Gather events
    const [payments, expenses, milestones] = await Promise.all([
      Payment.find({ project: id, createdBy }),
      Expense.find({ project: id, createdBy }),
      Milestone.find({ projectId: id }),
    ]);

    // Map all events to a common format
    const events = [];
    for (const m of milestones) {
      const mDoc = m as IMilestone & { createdAt: Date; updatedAt: Date };
      events.push({
        type: "milestone",
        id: mDoc._id,
        name: mDoc.name,
        status: mDoc.status,
        amount: mDoc.amount,
        dueDate: mDoc.dueDate,
        completed: mDoc.completed,
        completedDate: mDoc.completedDate,
        createdAt: mDoc.createdAt,
        updatedAt: mDoc.updatedAt,
      });
    }
    for (const p of payments) {
      const pDoc = p as IPayment & { createdAt: Date; updatedAt: Date };
      events.push({
        type: "payment",
        id: pDoc._id,
        amount: pDoc.amount,
        currency: pDoc.currency,
        date: pDoc.date,
        method: pDoc.method,
        notes: pDoc.notes,
        createdAt: pDoc.createdAt,
        updatedAt: pDoc.updatedAt,
      });
    }
    for (const e of expenses) {
      const eDoc = e as IExpense & { createdAt: Date; updatedAt: Date };
      events.push({
        type: "expense",
        id: eDoc._id,
        amount: eDoc.amount,
        currency: eDoc.currency,
        date: eDoc.date,
        category: eDoc.category,
        description: eDoc.description,
        createdAt: eDoc.createdAt,
        updatedAt: eDoc.updatedAt,
      });
    }

    // Add project status changes as events
    const projDoc = project as IProject & { createdAt: Date; updatedAt: Date };
    events.push({
      type: "project_created",
      id: projDoc._id,
      status: projDoc.status,
      createdAt: projDoc.createdAt,
    });
    if (projDoc.updatedAt && projDoc.updatedAt > projDoc.createdAt) {
      events.push({
        type: "project_updated",
        id: projDoc._id,
        status: projDoc.status,
        updatedAt: projDoc.updatedAt,
      });
    }

    // Sort all events chronologically (by createdAt or date)
    events.sort((a, b) => {
      const aTime = a.createdAt || a.date || 0;
      const bTime = b.createdAt || b.date || 0;
      return new Date(aTime).getTime() - new Date(bTime).getTime();
    });

    response.ok(res, events);
  } catch (err) {
    return response.serverError(res, "Failed to fetch project timeline", err);
  }
};
import { Milestone, IMilestone } from "../models/Milestone";
import { IPayment } from "../models/Payment";
import { IExpense } from "../models/Expense";
import { IProject } from "../models/Project";
// Get project stats (summary)
export const getProjectStats = async (req: RequestWithUser, res: Response) => {
  try {
    const { id } = req.params;
    const createdBy = req.userId as any;
    const project = await Project.findOne({ _id: id, createdBy });
    if (!project) {
      return response.notFound(res, "Project not found");
    }

    // Aggregate stats
    const [payments, expenses, milestones] = await Promise.all([
      Payment.find({ project: id, createdBy }),
      Expense.find({ project: id, createdBy }),
      Milestone.find({ projectId: id }),
    ]);

    const totalPayments = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const milestoneCount = milestones.length;
    const completedMilestones = milestones.filter((m) => m.completed).length;
    const milestoneCompletion =
      milestoneCount > 0 ? completedMilestones / milestoneCount : 0;

    response.ok(res, {
      projectId: id,
      totalPayments,
      totalExpenses,
      milestoneCount,
      completedMilestones,
      milestoneCompletion,
      budget: project.budget,
      currency: project.currency,
      status: project.status,
    });
  } catch (err) {
    return response.serverError(res, "Failed to fetch project stats", err);
  }
};
import { Response } from "express";
import { RequestWithUser } from "../middleware/authMiddleware";
import Project from "../models/Project";
import Client from "../models/Client";
import Payment from "../models/Payment";
import Expense from "../models/Expense";

export const createProject = async (req: RequestWithUser, res: Response) => {
  try {
    const createdBy = req.userId as any;
    const {
      client,
      title,
      budget,
      currency,
      startDate,
      endDate,
      status,
      milestones,
    } = req.body;

    // If client specified, ensure it exists and belongs to the user
    if (client) {
      const clientDoc = await Client.findOne({ _id: client, createdBy });
      if (!clientDoc)
        return response.notFound(res, "Client not found or access denied");
    }

    const project = new Project({
      title: title || req.body.name || req.body.title,
      description: req.body.description || req.body.desc,
      client: client || req.body.client,
      budget: budget || req.body.budget || 0,
      currency: currency || req.body.currency || "USD",
      status: status || "draft",
      startDate,
      endDate,
      milestones: milestones || req.body.milestones || [],
      createdBy,
    });
    await project.save();
    return response.created(res, project);
  } catch (err) {
    return response.serverError(res, "Failed to create project", err);
  }
};

export const getProjects = async (req: RequestWithUser, res: Response) => {
  try {
    const createdBy = req.userId as any;
    const { status, client, startDate, endDate } = req.query;

    const filter: any = { createdBy };
    if (status) filter.status = status;
    if (client) filter.client = client;
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate as string);
      if (endDate) filter.startDate.$lte = new Date(endDate as string);
    }

    const projects = await Project.find(filter)
      .populate("client")
      .sort({ createdAt: -1 });
    return response.ok(res, projects);
  } catch (err) {
    return response.serverError(res, "Failed to fetch projects", err);
  }
};

export const getProjectById = async (req: RequestWithUser, res: Response) => {
  try {
    const { id } = req.params;
    const createdBy = req.userId as any;
    const project = await Project.findOne({ _id: id, createdBy }).populate(
      "client"
    );
    if (!project) return response.notFound(res, "Project not found");
    return response.ok(res, project);
  } catch (err) {
    return response.serverError(res, "Failed to fetch project", err);
  }
};

export const updateProject = async (req: RequestWithUser, res: Response) => {
  try {
    const { id } = req.params;
    const createdBy = req.userId as any;
    const project = await Project.findOneAndUpdate(
      { _id: id, createdBy },
      { $set: req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!project)
      return response.notFound(res, "Project not found or access denied");
    return response.ok(res, project);
  } catch (err) {
    // (Removed dev-only error logging before production)
    return response.serverError(res, "Failed to update project", err);
  }
};

export const deleteProject = async (req: RequestWithUser, res: Response) => {
  try {
    const { id } = req.params;
    const createdBy = req.userId as any;
    // Check for related payments or expenses
    const paymentsCount = await Payment.countDocuments({ project: id });
    const expensesCount = await Expense.countDocuments({ project: id });
    if (paymentsCount > 0 || expensesCount > 0) {
      return response.conflict(
        res,
        "PROJECT_DELETE_BLOCKED",
        "Cannot delete project with existing payments or expenses. Remove them first."
      );
    }

    const project = await Project.findOneAndDelete({ _id: id, createdBy });
    if (!project)
      return response.notFound(res, "Project not found or access denied");

    // Cascade: remove related milestones
    await Milestone.deleteMany({ projectId: id });

    return response.ok(res, { message: "Project deleted" });
  } catch (err) {
    return response.serverError(res, "Failed to delete project", err);
  }
};

export default {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectStats,
  getProjectTimeline,
};
