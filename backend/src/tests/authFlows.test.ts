import request from "supertest";
import app from "../app";

describe("Auth flows: refresh and logout", () => {
  it("should refresh token and then logout", async () => {
    const user = {
      name: "AuthF",
      email: `authf${Date.now()}@x.com`,
      password: "password123",
    };
    await request(app).post("/api/auth/register").send(user);
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password });
    const token = login.body.data.token;

    // Use the same token as a refresh token (controller expects token in Authorization)
    const refreshRes = await request(app)
      .post("/api/auth/refresh")
      .set("Authorization", `Bearer ${token}`)
      .send();
    expect([200, 201]).toContain(refreshRes.status);
    expect(refreshRes.body.success).toBe(true);
    expect(refreshRes.body.data).toHaveProperty("token");

    // Logout using the original token
    const logoutRes = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${token}`)
      .send();
    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);

    // Subsequent protected call with same token should fail
    const meRes = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${token}`);
    expect([401, 403]).toContain(meRes.status);
  });
});
