import request from "supertest";
import app from "../app";
import { setupTestUserAndProject } from "./setup";

describe("Business rules: validation and protections", () => {
  test("blocks deleting a client that has projects", async () => {
    const { token, clientId } = await setupTestUserAndProject();

    const res = await request(app)
      .delete(`/api/clients/${clientId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error.code).toBe("CLIENT_DELETE_BLOCKED");
  });

  test("prevents overpayment when creating payments for a project with a budget", async () => {
    const { token, projectId } = await setupTestUserAndProject();

    // First payment within budget
    const p1 = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({ project: projectId, amount: 2000, currency: "USD" });
    expect(p1.status).toBe(201);

    // Second payment would exceed budget (project budget in setup is 3000)
    const p2 = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({ project: projectId, amount: 1500, currency: "USD" });

    expect(p2.status).toBe(409);
    expect(p2.body).toHaveProperty("error");
    expect(p2.body.error.code).toBe("PAYMENT_EXCEEDS_BUDGET");
  });

  test("prevents overpayment when updating a payment amount", async () => {
    const { token, projectId } = await setupTestUserAndProject();

    // Create two payments that together are within budget
    const p1 = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({ project: projectId, amount: 1000, currency: "USD" });
    expect(p1.status).toBe(201);
    const p2 = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({ project: projectId, amount: 1000, currency: "USD" });
    expect(p2.status).toBe(201);

    // Attempt to update second payment to exceed budget (3000 budget -> make p2 2500 -> total 3500)
    const paymentId = p2.body.data._id;
    const upd = await request(app)
      .patch(`/api/payments/${paymentId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 2500 });

    expect(upd.status).toBe(409);
    expect(upd.body).toHaveProperty("error");
    expect(upd.body.error.code).toBe("PAYMENT_EXCEEDS_BUDGET");
  });

  test("prevents expense overflow when creating an expense", async () => {
    const { token, projectId } = await setupTestUserAndProject();

    // First expense within budget
    const e1 = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({ project: projectId, amount: 500, currency: "USD" });
    expect(e1.status).toBe(201);

    // Second expense would exceed budget (project budget in setup is 3000, but we test smaller flow)
    const e2 = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({ project: projectId, amount: 2600, currency: "USD" });

    // Because previous expense 500 + 2600 = 3100 > 3000 budget -> blocked
    expect(e2.status).toBe(409);
    expect(e2.body).toHaveProperty("error");
    expect(e2.body.error.code).toBe("EXPENSE_EXCEEDS_BUDGET");
  });

  test("prevents expense overflow when updating an expense amount", async () => {
    const { token, projectId } = await setupTestUserAndProject();

    // Create two expenses that together are within budget
    const e1 = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({ project: projectId, amount: 1000, currency: "USD" });
    expect(e1.status).toBe(201);
    const e2 = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({ project: projectId, amount: 1000, currency: "USD" });
    expect(e2.status).toBe(201);

    // Attempt to update second expense to exceed budget (3000 budget -> make e2 2500 -> total 3500)
    const expenseId = e2.body.data._id;
    const upd = await request(app)
      .patch(`/api/expenses/${expenseId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 2500 });

    expect(upd.status).toBe(409);
    expect(upd.body).toHaveProperty("error");
    expect(upd.body.error.code).toBe("EXPENSE_EXCEEDS_BUDGET");
  });

  // Removed test: payments and expenses are validated separately by design.
  // If future product changes combine payments + expenses for budget calculations,
  // re-introduce an explicit test here that asserts the expected combined behavior.

  test("concurrent payments should not allow combined overflow (detect race)", async () => {
    const { token, projectId } = await setupTestUserAndProject();

    // Attempt two concurrent payments that together exceed budget (3000)
    const req1 = request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({ project: projectId, amount: 2000, currency: "USD" });
    const req2 = request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({ project: projectId, amount: 2000, currency: "USD" });

    const results = await Promise.all([req1, req2]);

    // After both attempts, ensure combined total in DB does not exceed budget
    const paymentsRes = await request(app)
      .get("/api/payments")
      .set("Authorization", `Bearer ${token}`);
    expect(paymentsRes.status).toBe(200);
    const payments = paymentsRes.body.data as Array<any>;
    const total = payments.reduce((s, p) => s + (p.amount || 0), 0);
    expect(total).toBeLessThanOrEqual(3000);
  });
});
