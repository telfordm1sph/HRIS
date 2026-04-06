<?php

namespace App\Http\Controllers;

use App\Http\Resources\ChangeRequestResource;
use App\Models\EmployeeChangeRequest;
use App\Repositories\EmployeeAttachmentRepository;
use App\Services\EmployeeChangeRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeChangeRequestController extends Controller
{
    public function __construct(
        protected EmployeeChangeRequestService $service
    ) {}

    // ─── HR Table Page ───────────────────────────────────────────────────────

    public function index(Request $request): Response
    {
        $filters = $request->only(['status', 'category', 'date_from', 'date_to', 'employid', 'per_page']);
        $filters['status'] ??= 'pending';

        return Inertia::render('ChangeRequests/Index', [
            'requests'   => ChangeRequestResource::collection($this->service->getAllForHR($filters)),
            'filters'    => $filters,
            'categories' => EmployeeChangeRequest::CATEGORIES,
        ]);
    }

    // ─── HR Approve / Reject ─────────────────────────────────────────────────

    public function approve(int $id): \Illuminate\Http\RedirectResponse
    {
        try {
            $this->service->approve($id, session('emp_data.emp_id'));
        } catch (\RuntimeException $e) {
            return back()->withErrors(['message' => $e->getMessage()]);
        }

        return back();
    }

    public function reject(Request $request, int $id): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'remarks' => ['required', 'string', 'max:1000'],
        ]);

        try {
            $this->service->reject($id, $validated['remarks'], session('emp_data.emp_id'));
        } catch (\RuntimeException $e) {
            return back()->withErrors(['message' => $e->getMessage()]);
        }

        return back();
    }

    // ─── Employee Submit ─────────────────────────────────────────────────────

    public function store(Request $request): JsonResponse
    {
        $request->merge([
            'old_value' => json_decode($request->old_value, true),
            'new_value' => json_decode($request->new_value, true),
        ]);

        $validated = $request->validate([
            'employid'         => ['required', 'integer'],
            'category'         => ['required', 'string', 'in:' . implode(',', array_keys(EmployeeChangeRequest::CATEGORIES))],
            'old_value'        => ['required', 'array'],
            'new_value'        => ['required', 'array'],
            'attachment_id'    => ['nullable', 'integer', 'exists:employee_attachments,id'],
            'file'             => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'file_description' => ['nullable', 'string', 'max:255'],
        ]);

        try {
            $changeRequest = $this->service->submit(
                employid: $validated['employid'],
                category: $validated['category'],
                oldValue: $validated['old_value'],
                newValue: $validated['new_value'],
                attachmentId: $validated['attachment_id'] ?? null,
                file: $request->file('file'),
                fileDescription: $validated['file_description'] ?? '',
            );

            return response()->json([
                'success' => true,
                'data'    => new ChangeRequestResource($changeRequest->load(['attachment', 'requester'])),
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }

    // ─── Attachments ─────────────────────────────────────────────────────────

    public function uploadAttachment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'employid'    => ['required', 'integer'],
            'file'        => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        $attachment = app(EmployeeAttachmentRepository::class)->store(
            employid: $validated['employid'],
            uploadedBy: $validated['employid'],
            file: $request->file('file'),
            description: $validated['description'] ?? '',
        );

        return response()->json([
            'success' => true,
            'data'    => [
                'id'            => $attachment->id,
                'original_name' => $attachment->original_name,
                'description'   => $attachment->description,
                'size'          => $attachment->size_formatted,
                'is_image'      => $attachment->is_image,
                'url'           => $attachment->url,
            ],
        ]);
    }

    public function listAttachments(Request $request): JsonResponse
    {
        $attachments = $this->service->getAttachmentsForEmployee($request->integer('employid'));

        return response()->json([
            'success' => true,
            'data'    => $attachments->map(fn($a) => [
                'id'            => $a->id,
                'original_name' => $a->original_name,
                'description'   => $a->description,
                'size'          => $a->size_formatted,
                'is_image'      => $a->is_image,
                'url'           => $a->url,
                'created_at'    => $a->created_at->toDateTimeString(),
            ]),
        ]);
    }
}
