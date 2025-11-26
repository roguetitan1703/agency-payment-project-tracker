import request from "supertest";
import app from "../app";

describe("Settings integration", () => {
  it("should get and update user settings", async () => {
    const user = {
      name: "Settings User",
      email: `settingsuser_${Date.now()}@example.com`,
      password: "password123",
    };
    await request(app).post("/api/auth/register").send(user);
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password });
    const token = login.body.data.token;
    // Get settings
    const getRes = await request(app)
      .get("/api/settings")
      .set("Authorization", `Bearer ${token}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.success).toBe(true);
    // Update settings
    const newSettings = { theme: "dark", notifications: true };
    const putRes = await request(app)
      .put("/api/settings")
      .set("Authorization", `Bearer ${token}`)
      .send({ settings: newSettings });
    expect(putRes.status).toBe(200);
    expect(putRes.body.success).toBe(true);
    expect(putRes.body.data.theme).toBe("dark");
    expect(putRes.body.data.notifications).toBe(true);
  });
});
