import request from "supertest";
import app from "../app";
import { setupTestUserAndProject } from "./setup";

describe("Edge cases: amounts, decimals, and updates", () => {
  test("reject payment with zero or negative amount", async () => {
    const { token, projectId } = await setupTestUserAndProject();

    const r0 = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({ project: projectId, amount: 0, currency: "USD" });
    expect(r0.status).toBe(422);

    const rNeg = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({ project: projectId, amount: -100, currency: "USD" });
    expect(rNeg.status).toBe(422);
  });

  test("reject expense with zero or negative amount", async () => {
    const { token, projectId } = await setupTestUserAndProject();

    const r0 = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({ project: projectId, amount: 0, currency: "USD" });
    expect(r0.status).toBe(422);

    const rNeg = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({ project: projectId, amount: -50, currency: "USD" });
    expect(rNeg.status).toBe(422);
  });

  test("allow decimal amounts for payments/expenses", async () => {
    const { token, projectId } = await setupTestUserAndProject();

    const p = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({ project: projectId, amount: 123.45, currency: "USD" });
    expect(p.status).toBe(201);

    const e = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({ project: projectId, amount: 10.75, currency: "USD" });
    expect(e.status).toBe(201);
  });

  test("reject updating payment to invalid amount (negative/zero)", async () => {
    const { token, projectId } = await setupTestUserAndProject();
    const p1 = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({ project: projectId, amount: 100, currency: "USD" });
    expect(p1.status).toBe(201);
    const id = p1.body.data._id;

    const up = await request(app)
      .patch(`/api/payments/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: -10 });
    expect(up.status).toBe(422);

    const up0 = await request(app)
      .patch(`/api/payments/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 0 });
    expect(up0.status).toBe(422);
  });

  test("reject updating expense to invalid amount (negative/zero)", async () => {
    const { token, projectId } = await setupTestUserAndProject();
    const e1 = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({ project: projectId, amount: 50, currency: "USD" });
    expect(e1.status).toBe(201);
    const id = e1.body.data._id;

    const up = await request(app)
      .patch(`/api/expenses/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: -5 });
    expect(up.status).toBe(422);

    const up0 = await request(app)
      .patch(`/api/expenses/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 0 });
    expect(up0.status).toBe(422);
  });
});
