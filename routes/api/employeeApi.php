<?php

use App\Http\Controllers\Api\EmployeeController;
use App\Http\Middleware\ApiAuthMiddleware;
use Illuminate\Support\Facades\Route;

Route::middleware([ApiAuthMiddleware::class, 'throttle:api-reads'])->group(function () {
    Route::prefix('employees')->group(function () {
        Route::get('/{employid}',       [EmployeeController::class, 'show']);
        Route::get('/{employid}/auth',  [EmployeeController::class, 'auth']);
        Route::get('/{employid}/work',  [EmployeeController::class, 'work']);
    });
});
