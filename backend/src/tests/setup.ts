import request from "supertest";
import app from "../app";

// Helper to create a user, login, and create a project for tests
export async function setupTestUserAndProject() {
  const user = {
    name: "Milestone Test User",
    email: `milestone-test-${Date.now()}@example.com`,
    password: "password123",
  };
  // Register
  await request(app).post("/api/auth/register").send(user);
  // Login
  const login = await request(app)
    .post("/api/auth/login")
    .send({ email: user.email, password: user.password });
  const token = login.body.data.token;
  // Create a client
  const clientRes = await request(app)
    .post("/api/clients")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Test Client" });
  const clientId = clientRes.body.data._id;
  // Create a project
  const projectRes = await request(app)
    .post("/api/projects")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Test Project",
      client: clientId,
      budget: 3000,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  const projectId = projectRes.body.data._id;
  return { token, projectId, clientId };
}
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

let mongod: MongoMemoryServer;

// Start in-memory MongoDB before all tests and connect mongoose
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri, {
    // useNewUrlParser and useUnifiedTopology are defaults in modern drivers
  } as mongoose.ConnectOptions);
  // Ensure uploads directory exists for attachment tests
  const uploadDir =
    process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
});

// Clear database between tests
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    // @ts-ignore
    await collections[key].deleteMany({});
  }
  // Clean uploads directory between tests
  try {
    const uploadDir =
      process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      for (const f of files) {
        const p = path.join(uploadDir, f);
        try {
          fs.unlinkSync(p);
        } catch (e) {
          /* ignore */
        }
      }
    }
  } catch (e) {
    // swallow any fs cleanup errors to not break tests
  }
});

// Disconnect and stop mongod after all tests
afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});
