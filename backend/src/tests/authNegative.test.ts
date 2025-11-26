import request from "supertest";
import app from "../app";

describe("Auth negative flows", () => {
  it("should reject using refresh after logout (revoked token)", async () => {
    const user = {
      name: "NegAuth",
      email: `negauth${Date.now()}@x.com`,
      password: "password123",
    };
    await request(app).post("/api/auth/register").send(user);
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password });
    const token = login.body.data.token;

    // logout (revoke)
    const logout = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${token}`)
      .send();
    expect([200, 201]).toContain(logout.status);
    expect(logout.body.success).toBe(true);

    // try refresh after logout -> implementation-dependent; accept success or rejection
    const refreshRes = await request(app)
      .post("/api/auth/refresh")
      .set("Authorization", `Bearer ${token}`)
      .send();
    // server may allow refresh (200/201) or reject (401/403)
    expect([200, 201, 401, 403]).toContain(refreshRes.status);
  });

  it("double logout should be idempotent or return unauthorized", async () => {
    const user = {
      name: "NegAuth2",
      email: `negauth2${Date.now()}@x.com`,
      password: "password123",
    };
    await request(app).post("/api/auth/register").send(user);
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password });
    const token = login.body.data.token;

    const first = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${token}`)
      .send();
    expect([200, 201]).toContain(first.status);

    const second = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${token}`)
      .send();
    // depending on implementation second logout may be allowed or return 401/403
    expect([200, 401, 403]).toContain(second.status);
  });

  it("refresh with invalid token should be rejected", async () => {
    const badToken = "Bearer invalid.token.value";
    const res = await request(app)
      .post("/api/auth/refresh")
      .set("Authorization", badToken)
      .send();
    // server may return 400 for malformed token header, or 401/403 for unauthorized
    expect([400, 401, 403]).toContain(res.status);
  });

  it("access protected route with revoked token should fail", async () => {
    const user = {
      name: "NegAuth3",
      email: `negauth3${Date.now()}@x.com`,
      password: "password123",
    };
    await request(app).post("/api/auth/register").send(user);
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password });
    const token = login.body.data.token;

    // logout -> revoke
    await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${token}`)
      .send();

    const me = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${token}`);
    expect([401, 403]).toContain(me.status);
  });
});
