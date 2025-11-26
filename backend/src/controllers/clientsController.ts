import { Request, Response } from "express";
import { RequestWithUser } from "../middleware/authMiddleware";
import Client from "../models/Client";
import Project from "../models/Project";
import Payment from "../models/Payment";
import Expense from "../models/Expense";
import response from "../utils/response";

export const createClient = async (req: RequestWithUser, res: Response) => {
  try {
    const { name, email, phone, address, notes } = req.body;
    const createdBy = req.userId as any;
    const client = new Client({
      name,
      email,
      phone,
      address,
      notes,
      createdBy,
    });
    await client.save();
    return response.created(res, client);
  } catch (err) {
    console.error("createClient error", err);
    return response.serverError(res, "Failed to create client", err);
  }
};

export const getClients = async (req: RequestWithUser, res: Response) => {
  try {
    const createdBy = req.userId as any;
    const clients = await Client.find({ createdBy }).sort({ createdAt: -1 });
    return response.ok(res, clients);
  } catch (err) {
    console.error("getClients error", err);
    return response.serverError(res, "Failed to fetch clients", err);
  }
};

export const getClientById = async (req: RequestWithUser, res: Response) => {
  try {
    const { id } = req.params;
    const client = await Client.findById(id);
    if (!client) return response.notFound(res, "Client not found");
    return response.ok(res, client);
  } catch (err) {
    console.error("getClientById error", err);
    return response.serverError(res, "Failed to fetch client", err);
  }
};

export const updateClient = async (req: RequestWithUser, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const client = await Client.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
      context: "query",
    });
    if (!client) return response.notFound(res, "Client not found");
    return response.ok(res, client);
  } catch (err) {
    console.error("updateClient error", err);
    return response.serverError(res, "Failed to update client", err);
  }
};

export const deleteClient = async (req: RequestWithUser, res: Response) => {
  try {
    const { id } = req.params;
    // Prevent deleting clients that have projects or payments
    const projectsCount = await Project.countDocuments({ client: id });
    const paymentsCount = await Payment.countDocuments({ client: id });
    if (projectsCount > 0 || paymentsCount > 0) {
      return response.error(
        res,
        400,
        "CLIENT_DELETE_BLOCKED",
        "Cannot delete client with associated projects or payments. Remove them first."
      );
    }

    const client = await Client.findByIdAndDelete(id);
    if (!client) return response.notFound(res, "Client not found");
    return response.ok(res, { message: "Deleted" });
  } catch (err) {
    console.error("deleteClient error", err);
    return response.serverError(res, "Failed to delete client", err);
  }
};

export const getClientProjects = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const projects = await Project.find({ client: id }).sort({ createdAt: -1 });
    return response.ok(res, projects);
  } catch (err) {
    console.error("getClientProjects error", err);
    return response.serverError(res, "Failed to fetch client projects", err);
  }
};

export const getClientStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const projects = await Project.find({ client: id });
    const projectIds = projects.map((p) => p._id);
    const payments = await Payment.find({ project: { $in: projectIds } });
    const expenses = await Expense.find({ project: { $in: projectIds } });

    const totalRevenue = payments.reduce((s, p) => s + (p.amount || 0), 0);
    const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    return response.ok(res, {
      totalRevenue,
      totalExpenses,
      projects: projects.length,
    });
  } catch (err) {
    console.error("getClientStats error", err);
    return response.serverError(res, "Failed to fetch client stats", err);
  }
};

export default {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
  getClientProjects,
  getClientStats,
};
