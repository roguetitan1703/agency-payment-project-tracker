import request from "supertest";
import app from "../app";

describe("Categories integration", () => {
  let token: string;
  const user = {
    name: "Category User",
    email: "categoryuser@example.com",
    password: "password123",
  };

  beforeEach(async () => {
    await request(app).post("/api/auth/register").send(user);
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password });
    token = login.body.data.token;
  });

  it("should create a category", async () => {
    const category = {
      name: "Travel",
      type: "expense",
      description: "Business travel",
    };
    const res = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send(category);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.name).toBe(category.name);
  });

  it("should list categories for the user", async () => {
    await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Travel" });
    const res = await request(app)
      .get("/api/categories")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it("should update a category", async () => {
    const createRes = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Old Category" });
    expect(createRes.body.success).toBe(true);
    if (!createRes.body.success)
      console.error("Category create failed:", createRes.body);
    const categoryId = createRes.body.data._id;
    const res = await request(app)
      .put(`/api/categories/${categoryId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "New Category" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("New Category");
  });

  it("should delete a category (soft delete)", async () => {
    const createRes = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "To Delete" });
    expect(createRes.body.success).toBe(true);
    if (!createRes.body.success)
      console.error("Category create failed:", createRes.body);
    const categoryId = createRes.body.data._id;
    const res = await request(app)
      .delete(`/api/categories/${categoryId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Should not find it anymore
    const getRes = await request(app)
      .get(`/api/categories/${categoryId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(getRes.status).toBe(404);
    expect(getRes.body.success).toBe(false);
    expect(getRes.body.error).toBeDefined();
    expect(getRes.body.error.code).toBe("NOT_FOUND");
  });
  it("should soft delete a category and not return it in list/get", async () => {
    const createRes = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Soft Delete Category" });
    expect(createRes.body.success).toBe(true);
    const categoryId = createRes.body.data._id;
    // Soft delete
    const delRes = await request(app)
      .delete(`/api/categories/${categoryId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);
    // Should not find it anymore
    const getRes = await request(app)
      .get(`/api/categories/${categoryId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(getRes.status).toBe(404);
    // Should not appear in list
    const listRes = await request(app)
      .get(`/api/categories`)
      .set("Authorization", `Bearer ${token}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.some((c: any) => c._id === categoryId)).toBe(
      false
    );
  });

  it("should block deleting a category if referenced by an expense", async () => {
    // Create category
    const createRes = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Blocked Category" });
    expect(createRes.body.success).toBe(true);
    const categoryId = createRes.body.data._id;
    // Create client and project
    const clientRes = await request(app)
      .post("/api/clients")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Cat Client" });
    expect(clientRes.body.success).toBe(true);
    const clientId = clientRes.body.data._id;
    const projectRes = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Cat Project", client: clientId });
    expect(projectRes.body.success).toBe(true);
    const projectId = projectRes.body.data._id;
    // Create expense referencing the category
    const expenseRes = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        project: projectId,
        amount: 10,
        currency: "USD",
        category: categoryId,
      });
    expect(expenseRes.body.success).toBe(true);
    // Attempt to delete category
    const delRes = await request(app)
      .delete(`/api/categories/${categoryId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(delRes.status).toBe(400);
    expect(delRes.body.success).toBe(false);
    expect(delRes.body.error).toBeDefined();
    expect(delRes.body.error.code).toBe("CATEGORY_DELETE_BLOCKED");
  });
});
