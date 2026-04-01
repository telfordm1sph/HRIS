<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Uses default 'mysql' (hris) connection
    public function up(): void
    {
        Schema::create('employee_attachments', function (Blueprint $table) {
            $table->id();
            $table->integer('employid');
            $table->unsignedBigInteger('uploaded_by');          // users.id

            $table->string('file_path');                        // storage path
            $table->string('original_name');                    // original filename
            $table->string('mime_type');                        // image/jpeg, application/pdf
            $table->unsignedBigInteger('file_size');            // bytes

            $table->string('description')->nullable();          // e.g. "Marriage Certificate"

            $table->timestamps();

            $table->index('employid');
            $table->foreign('uploaded_by')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_attachments');
    }
};
