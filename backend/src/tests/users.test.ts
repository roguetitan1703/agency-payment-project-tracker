import request from "supertest";
import app from "../app";

describe("Users integration", () => {
  it("should return the authenticated user's profile", async () => {
    const user = {
      name: "User Profile",
      email: `userprofile_${Date.now()}@example.com`,
      password: "password123",
    };
    await request(app).post("/api/auth/register").send(user);
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password });
    const token = login.body.data.token;
    const res = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(user.email);
    expect(res.body.data.name).toBe(user.name);
    expect(res.body.data.password).toBeUndefined();
  });
});
