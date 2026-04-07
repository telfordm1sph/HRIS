<?php

namespace App\Http\Controllers;

use App\Services\EmployeeAttachmentService;
use Illuminate\Support\Facades\Storage;

class AttachmentController extends Controller
{
    public function __construct(
        protected EmployeeAttachmentService $service
    ) {}

    public function view(int $id)
    {
        $attachment = $this->service->findForView($id);

        if (!$attachment) {
            abort(404);
        }

        if (!Storage::disk('private')->exists($attachment['file_path'])) {
            abort(404);
        }

        return response()->file(
            Storage::disk('private')->path($attachment['file_path']),
            [
                'Content-Type'        => $attachment['mime_type'],
                'Content-Disposition' => 'inline; filename="' . $attachment['original_name'] . '"',
            ]
        );
    }
}
