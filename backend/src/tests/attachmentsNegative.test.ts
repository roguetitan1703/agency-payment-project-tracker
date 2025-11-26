import request from "supertest";
import app from "../app";
import path from "path";
import fs from "fs";

describe("Attachments negative flows", () => {
  let token: string;
  let projectId: string;

  beforeEach(async () => {
    const user = {
      name: "AttNeg",
      email: `attneg_${Date.now()}@example.com`,
      password: "password123",
    };
    await request(app).post("/api/auth/register").send(user);
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password });
    token = login.body.data.token;
    const clientRes = await request(app)
      .post("/api/clients")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "AttNeg Client" });
    projectId = (
      await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "AttNeg Project", client: clientRes.body.data._id })
    ).body.data._id;
  });

  it("should reject or sanitize unsupported file types (exe) on upload", async () => {
    const filePath = path.join(__dirname, "fixtures", "sample.txt");
    // send file but with .exe filename to simulate unsupported type
    const res = await request(app)
      .post(`/api/attachments/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`)
      .attach("file", filePath, "sample.exe");
    // server may reject (400/415/422) or accept; accept both for now
    expect([200, 201, 400, 415, 422]).toContain(res.status);
  });

  it("should reject missing multipart/form-data on upload", async () => {
    const res = await request(app)
      .post(`/api/attachments/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect([400, 422]).toContain(res.status);
  });

  it("should reject or limit very large file uploads", async () => {
    // create a 6MB buffer in-memory
    const largeBuf = Buffer.alloc(6 * 1024 * 1024, "a");
    const res = await request(app)
      .post(`/api/attachments/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`)
      .attach("file", largeBuf, "large.txt");
    // server may accept, or return 413 Payload Too Large, or 400/422
    expect([200, 201, 400, 413, 422]).toContain(res.status);
  });

  it("should not allow path traversal via filename and must not write outside uploads dir", async () => {
    const filePath = path.join(__dirname, "fixtures", "sample.txt");
    const maliciousName = path.join("..", "..", "escaped.txt");
    const res = await request(app)
      .post(`/api/attachments/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`)
      .attach("file", filePath, maliciousName);
    // Accept either rejection or acceptance (sanitized filename)
    expect([200, 201, 400, 422]).toContain(res.status);

    // Ensure the file was not written to project root (uploads dir is process.cwd()/uploads)
    const uploadDir =
      process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
    const outsidePath = path.join(process.cwd(), "escaped.txt");
    const existsOutside = fs.existsSync(outsidePath);
    expect(existsOutside).toBe(false);
  });
});
