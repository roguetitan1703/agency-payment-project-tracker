# Backend Progress — Complete Reference

This document is a one-stop reference describing the current state of the backend (code structure, routes, controllers, models, helpers, middleware, tests and progress status). The goal is that an external agent (human or AI) can read this file and immediately understand the API surface, data shapes, and what is done / what remains.

Date: 2025-10-26

Summary status

- Test status: All backend tests passing locally (23 suites, 86 tests) as of this date.
- Goal: canonical JSON API responses (helpers in `src/utils/response.ts`), strict tests, and minimal, documented exceptions for non-JSON payloads (CSV and /health).

Contents

- Project quick commands
- Routes (exhaustive by file)
- Controllers (exported methods and notes)
- Models (fields and types)
- Middleware, helpers and services
- Tests & verification
- Files intentionally using non-canonical response (exceptions)
- Sweep progress and next actions

---

How to run (quick)

- From `backend/`:

```powershell
npm install
npm test
```

Run tests locally to verify everything remains green. CI should run the same command.

---

Routes (by file)
Each route entry lists: HTTP method, path (relative to `/api` where applicable), validation middleware, and controller handler.

- `src/routes/auth.ts` (mounted at `/api/auth`)

  - POST `/register` -> `authController.register` (body: name,email,password)
  - POST `/login` -> `authController.login` (body: email,password)
  - POST `/logout` -> `authController.logout`
  - POST `/refresh` -> `authController.refresh`

- `src/routes/clients.ts` (mounted at `/api/clients`, protected)

  - POST `/` -> `clientsController.createClient` (body: name,email? etc.)
  - GET `/` -> `clientsController.getClients`
  - GET `/:id` -> `clientsController.getClientById`
  - PUT `/:id` -> `clientsController.updateClient`
  - PATCH `/:id` -> `clientsController.updateClient`
  - DELETE `/:id` -> `clientsController.deleteClient`
  - GET `/:id/projects` -> `clientsController.getClientProjects`
  - GET `/:id/stats` -> `clientsController.getClientStats`

- `src/routes/projects.ts` (mounted at `/api/projects`, protected)

  - POST `/` -> `projectsController.createProject`
  - GET `/` -> `projectsController.getProjects` (query: status,client,startDate,endDate)
  - GET `/:id` -> `projectsController.getProjectById`
  - GET `/:id/timeline` -> `projectsController.getProjectTimeline`
  - GET `/:id/stats` -> `projectsController.getProjectStats`
  - PUT `/:id` -> `projectsController.updateProject`
  - PATCH `/:id` -> `projectsController.updateProject`
  - DELETE `/:id` -> `projectsController.deleteProject`

- `src/routes/payments.ts` (mounted at `/api/payments`, protected)

  - POST `/` -> `paymentsController.createPayment` (amount, currency, project/client, date)
  - GET `/` -> `paymentsController.getPayments`
  - GET `/:id` -> `paymentsController.getPaymentById`
  - PUT `/:id` -> `paymentsController.updatePayment`
  - PATCH `/:id` -> `paymentsController.updatePayment`
  - DELETE `/:id` -> `paymentsController.deletePayment`

- `src/routes/expenses.ts` (mounted at `/api/expenses`, protected)

  - POST `/` -> `expensesController.createExpense`
  - GET `/` -> `expensesController.getExpenses`
  - GET `/:id` -> `expensesController.getExpenseById`
  - PUT/PATCH `/:id` -> `expensesController.updateExpense`
  - DELETE `/:id` -> `expensesController.deleteExpense`

- `src/routes/sources.ts` (mounted at `/api/sources`, protected)

  - POST `/` -> `sourcesController.createSource`
  - GET `/` -> `sourcesController.getSources`
  - GET `/:id` -> `sourcesController.getSourceById`
  - PUT/PATCH `/:id` -> `sourcesController.updateSource`
  - DELETE `/:id` -> `sourcesController.deleteSource` (soft delete)

- `src/routes/categories.ts` (mounted at `/api/categories`, protected)

  - POST `/` -> `categoriesController.createCategory`
  - GET `/` -> `categoriesController.getCategories`
  - GET `/:id` -> `categoriesController.getCategoryById`
  - PUT/PATCH `/:id` -> `categoriesController.updateCategory`
  - DELETE `/:id` -> `categoriesController.deleteCategory` (soft delete; blocked if referenced)

- `src/routes/milestones.ts` (mounted at `/api/milestones`, protected)

  - POST `/` -> `milestonesController.createMilestone` (optional projectId)
  - GET `/` -> `milestonesController.getMilestones` (query: projectId)
  - GET `/:id` -> `milestonesController.getMilestoneById`
  - PATCH/PUT `/:id` -> `milestonesController.updateMilestone` (status transitions validated)
  - DELETE `/:id` -> `milestonesController.deleteMilestone`

- `src/routes/projectMilestones.ts` (mounted at `/api/projects/:projectId/milestones`, protected)

  - GET `/` -> `milestonesController.getMilestonesForProject`
  - POST `/` -> `milestonesController.createMilestoneForProject` (project scoped create)

- `src/routes/attachments.ts` (mounted at `/api/attachments`, protected)

  - POST `/projects/:projectId` -> `attachmentsController.uploadProjectAttachment` (multipart)
  - GET `/projects/:projectId` -> `attachmentsController.listProjectAttachments`
  - POST `/milestones/:milestoneId` -> `attachmentsController.uploadMilestoneAttachment`
  - GET `/milestones/:milestoneId` -> `attachmentsController.listMilestoneAttachments`
  - POST `/payments/:paymentId` -> `attachmentsController.uploadPaymentAttachment`
  - GET `/payments/:paymentId` -> `attachmentsController.listPaymentAttachments`
  - POST `/expenses/:expenseId` -> `attachmentsController.uploadExpenseAttachment`
  - GET `/expenses/:expenseId` -> `attachmentsController.listExpenseAttachments`
  - GET `/:id/download` -> `attachmentsController.downloadAttachment` (streams file)
  - DELETE `/:id` -> `attachmentsController.deleteAttachment`

- `src/routes/users.ts` (mounted at `/api/users`, protected)

  - GET `/me` -> `usersController.getMe`

- `src/routes/settings.ts` (mounted at `/api/settings`, protected)

  - GET `/` -> `settingsController.getSettings`
  - PUT/PATCH `/` -> `settingsController.updateSettings`

- `src/routes/analytics.ts` (mounted at `/api/analytics`, protected)

  - GET `/dashboard/stats` -> `analyticsController.getDashboardStats`
  - GET `/reports` -> `analyticsController.getReports`
  - GET `/trends` -> `analyticsController.getTrends`

- `src/routes/imports.ts` (mounted at `/api/import`, protected)

  - POST `/csv` -> `importExportController.importCSV` (multipart)
  - POST `/projects` -> `importExportController.importProjects` (multipart)
  - POST `/payments` -> `importExportController.importPayments` (multipart)

- `src/routes/exports.ts` (mounted at `/api/export`, protected)
  - GET `/csv` -> `importExportController.exportCSV` (streams CSV)
  - GET `/all` -> `importExportController.exportAll` (JSON dump)

---

Controllers (exports and quick behavior)

- `src/controllers/authController.ts`

  - register(req): creates user, issues access + refresh tokens
  - login(req): validate credentials, return token pair
  - logout(req): blacklist provided tokens
  - refresh(req): verify refresh token, rotate tokens

- `src/controllers/clientsController.ts`

  - createClient, getClients, getClientById, updateClient, deleteClient, getClientProjects, getClientStats
  - deleteClient blocks if there are payments/projects

- `src/controllers/projectsController.ts`

  - createProject, getProjects, getProjectById, updateProject, deleteProject, getProjectStats, getProjectTimeline
  - deleteProject blocks if payments/expenses exist; cascades milestone deletes

- `src/controllers/paymentsController.ts`

  - createPayment (transaction-aware, budget checks, auto-complete milestone), getPayments, getPaymentById, updatePayment, deletePayment

- `src/controllers/expensesController.ts`

  - createExpense (budget checks), getExpenses, getExpenseById, updateExpense, deleteExpense

- `src/controllers/sourcesController.ts`

  - createSource, getSources, getSourceById, updateSource, deleteSource (soft)

- `src/controllers/categoriesController.ts`

  - createCategory, getCategories, getCategoryById, updateCategory, deleteCategory (soft; blocked when referenced)

- `src/controllers/milestonesController.ts`

  - createMilestoneForProject (project-scoped create with warning when milestone sums mismatch budget)
  - createMilestone (top-level create)
  - getMilestonesForProject, getMilestones, getMilestoneById
  - updateMilestone (status validation; sets completed/completedDate when appropriate)
  - deleteMilestone
  - Note: `warning` is embedded in `data` when present (`response.created(res, { ...milestone, warning })`).

- `src/controllers/attachmentsController.ts`

  - upload/list/download/delete for project/milestone/payment/expense attachments
  - uses disk storage (`uploads/`) and `Attachment` model; sanitizes filenames

- `src/controllers/importExportController.ts`

  - importCSV, importProjects, importPayments (CSV parser / row-level reporting)
  - exportCSV (streams a CSV string); exportAll (JSON object of projects/payments/expenses/clients/categories)

- `src/controllers/remindersController.ts`

  - getReminders, getReminderById, createReminder, updateReminder, deleteReminder

- `src/controllers/settingsController.ts`

  - getSettings, updateSettings

- `src/controllers/analyticsController.ts`

  - getDashboardStats, getReports, getTrends (placeholders / basic implementations)

- `src/controllers/usersController.ts`
  - getMe

---

Models (fields and important notes)

- `Attachment` (src/models/Attachment.ts)

  - filename, originalName, mimetype, size, projectId?, milestoneId?, paymentId?, expenseId?, uploadedBy, createdAt

- `Category` (src/models/Category.ts)

  - name, type (expense|income), description?, createdBy, isDeleted

- `Client` (src/models/Client.ts)

  - name, email?, phone?, address?, notes?, createdBy

- `Expense` (src/models/Expense.ts)

  - project?, amount, currency, category?, date, description?, receiptUrl?, createdBy

- `Milestone` (src/models/Milestone.ts)

  - projectId, name, amount, dueDate, status (pending|in-progress|completed), completed, completedDate?, notes

- `Payment` (src/models/Payment.ts)

  - project?, client?, amount, currency, method?, status?, date, notes, createdBy

- `Project` (src/models/Project.ts)

  - title, description?, client?, budget, currency, status, startDate?, endDate?, createdBy

- `Reminder` (src/models/Reminder.ts)

  - user, type, title, message?, data?, read

- `Source` (src/models/Source.ts)

  - name, description?, createdBy, isDeleted

- `User` (src/models/User.ts)
  - name, email, password (hashed), role, settings
  - methods: comparePassword

---

Middleware, helpers & services

- `src/utils/response.ts` — canonical response helpers

  - ok(res, data, status=200) -> { success: true, data }
  - created(res, data) -> status 201
  - error(res, status, code, message, details?) -> { success: false, error: { code, message, details? } }
  - validationError, notFound(message-first), unauthorized, forbidden, conflict, serverError

- `src/middleware/authMiddleware.ts` — checks Authorization header (Bearer), validates JWT, verifies blacklist via `tokenBlacklist` service, sets `req.userId`.

- `src/middleware/validateRequest.ts` — express-validator result handler that maps errors -> `response.validationError` with details array.

- `src/middleware/validations.ts` — small helper factories for express-validator (mongoIdParam, optionalNumber, requiredString, isoDate, etc).

- `src/middleware/uploadMiddleware.ts` — multer disk storage setup, `uploadSingle(fieldName)` factory, `ensureFile` middleware, filename sanitization, allowed MIME types, file size limit.

- `src/middleware/errorHandler.ts` — global error handler that maps thrown errors to canonical response.error

- `src/services/tokenBlacklist.ts` — simple in-memory blacklist by default; optional redis backend (`blacklistRedis.ts`) if configured.

---

Tests & verification

- Test files are in `src/tests/` (Jest + supertest). Representative tests:

  - `auth.test.ts`, `authFlows.test.ts`, `authNegative.test.ts` — auth flows
  - `clients.test.ts`, `projects.test.ts`, `payments.test.ts`, `expenses.test.ts`, `sources.test.ts`, `categories.test.ts` — resource integration tests
  - `attachments.test.ts`, `attachmentsExtra.test.ts`, `attachmentsNegative.test.ts` — upload/download/delete behaviors
  - `milestones.test.ts` — milestones behaviors including warning and auto-complete
  - import/export tests, analytics, settings, users, validationFailures, businessRules, edgeCases, etc.

- Running tests: `npm test` from backend root. Current run (2025-10-26) => 23 suites / 86 tests passed.

---

Files intentionally outside the canonical JSON wrapper

- `/health` in `src/app.ts` returns a small JSON object via `res.json({ status: 'OK', ... })`. This is intentionally lightweight. If you want strict wrapper everywhere, switch it to `response.ok(res, {...})`.

- `importExportController.exportCSV` streams CSV via `res.setHeader(...); res.send(csvText)` — appropriate for non-JSON responses. `exportAll` returns canonical JSON.

---

Sweep progress and what changed during the canonicalization

- Implemented `src/utils/response.ts` and updated the majority of controllers to use these helpers.
- Adjusted `milestonesController` to embed `warning` inside `data` and updated unit/integration tests (`src/tests/milestones.test.ts`) accordingly.
- Fixed a corrupted `clientsController.ts` during edits and restored exports and behavior.
- Hardened attachment upload flows (sanitization, file presence checks) and fixed an intermittent test ECONNRESET by improving error handling and ensuring multer and downstream middleware respond consistently.

---

Next recommended actions

1. Add `docs/API_RESPONSE_POLICY.md` summarizing canonical response shapes, codes, and examples (high priority to prevent regressions).
2. Add a small integration test that asserts canonical shapes for a couple of representative endpoints (milestone create, payment create, auth login) to prevent regressions.
3. (Optional) Switch `/health` to `response.ok` if external monitors expect the canonical wrapper.
4. Add explicit documentation of domain error codes used (PROJECT_NOT_FOUND, PAYMENT_EXCEEDS_BUDGET, IMPORT_ERRORS, etc.) — can be a table in docs.

---

If you want I can:

- produce a machine-readable JSON/YAML of the entire API surface (paths, methods, request schema hints, response shapes) suitable for auto-generating mock servers or API contracts; or
- add `docs/API_RESPONSE_POLICY.md` and a unit test asserting the canonical shape. Tell me which and I'll implement it and run tests.

_Last updated: 2025-10-26_
