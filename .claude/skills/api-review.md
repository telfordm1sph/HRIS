---
name: api-review
description: Review an API controller, route, or service method in this HRIS project against project conventions — checks auth, rate limiting, DB connections, response envelope, and test coverage. Use when you've just written an API endpoint and want a quality check.
user-invocable: true
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
---

# /api-review — API Endpoint Review

Arguments: `$ARGUMENTS`

You are reviewing an API endpoint (or a set of files) in this Laravel 12 HRIS project for correctness, security, and adherence to project conventions.

---

## Step 1 — Identify what to review

From `$ARGUMENTS`:
- If a file path is given, read that file.
- If a route or method name is given, locate it with Grep then read the relevant files.
- If no arguments, ask the user which endpoint or file to review.

---

## Step 2 — Read the files

Read all relevant files for the endpoint:
- The route definition (in `routes/api/employeeApi.php` or similar)
- The controller method
- The service method
- The FormRequest (if any)
- The Pest test (if any, under `tests/Feature/Api/`)

Also read `app/Http/RateLimiters.php` and `app/Http/Middleware/AuthMiddleware.php` for reference.

---

## Step 3 — Apply the review checklist

For each item below, report **Pass**, **Fail**, or **N/A** with a brief explanation:

### Security
- [ ] `AuthMiddleware::class` is applied to the route
- [ ] No sensitive data (passwords, tokens, full PII) exposed in the response
- [ ] Input validation via FormRequest (not inline) for write endpoints

### Rate Limiting
- [ ] A `throttle:` middleware is applied
- [ ] The rate limiter key is appropriate (`emp_id` from session, not just IP)
- [ ] The limiter name matches one defined in `app/Http/RateLimiters.php`

### Database
- [ ] Correct `$connection` specified on models touching `masterlist` or `authify` DBs
- [ ] No raw SQL without parameter binding
- [ ] No N+1 queries (eager-load relations where needed)

### Response Shape
- [ ] All responses follow `{ success: bool, data: ..., message: string }` envelope
- [ ] Correct HTTP status codes used (200, 201, 404, 422, 429, 500)
- [ ] No Inertia response patterns (`back()`, `Inertia::render()`) in API controllers

### Architecture
- [ ] No business logic in the controller — delegated to service
- [ ] Service returns the standard envelope array
- [ ] Route added to the correct route file

### Tests
- [ ] Pest test exists for the endpoint
- [ ] Happy path covered
- [ ] 404 / error path covered
- [ ] Test uses SQLite in-memory (no real DB calls)

---

## Step 4 — Report findings

Format the output as:

**Route:** `GET /api/employees/{id}`
**Files reviewed:** list of paths

Then a table:

| Check | Result | Notes |
|-------|--------|-------|
| Auth middleware | Pass | AuthMiddleware applied |
| Rate limiter | Fail | No throttle middleware on route |
| DB connection | Pass | masterlist connection set on model |
| ... | ... | ... |

**Summary:** X passed, Y failed, Z N/A

If any items **Fail**, provide the specific fix needed with a code snippet.
