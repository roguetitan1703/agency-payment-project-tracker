# Final Proposal — Routes & Controllers Consolidation

Date: 2025-10-26 (updated: 2025-10-26)
Owner: Engineering (audit + implementation)

## Purpose (short)

This document is the authoritative, file-level audit and remediation proposal after a full read of all test files under `src/tests` and all controller files under `src/controllers`.
It contains: 1) consolidated findings, 2) per-file observations, 3) an exhaustive list of proposed negative tests and expansions, 4) concrete controller/code fixes, and 5) the exact next steps I can implement.

I read every test and controller in the repo before writing this — findings below include every gap and brittle spot discovered during that pass.

## High-level summary (one-liner)

- Validation centralized (helpers added), attachments consolidated, token-blacklist abstraction created; remaining work: add missing negative tests, tighten upload/MIME policy, ensure blacklist persistence in production, and harden a few controller edges.

## Files I read (complete)

Tests (all):

- `src/tests/setup.ts`
- `src/tests/auth.test.ts`
- `src/tests/authFlows.test.ts`
- `src/tests/validationFailures.test.ts`
- `src/tests/users.test.ts`
- `src/tests/sources.test.ts`
- `src/tests/settings.test.ts`
- `src/tests/projects.test.ts`
- `src/tests/payments.test.ts`
- `src/tests/milestones.test.ts`
- `src/tests/importExport.test.ts`
- `src/tests/importExportNegative.test.ts`
- `src/tests/expenses.test.ts`
- `src/tests/edgeCases.test.ts`
- `src/tests/clients.test.ts`
- `src/tests/categories.test.ts`
- `src/tests/businessRules.test.ts`
- `src/tests/attachments.test.ts`
- `src/tests/attachmentsExtra.test.ts`
- `src/tests/analytics.test.ts`

Controllers (all):

- `src/controllers/authController.ts`
- `src/controllers/clientsController.ts`
- `src/controllers/categoriesController.ts`
- `src/controllers/attachmentsController.ts`
- `src/controllers/expensesController.ts`
- `src/controllers/paymentsController.ts`
- `src/controllers/projectsController.ts`
- `src/controllers/milestonesController.ts`
- `src/controllers/importExportController.ts`
- `src/controllers/analyticsController.ts`
- `src/controllers/usersController.ts`
- `src/controllers/sourcesController.ts`
- `src/controllers/settingsController.ts`
- `src/controllers/remindersController.ts`

## Consolidated findings (actions & explanations)

1. Tests coverage gaps and brittle patterns (concrete)

- Many endpoints have happy-path tests but missing negative/validation tests. Specific gaps:
  - Auth: refresh and logout flows are present in a test file, but we must expand negatives (expired token, invalid token) and assert blacklist behavior precisely.
  - Attachments: upload/list happy-path tests exist; missing stronger negatives (missing file, forbidden MIME, download after delete) and stronger assertions about `Content-Type` when downloading.
  - Import/Export: uses `.ts` as fixtures and the tests accept too many status codes; add invalid CSV and partial-row tests and codify the expected semantics (skip/abort).
  - Validation-negatives: there are some validation tests (`validationFailures.test.ts`) but more are needed across endpoints (clients/projects/payments/expenses/milestones) and for param vs body vs query.
  - Security: tests should assert sensitive fields are not returned (e.g., `password`), ensure tokens are present but not raw secrets, and that protected routes honor blacklisting.

2. Controller & implementation issues found (concrete)

- `authController.ts`:

  - logout stores the token via `tokenBlacklist.add(token)` (good). `isBlacklisted` currently proxies `tokenBlacklist.has(token)` — ensure this returns/exports an async function if `has` is async. Tests and `authMiddleware` must await blacklist checks.
  - `refresh` uses jwt.verify(..., { ignoreExpiration: true }) and re-issues a token — acceptable, but tests must assert refreshed token is valid and that old token is not implicitly invalidated unless logout is called.

- `attachmentsController.ts`:

  - downloadAttachment builds paths with `path.join('uploads', filename)` and checks fs.existsSync; tests rely on the 'uploads' folder and on multer writing files there. Ensure test runner creates the uploads dir or the upload middleware writes to a tmp folder and tests assert accordingly.
  - Deleting attachment removes DB doc and unlinks file using `fs.unlinkSync` — this is fine for tests but add guards to handle missing files gracefully (already present but tests should cover both paths).

- `importExportController.ts`:

  - Streaming CSV parsing is implemented but error handling is minimal (no `.on('error')` listeners). For robustness, add error handling and guard against malicious file sizes / malformed CSV rows.
  - Tests use `setup.ts` (a TypeScript file) as a fixture. Replace test fixtures with small `.csv`/`.txt`/`.json` samples and tighten test assertions.

- `paymentsController.ts` / `expensesController.ts`:

  - Both enforce budget rules. They compute totals by querying DB and checking sums. Race conditions are accounted for: controllers attempt to rollback or restore on post-save violations — keep these checks and add tests that attempt concurrent writes to validate the rollback path.
  - Ensure numeric type coercion (Number(...)) is consistent and that amounts with decimals are supported (tests exist for decimal amounts but assert behavior; keep them).

- `milestonesController.ts` / `projectsController.ts`:
  - When creating/updating milestones the code warns if the sum of milestone amounts doesn't match project budget. Tests already assert warning messages in some cases — keep and expand tests to check the warning string presence/absence.

3. Test hygiene issues (concrete)

- Several tests accept multiple status codes (e.g., `[200, 201]`, `[401, 404]`). This hides regressions. Convert to exact expectations where the controller behavior is known.
- Some test files use static emails (e.g., `sourceuser@example.com`, `categoryuser@example.com`). Change them to unique per-test emails (timestamp + random) for safe parallelization.
- Tests that upload files use `src/tests/setup.ts` as a fixture (`.ts` file). Replace those with small `.txt`/`.csv` fixture files and update the upload middleware MIME whitelist accordingly.

4. Operational hardening

- Token blacklist must have a production-ready implementation (Redis recommended). Keep in-memory for tests and local dev; make Redis optional via `TOKEN_BLACKLIST_STORE` env var.
- Upload directory handling should use a well-known temp/upload path (configurable via env var) and be created during test setup.

## Per-test-file audit (notes + proposed expansions)

- `src/tests/setup.ts`

  - Good: provides MongoMemoryServer lifecycle and `setupTestUserAndProject()` helper. Confirm it creates `uploads/` dir when running attachment tests (it currently does not). Add a small `beforeAll` helper to ensure upload dir exists and is cleaned between runs.

- `src/tests/auth.test.ts`

  - Good: happy-path register/login. Gaps: no assertion that `password` is omitted from returned user, no negative login tests.
  - Proposed: assert `res.body.data.user.password` is undefined; add tests for wrong password / missing fields.

- `src/tests/authFlows.test.ts`

  - Present: refresh + logout happy path. Expand: assert refreshed token is different, assert new token decodes to same user id, negative: expired token, invalid token, logout + attempt to use token fails.

- `src/tests/validationFailures.test.ts`

  - Good initial negatives. Expand: add malformed `id` in URL param tests (e.g., GET /api/projects/not-an-id), invalid query param (startDate not ISO), invalid enum values (milestone status).

- `src/tests/users.test.ts`

  - Good: asserts `password` omitted. Add: assert `email` normalization, test `me` endpoint with blacklisted token.

- `src/tests/sources.test.ts`

  - Good CRUD coverage. Add: test create with missing required name -> 400; test permissions (another user cannot see someone's source).

- `src/tests/settings.test.ts`

  - Good. Add: test validation of settings payload shape (reject unknown keys if you plan to enforce schema).

- `src/tests/projects.test.ts`

  - Extensive. Fix: avoid multi-status assertions where not needed. Add: negative for creating project with nonexistent client id (404), and protected route checks when token blacklisted.

- `src/tests/payments.test.ts` & `src/tests/expenses.test.ts`

  - Good coverage for create/list/update/delete. Add: negative tests for zero/negative amounts (some exist in `edgeCases.test.ts`), concurrent payments race test already exists (good) — add an explicit test for rollback path: attempt two concurrent payments that together exceed budget and assert at most one committed.

- `src/tests/milestones.test.ts`

  - Good coverage including auto-complete milestone when payment matches amount. Add: negative for invalid `dueDate` and invalid `projectId` param types.

- `src/tests/importExport.test.ts` & `importExportNegative.test.ts`

  - Replace `.ts` fixtures with `.csv` fixtures in tests. Add strict assertions: for invalid CSV format expect 400 with `error.code: 'INVALID_CSV'` (or agreed semantics), for partial rows expect `data.rows` and `data.errors` arrays.

- `src/tests/edgeCases.test.ts` & `businessRules.test.ts`

  - Good: contain overpayment and concurrency tests. Keep concurrency tests, but add more assertions to ensure DB state (sums) are consistent. Add simulated `Promise.all` race with delays to reproduce potential race windows.

- `src/tests/attachments.test.ts` & `attachmentsExtra.test.ts`

  - Change fixtures to `.txt`. Add explicit tests:
    - upload without file -> 400
    - upload with disallowed MIME -> 415 (if you choose to return 415)
    - download returns proper `Content-Type` matching the saved mimetype
    - download after delete -> 404

- `src/tests/analytics.test.ts`
  - Placeholder-like endpoints return empty data. Add tests that verify the returned aggregates reflect created payments/expenses when data is present.

## Exhaustive proposed negative tests (copy-ready list)

Below is a precise list of negative tests to add. Each item is one test case (endpoint, request, expected status & partial assertions). I will add these to new test files unless you want them merged into existing suites.

1. Auth

- POST /api/auth/register with missing email -> 400 (VALIDATION_ERROR)
- POST /api/auth/login with wrong password -> 401 (UNAUTHORIZED)
- POST /api/auth/refresh with malformed token -> 400
- POST /api/auth/refresh with expired token -> 401 or 400 (decide semantics) — assert error code.
- POST /api/auth/logout then GET /api/users/me with same token -> 401 (token blacklisted)

2. Projects / Clients

- POST /api/projects without title -> 400 (VALIDATION_ERROR)
- POST /api/projects with client set to non-objectId -> 400
- POST /api/projects with client objectId that does not exist -> 404 (CLIENT_NOT_FOUND)
- DELETE /api/clients/:id when client has projects -> 400 CLIENT_DELETE_BLOCKED

3. Payments / Expenses

- POST /api/payments with project='not-an-id' -> 400
- POST /api/payments with amount=0 or negative -> 400 (INVALID_AMOUNT)
- POST /api/expenses with invalid date -> 400
- PATCH /api/payments/:id update amount to negative -> 400
- Concurrency: two concurrent POST /api/payments that together exceed budget -> assert total <= budget and at least one request returns 400

4. Milestones

- POST /api/projects/:projectId/milestones with invalid projectId type -> 400
- POST with dueDate not ISO -> 400
- PATCH /api/milestones/:id with invalid status value -> 400 (VALIDATION_ERROR)

5. Attachments

- POST /api/attachments/projects/:projectId with no `file` -> 400 (NO_FILE)
- POST with disallowed mime -> 415 (or 400 depending on policy)
- GET /api/attachments/:id/download when file missing in FS -> 404 (FILE_MISSING)
- GET /api/attachments/:id/download after delete -> 404

6. Import/Export

- POST /api/import/csv with non-CSV file -> 400 (INVALID_CSV)
- POST /api/import/projects with a CSV containing invalid rows -> expect `data.rows` and `data.errors` with counts; if you prefer fail-fast change assertion accordingly

7. General validation

- Any endpoint with an `_id` param passed as `abcd` (not an objectId) -> 400 and `errors` response

## Controller-level code changes I recommend (concrete diffs)

1. authController

- Ensure `isBlacklisted` is exported as async if underlying `tokenBlacklist.has()` returns a Promise. Example change:
  - export const isBlacklisted = async (token: string) => await tokenBlacklist.has(token);

2. authMiddleware

- Ensure it `await`s blacklist checks and returns standardized error payloads (`INVALID_TOKEN` / `UNAUTHORIZED`). (I observed middleware was updated earlier; verify it awaits `has` everywhere.)

3. attachmentsController

- Add `fs` error handlers around unlink and use configurable `UPLOAD_DIR` (env var). Ensure tests create/clean that directory. Example: `const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')`.

4. importExportController

- Add `.on('error', ...)` handlers to the CSV stream and validate row shape. Return `INVALID_CSV` on parse errors.

5. payments/expenses race handling

- Keep existing post-save total check and rollback, but centralize that logic into a small helper with retries (optional). Add tests that intentionally try to break the race and assert the DB remains consistent.

## Tests logic changes / conventions to apply across the suite

- All tests must use unique emails: `${Date.now()}${Math.random().toString(36).slice(2)}@example.com`.
- Avoid permissive multi-status assertions unless the controller intentionally supports multiple valid responses; prefer one expected status and update controllers if they must be flexible.
- Replace `.ts` upload fixtures with `.txt`/`.csv` in `src/tests/fixtures/` and reference them from tests.
- Add `uploads` directory management in `setup.ts`: create beforeAll and clean afterEach.
- Add helper to decode JWT and assert `sub`/`id` claim if you want to check token contents in tests.

## Implementation steps I will perform if you ask me to (in order)

1. Add/expand negative tests listed above (create new test files where appropriate). This will include changing fixtures to `.txt` and adding upload dir handling in `setup.ts`.
2. Update `authController.isBlacklisted` to be async (if needed) and verify `authMiddleware` awaits checks.
3. Add CSV parse error handling in `importExportController` and adjust tests accordingly.
4. Run the full test suite, fix any failing expectations, and report results.

If you want, I can implement all of the above now (start with the test additions and the small controller fixes). Pick one of the following:

- Option A (recommended): implement validation-negative tests + authFlows negatives + attachments download/delete tests + fixture updates.
- Option B: Option A + implement Redis-backed tokenBlacklist (requires adding `ioredis` and configuration, larger change).
- Option C: Only create a PR-ready patch containing the new/updated tests and doc changes for you to review before merging.

## Final notes & verification plan

- After implementing the tests and small controller fixes I will run:

```powershell
npm test -- --runInBand --silent
```

````

- I will report the test pass/fail summary, and if any tests fail I will fix small issues (up to 3 quick iterations) and re-run. If a failing test exposes a larger design choice (e.g., what to return on invalid CSV) I will stop and ask for the desired semantics.

---

End of enhanced proposal (I read every file and included the per-file findings + exhaustive negative-test plan).

If you want me to proceed, tell me which Option (A/B/C) to execute and I will: update the todo list status, apply the test/controller edits, run tests, and report back.

```
  const login = await request(app)
```
````
