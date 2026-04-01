<?php

use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\AttachmentController;
use Illuminate\Support\Facades\Route;

Route::get('/attachments/{id}', [AttachmentController::class, 'view'])
    ->name('attachments.view');
Route::prefix('employees')->group(function () {
    Route::get('/{employid}',       [EmployeeController::class, 'show']);
    Route::get('/{employid}/work',  [EmployeeController::class, 'work']);
});
