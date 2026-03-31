<?php

use App\Http\Controllers\Api\EmployeeController;
use Illuminate\Support\Facades\Route;


Route::prefix('employees')->group(function () {
    Route::get('/{employid}',       [EmployeeController::class, 'show']);
    Route::get('/{employid}/work',  [EmployeeController::class, 'work']);
});
