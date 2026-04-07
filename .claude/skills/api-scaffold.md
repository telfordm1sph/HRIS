---
name: api-scaffold
description: Scaffold a new API endpoint for this HRIS project — creates the route, controller method, service method, FormRequest, and Pest test. Use when adding a new API route to routes/api/employeeApi.php or a new api route file.
user-invocable: true
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---

# /api-scaffold — Scaffold a New HRIS API Endpoint

Arguments: `$ARGUMENTS`

You are scaffolding a new API endpoint for this Laravel 12 HRIS project. Follow the project's established patterns exactly. Do not deviate from conventions already present in the codebase.

---

## Step 1 — Parse the request

Extract from `$ARGUMENTS`:
- **Resource**: what entity is being exposed (e.g. `employee`, `department`, `change-request`)
- **Action**: what the endpoint does (e.g. `list`, `show`, `store`, `update`, `destroy`, or a custom name)
- **HTTP method**: GET / POST / PUT / PATCH / DELETE (infer from action if not given)
- **Route path**: e.g. `/employees/{id}/attachments`

If any of these are missing or ambiguous, ask the user before proceeding.

---

## Step 2 — Read existing patterns

Before writing any code, read these files to match existing style exactly:
- `app/Http/Controllers/Api/EmployeeController.php`
- `routes/api/employeeApi.php`
- `app/Services/EmployeeService.php` (or the relevant service if it exists)
- `app/Http/RateLimiters.php`

---

## Step 3 — Plan the files to create/edit

Determine which files need to change:

| File | Action |
|------|--------|
| `routes/api/employeeApi.php` (or new versioned file) | Add route |
| `app/Http/Controllers/Api/{Resource}Controller.php` | Add method or create file |
| `app/Services/{Resource}Service.php` | Add method or create file |
| `app/Http/Requests/Api/{Action}{Resource}Request.php` | Create FormRequest (for POST/PUT/PATCH only) |
| `tests/Feature/Api/{Resource}/{Action}Test.php` | Create Pest test |

---

## Step 4 — Write the code

### Route
Add to the correct route file inside the appropriate middleware group:
```php
Route::middleware([AuthMiddleware::class, 'throttle:api-reads'])->group(function () {
    Route::get('/resource/{id}', [ResourceController::class, 'method']);
});
```
- GET endpoints: use `throttle:api-reads` (60/min)
- Write endpoints: define a new rate limiter in `app/Http/RateLimiters.php` if none fits

### Controller method
```php
public function methodName(int $id): JsonResponse
{
    $result = $this->service->methodName($id);

    if (!$result['success']) {
        return response()->json($result, 404);
    }

    return response()->json($result);
}
```
- Inject the service via constructor
- Return `JsonResponse` always (never Inertia responses)
- No business logic in controller — delegate to service

### JSON response envelope (always return this shape)
```json
{ "success": true, "data": {}, "message": "..." }
```
Error:
```json
{ "success": false, "message": "...", "errors": {} }
```

### Service method
- Put all business logic here
- Always specify `$connection` when querying non-default DB (`masterlist`, `authify`)
- Return the standard envelope array: `['success' => true, 'data' => ..., 'message' => '...']`

### FormRequest (write endpoints only)
```php
namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreResourceRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'field' => ['required', 'string', 'max:255'],
        ];
    }
}
```

### Pest test
```php
use function Pest\Laravel\{getJson, postJson};

describe('GET /api/resource/{id}', function () {
    it('returns the resource for a valid id', function () {
        // Arrange: seed minimal data
        // Act
        $response = getJson('/api/resource/1?key=test-token');
        // Assert
        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['id', 'name']]);
    });

    it('returns 404 for unknown id', function () {
        $response = getJson('/api/resource/9999?key=test-token');
        $response->assertNotFound()
            ->assertJsonPath('success', false);
    });
});
```

---

## Step 5 — Self-verification checklist

Before presenting the code, verify:
- [ ] Correct DB `$connection` on all models touching non-default DBs
- [ ] Auth middleware applied (`AuthMiddleware::class`)
- [ ] Rate limiter applied to the route group
- [ ] No inline `$request->validate()` — FormRequest class used for write endpoints
- [ ] Response follows `{ success, data, message }` envelope
- [ ] No business logic in controller
- [ ] Route added to correct route file
- [ ] No Inertia return types mixed in
- [ ] Pest test covers happy path and 404

---

## Step 6 — Present the output

Show each file in a code block labelled with its path. After all files, list:
- The exact route that was added
- The rate limiter applied
- Any new DB connections used
