# HRIS Architecture Documentation

## Table of Contents
1. [System Overview](#1-system-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture Patterns](#3-architecture-patterns)
4. [Multi-Database Design](#4-multi-database-design)
5. [Request Lifecycle](#5-request-lifecycle)
6. [Authentication Flow](#6-authentication-flow)
7. [Change Request Workflow](#7-change-request-workflow)
8. [File Storage Architecture](#8-file-storage-architecture)
9. [Component Architecture](#9-component-architecture)
10. [Rate Limiting](#10-rate-limiting)
11. [Excel Import/Export](#11-excel-importexport)

---

## 1. System Overview

HRIS (Human Resources Information System) is a web application for managing employee profiles, processing personal data change requests, and storing employee attachments. It integrates with an existing SSO system called **Authify** for authentication.

### Two Main Roles
- **Employee** — views profile, submits change requests, uploads documents
- **HR/Admin** — reviews change requests, approves/rejects, direct field editing

---

## 2. Technology Stack

### Backend
| Layer | Technology |
|---|---|
| Framework | Laravel 12 |
| PHP | 8.2+ |
| SPA Bridge | Inertia.js v2 |
| Authentication | Custom SSO via Authify |
| Architecture | Repository → Service → Controller |

### Frontend
| Layer | Technology |
|---|---|
| UI Framework | React 18 |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS + DaisyUI |
| UI Components | Radix UI + Shadcn/ui |
| Icons | Lucide React |
| Notifications | Sonner |
| Forms | React Hook Form |
| State | Zustand |
| Charts | Chart.js |

### Infrastructure
| Concern | Detail |
|---|---|
| Primary DB | MySQL (`mysql` connection) |
| Employee DB | MySQL (`masterlist` connection) |
| SSO DB | MySQL (`authify` connection) |
| File Storage | Laravel private disk |
| Session | Laravel session (cookie-based) |

---

## 3. Architecture Patterns

### Repository → Service → Controller

```
Request
  └── Controller        (HTTP: validate input, return response)
        └── Service     (Business logic: orchestrate, transform)
              └── Repository (Data access: DB queries only)
```

### Directory Structure

```
app/
├── Actions/           # Action classes for complex operations
│   └── ApplyChangeRequest.php
├── Http/
│   ├── Controllers/ # HTTP request handlers
│   └── Middleware/  # Auth, Admin, Inertia
├── Models/          # Eloquent models
├── Repositories/   # Data access layer
├── Services/       # Business logic layer
├── Exports/        # Excel template generation
└── Imports/        # Excel import processing
```

---

## 4. Multi-Database Design

### Three Separate MySQL Databases

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    masterlist   │    │      hris       │    │    authify      │
│  (connection:   │    │  (connection:   │    │  (connection:   │
│   "masterlist") │    │    "mysql")    │    │   "authify")   │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ EmployeeDetail  │    │EmployeeChange   │    │authify_sessions │
│ EmployeeWork   │◄───┤    Request      │    │   (token only)  │
│ Detail         │    │EmployeeAttach │    └─────────────────┘
│ EmployeeAddr   │    │    ment        │
│ EmployeeParent│    └─────────────────┘
│ EmployeeSpouse│
│ EmployeeChild │
│ EmployeeSibling
│ (all lookup
│  tables)
└─────────────────┘
```

### Connection Usage

| Connection | Purpose | Usage Pattern |
|---|---|---|
| `masterlist` | Source of truth for employee data (read-heavy) | `Model::on('masterlist')` |
| `mysql` | HRIS operational data (write-heavy) | Default connection |
| `authify` | SSO token validation only (read-only) | Direct DB query |

---

## 5. Request Lifecycle

```
User Request
    │
    ├── web.php / api.php (Route definitions)
    │
    ├── Kernel (Middleware stack)
    │   ├── AuthMiddleware (SSO validation)
    │   ├── AdminMiddleware (role check)
    │   └── HandleInertiaRequests (props injection)
    │
    ├── Controller (HTTP concerns)
    │   └── EmployeeController@show
    │
    ├── Service (Business logic)
    │   └── EmployeeService@getFullDetail
    │
    └── Repository (Data access)
        └── EmployeeRepository@getFullDetailByEmployid
            │
            └── Database (masterlist connection)
```

---

## 6. Authentication Flow

### SSO Token Validation

```
1. User visits /{APP_NAME}?key=<sso_token>
       │
2. AuthMiddleware reads token:
       priority 1: ?key query param
       priority 2: SSO cookie
       priority 3: Laravel session
       │
3. If no cached session → validate against authify DB
       → on success: store emp_data in session, set cookie
       → on failure: redirect to SSO login URL
       │
4. If session exists & token matches → continue
       → strip ?key from URL
       │
5. setUserResolver enables $request->user()?->emp_id
```

### Token Storage
- **Server**: Session + cookie
- **Client**: localStorage (`authify-token`)

---

## 7. Change Request Workflow

### Categories (10 Total)

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

### Workflow

```
Employee                    HR/Admin
   │                          │
   ▼                          │
Selects category             │
   │                          │
Modal pre-fills current ──────►│
values                      │
   │                          │
   ▼                          │
Edits and submits ──────────►│ (optional attachment)
   │                          │
   │                    Reviews queue
   │                    Approves/Rejects
   │                          │
   │                          ▼
   │                    ApplyChangeRequest action
   │                    (cross-DB transaction)
   │                          │
   ▼                          │
Auto-cancel existing    Writes to masterlist
pending request       DB tables
(for same category)
```

### Auto-Cancellation Logic
When employee submits a new request for a category with an existing `pending` request, the old pending request is automatically cancelled.

---

## 8. File Storage Architecture

### Storage Configuration

```php
// config/filesystems.php
'disks' => [
    'private' => [
        'driver' => 'local',
        'root'   => storage_path('app/private'),
    ],
]
```

### File Serving

```
User clicks attachment
        │
        ▼
AttachmentController@view
        │
        ├── Find EmployeeAttachment record
        │
        ├── Storage::disk('private')->get(file_path)
        │
        └── Stream with correct Content-Type
```

### Safe Delete
Files are only deleted from disk when no active change request references them.

---

## 9. Component Architecture

### Frontend Structure

```
resources/js/
├── app.jsx                    # App root (ThemeProvider, toast)
├── Pages/                     # Route pages
│   ├── Employee/
│   │   ├── Show.jsx         # Three-tab profile
│   │   └── Index.jsx        # Employee list
│   ├── ChangeRequest/
│   │   └── Index.jsx        # HR queue
│   ├── Admin/
│   │   └── Admin.jsx        # Admin panel
│   └── Dashboard.jsx
├── Components/
│   ├── Employee/             # Employee features
│   ├── ChangeRequest/        # CR features
│   ├── Admin/               # Admin features
│   └── ui/                  # shadcn/ui wrappers
└── Helpers/
    └── employee.js          # Avatar utilities
```

### Inertia Lazy Loading

Two props are lazy-loaded to reduce initial payload:
- `attachments` — loaded on first Files tab click
- `activeEmployees` — loaded when employee combobox opens

```php
// Server-side (Controller)
Inertia::lazy('attachments')

// Client-side (React)
router.reload({ only: ['attachments'] })
```

---

## 10. Rate Limiting

Defined in `app/Http/RateLimiters.php`, registered in `AppServiceProvider`.

All limiter keys: `emp_id` (from session) with IP fallback.

| Limiter | Limit | Applied To |
|---|---|---|
| `api-reads` | 60/min | API reads, attachment view |
| `cr-submit` | 20/min | POST /change-requests |
| `cr-review` | 30/min | Approve/Reject endpoints |
| `cr-upload` | 10/min | Attachment upload |

---

## 11. Excel Import/Export

### Template Generation

```
EmployeeImportTemplate
        │
        ├── LookupsSheet (MUST be first!)
        │   └── All dropdown lookup tables
        │
        ├── EmployeeDetailsSheet
        ├── WorkDetailsSheet
        ├── AddressSheet
        ├── ParentsSheet (father/mother)
        ├── SpouseSheet
        ├── ChildrenSheet
        ├── SiblingsSheet
        ├── GovInfoSheet
        └── ApproverSheet
```

**Important**: `LookupsSheet` must be first so dropdown validations can reference it.

### Import Processing

```
EmployeeImport (orchestrator)
        │
        ├── LookupResolver (preloads all FK maps)
        │
        ├── EmployeeDetailsImportSheet
        ├── WorkDetailsImportSheet
        ├── AddressImportSheet
        ├── ParentsImportSheet
        ├── SpouseImportSheet
        ├── ChildrenImportSheet
        ├── SiblingsImportSheet
        ├── GovInfoImportSheet
        └── ApproverImportSheet
```

### Data Flow

```
Template      Import              Validation           Write
  ↓            ↓                    ↓                 ↓
Download → Upload → LookupResolver (FK resolution) → masterlist DB
              │          │                                │
              │          ▼                                ▼
              │    Skipped if any FK              transactional
              │    cannot resolve                 writes
              ▼
         Error response
```

### Route Mapping

| Action | Route | Controller |
|---|---|---|
| Download template | `GET /{APP_NAME}/import/template` | `ImportController@template` |
| Import page | `GET /{APP_NAME}/import` | `ImportController@index` |
| Upload | `POST /{APP_NAME}/import/upload` | `ImportController@upload` |

---

## Key File Reference

| Concern | Path |
|---|---|
| SSO Auth | `app/Http/Middleware/AuthMiddleware.php` |
| Inertia Props | `app/Http/Middleware/HandleInertiaRequests.php` |
| CR Approval | `app/Actions/ApplyChangeRequest.php` |
| Rate Limiters | `app/Http/RateLimiters.php` |
| Routes | `routes/web.php`, `routes/employee.php` |
| Frontend Entry | `resources/js/app.jsx` |
| Excel Export | `app/Exports/EmployeeImportTemplate.php` |
| Excel Import | `app/Imports/EmployeeImport.php` |