import request from "supertest";
import app from "../app";

describe("Sources integration", () => {
  let token: string;
  const user = {
    name: "Source User",
    email: "sourceuser@example.com",
    password: "password123",
  };

  beforeEach(async () => {
    await request(app).post("/api/auth/register").send(user);
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password });
    token = login.body.data.token;
  });

  it("should create a source", async () => {
    const source = {
      name: "Bank Account",
      description: "Main business account",
    };
    const res = await request(app)
      .post("/api/sources")
      .set("Authorization", `Bearer ${token}`)
      .send(source);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.name).toBe(source.name);
  });

  it("should list sources for the user", async () => {
    await request(app)
      .post("/api/sources")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Bank Account" });
    const res = await request(app)
      .get("/api/sources")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it("should update a source", async () => {
    const createRes = await request(app)
      .post("/api/sources")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Old Name" });
    expect(createRes.body.success).toBe(true);
    if (!createRes.body.success)
      console.error("Source create failed:", createRes.body);
    const sourceId = createRes.body.data._id;
    const res = await request(app)
      .put(`/api/sources/${sourceId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "New Name" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("New Name");
  });

  it("should delete a source (soft delete)", async () => {
    const createRes = await request(app)
      .post("/api/sources")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "To Delete" });
    expect(createRes.body.success).toBe(true);
    if (!createRes.body.success)
      console.error("Source create failed:", createRes.body);
    const sourceId = createRes.body.data._id;
    const res = await request(app)
      .delete(`/api/sources/${sourceId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Should not find it anymore
    const getRes = await request(app)
      .get(`/api/sources/${sourceId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(getRes.status).toBe(404);
    expect(getRes.body.success).toBe(false);
    expect(getRes.body.error).toBeDefined();
    expect(getRes.body.error.code).toBe("NOT_FOUND");
  });
  it("should soft delete a source and not return it in list/get", async () => {
    const createRes = await request(app)
      .post("/api/sources")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Soft Delete Source" });
    expect(createRes.body.success).toBe(true);
    const sourceId = createRes.body.data._id;
    // Soft delete
    const delRes = await request(app)
      .delete(`/api/sources/${sourceId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);
    // Should not find it anymore
    const getRes = await request(app)
      .get(`/api/sources/${sourceId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(getRes.status).toBe(404);
    // Should not appear in list
    const listRes = await request(app)
      .get(`/api/sources`)
      .set("Authorization", `Bearer ${token}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.some((s: any) => s._id === sourceId)).toBe(false);
  });
});
