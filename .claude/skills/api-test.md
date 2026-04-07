---
name: api-test
description: Generate Pest PHP tests for an HRIS API endpoint. Use when you need to write tests for an existing or newly created API route in this project.
user-invocable: true
allowed-tools:
  - Read
  - Glob
  - Grep
  - Write
  - Bash
---

# /api-test — Generate Pest Tests for an API Endpoint

Arguments: `$ARGUMENTS`

You are generating Pest PHP v3 tests for an API endpoint in this Laravel 12 HRIS project. Tests use SQLite in-memory and follow the conventions in `phpunit.xml`.

---

## Step 1 — Identify the endpoint

From `$ARGUMENTS`:
- Parse the route or controller method to test (e.g. `GET /api/employees/{id}` or `EmployeeController@show`)
- If not given, ask the user which endpoint to test

---

## Step 2 — Read the implementation

Read:
- The controller method
- The service method it calls
- The route definition (middleware, rate limiter)
- Any existing test in `tests/Feature/Api/` for this resource (to avoid duplication)
- `phpunit.xml` for test DB configuration

---

## Step 3 — Identify all test cases

For a GET endpoint, typical cases:
1. Happy path — valid ID, returns 200 with correct envelope and structure
2. Not found — unknown ID, returns 404 with `success: false`
3. Unauthenticated — missing token, redirects or returns 401/403
4. Rate limited — if a throttle is applied, test the 429 response (optional)

For POST/PUT endpoints, add:
5. Validation failure — missing required fields, returns 422 with `errors`
6. Success — valid payload, returns 200/201 with envelope

---

## Step 4 — Write the tests

File location: `tests/Feature/Api/{Resource}/{MethodName}Test.php`

Template:
```php
<?php

use App\Models\EmployeeDetail; // adjust to relevant model
use function Pest\Laravel\{getJson, postJson};

describe('GET /api/employees/{id}', function () {

    beforeEach(function () {
        // Seed any data the endpoint needs
        // Use the test DB connection (SQLite in-memory via phpunit.xml)
    });

    it('returns employee data for a valid id', function () {
        $response = getJson('/HRIS/api/employees/1?key=test-token');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'emp_id',
                    'first_name',
                    'last_name',
                ],
                'message',
            ]);
    });

    it('returns 404 for an unknown employee id', function () {
        $response = getJson('/HRIS/api/employees/99999?key=test-token');

        $response->assertNotFound()
            ->assertJsonPath('success', false);
    });

    it('redirects unauthenticated requests', function () {
        // No ?key param and no cookie/session
        $response = getJson('/HRIS/api/employees/1');

        // AuthMiddleware redirects to SSO login
        $response->assertRedirect();
    });

});
```

### Important conventions
- **Token auth in tests**: Pass `?key=test-token` and seed a matching `authify_sessions` row, OR mock `AuthMiddleware` in a test-only service provider
- **Route prefix**: Routes are prefixed `/HRIS` — check `routes/web.php` or `RouteServiceProvider` to confirm
- **DB connections**: In tests, the `masterlist` and `hris` connections both point to SQLite in-memory — check `phpunit.xml`
- **No mocking the DB**: Integration tests hit the real (test) database — do not mock Eloquent models
- **Assertions**: Prefer `assertJsonPath()` for specific fields, `assertJsonStructure()` for shape

---

## Step 5 — Present the output

Show the complete test file in a code block labelled with its path. List all test cases covered and any setup assumptions (e.g. "assumes `authify_sessions` can be seeded in tests").

If the test requires changes to `phpunit.xml` or test helpers, call them out explicitly.
