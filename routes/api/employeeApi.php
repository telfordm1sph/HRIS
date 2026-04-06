<?php

use App\Http\Controllers\Api\EmployeeController;
use App\Http\Middleware\AuthMiddleware;
use Illuminate\Support\Facades\Route;

Route::middleware([AuthMiddleware::class, 'throttle:api-reads'])->group(function () {
    Route::prefix('employees')->group(function () {
        Route::get('/{employid}',      [EmployeeController::class, 'show']);
        Route::get('/{employid}/work', [EmployeeController::class, 'work']);
    });
});
