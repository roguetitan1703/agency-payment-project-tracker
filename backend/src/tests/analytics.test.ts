import request from "supertest";
import app from "../app";

describe("Analytics integration", () => {
  let token: string;
  beforeEach(async () => {
    const user = {
      name: "Analytics User",
      email: `analyticsuser_${Date.now()}@example.com`,
      password: "password123",
    };
    await request(app).post("/api/auth/register").send(user);
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password });
    token = login.body.data.token;
  });
  it("should return dashboard stats", async () => {
    const res = await request(app)
      .get("/api/analytics/dashboard/stats")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("totalPayments");
    expect(res.body.data).toHaveProperty("totalExpenses");
    expect(res.body.data).toHaveProperty("projectCount");
  });
  it("should return analytics reports", async () => {
    const res = await request(app)
      .get("/api/analytics/reports")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("reports");
  });
  it("should return analytics trends", async () => {
    const res = await request(app)
      .get("/api/analytics/trends")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("trends");
  });
});
