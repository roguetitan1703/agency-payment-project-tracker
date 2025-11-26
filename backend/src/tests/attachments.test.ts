import request from "supertest";
import app from "../app";
import fs from "fs";
import path from "path";

describe("Attachments integration", () => {
  let token: string;
  let projectId: string;
  let milestoneId: string;
  beforeEach(async () => {
    // Register and login
    const user = {
      name: "Attachment User",
      email: `attachuser_${Date.now()}@example.com`,
      password: "password123",
    };
    await request(app).post("/api/auth/register").send(user);
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password });
    token = login.body.data.token;
    // Create client and project
    const clientRes = await request(app)
      .post("/api/clients")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Attachment Client" });
    projectId = (
      await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Attachment Project", client: clientRes.body.data._id })
    ).body.data._id;
    // Create milestone
    milestoneId = (
      await request(app)
        .post(`/api/projects/${projectId}/milestones`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Attachment Milestone",
          amount: 100,
          dueDate: new Date().toISOString(),
        })
    ).body.data._id;
  });

  it("should upload and list project attachment", async () => {
    const filePath = path.join(__dirname, "fixtures", "sample.txt");
    const res = await request(app)
      .post(`/api/attachments/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`)
      .attach("file", filePath);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    const list = await request(app)
      .get(`/api/attachments/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body.data)).toBe(true);
    expect(list.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it("should upload and list milestone attachment", async () => {
    const filePath = path.join(__dirname, "fixtures", "sample.txt");
    const res = await request(app)
      .post(`/api/attachments/milestones/${milestoneId}`)
      .set("Authorization", `Bearer ${token}`)
      .attach("file", filePath);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    const list = await request(app)
      .get(`/api/attachments/milestones/${milestoneId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body.data)).toBe(true);
    expect(list.body.data.length).toBeGreaterThanOrEqual(1);
  });
});
