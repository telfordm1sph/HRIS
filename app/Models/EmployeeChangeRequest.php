<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeChangeRequest extends Model
{
    // Default 'mysql' (hris) connection
    protected $table      = 'employee_change_requests';
    protected $connection = 'mysql';

    protected $fillable = [
        'employid',
        'requested_by',
        'category',
        'category_label',
        'old_value',
        'new_value',
        'attachment_id',
        'status',
        'remarks',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'old_value'   => 'array',
        'new_value'   => 'array',
        'reviewed_at' => 'datetime',
    ];

    // ─── Status Constants ────────────────────────────────────────────────────

    const STATUS_PENDING   = 'pending';
    const STATUS_APPROVED  = 'approved';
    const STATUS_REJECTED  = 'rejected';
    const STATUS_CANCELLED = 'cancelled';

    // ─── Category Constants ──────────────────────────────────────────────────

    const CATEGORIES = [
        'name'         => 'Name',
        'civil_status' => 'Civil Status',
        'address'      => 'Address',
        'education'    => 'Education',
        'father'       => 'Father',
        'mother'       => 'Mother',
        'spouse'       => 'Spouse',
        'children'     => 'Children',
        'siblings'     => 'Siblings',
        'others'       => 'Others',
    ];

    // Categories that require an attachment
    const ATTACHMENT_REQUIRED = [
        'name',
        'civil_status',
        'education',
        'spouse',
    ];

    // ─── Relations ───────────────────────────────────────────────────────────

    /**
     * Get the employee who requested the change
     * Changed from User to Employee model
     */
    public function requester(): BelongsTo
    {
        return $this->belongsTo(EmployeeDetail::class, 'requested_by', 'employid');
    }

    /**
     * Get the HR employee who reviewed the change
     * Changed from User to Employee model
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(EmployeeDetail::class, 'reviewed_by', 'employid');
    }

    public function attachment(): BelongsTo
    {
        return $this->belongsTo(EmployeeAttachment::class, 'attachment_id');
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(EmployeeDetail::class, 'employid', 'employid');
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    public function isRejected(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }

    public function requiresAttachment(): bool
    {
        return in_array($this->category, self::ATTACHMENT_REQUIRED);
    }
}
