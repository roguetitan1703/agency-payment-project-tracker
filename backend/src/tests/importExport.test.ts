import request from "supertest";
import app from "../app";
import path from "path";

describe("Import/Export integration", () => {
  let token: string;
  beforeEach(async () => {
    const user = {
      name: "ImportExport User",
      email: `impexpuser_${Date.now()}@example.com`,
      password: "password123",
    };
    await request(app).post("/api/auth/register").send(user);
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password });
    token = login.body.data.token;
  });
  it("should import a CSV file", async () => {
    const filePath = path.join(__dirname, "fixtures", "sample.csv");
    const res = await request(app)
      .post("/api/import/csv")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", filePath);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("rows");
  });
  it("should export a CSV file", async () => {
    const res = await request(app)
      .get("/api/export/csv")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.header["content-type"]).toMatch(/text\/csv/);
    expect(res.header["content-disposition"]).toMatch(/attachment/);
    expect(res.text).toContain("id,name");
  });
  it("should import projects CSV", async () => {
    const filePath = path.join(__dirname, "fixtures", "sample.csv");
    const res = await request(app)
      .post("/api/import/projects")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", filePath);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("rows");
  });
  it("should import payments CSV", async () => {
    const filePath = path.join(__dirname, "fixtures", "sample.csv");
    const res = await request(app)
      .post("/api/import/payments")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", filePath);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("rows");
  });
});
