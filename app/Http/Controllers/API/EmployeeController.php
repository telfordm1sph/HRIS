<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\EmployeeService;
use Illuminate\Http\JsonResponse;

class EmployeeController extends Controller
{
    public function __construct(
        protected EmployeeService $service
    ) {}

    /**
     * GET /api/employees/{employid}
     * Full details — personal + work + resolved names
     */
    public function show(int $employid): JsonResponse
    {
        $result = $this->service->getFullDetail($employid);

        if (!$result['success']) {
            return response()->json($result, 404);
        }

        return response()->json($result);
    }

    /**
     * GET /api/employees/{employid}/work
     * Work details only + resolved names
     */
    public function work(int $employid): JsonResponse
    {
        $result = $this->service->getWorkDetail($employid);

        if (!$result['success']) {
            return response()->json($result, 404);
        }

        return response()->json($result);
    }
}
