<?php

namespace App\Http\Controllers;

use App\Services\EmployeeService;
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

        return Inertia::render('Employee/Show', [
            'employee' => $result['data'],
        ]);
    }
}
