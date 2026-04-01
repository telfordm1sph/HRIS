<?php

namespace App\Http\Controllers;

use App\Models\EmployeeAttachment;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class AttachmentController extends Controller
{
    public function view($id)
    {
        $attachment = EmployeeAttachment::findOrFail($id);

        $path = $attachment->file_path;

        if (!Storage::disk('private')->exists($path)) {
            abort(404);
        }

        return response()->file(
            Storage::disk('private')->path($path),
            [
                'Content-Type' => $attachment->mime_type,
                'Content-Disposition' => 'inline; filename="' . $attachment->original_name . '"',
            ]
        );
    }
}
