import { Request, Response } from "express";
import response from "../utils/response";
import { Milestone } from "../models/Milestone";
import Project from "../models/Project";

// List all milestones for a project (RESTful)
export const getMilestonesForProject = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { projectId } = req.params;
  if (!userId) {
    return response.unauthorized(res, undefined, "Missing userId in request");
  }
  try {
    const project = await Project.findOne({
      _id: projectId,
      createdBy: userId,
    });
    if (!project) {
      return response.error(
        res,
        404,
        "PROJECT_NOT_FOUND",
        "Project not found or access denied"
      );
    }
    const milestones = await Milestone.find({ projectId }).sort({ dueDate: 1 });
    return response.ok(res, milestones);
  } catch (error: any) {
    return response.serverError(res, error.message, error);
  }
};

// Create a milestone for a project (RESTful)
export const createMilestoneForProject = async (
  req: Request,
  res: Response
) => {
  const userId = (req as any).userId;
  const { projectId } = req.params;
  if (!userId) {
    return response.unauthorized(res, undefined, "Missing userId in request");
  }
  try {
    const { name, amount, dueDate, notes } = req.body;
    const project = await Project.findOne({
      _id: projectId,
      createdBy: userId,
    });
    if (!project) {
      return response.error(
        res,
        404,
        "PROJECT_NOT_FOUND",
        "Project not found or access denied"
      );
    }
    const milestone = await Milestone.create({
      projectId,
      name,
      amount,
      dueDate,
      notes,
      completed: false,
    });

    // Sum all milestone amounts for this project
    const milestones = await Milestone.find({ projectId });
    const sum = milestones.reduce((acc, m) => acc + (m.amount || 0), 0);
    let warning = undefined;
    if (typeof project.budget === "number" && sum !== project.budget) {
      warning = `Sum of milestone amounts (${sum}) does not match project budget (${project.budget})`;
    }

    // Build payload: return the created milestone and optionally a warning
    const createdPayload =
      typeof (milestone as any).toObject === "function"
        ? (milestone as any).toObject()
        : milestone;
    if (warning) {
      // canonical: include warning inside the data payload
      return response.created(res, { ...createdPayload, warning });
    }
    return response.created(res, createdPayload);
  } catch (error: any) {
    return response.serverError(res, error.message, error);
  }
};

// Create a new milestone
export const createMilestone = async (req: Request, res: Response) => {
  // Type guard for userId
  const userId = (req as any).userId;
  if (!userId) {
    return response.unauthorized(res, undefined, "Missing userId in request");
  }
  try {
    const { projectId, name, amount, dueDate, notes } = req.body;

    // Validate project ownership
    const project = await Project.findOne({
      _id: projectId,
      createdBy: userId,
    });
    if (!project) {
      return response.error(
        res,
        404,
        "PROJECT_NOT_FOUND",
        "Project not found or access denied"
      );
    }

    const milestone = await Milestone.create({
      projectId,
      name,
      amount,
      dueDate,
      notes,
      completed: false,
    });

    return response.created(
      res,
      typeof (milestone as any).toObject === "function"
        ? (milestone as any).toObject()
        : milestone
    );
  } catch (error: any) {
    return response.serverError(res, error.message, error);
  }
};

// Get all milestones for a project
export const getMilestones = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    return response.unauthorized(res, undefined, "Missing userId in request");
  }
  try {
    const { projectId } = req.query;
    if (!projectId) {
      return response.error(
        res,
        400,
        "MISSING_PROJECT_ID",
        "Project ID is required"
      );
    }
    // Validate project ownership
    const project = await Project.findOne({
      _id: projectId,
      createdBy: userId,
    });
    if (!project) {
      return response.error(
        res,
        404,
        "PROJECT_NOT_FOUND",
        "Project not found or access denied"
      );
    }
    const milestones = await Milestone.find({ projectId }).sort({ dueDate: 1 });
    return response.ok(res, milestones);
  } catch (error: any) {
    return response.serverError(res, error.message, error);
  }
};

// Get a single milestone by ID
export const getMilestoneById = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    return response.unauthorized(res, undefined, "Missing userId in request");
  }
  try {
    const { id } = req.params;
    const milestone = await Milestone.findById(id);
    if (!milestone) {
      return response.error(
        res,
        404,
        "MILESTONE_NOT_FOUND",
        "Milestone not found"
      );
    }
    // Validate project ownership
    const project = await Project.findOne({
      _id: milestone.projectId,
      createdBy: userId,
    });
    if (!project) {
      return response.error(
        res,
        404,
        "PROJECT_NOT_FOUND",
        "Project not found or access denied"
      );
    }
    return response.ok(res, milestone);
  } catch (error: any) {
    return response.serverError(res, error.message, error);
  }
};

// Update a milestone
export const updateMilestone = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    return response.unauthorized(res, undefined, "Missing userId in request");
  }
  try {
    const { id } = req.params;
    const updates = req.body;
    const milestone = await Milestone.findById(id);
    if (!milestone) {
      return response.error(
        res,
        404,
        "MILESTONE_NOT_FOUND",
        "Milestone not found"
      );
    }
    // Validate project ownership
    const project = await Project.findOne({
      _id: milestone.projectId,
      createdBy: userId,
    });
    if (!project) {
      return response.error(
        res,
        404,
        "PROJECT_NOT_FOUND",
        "Project not found or access denied"
      );
    }
    // Only allow valid status transitions
    if (updates.status) {
      const validStatuses = ["pending", "in-progress", "completed"];
      if (!validStatuses.includes(updates.status)) {
        return response.validationError(
          res,
          { param: "status", msg: "Invalid status value" },
          "Invalid status value"
        );
      }
      milestone.status = updates.status;
      // If completed, set completed=true and completedDate
      if (updates.status === "completed") {
        milestone.completed = true;
        milestone.completedDate = new Date();
      } else {
        milestone.completed = false;
        milestone.completedDate = undefined;
      }
    }
    // Allow updating other fields as well
    if (updates.name !== undefined) milestone.name = updates.name;
    if (updates.amount !== undefined) milestone.amount = updates.amount;
    if (updates.dueDate !== undefined) milestone.dueDate = updates.dueDate;
    if (updates.notes !== undefined) milestone.notes = updates.notes;
    await milestone.save();

    // Sum all milestone amounts for this project
    const milestones = await Milestone.find({ projectId: milestone.projectId });
    const projectForSum = await Project.findOne({ _id: milestone.projectId });
    const sum = milestones.reduce((acc, m) => acc + (m.amount || 0), 0);
    let warning = undefined;
    if (
      projectForSum &&
      typeof projectForSum.budget === "number" &&
      sum !== projectForSum.budget
    ) {
      warning = `Sum of milestone amounts (${sum}) does not match project budget (${projectForSum.budget})`;
    }

    const payload =
      typeof (milestone as any).toObject === "function"
        ? (milestone as any).toObject()
        : milestone;
    if (warning) {
      // canonical: include warning inside the data payload
      return response.ok(res, { ...payload, warning });
    }
    return response.ok(res, payload);
  } catch (error: any) {
    return response.serverError(res, error.message, error);
  }
};

// Delete a milestone
export const deleteMilestone = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    return response.unauthorized(res, undefined, "Missing userId in request");
  }
  try {
    const { id } = req.params;
    const milestone = await Milestone.findById(id);
    if (!milestone) {
      return response.error(
        res,
        404,
        "MILESTONE_NOT_FOUND",
        "Milestone not found"
      );
    }
    // Validate project ownership
    const project = await Project.findOne({
      _id: milestone.projectId,
      createdBy: userId,
    });
    if (!project) {
      return response.error(
        res,
        404,
        "PROJECT_NOT_FOUND",
        "Project not found or access denied"
      );
    }
    // Unlink payments referencing this milestone (if such a field exists in future)
    // If you add a milestoneId field to Payment, uncomment below:
    // await Payment.updateMany({ milestoneId: id }, { $set: { milestoneId: null } });

    await milestone.deleteOne();
    return response.ok(res, { message: "Milestone deleted successfully" });
  } catch (error: any) {
    return response.serverError(res, error.message, error);
  }
};
