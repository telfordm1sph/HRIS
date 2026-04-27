# Database Normalization: Why We Need a New Table Structure

**Prepared for:** HR / Management  
**Date:** April 14, 2026  
**Subject:** Migration from Flat `employee_masterlist` to Normalized Relational Tables

---

## 1. The Problem with the Current System

The existing `employee_masterlist` table stores **everything about every employee in a single, flat row** — over 120 columns per employee. Fields like `DEPARTMENT`, `EMPPOSITION`, `JOB_TITLE`, `COMPANY`, `TEAM`, and `EMPSTATUS` are stored as raw text (VARCHAR), meaning the system just saves a typed string like `"Software Engineer"` or `"Human Resources"` with no link to any master reference.

### What This Looks Like in Practice

| EMPID | EMPNAME | EMPPOSITION | DEPARTMENT | JOB_TITLE |
|---|---|---|---|---|
| 1001 | Juan Dela Cruz | Team Leader | Information Technology | IT Team Leader |
| 1002 | Maria Santos | Team Leader | Information Technology | IT Team Leader |
| 1003 | Pedro Reyes | Team Leader | Human Resources | HR Team Leader |

These values are just **free text**. There is no single place that defines what a valid position, department, or job title is.

---

## 2. Real Problems This Causes Today

### Problem 1: Renaming a Position Requires Updating Every Row

If management decides to rename `"Team Leader"` to `"Section Head"`, the IT team must manually run a database update across **every single employee record** that has that position. If any record is missed or spelled slightly differently (e.g., `"team leader"`, `"Team leader"`, `"Teamleader"`), those employees will show the old or incorrect name in reports and other systems.

**Current reality:** There is no guarantee all records will be consistent after a rename.

### Problem 2: Other Systems Get Out of Sync

Other systems (payroll, attendance, timekeeping, biometrics) that read from `employee_masterlist` look for the text value `"Team Leader"`. If one system updates the name and another does not, the systems are now **describing the same position with different words** — they no longer agree on who holds what role.

**Example:** The attendance system still shows `"Team Leader"` while the HRIS now shows `"Section Head"`. Reports that join both systems will not match.

### Problem 3: Typos and Inconsistencies Are Permanent

Because there is no reference table enforcing valid values, data entry errors become permanent. Common examples found in real masterlist data:
- `"Human Resource"` vs `"Human Resources"` vs `"HR"`
- `"I.T."` vs `"IT"` vs `"Information Technology"`
- `"Regular"` vs `"Regularized"` vs `"regular"`

Each variation is treated as a **different department or status** by any system that reads the data.

### Problem 4: Reports Are Unreliable

When HR generates a headcount report grouped by department, employees with `"Human Resource"` are counted separately from employees with `"Human Resources"`. The report silently produces wrong numbers.

### Problem 5: The Table Is Enormous and Slow

With over 120 columns, every query that fetches an employee record pulls all that data — even if only the name and department are needed. This makes the system slower as the number of employees grows.

---

## 3. What Normalization Means (in Plain Terms)

Instead of storing the **name** of a department or position directly on the employee record, we store a **reference number (ID)** that points to a separate lookup table.

### Example: Department

**Before (flat):**
```
employee_masterlist: DEPARTMENT = "Information Technology"
```

**After (normalized):**
```
departments table:       id=5, name="Information Technology"
employee_work_details:   department_id = 5
```

Now, if management renames the department, they change it **in one place** — the `departments` table — and every employee, every system, and every report that reads `department_id = 5` automatically sees the new name. **Nothing else needs to change.**

---

## 4. The New Normalized Structure

The new system splits the masterlist into focused tables, each with a clear responsibility:

| Table | What It Stores |
|---|---|
| `employee_details` | Personal info: name, birthday, civil status, contact, address |
| `employee_work_details` | Work info: position, department, company, status, dates hired/separated |
| `employee_family` | Family members: parents, spouse, children |
| `employee_government_ids` | SSS, TIN, PhilHealth, Pag-IBIG, bank account |
| `employee_education` | Educational attainment records |
| `employee_leave_credits` | Leave balances per type |
| `employee_hmo` | HMO membership details |
| **Lookup Tables** | |
| `positions` | Valid positions (id, name) |
| `job_titles` | Valid job titles (id, name) |
| `departments` | Valid departments (id, name) |
| `companies` | Valid companies (id, name) |
| `employment_statuses` | Valid statuses: Regular, Probationary, etc. |
| `employment_classes` | Valid classes: Rank & File, Supervisory, etc. |
| `shift_types` | Valid shift schedules |

---

## 5. How This Solves Every Problem Listed Above

| Old Problem | How the New Structure Fixes It |
|---|---|
| Renaming a position requires mass updates | Change the name once in `positions` — all employees reflect it instantly |
| Other systems go out of sync | All systems reference the same `position_id` — they always agree |
| Typos and inconsistencies | Dropdowns and foreign keys enforce valid values only — no free text |
| Unreliable headcount reports | Grouping by `department_id` is exact — no string-matching issues |
| Slow queries on a 120-column table | Each table is lean; queries only fetch what they need |

---

## 6. How This Affects Day-to-Day HR Operations

### Scenario A: Renaming a Job Title Company-Wide

**Before:** IT team runs `UPDATE employee_masterlist SET JOB_TITLE = 'Section Head' WHERE JOB_TITLE = 'Team Leader'` across all records. Risk of missing records, case mismatch, or breaking other systems.

**After:** HR Administrator goes to the Lookup Maintenance page → edits `"Team Leader"` → saves. Done. All 1,000+ employees with that title are updated in one click.

### Scenario B: Creating a New Department

**Before:** HR simply starts typing the new department name in new employee records. Old employees remain unlinked. Reports may never show the correct grouping.

**After:** HR creates the department in the `departments` lookup table first. It then appears as a valid option when assigning employees. Consistency is guaranteed.

### Scenario C: A New System Integrates with HRIS

**Before:** The new system must parse text strings and build its own mapping tables to understand what `"I.T."` means.

**After:** The new system reads `department_id = 5` and calls the HRIS lookup API to get the canonical name. One source of truth. No guesswork.

---

## 7. What Happens to Existing Data

The existing `employee_masterlist` data will be **migrated, not deleted**. During migration:
1. All unique values from VARCHAR columns are extracted and inserted into the appropriate lookup tables.
2. Each employee record is updated to store the corresponding ID.
3. The old flat table is retained as an archive until the new system is fully validated.

No historical data is lost. The migration is reversible during the transition period.

---

## 8. Summary

| | Old Flat Masterlist | New Normalized Structure |
|---|---|---|
| Rename a position | Update 1,000+ rows manually | Change 1 row in lookup table |
| Data consistency | Not enforced — typos persist | Enforced by database relationships |
| Cross-system accuracy | Systems can disagree | All systems share the same IDs |
| Report accuracy | String-matching errors possible | Exact ID-based grouping |
| Performance | 120+ columns per query | Lean tables, targeted queries |
| Scalability | Degrades as columns and rows grow | Designed to scale |

The normalized structure is the industry-standard approach to managing employee data reliably. It is the foundation that makes all future integrations — payroll, attendance, timekeeping, benefits, and any new systems — work accurately without manual reconciliation.

---

*For technical questions, contact the HRIS Development Team.*
