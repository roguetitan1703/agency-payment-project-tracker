import request from "supertest";
import app from "../app";

describe("Payments & Expenses negative flows", () => {
  let token: string;
  let clientId: string;
  let projectId: string;

  beforeEach(async () => {
    const unique = Date.now() + Math.random().toString(36).slice(2);
    const user = {
      name: "Neg PE",
      email: `negpe_${unique}@example.com`,
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
      .send({ name: "Neg PE Client" });
    clientId = clientRes.body.data._id;
    const projectRes = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Neg PE Project", client: clientId, budget: 100 });
    projectId = projectRes.body.data._id;
  });

  it("should reject creating a payment with missing project", async () => {
    const res = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 10, currency: "USD", date: "2025-10-25" });
    // Missing project -> validation error
    expect(res.status).toBe(422);
  });

  it("should reject creating a payment for non-existent project", async () => {
    const res = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        project: "000000000000000000000000",
        amount: 10,
        currency: "USD",
        date: "2025-10-25",
      });
    // Non-existent project -> not found
    expect(res.status).toBe(404);
  });

  it("should reject creating a payment with zero or negative amount", async () => {
    const resZero = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        project: projectId,
        amount: 0,
        currency: "USD",
        date: "2025-10-25",
      });
    // Zero amount -> validation error
    expect(resZero.status).toBe(422);

    const resNeg = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        project: projectId,
        amount: -50,
        currency: "USD",
        date: "2025-10-25",
      });
    // Negative amount -> validation error
    expect(resNeg.status).toBe(422);
  });

  it("should prevent overpayment when creating payments (budget enforcement)", async () => {
    // project budget is 100 per beforeEach
    const r1 = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        project: projectId,
        amount: 80,
        currency: "USD",
        date: "2025-10-25",
      });
    // First payment should be created
    expect(r1.status).toBe(201);

    const r2 = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        project: projectId,
        amount: 30,
        currency: "USD",
        date: "2025-10-25",
      });
    // should be rejected due to budget overflow (conflict)
    expect(r2.status).toBe(409);
  });

  it("concurrent payments that together exceed budget should not both succeed", async () => {
    // attempt two payments concurrently: 60 + 60 against budget 100
    const p1 = request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        project: projectId,
        amount: 60,
        currency: "USD",
        date: "2025-10-25",
      });
    const p2 = request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        project: projectId,
        amount: 60,
        currency: "USD",
        date: "2025-10-25",
      });
    const results = await Promise.all([p1, p2]);
    const statuses = results.map((r) => r.status);
    // At least one should be a rejection (400/409/422)
    const successCount = statuses.filter((s) => s === 201).length;
    expect(successCount).toBeLessThanOrEqual(1);
  });

  // Expenses negatives
  it("should reject creating an expense with missing project", async () => {
    const res = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 10, currency: "USD", date: "2025-10-25" });
    // Missing project -> validation error
    expect(res.status).toBe(422);
  });

  it("should reject creating an expense for non-existent project", async () => {
    const res = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        project: "000000000000000000000000",
        amount: 10,
        currency: "USD",
        date: "2025-10-25",
      });
    // Non-existent project -> not found
    expect(res.status).toBe(404);
  });

  it("should reject creating an expense with negative amount", async () => {
    const res = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        project: projectId,
        amount: -10,
        currency: "USD",
        date: "2025-10-25",
      });
    // Negative amount -> validation error
    expect(res.status).toBe(422);
  });

  it("should reject creating an expense with invalid category id", async () => {
    const res = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        project: projectId,
        amount: 10,
        currency: "USD",
        date: "2025-10-25",
        category: "000000000000000000000000",
      });
    // Invalid category should be reported as not found
    expect(res.status).toBe(404);
  });
});
