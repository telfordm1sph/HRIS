<?php

use App\Http\Controllers\EmployeeChangeRequestController;
use App\Http\Controllers\EmployeeController;
use Illuminate\Support\Facades\Route;

$app_name = env('APP_NAME', '');

Route::prefix($app_name)->group(function () {
    Route::get('/employees/{employid}', [EmployeeController::class, 'show'])
        ->name('employees.show');
    Route::get('/api/employees/options', [EmployeeController::class, 'getEmployeeOptions'])
        ->name('employees.options');


    // ── HR Table Page (Inertia) ───────────────────────────────────────────────
    Route::get('/change-requests', [EmployeeChangeRequestController::class, 'index'])
        ->name('change-requests.index');

    // ── Employee Submit ───────────────────────────────────────────────────────
    Route::post('/change-requests', [EmployeeChangeRequestController::class, 'store'])
        ->name('change-requests.store');

    // ── HR Approve / Reject ───────────────────────────────────────────────────
    Route::post('/change-requests/{id}/approve', [EmployeeChangeRequestController::class, 'approve'])
        ->name('change-requests.approve');

    Route::post('/change-requests/{id}/reject', [EmployeeChangeRequestController::class, 'reject'])
        ->name('change-requests.reject');

    // ── Attachments ───────────────────────────────────────────────────────────
    Route::get('/change-requests/attachments', [EmployeeChangeRequestController::class, 'listAttachments'])
        ->name('change-requests.attachments.index');

    Route::post('/change-requests/attachments', [EmployeeChangeRequestController::class, 'uploadAttachment'])
        ->name('change-requests.attachments.store');
});
