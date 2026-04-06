<?php

namespace App\Http\Controllers;

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

    public function show(int $employid, Request $request): Response
    {
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
            'activeEmployees' => Inertia::lazy(fn () =>
                $this->employeeService->getActiveEmployeeList([
                    'search'   => $request->input('search', ''),
                    'page'     => $request->integer('page', 1),
                    'per_page' => $request->integer('per_page', 50),
                ])
            ),
        ]);
    }
}
