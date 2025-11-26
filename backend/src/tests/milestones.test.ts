import request from "supertest";
import app from "../app";
import mongoose from "mongoose";
import { setupTestUserAndProject } from "./setup";
import { Milestone } from "../models/Milestone";

describe("Milestone API (RESTful)", () => {
  it("should create a milestone for a project", async () => {
    const { token, projectId } = await setupTestUserAndProject();
    const res = await request(app)
      .post(`/api/projects/${projectId}/milestones`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Design Phase",
        amount: 1000,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("_id");
    expect(res.body.data.name).toBe("Design Phase");
    expect(res.body.data.status).toBe("pending");
  });

  it("should list milestones for a project", async () => {
    const { token, projectId } = await setupTestUserAndProject();
    // Create a milestone first
    await request(app)
      .post(`/api/projects/${projectId}/milestones`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Listable Milestone",
        amount: 500,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      });
    const res = await request(app)
      .get(`/api/projects/${projectId}/milestones`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0]).toHaveProperty("name");
    expect(res.body.data[0]).toHaveProperty("status");
  });

  it("should update milestone status", async () => {
    const { token, projectId } = await setupTestUserAndProject();
    // Create a milestone
    const createRes = await request(app)
      .post(`/api/projects/${projectId}/milestones`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Dev Phase",
        amount: 2000,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      });
    const milestoneId = createRes.body.data._id;
    // Update status
    const updateRes = await request(app)
      .patch(`/api/milestones/${milestoneId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "in-progress" });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.status).toBe("in-progress");
  });

  it("should not create milestone if project does not exist", async () => {
    const { token } = await setupTestUserAndProject();
    const fakeProjectId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .post(`/api/projects/${fakeProjectId}/milestones`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Ghost Phase",
        amount: 500,
        dueDate: new Date().toISOString(),
      });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("PROJECT_NOT_FOUND");
  });

  it("should auto-complete milestone when payment matches amount", async () => {
    const { token, projectId } = await setupTestUserAndProject();
    // Create a milestone
    const milestoneRes = await request(app)
      .post(`/api/projects/${projectId}/milestones`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Auto-complete Milestone",
        amount: 1234,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      });
    expect(milestoneRes.status).toBe(201);
    const milestoneId = milestoneRes.body.data._id;

    // Create a payment that matches the milestone amount
    const paymentRes = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        project: projectId,
        amount: 1234,
        currency: "USD",
        date: new Date().toISOString(),
      });
    expect(paymentRes.status).toBe(201);

    // Fetch the milestone and check if it is completed
    const getMilestone = await request(app)
      .get(`/api/milestones/${milestoneId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(getMilestone.status).toBe(200);
    expect(getMilestone.body.data.completed).toBe(true);
    expect(getMilestone.body.data.status).toBe("completed");
  });

  it("should warn if milestone sum does not match project budget", async () => {
    const { token, projectId } = await setupTestUserAndProject();
    // Set up a project with a known budget (setup helper does this)
    // Create a milestone with less than the budget
    const res1 = await request(app)
      .post(`/api/projects/${projectId}/milestones`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Partial Milestone",
        amount: 1000,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      });
    expect(res1.status).toBe(201);
    // canonical response places warning inside data
    expect(res1.body.data.warning).toMatch(/does not match project budget/);

    // Add another milestone to reach the budget
    const res2 = await request(app)
      .post(`/api/projects/${projectId}/milestones`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Rest Milestone",
        amount: 2000,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      });
    expect(res2.status).toBe(201);
    // Now the sum should match, so no warning
    expect(res2.body.data.warning).toBeUndefined();
  });
});
