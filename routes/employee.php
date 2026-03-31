<?php

use App\Http\Controllers\EmployeeController;
use Illuminate\Support\Facades\Route;

$app_name = env('APP_NAME', '');

Route::prefix($app_name)->group(function () {
    Route::get('/employees/{employid}', [EmployeeController::class, 'show'])
        ->name('employees.show');
});
