import request from "supertest";
import app from "../app";

describe("Clients integration", () => {
  it("should allow creating and listing clients when authenticated", async () => {
    const user = {
      name: "Client Tester",
      email: "client-tester@example.com",
      password: "password123",
    };

    const reg = await request(app).post("/api/auth/register").send(user);
    expect(reg.status).toBe(201);
    expect(reg.body.success).toBe(true);
    const token =
      reg.body.data?.token ||
      (
        await request(app)
          .post("/api/auth/login")
          .send({ email: user.email, password: user.password })
      ).body.data.token;
    expect(token).toBeDefined();

    const newClient = { name: "ACME Corporation" };
    const createRes = await request(app)
      .post("/api/clients")
      .set("Authorization", `Bearer ${token}`)
      .send(newClient);
    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.data).toBeDefined();
    expect(createRes.body.data.name).toBe(newClient.name);

    const listRes = await request(app)
      .get("/api/clients")
      .set("Authorization", `Bearer ${token}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(Array.isArray(listRes.body.data)).toBe(true);
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);
  });
});
