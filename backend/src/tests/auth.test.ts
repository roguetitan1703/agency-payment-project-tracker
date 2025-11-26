import request from "supertest";
import app from "../app";

describe("Auth integration", () => {
  it("should register a new user and then login", async () => {
    const user = {
      name: "Test User",
      email: "test-user@example.com",
      password: "password123",
    };

    const reg = await request(app).post("/api/auth/register").send(user);
    expect([201, 200]).toContain(reg.status);
    expect(reg.body.success).toBe(true);
    expect(reg.body.data.token).toBeDefined();
    expect(reg.body.data.user).toBeDefined();

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password });
    expect(login.status).toBe(200);
    expect(login.body.success).toBe(true);
    expect(login.body.data.token).toBeDefined();
    expect(login.body.data.user.email).toBe(user.email);
  });
});
