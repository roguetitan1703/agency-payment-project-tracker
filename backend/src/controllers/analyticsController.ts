import { Request, Response } from "express";
import Payment from "../models/Payment";
import Expense from "../models/Expense";
import Project from "../models/Project";
import response from "../utils/response";

const getDashboardStats = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const [payments, expenses, projects] = await Promise.all([
    Payment.find({ createdBy: userId }),
    Expense.find({ createdBy: userId }),
    Project.find({ createdBy: userId }),
  ]);
  response.ok(res, {
      totalPayments: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
      totalExpenses: expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
      projectCount: projects.length,
    },
  );
};

const getReports = async (req: Request, res: Response) => {
  // Placeholder: return empty report
  response.ok(res, { reports: [] } );
};

const getTrends = async (req: Request, res: Response) => {
  // Placeholder: return empty trends
  response.ok(res, { trends: [] } );
};

export default {
  getDashboardStats,
  getReports,
  getTrends,
};
