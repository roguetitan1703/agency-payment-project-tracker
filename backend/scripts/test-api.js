// Simple API smoke-test script for the backend
// Usage: node scripts/test-api.js
// Optionally set environment variables to control behavior:
// TEST_EMAIL, TEST_PASSWORD, TEST_NAME

async function getFetch() {
  if (globalThis.fetch) return globalThis.fetch.bind(globalThis);
  try {
    const mod = await import("node-fetch");
    return mod.default;
  } catch (err) {
    console.error(
      "No global fetch and failed to import node-fetch. If your Node version is <18, run: npm install node-fetch"
    );
    throw err;
  }
}

async function requestJson(fetch, method, url, body, headers = {}) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json", ...headers },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const text = await res.text();
  let data = text;
  try {
    data = JSON.parse(text);
  } catch (e) {
    /* not JSON */
  }
  return {
    status: res.status,
    ok: res.ok,
    data,
    headers: Object.fromEntries(res.headers.entries()),
  };
}

async function main() {
  const fetch = await getFetch();
  const base = process.env.API_BASE || "http://localhost:3001";
  const email = process.env.TEST_EMAIL || "test+bot@example.com";
  const password = process.env.TEST_PASSWORD || "Password123!";
  const name = process.env.TEST_NAME || `Test User ${Date.now()}`;

  console.log("Using API base:", base);

  // Try register (if email exists, server may return 409)
  console.log("\n1) Registering user (may return 409 if already exists)");
  const reg = await requestJson(fetch, "POST", `${base}/api/auth/register`, {
    name,
    email,
    password,
  });
  console.log("Register status:", reg.status);
  console.log("Register body:", JSON.stringify(reg.data));

  // If register failed with 409, proceed to login anyway
  if (reg.status >= 400 && reg.status !== 409) {
    console.error("Register failed with unexpected status; aborting.");
    process.exit(1);
  }

  // Login
  console.log("\n2) Logging in");
  const login = await requestJson(fetch, "POST", `${base}/api/auth/login`, {
    email,
    password,
  });
  console.log("Login status:", login.status);
  console.log("Login body:", JSON.stringify(login.data));
  if (!login.ok) {
    console.error("Login failed; aborting.");
    process.exit(1);
  }
  const token = login.data && login.data.token;
  console.log("\nToken length:", token ? token.length : "none");

  // Call protected endpoint
  console.log("\n3) Fetching /api/clients with Authorization header");
  const clients = await requestJson(fetch, "GET", `${base}/api/clients`, null, {
    Authorization: `Bearer ${token}`,
  });
  console.log("Clients status:", clients.status);
  console.log("Clients body:", JSON.stringify(clients.data));

  // Helpful debug: echo first 80 chars of token
  console.log(
    "\nToken preview (first 80 chars):",
    token ? token.slice(0, 80) : "none"
  );
}

main().catch((err) => {
  console.error("Script error:", err);
  process.exit(1);
});
