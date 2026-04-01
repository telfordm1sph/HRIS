<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Uses default 'mysql' (hris) connection
    public function up(): void
    {
        Schema::create('employee_change_requests', function (Blueprint $table) {
            $table->id();
            $table->integer('employid');
            $table->unsignedBigInteger('requested_by');         // users.id

            $table->string('category');                         // name|civil_status|address|
            // education|father|mother|
            // spouse|children|siblings|others
            $table->string('category_label');                   // "Name", "Civil Status", etc.

            $table->json('old_value');                          // snapshot before change
            $table->json('new_value');                          // requested new data

            // Attachment — FK to employee_attachments (nullable, not all categories require it)
            $table->unsignedBigInteger('attachment_id')->nullable();

            $table->enum('status', [
                'pending',
                'approved',
                'rejected',
                'cancelled',                                    // auto-cancelled when new request for same category submitted
            ])->default('pending');

            $table->text('remarks')->nullable();                // HR rejection/approval note
            $table->unsignedBigInteger('reviewed_by')->nullable();  // users.id
            $table->timestamp('reviewed_at')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['employid', 'status']);
            $table->index(['employid', 'category', 'status']); // for cancel-previous query
            $table->index(['status', 'created_at']);            // for HR queue ordering

            // Foreign keys (hris DB only — employid is on masterlist so no FK there)
            $table->foreign('requested_by')->references('id')->on('users');
            $table->foreign('reviewed_by')->references('id')->on('users');
            $table->foreign('attachment_id')->references('id')->on('employee_attachments')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_change_requests');
    }
};
