# HRIS — Human Resources Information System

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Tech Stack](#2-tech-stack)
3. [Feature Breakdown](#3-feature-breakdown)
4. [Architecture](#4-architecture)
5. [Database Connections & Models](#5-database-connections--models)
6. [Laravel Routes & Controllers](#6-laravel-routes--controllers)
7. [React Component Structure](#7-react-component-structure)
8. [Authentication Flow (SSO)](#8-authentication-flow-sso)
9. [Rate Limiting](#9-rate-limiting)
10. [Local Setup](#10-local-setup)

---

## 1. System Overview

HRIS is a web application for managing employee profiles, processing personal data change requests, and storing employee attachments (documents/images). It integrates with an existing SSO (Single Sign-On) system called **Authify** so employees log in with their existing company credentials — no separate account management.

The system has two main roles:

- **Employee** — views their own profile, submits change requests, and uploads supporting documents.
- **HR / Admin** — reviews all submitted change requests, approves or rejects them, which then writes the approved change back to the masterlist database automatically.

---

## 2. Tech Stack

### Backend

| Layer | Technology |
|---|---|
| Framework | Laravel 12 |
| PHP | 8.2+ |
| SPA Bridge | Inertia.js v2 (server-side rendering of initial props) |
| Authentication | Custom `AuthMiddleware` (SSO via Authify DB) |
| Architecture | Repository → Service → Controller |

### Frontend

| Layer | Technology |
|---|---|
| UI Framework | React 18 |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS v3 + DaisyUI v5 |
| UI Components | Radix UI (headless primitives) + shadcn/ui wrappers |
| Icons | Lucide React |
| Notifications | Sonner (toasts) |
| Forms | React Hook Form |
| State (global) | Zustand |
| Theming | next-themes (dark/light mode) |
| Charts | Chart.js + react-chartjs-2 |
| Tables | Tabulator |

### Infrastructure

| Concern | Detail |
|---|---|
| Primary DB | MySQL — `mysql` connection (HRIS operational data) |
| Employee DB | MySQL — `masterlist` connection (source of truth for employee records) |
| SSO DB | MySQL — `authify` connection (token validation) |
| File storage | Laravel `private` disk (local, not publicly accessible) |
| Session | Laravel session (cookie-based, encrypted) |

---

## 3. Feature Breakdown

### 3.1 Employee Profile Viewer

Accessed at `/{APP_NAME}/employees/{employid}`.

Displays a three-tab profile page:

**Personal Tab**
- Full name, nickname, birthday, place of birth, sex (Male/Female display), civil status, religion, contact number, email, height, weight, blood type, educational attainment
- Address records (multiple), government IDs (SSS, PhilHealth, Pag-IBIG, TIN)
- Family: father, mother, spouse, children, siblings

**Work Tab**
- Department, job title, production line, station, position, employment status, classification, shift type, shuttle assignment
- Date hired, date regularized, service length
- Approver assignment

**Files Tab**
- Lazy-loaded on first tab click (Inertia partial reload)
- Grid of attached documents/images with thumbnail preview
- Images render inline; non-images show a file-type badge (PDF, DOCX, etc.)
- Clicking any card opens the file in a new tab

### 3.2 Change Requests

Employees submit a change request for one of 10 categories. The old value is snapshot at submission time. HR reviews the queue and approves or rejects. On approval, the system automatically writes the new value back to the masterlist database.

**Categories:**

| Key | Label | Attachment Required |
|---|---|---|
| `name` | Name | Yes |
| `civil_status` | Civil Status | Yes |
| `address` | Address | No |
| `education` | Education | Yes |
| `father` | Father | No |
| `mother` | Mother | No |
| `spouse` | Spouse | Yes |
| `children` | Children | No |
| `siblings` | Siblings | No |
| `others` | Others (shuttle, blood type, etc.) | No |

**Workflow:**
1. Employee opens the Edit dropdown on any section and picks a category.
2. A modal pre-fills the current values. Employee edits and attaches supporting documents (required for some categories).
3. On submit, any existing pending request for the same category is automatically cancelled.
4. HR sees all pending requests on the Change Requests page.
5. HR approves or rejects with optional remarks.
6. On approval, `ApplyChangeRequest` action runs inside a `masterlist` DB transaction and writes the new value to the correct tables.

### 3.3 Attachment Management

- Files are uploaded to a private (non-public) Laravel disk.
- Each file is served through `AttachmentController@view` which reads from disk and streams with the correct Content-Type header.
- Attachments belong to an employee and can optionally be linked to a change request.
- The Files tab in the profile displays all attachments for that employee.
- Safe delete: a file is only removed from disk if no active change request references it.

---

## 4. Architecture

### Repository → Service → Controller Pattern

```
Request
  └── Controller          (HTTP layer: validate input, return response)
        └── Service       (Business logic: orchestrate, transform)
              └── Repository  (Data access: DB queries only)
```

All data access goes through a repository. Services contain business logic and transformations. Controllers only handle HTTP concerns (input parsing, response format).

### Dual Database Design

```
masterlist DB   ←→   EmployeeDetail, EmployeeWorkDetail, Shuttle, etc.
                       (source-of-truth employee records, read-heavy)

mysql (hris) DB ←→   EmployeeChangeRequest, EmployeeAttachment
                       (HRIS operational data, write-heavy)

authify DB      ←→   Token validation only (read-only from HRIS)
```

Cross-connection relationships are handled by Laravel Eloquent. Cross-DB writes in `ApplyChangeRequest` are wrapped in a `DB::connection('masterlist')->transaction()`.

### Inertia.js Lazy Props

Some props are expensive and not needed on first load:

- `attachments` — loaded only when the Files tab is first clicked
- `activeEmployees` — loaded only when the employee combobox is opened

Both use `Inertia::lazy()` on the server and `router.reload({ only: [...] })` on the client.

---

## 5. Database Connections & Models

### Connection: `masterlist`

#### `EmployeeDetail` — `employee_details`

Primary employee record.

| Column | Type | Description |
|---|---|---|
| `employid` | PK | Employee ID |
| `firstname`, `middlename`, `lastname` | string | Name fields |
| `nickname` | string | |
| `birthday`, `place_of_birth` | date/string | |
| `emp_sex` | int | `1` = Male, `2` = Female |
| `email`, `contact_no` | string | |
| `civil_status`, `religion` | string | |
| `height`, `weight`, `blood_type` | string | |
| `educational_attainment` | string | |
| `accstatus`, `biometric_status` | string | |

**Relations:** `workDetail`, `address[]`, `parents[]`, `spouse[]`, `siblings[]`, `children[]`

**Accessors:** `name` (full name), `fullName` (with nickname)

---

#### `EmployeeWorkDetail` — `employee_work_details`

| Column | Description |
|---|---|
| `employid` | FK → EmployeeDetail |
| `company`, `department`, `prodline`, `job_title`, `station`, `team` | Work assignment |
| `empstatus`, `empclass` | Status and classification |
| `shift_type` | FK → EmployeeShift |
| `shuttle` | FK → Shuttle |
| `date_hired`, `date_reg`, `service_length` | Tenure |

**Relations:** `employee`, `departmentRel`, `empPositionRel`, `jobTitleRel`, `prodLineRel`, `stationRel`, `statusRel`, `classRel`, `shiftRel`, `shuttleRel`, `approver`, `govInfo`

---

#### `Shuttle` — `shuttles`

| Column | Description |
|---|---|
| `id` | PK |
| `shuttle_name` | Name of the shuttle route |

No timestamps. Used as a lookup table in `EmployeeWorkDetail.shuttle`.

---

#### Other masterlist lookup models

| Model | Table | Used For |
|---|---|---|
| `EmployeeDepartment` | `employee_departments` | Department name |
| `JobTitle` | `job_titles` | Job title name |
| `Prodline` | `prod_lines` | Production line |
| `Station` | `stations` | Work station |
| `EmployeePosition` | `employee_positions` | Position |
| `EmployeeStatus` | `employee_statuses` | Employment status |
| `EmployeeClass` | `employee_classes` | Classification |
| `EmployeeShift` | `employee_shifts` | Shift type |
| `EmployeeApprover` | `employee_approvers` | Approver assignment |
| `EmployeeGovInfo` | `employee_gov_infos` | SSS, PhilHealth, TIN, Pag-IBIG |
| `EmployeeAddress` | `employee_addresses` | Multiple address records |
| `EmployeeParent` | `employee_parents` | Father and mother records |
| `EmployeeSpouse` | `employee_spouses` | Spouse records |
| `EmployeeChild` | `employee_children` | Children records |
| `EmployeeSibling` | `employee_siblings` | Sibling records |
| `MasterlistLogs` | `masterlist_logs` | Audit trail of changes |

---

### Connection: `mysql` (hris)

#### `EmployeeChangeRequest` — `employee_change_requests`

| Column | Type | Description |
|---|---|---|
| `id` | PK | |
| `employid` | int | Employee being changed |
| `requested_by` | int | FK → EmployeeDetail |
| `category` | string | One of 10 category keys |
| `category_label` | string | Human-readable label |
| `old_value` | JSON | Snapshot at submission |
| `new_value` | JSON | Requested new data |
| `attachment_id` | int | FK → EmployeeAttachment (nullable) |
| `status` | string | `pending`, `approved`, `rejected`, `cancelled` |
| `remarks` | string | HR rejection/approval note |
| `reviewed_by` | int | FK → EmployeeDetail |
| `reviewed_at` | datetime | |

**Relations:** `requester`, `reviewer`, `attachment`, `employee`

---

#### `EmployeeAttachment` — `employee_attachments`

| Column | Type | Description |
|---|---|---|
| `id` | PK | |
| `employid` | int | Owner employee |
| `uploaded_by` | int | FK → EmployeeDetail |
| `file_path` | string | Path on private disk |
| `original_name` | string | Original filename |
| `mime_type` | string | e.g. `image/jpeg`, `application/pdf` |
| `file_size` | int | Bytes |
| `description` | string | Optional label |

**Appended accessors:** `url` (route-based, streamed through controller), `size_formatted` (human-readable), `is_image` (bool)

**Relations:** `uploader`, `changeRequests[]`

---

### Connection: `authify`

Used only by `AuthMiddleware` for token validation. No Eloquent model — queried directly via `DB::connection('authify')`.

---

## 6. Laravel Routes & Controllers

### Web Routes (`routes/web.php` + includes)

All web routes are under the `/{APP_NAME}` prefix. `APP_NAME` is read from `.env`.

#### Auth (`routes/auth.php`)

| Method | Path | Controller | Name |
|---|---|---|---|
| GET | `/{APP_NAME}/logout` | `AuthenticationController@logout` | `logout` |
| GET | `/{APP_NAME}/unauthorized` | _(Inertia render)_ | `unauthorized` |

#### General (`routes/general.php`) — requires `AuthMiddleware`

| Method | Path | Controller | Name | Notes |
|---|---|---|---|---|
| GET | `/{APP_NAME}/` | `DashboardController@index` | `dashboard` | |
| GET | `/{APP_NAME}/profile` | `ProfileController@index` | `profile.index` | |
| POST | `/{APP_NAME}/change-password` | `ProfileController@changePassword` | `changePassword` | |
| GET | `/{APP_NAME}/admin` | `AdminController@index` | `admin` | AdminMiddleware |
| GET | `/{APP_NAME}/new-admin` | `AdminController@index_addAdmin` | `index_addAdmin` | AdminMiddleware |
| POST | `/{APP_NAME}/add-admin` | `AdminController@addAdmin` | `addAdmin` | AdminMiddleware |
| POST | `/{APP_NAME}/remove-admin` | `AdminController@removeAdmin` | `removeAdmin` | AdminMiddleware |
| PATCH | `/{APP_NAME}/change-admin-role` | `AdminController@changeAdminRole` | `changeAdminRole` | AdminMiddleware |

#### Employee & Attachments (`routes/employee.php`)

| Method | Path | Controller | Name | Middleware |
|---|---|---|---|---|
| GET | `/{APP_NAME}/employees/{employid}` | `EmployeeController@show` | `employees.show` | — |
| GET | `/{APP_NAME}/attachments/{id}` | `AttachmentController@view` | `attachments.view` | `throttle:api-reads` |
| GET | `/{APP_NAME}/change-requests` | `EmployeeChangeRequestController@index` | `change-requests.index` | — |
| POST | `/{APP_NAME}/change-requests` | `EmployeeChangeRequestController@store` | `change-requests.store` | `throttle:cr-submit` |
| POST | `/{APP_NAME}/change-requests/{id}/approve` | `EmployeeChangeRequestController@approve` | `change-requests.approve` | `throttle:cr-review` |
| POST | `/{APP_NAME}/change-requests/{id}/reject` | `EmployeeChangeRequestController@reject` | `change-requests.reject` | `throttle:cr-review` |
| GET | `/{APP_NAME}/change-requests/attachments` | `EmployeeChangeRequestController@listAttachments` | `change-requests.attachments.index` | — |
| POST | `/{APP_NAME}/change-requests/attachments` | `EmployeeChangeRequestController@uploadAttachment` | `change-requests.attachments.store` | `throttle:cr-upload` |

> **Note:** `attachments.view` must be on the web route stack (not API) so that `EncryptCookies` and `StartSession` middleware run, enabling cookie-based SSO authentication to work when opening files in a browser tab.

#### Other

| Method | Path | Controller | Name |
|---|---|---|---|
| GET | `/{APP_NAME}/demo` | `DemoController@index` | `demo` |
| ANY | _(fallback)_ | _(Inertia 404)_ | `404` |

---

### API Routes (`routes/api/employeeApi.php`)

All routes require `AuthMiddleware` + `throttle:api-reads`.

Base prefix: `/api/employees`

| Method | Path | Controller | Description |
|---|---|---|---|
| GET | `/{employid}` | `Api\EmployeeController@show` | Basic employee data |
| GET | `/{employid}/work` | `Api\EmployeeController@work` | Work detail data |

---

### Key Controllers

#### `EmployeeController` (web)
- `show(int $employid)` — renders `Employee/Show` Inertia page with employee data, shuttles, and lazy-loaded attachments + active employee list.

#### `EmployeeChangeRequestController`
- `index()` — HR queue page (Inertia)
- `store()` — employee submits a change request (JSON)
- `approve(int $id)` — HR approves; triggers `ApplyChangeRequest` (JSON)
- `reject(Request $request, int $id)` — HR rejects with remarks (JSON)
- `uploadAttachment()` — upload a file, returns attachment data (JSON)
- `listAttachments()` — list attachments for the current employee (JSON)

#### `AttachmentController`
- `view(int $id)` — streams a file from the private disk inline with the correct `Content-Type` header.

---

## 7. React Component Structure

```
resources/js/
├── app.jsx                          # Inertia app root — ThemeProvider, ConfigProvider, Sonner
├── Pages/
│   ├── Employee/
│   │   └── Show.jsx                 # Three-tab employee profile page
│   ├── ChangeRequest/
│   │   └── Index.jsx                # HR change request queue
│   ├── Dashboard.jsx
│   ├── Profile.jsx
│   ├── 404.jsx
│   └── Unauthorized.jsx
├── Components/
│   ├── Employee/
│   │   ├── EmployeeComponents.jsx   # PersonalTab, WorkTab, avatar helper, section wrappers
│   │   └── FilesTab.jsx             # Files tab — Skeleton, Empty, AttachmentCard grid
│   ├── ChangeRequest/
│   │   ├── ChangeRequestModal.jsx   # Edit modal — form + attachment picker
│   │   ├── EditSectionDropdown.jsx  # Radix DropdownMenu for picking edit category
│   │   └── Forms/
│   │       └── CategoryForms.jsx    # One form component per category
│   ├── ui/                          # shadcn/ui wrappers (Radix-based)
│   │   ├── combobox.jsx             # Searchable select with async support
│   │   ├── select.jsx
│   │   ├── dialog.jsx
│   │   ├── dropdown-menu.jsx
│   │   ├── tabs.jsx
│   │   ├── badge.jsx
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   ├── avatar.jsx
│   │   ├── input.jsx
│   │   ├── textarea.jsx
│   │   ├── label.jsx
│   │   ├── popover.jsx
│   │   ├── command.jsx
│   │   ├── separator.jsx
│   │   ├── tooltip.jsx
│   │   ├── sonner.jsx
│   │   └── progress.jsx
│   ├── sidebar/
│   │   ├── SideBar.jsx
│   │   ├── SidebarLink.jsx
│   │   ├── Navigation.jsx
│   │   ├── DropDown.jsx
│   │   └── ThemeToggler.jsx
│   ├── NavBar.jsx
│   ├── Modal.jsx
│   ├── DataTable.jsx
│   ├── TabulatorTable.jsx
│   ├── LoadingScreen.jsx
│   └── ThemeContext.jsx
└── Helpers/
    └── employee.js                  # AVATAR_PALETTES, avatarPalette(id)
```

### Key Component Details

#### `Show.jsx`

Props from Inertia:
- `employee` — full employee data object (always loaded)
- `shuttles` — array of `{ id, shuttle_name }` (always loaded)
- `changeRequests` — object keyed by category (always loaded)
- `attachments` — lazy prop, `undefined` until first tab click

State:
- `tab` — active tab (`"personal"`, `"work"`, `"files"`)
- `modalCategory` — open edit modal for this category key
- `oldValueSnapshot` — snapshot of employee data taken when modal opens
- `attachmentsLoading` — boolean for files tab skeleton
- `attachmentsFetched` (ref) — prevents duplicate lazy reloads
- `pendingMap` — computed map of `category → pending request`

Performance:
- All event handlers wrapped in `useCallback`
- `pal` (avatar palette) wrapped in `useMemo`
- `loadOptions` (combobox async search) wrapped in `useCallback`
- `attachmentsFetched` is a `useRef` (not state) to avoid re-render on set

#### `FilesTab.jsx`

Three states:
1. **Loading** — 6-card animated pulse skeleton grid
2. **Empty** — centered FileText icon with message
3. **Populated** — 2-col (mobile) / 3-col (desktop) grid of `AttachmentCard`

`AttachmentCard`:
- Images: `<img loading="lazy">` with scale-on-hover CSS transition
- Non-images: FileText icon with uppercase format badge (PDF, DOCX, etc.)
- Hover overlay shows "View" badge with external link icon
- Entire card is an `<a target="_blank">` pointing to `attachments.view`

#### `EditSectionDropdown.jsx`

Uses Radix `DropdownMenu` — provides keyboard navigation, ARIA roles, and click-outside dismissal automatically. No manual `useRef` / `useEffect` / `document.addEventListener` needed.

#### `CategoryForms.jsx`

- Dropdowns with **≤5 options** use plain `<Select>` (e.g., civil status, gender)
- Dropdowns with **>5 options** use `<Combobox>` (e.g., education, blood type, religion, shuttle)
- Shuttle field uses numeric ID as value, name as display label

#### `ChangeRequestModal.jsx`

- Existing attachments are lazy-loaded only on first click of the "existing" tab
- Prevents redundant API calls on every modal open

---

## 8. Authentication Flow (SSO)

The app does not manage passwords. Authentication is delegated to the Authify SSO system.

```
1. User visits /{APP_NAME}?key=<sso_token>
        |
2. AuthMiddleware reads token from:
        priority 1: ?key query param
        priority 2: SSO cookie
        priority 3: Laravel session
        |
3. If no cached session → validate token against authify DB
        → on success: store emp_data in session, set SSO cookie
        → on failure: redirect to SSO login URL
        |
4. If session exists & token matches → continue
        → strip ?key from URL (clean redirect)
        |
5. Request user resolver set via:
        $request->setUserResolver(fn() => (object) session('emp_data'))
        → allows $request->user()?->emp_id throughout the app
        |
6. Token also stored in localStorage (from app.jsx) for API calls
```

**Token priority rationale:** The query param is used for the initial SSO redirect. After first load, the cookie/session takes over, and the URL is cleaned up.

---

## 9. Rate Limiting

Defined in `app/Http/RateLimiters.php`, registered in `AppServiceProvider::boot()`.

All limiters are keyed by **`emp_id`** (from `$request->user()?->emp_id`) with an IP fallback for unauthenticated states.

| Limiter Name | Limit | Applied To |
|---|---|---|
| `api-reads` | 60/min | API employee routes, attachment view |
| `cr-submit` | 20/min | `POST /change-requests` |
| `cr-review` | 30/min | Approve / Reject endpoints |
| `cr-upload` | 10/min | Attachment upload |

---

## 10. Local Setup

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 20+
- MySQL (three databases: hris, masterlist, authify)

### Steps

**1. Clone the repository**

```bash
git clone <repo-url>
cd HRIS
```

**2. Install PHP dependencies**

```bash
composer install
```

**3. Install Node dependencies**

```bash
npm install
```

**4. Configure environment**

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` and configure the three database connections:

```dotenv
APP_NAME=hris
APP_URL=http://localhost:8000

# Primary HRIS database (operational data)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=hris
DB_USERNAME=root
DB_PASSWORD=

# Masterlist database (employee source of truth)
DB_MASTERLIST_HOST=127.0.0.1
DB_MASTERLIST_PORT=3306
DB_MASTERLIST_DATABASE=masterlist
DB_MASTERLIST_USERNAME=root
DB_MASTERLIST_PASSWORD=

# Authify SSO database (token validation)
DB_AUTHIFY_HOST=127.0.0.1
DB_AUTHIFY_PORT=3306
DB_AUTHIFY_DATABASE=authify
DB_AUTHIFY_USERNAME=root
DB_AUTHIFY_PASSWORD=

# SSO
SSO_COOKIE_NAME=sso_token
SSO_LOGIN_URL=http://your-sso-system/login
```

**5. Run database migrations**

```bash
php artisan migrate
```

**6. Create the private storage disk**

```bash
php artisan storage:link
```

Ensure the `private` disk is configured in `config/filesystems.php`:

```php
'private' => [
    'driver' => 'local',
    'root'   => storage_path('app/private'),
],
```

**7. Start the development servers**

```bash
composer run dev
```

This runs `php artisan serve` and `npm run dev` (Vite) concurrently.

The app will be available at: `http://localhost:8000/{APP_NAME}`

### Accessing the app

Since the app uses SSO, direct navigation to the app URL without a valid token will redirect to the SSO login URL. During development you can manually set the token in the session or use the `?key=<token>` query parameter from the Authify system.

### Building for production

```bash
npm run build
```

This compiles and fingerprints all frontend assets into `public/build/`.
