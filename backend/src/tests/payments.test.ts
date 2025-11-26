import request from "supertest";
import app from "../app";

describe("Payments integration", () => {
  let token: string;
  let clientId: string;
  let projectId: string;
  let paymentId: string;
  let user: { name: string; email: string; password: string };

  beforeEach(async () => {
    // Use a unique email for each test run
    const unique = Date.now() + Math.random().toString(36).slice(2);
    user = {
      name: "Pay User",
      email: `payuser_${unique}@example.com`,
      password: "password123",
    };
    const regRes = await request(app).post("/api/auth/register").send(user);
    if (!regRes.body.success) {
      console.error("Registration failed:", regRes.body);
      throw new Error("User registration failed");
    }
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password });
    if (!login.body.data || !login.body.data.token) {
      console.error("Login failed:", login.body);
      throw new Error("User login failed");
    }
    token = login.body.data.token;
    const clientRes = await request(app)
      .post("/api/clients")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Pay Client" });
    expect(clientRes.body.success).toBe(true);
    if (!clientRes.body.success)
      console.error("Client create failed:", clientRes.body);
    clientId = clientRes.body.data._id;
    const projectRes = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Pay Project", client: clientId });
    if (!projectRes.body.success) {
      console.error("Project create failed:", projectRes.body);
      throw new Error("Project creation failed");
    }
    projectId = projectRes.body.data._id;
  });

  it("should create a payment", async () => {
    const payment = {
      project: projectId,
      amount: 100,
      currency: "USD",
      date: "2025-10-25",
    };
    const res = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${token}`)
      .send(payment);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.amount).toBe(100);
    paymentId = res.body.data._id;
  });

  it("should list payments for the user", async () => {
    // Create a payment first
    const payment = {
      project: projectId,
      amount: 100,
      currency: "USD",
      date: "2025-10-25",
    };
    await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${token}`)
      .send(payment);
    const res = await request(app)
      .get("/api/payments")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it("should update a payment", async () => {
    // Create a payment first
    const payment = {
      project: projectId,
      amount: 100,
      currency: "USD",
      date: "2025-10-25",
    };
    const createRes = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${token}`)
      .send(payment);
    paymentId = createRes.body.data._id;
    const res = await request(app)
      .put(`/api/payments/${paymentId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 200 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toBe(200);
  });

  it("should delete a payment", async () => {
    // Create a payment first
    const payment = {
      project: projectId,
      amount: 100,
      currency: "USD",
      date: "2025-10-25",
    };
    const createRes = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${token}`)
      .send(payment);
    paymentId = createRes.body.data._id;
    const res = await request(app)
      .delete(`/api/payments/${paymentId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Should not find it anymore
    const getRes = await request(app)
      .get(`/api/payments/${paymentId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(getRes.status).toBe(404);
    expect(getRes.body.success).toBe(false);
    expect(getRes.body.error).toBeDefined();
    expect(getRes.body.error.code).toBe("NOT_FOUND");
  });
});
