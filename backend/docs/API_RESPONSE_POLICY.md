# API Response Policy & OpenAPI guidance

This document describes the canonical API response shapes used across the backend, recommended error codes, and quick steps to generate an OpenAPI spec (Swagger) so the frontend can work against a stable contract.

Date: 2025-10-26

1. Canonical response shapes

Success (default)

HTTP: 200 (or 201 for created)

Body:

{
"success": true,
"data": { /_ resource object, list, or meta _/ }
}

Examples

200 OK (get project)

{
"success": true,
"data": { "id": "...", "title": "Website", "budget": 1000 }
}

201 Created (new payment)

HTTP 201

{
"success": true,
"data": { "id": "...", "amount": 250 }
}

Error (standard)

HTTP: 4xx / 5xx

Body:

{
"success": false,
"error": {
"code": "VALIDATION_ERROR", // machine friendly
"message": "The request payload is invalid",
"details": [ { "field": "amount", "reason": "required" } ] // optional
}
}

Common error codes (suggestion)

- VALIDATION_ERROR
- NOT_FOUND
- UNAUTHORIZED
- FORBIDDEN
- CONFLICT
- IMPORT_ERRORS
- PAYMENT_EXCEEDS_BUDGET
- SERVER_ERROR

2. Rules & ergonomics

- All JSON endpoints should return the canonical wrapper above.
- Binary or non-JSON endpoints (CSV export, file download) are allowed to respond directly via `res.send`, `res.download` or streaming — document these endpoints explicitly.
- `notFound(res, message)` uses message-first ergonomics: `notFound(res, 'Project not found')`.
- Warnings related to a resource (e.g., "overpayment") should be embedded inside `data` as `data.warning` so clients always find payload under `data`.

3. Example: implementing the policy in Express handlers

const createdProject = await Project.create(...);
return response.created(res, createdProject);

const notFound = (res, message = 'Not found') => response.notFound(res, message);

4. How to create an OpenAPI spec (two approaches)

A — Quick manual OpenAPI YAML (recommended for small projects)

1. Create `docs/openapi.yaml` and author paths for the core endpoints the frontend will use (auth, projects, payments, milestones, attachments).
2. Publish a swagger UI on the backend using `swagger-ui-express` to serve the YAML.

Pros: full control, simple, deterministic.

B — Generate OpenAPI from JSDoc using `swagger-jsdoc` (keeps doc close to code)

Install packages

```powershell
cd backend
npm install --save swagger-jsdoc swagger-ui-express
```

Add a small swagger bootstrap (e.g. `src/utils/swagger.ts`):

```ts
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import express from "express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: { title: "Agency Payment Tracker API", version: "1.0.0" },
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: express.Express) {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
```

Then call `setupSwagger(app)` in `src/server.ts` after routes are mounted.

Add JSDoc comments to route handlers with `@openapi` annotations for request/response shapes.

5. Minimum OpenAPI content to include

- Schemas for core resources (Project, Payment, Expense, Milestone, Attachment, User)
- Security scheme (Bearer JWT)
- Example responses using the canonical wrapper (success/error)

6. Recommended workflow

- Start by authoring a small `docs/openapi.yaml` containing only the endpoints the frontend needs immediately (auth, projects CRUD, payments CRUD, milestones, attachments upload/download). This is quick and ensures frontend can start.
- Optionally generate richer docs from JSDoc later once the OpenAPI surface and examples are stable.

7. Example small OpenAPI snippet (YAML) for a login endpoint

```yaml
openapi: 3.0.0
info:
  title: Agency Payment Tracker API
  version: "1.0.0"
paths:
  /api/auth/login:
    post:
      tags: [Auth]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                password:
                  type: string
      responses:
        "200":
          description: successful login
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/SuccessResponse"
components:
  schemas:
    SuccessResponse:
      type: object
      properties:
        success:
          type: boolean
          example: true
        data:
          type: object
          properties:
            accessToken:
              type: string
            refreshToken:
              type: string
    ErrorResponse:
      type: object
      properties:
        success:
          type: boolean
          example: false
        error:
          type: object
          properties:
            code:
              type: string
            message:
              type: string
```

8. Next steps I can do for you (pick one)

- Create `docs/openapi.yaml` with the minimal endpoints the frontend needs (auth, projects, payments, milestones, attachments) and add `setupSwagger` integration.
- Or: create the `docs/API_RESPONSE_POLICY.md` (done) and a tiny `docs/openapi-sample.yaml` — ready for you to expand.

If you want, I can also implement the swagger bootstrap into `src/server.ts` and run the test suite afterwards.

---

Notes

- I canonicalized `/health` endpoint in `src/app.ts` to return the wrapper via `response.ok` so frontend health checks will now receive `{ success: true, data: { ... } }`.

If you want, I can immediately generate a minimal `docs/openapi.yaml` and hook up `/api/docs` for local browsing. Tell me which endpoints you want included first.
