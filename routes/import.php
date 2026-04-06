<?php


use App\Http\Controllers\General\ImportController;
use Illuminate\Support\Facades\Route;

$app_name = env('APP_NAME', '');

Route::prefix($app_name)->group(function () {
    Route::get("/import", [ImportController::class, 'index'])->name('import.index');
    Route::get("/import/template", [ImportController::class, 'downloadTemplate'])->name('import.template');
    Route::post("/import/upload", [ImportController::class, 'upload'])->name('import.upload');
});
