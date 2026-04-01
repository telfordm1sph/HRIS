<?php

namespace App\Repositories;

use App\Models\EmployeeAttachment;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class EmployeeAttachmentRepository
{
    /**
     * All attachments for an employee, newest first.
     * Used in the modal "choose from existing" list.
     */
    public function getForEmployee(int $employid): Collection
    {
        return EmployeeAttachment::where('employid', $employid)
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * Store file to private disk and create DB record.
     */
    public function store(
        int          $employid,
        int          $uploadedBy,
        UploadedFile $file,
        string       $description = ''
    ): EmployeeAttachment {
        $path = $file->store(
            "change_requests/{$employid}",
            'private'
        );

        return EmployeeAttachment::create([
            'employid'      => $employid,
            'uploaded_by'   => $uploadedBy,
            'file_path'     => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type'     => $file->getMimeType(),
            'file_size'     => $file->getSize(),
            'description'   => $description,
        ]);
    }

    public function findById(int $id): ?EmployeeAttachment
    {
        return EmployeeAttachment::find($id);
    }

    /**
     * Delete file from disk and remove DB record.
     */
    public function delete(int $id): void
    {
        $attachment = EmployeeAttachment::find($id);
        if (!$attachment) return;

        // Only delete file if no other change requests still reference it
        $stillReferenced = $attachment->changeRequests()
            ->whereNot('status', 'cancelled')
            ->exists();

        if (!$stillReferenced) {
            Storage::disk('private')->delete($attachment->file_path);
        }

        $attachment->delete();
    }
}
