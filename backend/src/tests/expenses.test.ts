import request from "supertest";
import app from "../app";

describe("Expenses integration", () => {
  let token: string;
  let clientId: string;
  let projectId: string;
  let expenseId: string;
  let user: { name: string; email: string; password: string };

  beforeEach(async () => {
    // Use a unique email for each test run
    const unique = Date.now() + Math.random().toString(36).slice(2);
    user = {
      name: "Exp User",
      email: `expuser_${unique}@example.com`,
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
      .send({ name: "Exp Client" });
    expect(clientRes.body.success).toBe(true);
    if (!clientRes.body.success)
      console.error("Client create failed:", clientRes.body);
    clientId = clientRes.body.data._id;
    const projectRes = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Exp Project", client: clientId });
    if (!projectRes.body.success) {
      console.error("Project create failed:", projectRes.body);
      throw new Error("Project creation failed");
    }
    projectId = projectRes.body.data._id;
  });

  it("should create an expense", async () => {
    const expense = {
      project: projectId,
      amount: 50,
      currency: "USD",
      date: "2025-10-25",
    };
    const res = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send(expense);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.amount).toBe(50);
    expenseId = res.body.data._id;
  });

  it("should list expenses for the user", async () => {
    // Create an expense first
    const expense = {
      project: projectId,
      amount: 50,
      currency: "USD",
      date: "2025-10-25",
    };
    await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send(expense);
    const res = await request(app)
      .get("/api/expenses")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it("should update an expense", async () => {
    // Create an expense first
    const expense = {
      project: projectId,
      amount: 50,
      currency: "USD",
      date: "2025-10-25",
    };
    const createRes = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send(expense);
    expenseId = createRes.body.data._id;
    const res = await request(app)
      .put(`/api/expenses/${expenseId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 75 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toBe(75);
  });

  it("should delete an expense", async () => {
    // Create an expense first
    const expense = {
      project: projectId,
      amount: 50,
      currency: "USD",
      date: "2025-10-25",
    };
    const createRes = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send(expense);
    expenseId = createRes.body.data._id;
    const res = await request(app)
      .delete(`/api/expenses/${expenseId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Should not find it anymore
    const getRes = await request(app)
      .get(`/api/expenses/${expenseId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(getRes.status).toBe(404);
    expect(getRes.body.success).toBe(false);
    expect(getRes.body.error).toBeDefined();
    expect(getRes.body.error.code).toBe("NOT_FOUND");
  });
});
