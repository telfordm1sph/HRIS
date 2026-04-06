# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start full development environment (Laravel + queue listener + Vite concurrently)
composer run dev

# Run tests (clears config cache first)
composer run test

# Frontend only
npm run dev
npm run build
```

## Architecture Overview

**Stack:** Laravel 12 + React 18 + Inertia.js v2 (SPA bridge), Vite, Tailwind CSS + DaisyUI + Shadcn/ui

### Request Lifecycle
```
Request → Middleware → Controller → Service → Repository → Database
```

### Multi-Database Design
Three separate MySQL databases with explicit connection routing:
- **`masterlist`** — Source-of-truth employee data (read-heavy). All employee profiles, work details, family relations, government IDs. Models: `EmployeeDetail`, `EmployeeWorkDetail`, family/address models.
- **`hris`** (default `mysql` connection) — Operational data (write-heavy). `EmployeeChangeRequest` (pending/approved/rejected/cancelled), `EmployeeAttachment` (file metadata).
- **`authify`** — SSO token validation only (read-only). `authify_sessions` table checked by `AuthMiddleware`.

### Authentication (SSO)
`AuthMiddleware` intercepts all protected routes. It checks for a token via query param `?key` → cookie → session, then validates against `authify_sessions` in the Authify DB. On success, it sets session variables (`emp_id`, `emp_name`, `dept`, etc.). No token redirects to the Authify SSO server at `http://127.0.0.1:8001/login`.

Frontend stores the token in `localStorage` as `authify-token`. Inertia's `HandleInertiaRequests` middleware injects `emp_data` as a shared prop.

### Change Request Workflow
1. Employee selects a category → modal pre-fills current values from masterlist
2. Employee submits → any existing `pending` request for the same category is auto-cancelled
3. HR reviews on `ChangeRequests/Index` page
4. Approval triggers `ApplyChangeRequest` action — runs a cross-DB transaction writing new values to the appropriate `masterlist` table(s)

10 change categories: `name`, `civil_status`, `address`, `education`, `father`, `mother`, `spouse`, `children`, `siblings`, `others`

### Inertia Lazy Loading
Two props on the employee show page are lazy-loaded (not sent on initial request):
- `attachments` — loaded on first Files tab click
- `activeEmployees` — loaded when the employee combobox opens

### File Storage
Files are stored on a private (non-public) disk and served through `AttachmentController@view` with correct MIME types. Files are only deleted when no active change request references them.

### Rate Limiting
Keyed by `emp_id` from session (falls back to IP). Four rate limiters defined in `RateLimiters.php`: API reads (60/min), CR submission (20/min), CR review (30/min), file uploads (10/min).

## Key File Locations

| Concern | Path |
|---|---|
| SSO auth middleware | `app/Http/Middleware/AuthMiddleware.php` |
| Inertia shared props | `app/Http/Middleware/HandleInertiaRequests.php` |
| Change request approval | `app/Actions/ApplyChangeRequest.php` |
| Rate limiter setup | `app/Http/RateLimiters.php` + `app/Providers/AppServiceProvider.php` |
| Route files | `routes/web.php`, `routes/general.php`, `routes/employee.php`, `routes/api/employeeApi.php` |
| Frontend entry | `resources/js/app.jsx` |
| Page components | `resources/js/Pages/` |
| Reusable components | `resources/js/Components/` |

## Testing

Uses Pest PHP v3 with SQLite in-memory (`:memory:`) for the test database. Test-specific env vars are defined in `phpunit.xml`. Tests live in `tests/Feature/` and `tests/Unit/`.

```bash
# Run a single test file
php artisan test --filter=TestClassName
```
