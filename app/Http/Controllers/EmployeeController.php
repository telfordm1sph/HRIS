<?php

namespace App\Http\Controllers;

use App\Services\EmployeeService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    public function __construct(
        protected EmployeeService $service
    ) {}

    public function show(int $employid): Response
    {
        $result = $this->service->getFullDetail($employid);

        if (!$result['success']) {
            abort(404, 'Employee not found.');
        }

        // For initial load, get first page of active employees
        $activeEmployees = $this->service->getActiveEmployeeList(['per_page' => 50, 'page' => 1]);

        return Inertia::render('Employee/Show', [
            'employee'        => $result['data'],
            'activeEmployees' => $activeEmployees,
        ]);
    }

    public function getEmployeeOptions(Request $request)
    {
        $params = $request->only(['search', 'page', 'per_page']);
        $params['per_page'] = $params['per_page'] ?? 50;
        $params['page'] = $params['page'] ?? 1;

        $result = $this->service->getActiveEmployeeList($params);

        return response()->json($result);
    }
}
