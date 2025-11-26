import { Request, Response } from "express";
import csv from "csv-parser";
import fs from "fs";
import Project from "../models/Project";
import Payment from "../models/Payment";
import response from "../utils/response";

type Row = { [key: string]: string };

const importCSV = async (req: Request, res: Response) => {
  if (!req.file) {
    return response.error(res, 400, "NO_FILE", "No file uploaded");
  }
  // Parse CSV and return row count. Fail-fast on parser errors.
  let rowCount = 0;
  const stream = fs.createReadStream(req.file.path).pipe(csv());
  stream.on("data", () => rowCount++);
  stream.on("error", (err: Error) => {
    // cleanup
    try {
      if (req.file && (req.file as any).path)
        fs.unlinkSync((req.file as any).path);
    } catch (e) {}
    return response.error(res, 422, "CSV_PARSE_ERROR", "Failed to parse CSV");
  });
  stream.on("end", () => {
    try {
      if (req.file && (req.file as any).path)
        fs.unlinkSync((req.file as any).path);
    } catch (e) {}
    response.ok(res, { rows: rowCount });
  });
};

const importProjects = async (req: Request, res: Response) => {
  if (!req.file) {
    return response.error(res, 400, "NO_FILE", "No file uploaded");
  }
  const createdBy = (req as any).userId;
  const results: Row[] = [];
  const errors: { row: number; reason: string }[] = [];
  let rowIndex = 0;
  const stream = fs.createReadStream(req.file.path).pipe(csv());
  stream.on("data", (data: Row) => {
    rowIndex++;
    results.push(data);
  });
  stream.on("error", (err: Error) => {
    try {
      if (req.file && (req.file as any).path)
        fs.unlinkSync((req.file as any).path);
    } catch (e) {}
    return response.error(res, 422, "CSV_PARSE_ERROR", "Failed to parse CSV");
  });
  stream.on("end", async () => {
    const created: any[] = [];
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      try {
        const p = new Project({
          title: r.title || r.name || "Untitled",
          description: r.description || "",
          client: r.client || null,
          budget: r.budget ? Number(r.budget) : 0,
          currency: r.currency || "USD",
          startDate: r.startDate ? new Date(r.startDate) : undefined,
          endDate: r.endDate ? new Date(r.endDate) : undefined,
          status: (r.status as any) || "draft",
          createdBy,
        });
        await p.save();
        created.push(p);
      } catch (e: any) {
        errors.push({ row: i + 1, reason: e.message || "invalid" });
      }
    }
    try {
      if (req.file && (req.file as any).path)
        fs.unlinkSync((req.file as any).path);
    } catch (e) {}
    if (errors.length > 0) {
      return response.error(
        res,
        422,
        "IMPORT_ERRORS",
        "Some rows failed to import",
        errors
      );
    }
    response.ok(res, { created: created.length, rows: results.length });
  });
};

const importPayments = async (req: Request, res: Response) => {
  if (!req.file) {
    return response.error(res, 400, "NO_FILE", "No file uploaded");
  }
  const createdBy = (req as any).userId;
  const results: Row[] = [];
  const errors: { row: number; reason: string }[] = [];
  let rowIndex = 0;
  const stream = fs.createReadStream(req.file.path).pipe(csv());
  stream.on("data", (data: Row) => {
    rowIndex++;
    results.push(data);
  });
  stream.on("error", (err: Error) => {
    try {
      if (req.file && (req.file as any).path)
        fs.unlinkSync((req.file as any).path);
    } catch (e) {}
    return response.error(res, 422, "CSV_PARSE_ERROR", "Failed to parse CSV");
  });
  stream.on("end", async () => {
    const created: any[] = [];
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      try {
        const pay = new Payment({
          amount: r.amount ? Number(r.amount) : 0,
          currency: r.currency || "USD",
          project: r.project || null,
          client: r.client || null,
          date: r.date ? new Date(r.date) : undefined,
          method: r.method || undefined,
          notes: r.notes || undefined,
          createdBy,
        });
        await pay.save();
        created.push(pay);
      } catch (e: any) {
        errors.push({ row: i + 1, reason: e.message || "invalid" });
      }
    }
    try {
      if (req.file && (req.file as any).path)
        fs.unlinkSync((req.file as any).path);
    } catch (e) {}
    if (errors.length > 0) {
      return response.error(
        res,
        422,
        "IMPORT_ERRORS",
        "Some rows failed to import",
        errors
      );
    }
    response.ok(res, { created: created.length, rows: results.length });
  });
};

const exportCSV = async (_req: Request, res: Response) => {
  // Placeholder: return a simple CSV
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=export.csv");
  res.send("id,name\n1,Example\n");
};

const exportAll = async (req: Request, res: Response) => {
  try {
    const createdBy = (req as any).userId;
    const [projects, payments, expenses, clients, categories] =
      await Promise.all([
        Project.find({ createdBy }),
        Payment.find({ createdBy }),
        // lazy-load Expense and Client/Category to avoid circular import at top
        require("../models/Expense").default.find({ createdBy }),
        require("../models/Client").default.find({ createdBy }),
        require("../models/Category").default.find({ createdBy }),
      ]);
    response.ok(res, { projects, payments, expenses, clients, categories });
  } catch (err) {
    console.error(err);
    return response.serverError(res, "Failed to export data", err);
  }
};

export default {
  importCSV,
  importProjects,
  importPayments,
  exportCSV,
  exportAll,
};
