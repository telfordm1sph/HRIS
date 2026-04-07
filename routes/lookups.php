<?php

use App\Http\Controllers\General\LookupController;
use Illuminate\Support\Facades\Route;

$app_name = env('APP_NAME', '');

Route::prefix($app_name)->group(function () {
    Route::get('/lookups',                        [LookupController::class, 'index'])->name('lookups.index');
    Route::post('/lookups/{type}',                [LookupController::class, 'store'])->name('lookups.store');
    Route::patch('/lookups/{type}/{id}',          [LookupController::class, 'update'])->name('lookups.update');
    Route::delete('/lookups/{type}/{id}',         [LookupController::class, 'destroy'])->name('lookups.destroy');
});
