import request from "supertest";
import app from "../app";

describe("Validation failures", () => {
  it("rejects malformed project id in payment body", async () => {
    const user = {
      name: "V",
      email: `v${Date.now()}@x.com`,
      password: "password123",
    };
    await request(app).post("/api/auth/register").send(user);
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password });
    const token = login.body.data.token;

    const res = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({ project: "not-an-id", amount: 10, currency: "USD" });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("rejects missing project title", async () => {
    const user = {
      name: "V2",
      email: `v2${Date.now()}@x.com`,
      password: "password123",
    };
    await request(app).post("/api/auth/register").send(user);
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password });
    const token = login.body.data.token;

    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ client: "507f1f77bcf86cd799439011" });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("rejects invalid date for expense", async () => {
    const user = {
      name: "V3",
      email: `v3${Date.now()}@x.com`,
      password: "password123",
    };
    await request(app).post("/api/auth/register").send(user);
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password });
    const token = login.body.data.token;

    const res = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        project: "507f1f77bcf86cd799439011",
        amount: 10,
        currency: "USD",
        date: "not-a-date",
      });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
  });
});
