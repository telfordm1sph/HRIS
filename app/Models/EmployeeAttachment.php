<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class EmployeeAttachment extends Model
{
    // Default 'mysql' (hris) connection
    protected $table      = 'employee_attachments';
    protected $connection = 'mysql';

    protected $fillable = [
        'employid',
        'uploaded_by',
        'file_path',
        'original_name',
        'mime_type',
        'file_size',
        'description',
    ];

    protected $appends = ['url', 'size_formatted', 'is_image'];

    // ─── Relations ───────────────────────────────────────────────────────────

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(EmployeeDetail::class, 'uploaded_by', 'employid');
    }

    public function changeRequests(): HasMany
    {
        return $this->hasMany(EmployeeChangeRequest::class, 'attachment_id');
    }

    // ─── Accessors ───────────────────────────────────────────────────────────

    public function getUrlAttribute(): string
    {
        return route('attachments.view', [
            'id' => $this->id
        ]);
    }
    public function getSizeFormattedAttribute(): string
    {
        $bytes = $this->file_size;

        return match (true) {
            $bytes < 1024           => $bytes . ' B',
            $bytes < 1048576        => round($bytes / 1024, 1) . ' KB',
            default                 => round($bytes / 1048576, 1) . ' MB',
        };
    }

    public function getIsImageAttribute(): bool
    {
        return str_starts_with($this->mime_type, 'image/');
    }
}
