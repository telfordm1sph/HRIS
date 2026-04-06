<?php

namespace App\Http\Controllers;

use App\Models\EmployeeClass;
use App\Models\EmployeeCompany;
use App\Models\EmployeeDepartment;
use App\Models\EmployeeStatus;
use App\Services\EmployeeAttachmentService;
use App\Services\EmployeeService;
use App\Services\ShuttleService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    public function __construct(
        protected EmployeeService            $employeeService,
        protected ShuttleService             $shuttleService,
        protected EmployeeAttachmentService  $attachmentService,
    ) {}

    public function index(Request $request): Response
    {
        $encoded = $request->query('filters', '');
        $decoded = [];
        if ($encoded) {
            $json    = base64_decode($encoded, strict: true);
            $decoded = ($json !== false) ? (json_decode($json, associative: true) ?? []) : [];
        }

        $filters = array_intersect_key(
            array_map('strval', $decoded),
            array_flip(['search', 'company', 'department', 'status', 'class', 'page', 'per_page'])
        );

        $result  = $this->employeeService->getEmployeeListForTable($filters);

        return Inertia::render('Employee/Index', [
            'employees'   => $result,
            'filters'     => $filters,
            'lookups'     => [
                'companies'   => EmployeeCompany::orderBy('company_name')->pluck('company_name', 'id'),
                'departments' => EmployeeDepartment::orderBy('dept_name')->pluck('dept_name', 'id'),
                'statuses'    => EmployeeStatus::orderBy('status_name')->pluck('status_name', 'id'),
                'classes'     => EmployeeClass::orderBy('class_name')->pluck('class_name', 'id'),
            ],
        ]);
    }

    public function show(string $employid, Request $request): Response
    {
        $decoded   = base64_decode($employid, strict: true);
        $employid  = ($decoded !== false && ctype_digit($decoded)) ? (int) $decoded : 0;

        $result = $this->employeeService->getFullDetail($employid);

        if (!$result['success']) {
            abort(404, 'Employee not found.');
        }

        return Inertia::render('Employee/Show', [
            'employee'    => $result['data'],
            'shuttles'    => $this->shuttleService->getAll(),

            // Loaded on demand when the Files tab is first opened
            'attachments' => Inertia::lazy(
                fn () => $this->attachmentService->getForEmployee($employid)
            ),

            // Loaded on demand when the employee combobox is opened
            'activeEmployees' => Inertia::lazy(function () use ($request) {
                $encoded = $request->query('q', '');
                $params  = [];
                if ($encoded) {
                    $json   = base64_decode($encoded, strict: true);
                    $params = ($json !== false) ? (json_decode($json, associative: true) ?? []) : [];
                }
                return $this->employeeService->getActiveEmployeeList([
                    'search'   => $params['search']   ?? '',
                    'page'     => (int) ($params['page']     ?? 1),
                    'per_page' => (int) ($params['per_page'] ?? 50),
                ]);
            }),
        ]);
    }
}
