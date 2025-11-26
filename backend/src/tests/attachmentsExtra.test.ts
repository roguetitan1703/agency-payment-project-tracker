import request from "supertest";
import app from "../app";
import path from "path";

describe("Attachments extra tests", () => {
  let token: string;
  let projectId: string;
  beforeEach(async () => {
    const user = {
      name: "AttE",
      email: `atte${Date.now()}@x.com`,
      password: "password123",
    };
    await request(app).post("/api/auth/register").send(user);
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password });
    token = login.body.data.token;
    const clientRes = await request(app)
      .post("/api/clients")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Att Client" });
    projectId = (
      await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "AttProj", client: clientRes.body.data._id })
    ).body.data._id;
  });

  it("should upload, download, delete attachment", async () => {
    const filePath = path.join(__dirname, "fixtures", "sample.txt");
    const up = await request(app)
      .post(`/api/attachments/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`)
      .attach("file", filePath);
    expect(up.status).toBe(201);
    const list = await request(app)
      .get(`/api/attachments/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body.data)).toBe(true);
    const att = list.body.data[0];
    expect(att).toBeDefined();

    // download
    const dl = await request(app)
      .get(`/api/attachments/${att._id}/download`)
      .set("Authorization", `Bearer ${token}`);
    expect(dl.status).toBe(200);
    expect(dl.header["content-type"]).toBeDefined();

    // delete
    const del = await request(app)
      .delete(`/api/attachments/${att._id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(del.status).toBe(200);

    // confirm gone
    // Attempt to download after delete should return 404
    const dlAfter = await request(app)
      .get(`/api/attachments/${att._id}/download`)
      .set("Authorization", `Bearer ${token}`);
    expect(dlAfter.status).toBe(404);
  });

  it("should reject missing file on upload", async () => {
    const res = await request(app)
      .post(`/api/attachments/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`)
      .send();
    expect([400, 422]).toContain(res.status);
  });
});
