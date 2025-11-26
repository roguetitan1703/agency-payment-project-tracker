import { Request, Response } from "express";
import Attachment from "../models/Attachment";
import fs from "fs";
import path from "path";
import response from "../utils/response";

const uploadProjectAttachment = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = (req as any).userId;
    if (!req.file) {
      return response.error(res, 400, "NO_FILE", "No file uploaded");
    }
    const { filename, originalname, mimetype, size } = req.file;
    const attachment = await Attachment.create({
      filename,
      originalName: originalname,
      mimetype,
      size,
      projectId,
      uploadedBy: userId,
    });
    response.created(res, attachment);
  } catch (error: any) {
    console.error("Error uploading project attachment:", error);
    return response.serverError(
      res,
      error.message || "Failed to upload attachment",
      error
    );
  }
};

const uploadMilestoneAttachment = async (req: Request, res: Response) => {
  try {
    const { milestoneId } = req.params;
    const userId = (req as any).userId;
    if (!req.file) {
      return response.error(res, 400, "NO_FILE", "No file uploaded");
    }
    const { filename, originalname, mimetype, size } = req.file;
    const attachment = await Attachment.create({
      filename,
      originalName: originalname,
      mimetype,
      size,
      milestoneId,
      uploadedBy: userId,
    });
    response.created(res, attachment);
  } catch (error: any) {
    console.error("Error uploading milestone attachment:", error);
    return response.serverError(
      res,
      error.message || "Failed to upload attachment",
      error
    );
  }
};

const listProjectAttachments = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const attachments = await Attachment.find({ projectId });
  response.ok(res, attachments);
};

const listMilestoneAttachments = async (req: Request, res: Response) => {
  const { milestoneId } = req.params;
  const attachments = await Attachment.find({ milestoneId });
  response.ok(res, attachments);
};

const uploadPaymentAttachment = async (req: Request, res: Response) => {
  const { paymentId } = req.params;
  const userId = (req as any).userId;
  if (!req.file) {
    return response.error(res, 400, "NO_FILE", "No file uploaded");
  }
  const { filename, originalname, mimetype, size } = req.file;
  const attachment = await Attachment.create({
    filename,
    originalName: originalname,
    mimetype,
    size,
    paymentId,
    uploadedBy: userId,
  });
  response.created(res, attachment);
};

const listPaymentAttachments = async (req: Request, res: Response) => {
  const { paymentId } = req.params;
  const attachments = await Attachment.find({ paymentId });
  response.ok(res, attachments);
};

const uploadExpenseAttachment = async (req: Request, res: Response) => {
  const { expenseId } = req.params;
  const userId = (req as any).userId;
  if (!req.file) {
    return response.error(res, 400, "NO_FILE", "No file uploaded");
  }
  const { filename, originalname, mimetype, size } = req.file;
  const attachment = await Attachment.create({
    filename,
    originalName: originalname,
    mimetype,
    size,
    expenseId,
    uploadedBy: userId,
  });
  response.created(res, attachment);
};

const listExpenseAttachments = async (req: Request, res: Response) => {
  const { expenseId } = req.params;
  const attachments = await Attachment.find({ expenseId });
  response.ok(res, attachments);
};

const downloadAttachment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const attachment = await Attachment.findById(id);
  if (!attachment) {
    return response.notFound(res, "Attachment not found");
  }
  const filePath = path.join("uploads", attachment.filename);
  if (!fs.existsSync(filePath)) {
    return response.notFound(res, "File not found on server");
  }
  res.download(filePath, attachment.originalName);
};

const deleteAttachment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const attachment = await Attachment.findById(id);
  if (!attachment) {
    return response.notFound(res, "Attachment not found");
  }
  const filePath = path.join("uploads", attachment.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  await attachment.deleteOne();
  return response.ok(res, { message: "Attachment deleted" });
};

export default {
  uploadProjectAttachment,
  uploadMilestoneAttachment,
  uploadPaymentAttachment,
  listPaymentAttachments,
  uploadExpenseAttachment,
  listExpenseAttachments,
  listProjectAttachments,
  listMilestoneAttachments,
  downloadAttachment,
  deleteAttachment,
};
