# Backend Audit — Detailed Findings & Strict Recommendations

Generated: 2025-10-26
Repository: agency-payment-project-tracker (backend)
Scope: controllers (src/controllers), routes (src/routes), tests (src/tests), middleware & upload flow, import/export.

This document reports file-by-file and cross-cutting findings. For each issue I give: what is wrong, why it matters, the strict change I recommend (code-level), and tests/verification to include in your PR. The goal is to be prescriptive: small, safe, testable changes that harden the code and make behavior consistent.

Summary of high-level issues (quick):

- Inconsistent request user shape: sometimes `req.userId`, sometimes `req.user.id`, sometimes `RequestWithUser` typed and sometimes raw `Request`. Standardize to a single typed shape.
- Inconsistent error responses and HTTP status usage across controllers. No single error shape contract.
- Duplicate and inconsistent budget enforcement logic (payments vs expenses vs projects) implemented in multiple places without DB transactions — race conditions possible.
- Attachment handling uses relative paths and no sanitization or path traversal protection; multer config lacks size/type limits and global config is scattered.
- CSV import/export: streaming parse without robust error handling, no header/column validation, no uploaded-file cleanup, no size/row limits.
- Tests: useful coverage added, but many tests tolerate multiple behaviors (accepting both success and failure) — masks real issues and prevents safely hardening controllers. Tests also duplicate setup code rather than using shared helpers.
- Dynamic `require()` usage for models (lazy load) scattered — can hide circular import issues and makes static analysis harder.
- Logging: inconsistent console.error usage left in some controllers; other places swallow exceptions silently.
- Soft-delete vs hard-delete inconsistencies and missing access-control checks in some endpoints.

How I audited

- Read all controllers under `src/controllers` and all routes under `src/routes`.
- Read key tests under `src/tests` to see how routes and controllers are exercised.
- Inspected `src/tests/setup.ts`, upload middleware, and `importExportController` for filesystem handling.

=================================================================
Per-file findings and strict recommendations
=================================================================

## Controllers (detailed)

## src/controllers/authController.ts

Findings

- Uses JWT access tokens as the refresh token (`/refresh` expects an existing token in Authorization and issues a new access token). This conflates access/refresh semantics.
- `refresh` uses `jwt.verify(..., { ignoreExpiration: true })` then issues a new token without verifying that the original token wasn't revoked/blacklisted. The `logout` route adds tokens to `tokenBlacklist` but `refresh` does not check the blacklist.
- `logout` accepts the token from Authorization header, calls `tokenBlacklist.add(token)` but offers no error handling for the blacklist service. There is no TTL/storage guarantee; tokenBlacklist appears in-memory only (service was documented but not enforced with Redis). `isBlacklisted` returns `tokenBlacklist.has(token)` but not used centrally by auth middleware.
- Error shapes are inconsistent (sometimes `message` only, sometimes `error` object) and some messages leak internal details in console.error.

Why it matters

- Security: refresh without blacklist check means a revoked token can be used to obtain new tokens.
- Spec: access vs refresh tokens should be separated to limit exposure.
- Operational: in-memory blacklist will not scale across processes.

Strict change recommendations (code-level)

1. Separate access and refresh tokens: implement endpoint that accepts a refresh token cookie or specialized Authorization type (e.g., `Authorization: Refresh <token>`) instead of reusing access tokens. Update login to return both tokens (or a refresh token cookie) and update tests accordingly.
2. In `refresh`, after verifying token payload, check blacklist service (await tokenBlacklist.has(token)). If blacklisted, return 401/403.
3. Make `tokenBlacklist` pluggable: keep an in-memory fallback but add a Redis-backed implementation behind the same API (add/has/remove/ttl). Add configuration to choose backend using env var (e.g., TOKEN_BLACKLIST_STORE=redis|null). Provide recommended Redis config sample in docs and keep TTL matching JWT expiration.
4. Normalize error responses: introduce a helper util `respondError(res, status, code, message, details?)` and use `return respondError(...)` consistently.
5. Add defensive checks and tests for missing Authorization header; standardize 400 vs 401 responses (use 401 for missing/invalid auth). In `logout` return 204 or 200 with consistent body.

Tests to add/update

- Replace current refresh tests to send explicit refresh token (once implemented). Add negative tests asserting revoked refresh tokens are rejected.
- Add integration tests covering multi-process blacklist behavior (mock Redis in tests).

Estimated files to change

- `src/controllers/authController.ts`
- `src/middleware/authMiddleware.ts` (to check blacklist centrally)
- `src/services/tokenBlacklist.ts` (add Redis implementation)
- `src/tests/auth*.test.ts` (update expectations)

## src/controllers/paymentsController.ts

Findings

- Budget enforcement uses multiple reads and reduces in-application which opens race conditions. There is a pre-save check and a post-save rollback (delete) attempt.
- Duplicate logic in `updatePayment` repeats the same budget checks.
- Uses `require('../models/Milestone')` inside function — dynamic require. Several controllers do this for milestone auto-completion.
- No transactional guarantees: when many concurrent requests occur, both pre-check and post-check approach is brittle.
- Uses `createdBy` filtering in some queries but not in others (e.g., payments.find by project no createdBy filter). Similarly, when reading payments to calculate totals, createdBy is omitted which may include unrelated payments (security issue if multi-tenant).

Why it matters

- Race conditions can allow budget overflow.
- Data leakage possible: if total calculations include records from other users, budgets can be bypassed and users might see/influence other users' data.

Strict change recommendations

1. Move budget enforcement logic into a single service function e.g., `services/budgetService.enforcePayment(projectId, amount, session?)` that runs inside a MongoDB transaction or uses findOneAndUpdate with atomic operators when possible. Use Mongoose sessions for transactions (Mongo must be replica set; configure in test harness via mongodb-memory-server supports transactions — confirm and enable if desired). If transactions unavailable, use optimistic concurrency / versioning (mongoose `__v`) with retry loops.
2. Always scope budget calculations by createdBy and project: use queries like `Payment.find({ project: projectId, createdBy })`.
3. Replace post-save rollback pattern with pre-commit transaction so creation/save is atomic and fails if budget exceeded.
4. Centralize milestone auto-completion into a service (avoid dynamic require). E.g., `milestonesService.completeIfMatches(projectId, amount)` called after a successful transaction.
5. Add database indexes on `project` + `createdBy` for quick aggregation.

Tests to add/update

- Add concurrency tests that attempt N simultaneous payments and assert only allowed sum saved.
- Replace relaxed test expectations with strict ones once transactional enforcement is in place.

Files to change

- `src/controllers/paymentsController.ts`
- `src/controllers/expensesController.ts` (similar pattern)
- `src/services/budgetService.ts` (new)
- `src/services/milestonesService.ts` (new)
- Tests: `src/tests/payments*.test.ts`, `src/tests/businessRules.test.ts`

## src/controllers/expensesController.ts

Findings

- Similar to payments: budget enforcement uses in-memory aggregation without createdBy scoping in some cases.
- The code checks only expenses when enforcing expense budget, but previously payments enforcement included expenses in payments check — inconsistency between how payments/expenses consider each other.

Why it matters

- Inconsistent business rules: should clearly define whether budget is shared between payments and expenses (likely yes) and unify enforcement.

Strict change recommendations

1. Define a single budget model: budget used by project is shared across payments and expenses and enforcement must be done by `budgetService` (see above).
2. Update both `create` and `update` paths to call `budgetService.attemptAdjust(projectId, deltaPayments, deltaExpenses, session)` inside transaction.

Tests to add/update

- Tests for overpayment/expense combinations, and concurrency where payments+expenses combined exceed budget.

Files to change

- `src/controllers/expensesController.ts`
- `src/services/budgetService.ts`

## src/controllers/importExportController.ts

Findings

- CSV import uses `csv-parser` stream and simply pushes rows to results with no header validation, no strict schema enforcement, no error handling for parse errors, no limit on rows or file size, and no cleanup of uploaded files on disk.
- `importCSV` responds after stream end but does not handle parser `error` event or `fs` stream errors.
- `exportCSV` returns a trivial CSV string; acceptable as placeholder but inconsistent with `exportAll` (which returns JSON).
- Use of `require('../models/Expense').default` in export function — dynamic require.

Why it matters

- Malicious or malformed CSV can crash the service or produce invalid data. Large files can exhaust memory/disk.
- Uploaded temporary files are left on disk (multer stores to uploads/). Tests cleaned the uploads folder but production can accumulate files.

Strict change recommendations

1. Add per-endpoint import limits: maxRows (configurable), maxFileBytes via multer limits, and a CSV parser option controlling max columns and strict quoting.
2. Add explicit header/schema validation. For `importProjects`, require specific headers: e.g., `title,description,client,budget,currency,startDate,endDate,status`. Reject file if headers don't match or run a mapping step with warnings. Use a JSON schema validation for each row (ajv) — generate clear errors per-row and optionally support partial success mode with an explicit parameter (fail-fast vs best-effort).
3. Add robust stream error handling: catch `error` and respond 400 with `CSV_PARSE_ERROR` or 413 for large file.
4. Delete uploaded file (fs.unlink) after processing (in both success and error paths). Consider switching multer to memory storage for small CSVs or to a managed tmp location with automatic cleanup.
5. Add CSV import tests that create files with bad quoting, unexpected headers, binary content and assert deterministic behavior after the schema is enforced.

Files to change

- `src/controllers/importExportController.ts`
- `src/routes/imports.ts` (multer config: set limits and fileFilter)
- `src/tests/importExport*.test.ts` (tighten expectations after changes)

## src/controllers/attachmentsController.ts

Findings

- Uses `path.join('uploads', attachment.filename)` which is relative and can be manipulated if filenames are not sanitized. The application doesn't assert `req.file.filename` is trusted; in addition, `uploads` dir is assumed to be process.cwd() + '/uploads', which is not environment-configurable.
- No attempt to sanitize `originalname` or check `mimetype` beyond what multer might enforce. No streaming of downloads (but res.download is fine) and no content-disposition header standardization.
- File deletion is synchronous `fs.unlinkSync`, which can block the event loop.

Why it matters

- Path traversal and arbitrary writes (if attacker can control `filename`) are security issues. Using synchronous fs in request handlers can degrade performance.
- Hard-coded `uploads` path makes deployment fragile.

Strict change recommendations

1. Centralize upload dir via config env var `UPLOAD_DIR` and use an absolute, resolved path everywhere: `const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'))`.
2. Enforce filename sanitization: either let multer generate a safe filename and do NOT use `originalname` as a filesystem name, or sanitize `originalname` before saving metadata. When saving metadata, store both the sanitized saved filename and originalName (for download filename only).
3. Ensure download path is constrained: resolve the candidate path and ensure it's under UPLOAD_DIR (e.g., `const target = path.resolve(UPLOAD_DIR, attachment.filename); if (!target.startsWith(UPLOAD_DIR)) return 400;`).
4. Use async `fs` calls (promises) and handle errors gracefully. For delete, attempt unlink asynchronously and handle ENOENT as not-an-error.
5. Configure multer at app-level with `limits` (fileSize), `fileFilter` to restrict types, and maxCount where needed. Consider virus scanning step in pipeline for production.
6. Add tests for attempted path traversal, large files, and missing files. Remove `expect([200,201,...])` relaxed expectations — tighten after enforcement.

Files to change

- `src/controllers/attachmentsController.ts`
- `src/middleware/uploadMiddleware.ts` (multer config)
- `src/tests/attachments*.test.ts` (tighten)

## src/controllers/projectsController.ts

Findings

- Good: exposes timeline and stats endpoints, and applies createdBy checks in many places.
- Issues: some `Payment.find`/`Expense.find` calls used in timeline/stats omit `createdBy` scoping which can return data from other users (multi-tenancy bug). Projects are created with multiple fallbacks (title || req.body.name) — inconsistent naming convention.
- Some error messages and codes are inconsistent with other controllers.

Strict change recommendations

1. Ensure all reads filter by `createdBy` where applicable (Payments/Expenses returned for a project must belong to the project and createdBy). Use aggregation pipelines for stats for performance.
2. Normalize project creation input schema. Prefer a single canonical field mapping and reject deprecated fields (or log and map them explicitly with a warning). Document the accepted request shape.
3. Add indexes for fields used in filters and aggregations (project.budget, project.\_id, createdBy).

Files to change

- `src/controllers/projectsController.ts`

## src/controllers/remindersController.ts

Findings

- Uses `(req as any).user.id` while other controllers use `req.userId` — inconsistent user identity shape.
- Many `console.error` calls remain; some responses leak generic messages.

Recommendation

- Consolidate user injection at `authMiddleware` and type definitions.
- Replace console.error with centralized logger (winston/pino) and ensure sensitive info isn't logged.

## src/controllers/categoriesController.ts, sourcesController.ts, clientsController.ts

Findings

- Generally consistent but several endpoints return inconsistent error shapes (`message` vs `error` object).
- `deleteSource` and `deleteCategory` perform soft-delete by setting `isDeleted` but `get` endpoints filter by `isDeleted: false` — good. Ensure soft-delete is applied consistently and that references block deletion.

Recommendations

- Standardize error shape across CRUD controllers.
- Add reference checks for deletion consistently (e.g., prevent deleting a client with projects/payments; ensure same pattern implemented everywhere).

## src/controllers/analyticsController.ts

Findings

- Some endpoints are placeholders. `getDashboardStats` uses array `find` and reduces in memory — for large datasets prefer aggregation pipelines.

Recommendation

- Implement aggregation in DB for production readiness. Add caching support if heavy.

## Routes (detailed)

General patterns

- Validation middleware `validations` is used in many routes, and `validateRequest` ensures request-level validation — good. However, several routes expect different request shapes in controllers (absence of uniform `RequestWithUser` use).
- Multer is configured inline in `src/routes/imports.ts` with `multer({ dest: 'uploads/' })` but lacks `limits` and `fileFilter` — change to a central multer config.
- Routes use `router.use(authMiddleware)` in each file — consider mounting authMiddleware at higher level (app.ts) and only use exceptions for public routes (auth). That avoids duplicated `use` calls and ensures uniform behavior.

Strict change recommendations for routes

1. Move multer config into `src/middleware/uploadMiddleware.ts` with central limits and fileFilter and export `uploadSingle` (already exists but ensure uses app-level config). Validate `file.mimetype` in fileFilter.
2. Standardize route registration order and ensure consistent use of `validateRequest` after validations. Avoid `router.use(authMiddleware)` duplication by mounting guarded routers centrally.
3. Ensure route-level docs/comments match the implemented contract (e.g., `import` router mounted at `/api/import`).

## Tests (detailed)

Findings

- Tests provide valuable coverage and were extended during this work. However:
  - Many negative tests were written to accept multiple possible server responses (e.g., expect one of [200,201,400,422]). This masks the exact behavior and prevents tightening protections.
  - Duplicate setup code found across many tests (register/login/create project). There is a helper `setupTestUserAndProject` in `src/tests/setup.ts` but not used consistently.
  - Filesystem tests rely on hard-coded upload directory relative path. `setup.ts` creates an `uploads` dir in process.cwd() — ok for tests, but production path should be configurable and tests should use per-test temp directories (or inject UPLOAD_DIR to point at test fixtures) to avoid collisions.
  - Some tests use `Date.now()` for uniqueness but still intermix async behaviour that might be brittle under CI.
  - Several tests use `expect([allowed statuses])` to tolerate old/buggy behavior. After controllers are hardened, tests need to be tightened to assert the expected canonical behavior (e.g., missing project should return 400/422, not 201).

Strict change recommendations for tests

1. Create and enforce a test helper library `src/tests/helpers.ts` exposing functions: `createUser`, `loginUser`, `createProjectForUser(token, overrides)`, `uploadFixture(token, path, route)`. Replace duplicated setUp code across tests.
2. Inject `UPLOAD_DIR` for tests using env override to point to an ephemeral temp folder (use `os.tmpdir()` + unique per-test subfolder) and ensure cleanup.
3. Replace relaxed assertions with precise expected status codes in a staged approach: first make controller changes deterministic, then tighten tests. For the audit PR, mark test changes as TODO where immediate change would break functionality. In the PR, implement controller fixes first and then update tests.
4. Remove duplicated test suites that exercise the same flow (e.g., `attachments.test.ts` vs `attachmentsExtra.test.ts`) or extract shared specs into parametrized tests.
5. Add explicit concurrency tests for payments/expenses using Promise.all and ensure deterministic assertions (use retries or transactions to avoid flakes).

## Middleware and helpers

Findings

- `authMiddleware` should check token format, verify signature, check blacklist, and populate `req.userId` consistently.
- There is inconsistent use of `RequestWithUser` type.
- `uploadMiddleware` exists but multer limits and fileFilter need central config.

Strict change recommendations

1. Consolidate auth logic in `authMiddleware`: verify JWT, check blacklist, populate `req.userId` and `req.user` consistently, and export `RequestWithUser` type. Replace all `(req as any).userId` usages with typed `req.userId`.
2. Create `utils/respond.ts` containing `respondSuccess` and `respondError` helpers to standardize response payloads and codes.
3. Migrate multer configuration into `src/middleware/uploadMiddleware.ts` with sensible defaults and env-configurable limits.

## Cross-cutting & infra

- Add environment-config validation (e.g., using `envalid` or `dotenv-safe`) to ensure `JWT_SECRET`, `UPLOAD_DIR`, and token blacklist backend settings are present for production deployments.
- Add CI checks: `npm run lint`, `npm test -- --coverage`, and a coverage threshold (e.g., 80%).

## PR content and verification checklist (strict)

When implementing the recommended changes, split into small commits: (a) API contract + helpers, (b) auth & blacklist, (c) upload/multer centralization, (d) budgetService + payments/expenses changes + concurrency tests, (e) import CSV hardening + tests, (f) test cleanup and tightening.

Verification steps per PR

- Run full test suite in CI; tests should be deterministic and not use "multi-accepted-status" patterns.
- New integration tests for concurrency must be added and pass reliably.
- Run lint and typecheck (`npx tsc --noEmit`).
- Validate upload dir is configurable and tests override `UPLOAD_DIR`.

## Appendix: Per-file quick checklist

(Only files in `src/controllers` and `src/routes` were fully inspected.)

Controllers

- usersController.ts
  - [ ] Standardize auth usage (use `req.userId` typed)
  - [ ] Standardize error response helper
- sourcesController.ts
  - [ ] Return consistent error shapes
  - [ ] Consider reference checks before deletion
- settingsController.ts
  - [ ] Consistent auth shape
  - [ ] Use respond helpers
- remindersController.ts
  - [ ] Replace `(req as any).user.id` with `req.userId`
  - [ ] Remove console.error and use logger
- projectsController.ts
  - [ ] Ensure all payments/expenses queries are `createdBy` scoped
  - [ ] Use aggregation pipelines for stats
- paymentsController.ts
  - [ ] Move budget checks into `budgetService` with transactions
  - [ ] Scope queries by `createdBy`
  - [ ] Avoid dynamic require for Milestone
- milestonesController.ts
  - [ ] Consolidate duplicated handlers and ensure consistent validation
- importExportController.ts
  - [ ] Add parse error handling, file size and row limits, header validation, and cleanup
- expensesController.ts
  - [ ] Same as payments: centralize budget logic
- clientsController.ts
  - [ ] Keep reference checks; ensure consistent error shapes
- categoriesController.ts
  - [ ] Keep reference checks; consistent error shapes
- authController.ts
  - [ ] Separate refresh tokens, check blacklist, centralize token issuance, make blacklist pluggable
- attachmentsController.ts
  - [ ] Use `UPLOAD_DIR`, sanitize names, protect path traversal, async fs usage
- analyticsController.ts
  - [ ] Use DB aggregation

Routes

- auth.ts: OK but update refresh semantics
- projects.ts: OK — ensure controllers align with route validations
- projectMilestones.ts / milestones.ts: combine duplicate validation patterns
- payments.ts / expenses.ts: ensure validations match controller constraints
- imports.ts: centralize multer config and set limits
- attachments.ts: ensure middleware uses central upload middleware and `ensureFile` exists and is robust

Tests

- Consolidate helpers in `src/tests/helpers.ts`
- Remove multi-status expectations after fixes
- Use ephemeral upload dirs per test run
- Add concurrency tests and targeted negative tests

If you want, I will now:

- produce a change plan with concrete patch-level edits for the highest-priority items (auth blacklist + authMiddleware, upload middleware + attachmentsController hardening, and budgetService with payments/expenses transaction-safe enforcement), including the exact file changes and tests to add; or
- generate a ready-to-apply patch for a single priority (pick: auth hardening or upload hardening or budget transactional enforcement).

Which one should I start implementing first? (I won't make any code changes until you confirm one of the priorities above.)

---

Notes:

- I avoided changing code automatically in this pass because you asked for a strict audit and recommendations. Implementation touches (especially budget transactions and token rework) are medium-risk and should be done in small commits with tests.
- I can also convert this document into a markdown file in repo (already created as `docs/AUDIT_DETAILED.md`). Please tell me if you'd like the audit expanded to include models and middleware files as well (I can read and append those).
