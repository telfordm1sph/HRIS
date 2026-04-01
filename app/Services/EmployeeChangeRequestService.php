<?php

namespace App\Services;

use App\Actions\ApplyChangeRequest;
use App\Models\EmployeeChangeRequest;
use App\Repositories\EmployeeAttachmentRepository;
use App\Repositories\EmployeeChangeRequestRepository;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;

class EmployeeChangeRequestService
{
    public function __construct(
        protected EmployeeChangeRequestRepository $repository,
        protected EmployeeAttachmentRepository    $attachmentRepository,
        protected ApplyChangeRequest              $applyAction,
    ) {}

    // ─── Employee actions ─────────────────────────────────────────────────────

    /**
     * Submit a change request for a category.
     *
     * @param  int               $employid
     * @param  string            $category    One of EmployeeChangeRequest::CATEGORIES keys
     * @param  array             $oldValue    Current data snapshot (built by caller)
     * @param  array             $newValue    Requested new data
     * @param  int|null          $attachmentId  Existing attachment ID (reuse)
     * @param  UploadedFile|null $file          New file upload (takes priority over attachmentId)
     * @param  string            $fileDescription  Label for the uploaded file
     */
    public function submit(
        int           $employid,
        string        $category,
        array         $oldValue,
        array         $newValue,
        ?int          $attachmentId = null,
        ?UploadedFile $file = null,
        string        $fileDescription = ''
    ): EmployeeChangeRequest {
        // Validate category
        if (!array_key_exists($category, EmployeeChangeRequest::CATEGORIES)) {
            throw new \InvalidArgumentException("Invalid category: {$category}");
        }

        // Validate attachment required
        $requiresAttachment = in_array($category, EmployeeChangeRequest::ATTACHMENT_REQUIRED);
        if ($requiresAttachment && !$file && !$attachmentId) {
            throw new \RuntimeException("An attachment is required for category: {$category}");
        }

        // If new file uploaded — store it first
        if ($file) {
            $attachment = $this->attachmentRepository->store(
                $employid,
                $employid, // Using employid as the uploaded_by since no Auth
                $file,
                $fileDescription ?: EmployeeChangeRequest::CATEGORIES[$category]
            );
            $attachmentId = $attachment->id;
        }

        // Cancel any existing pending request for this category
        $this->repository->cancelPreviousPending($employid, $category);

        // Create the change request
        return $this->repository->create([
            'employid'       => $employid,
            'requested_by'   => $employid, // Using employid since no User authentication
            'category'       => $category,
            'category_label' => EmployeeChangeRequest::CATEGORIES[$category],
            'old_value'      => $oldValue,
            'new_value'      => $newValue,
            'attachment_id'  => $attachmentId,
            'status'         => EmployeeChangeRequest::STATUS_PENDING,
        ]);
    }

    // ─── HR actions ──────────────────────────────────────────────────────────

    /**
     * Approve a change request — writes data back to masterlist tables.
     * 
     * @param int $id The change request ID
     * @param int|null $reviewerId The HR employee ID who is approving (optional)
     */
    public function approve(int $id, ?int $reviewerId = null): EmployeeChangeRequest
    {
        $request = $this->repository->findById($id);

        if (!$request) {
            throw new \RuntimeException("Change request #{$id} not found.");
        }

        if (!$request->isPending()) {
            throw new \RuntimeException("Change request #{$id} is not pending.");
        }

        // Apply the change to masterlist tables
        $this->applyAction->execute($request);

        // Mark as approved
        return $this->repository->approve($id, $reviewerId);
    }

    /**
     * Reject a change request — data is NOT written back.
     * 
     * @param int $id The change request ID
     * @param string $remarks Rejection reason
     * @param int|null $reviewerId The HR employee ID who is rejecting (optional)
     */
    public function reject(int $id, string $remarks, ?int $reviewerId = null): EmployeeChangeRequest
    {
        $request = $this->repository->findById($id);

        if (!$request) {
            throw new \RuntimeException("Change request #{$id} not found.");
        }

        if (!$request->isPending()) {
            throw new \RuntimeException("Change request #{$id} is not pending.");
        }

        if (empty(trim($remarks))) {
            throw new \RuntimeException("Rejection remarks are required.");
        }

        return $this->repository->reject($id, $reviewerId, $remarks);
    }

    // ─── Queries ─────────────────────────────────────────────────────────────

    /**
     * Returns all non-cancelled requests for an employee, keyed by category.
     * Shape: [ 'name' => ChangeRequest|null, 'civil_status' => ChangeRequest|null, ... ]
     * Used by EmployeeShow to show pending badges.
     */
    public function getPendingMapForEmployee(int $employid): array
    {
        $requests = $this->repository->getForEmployee($employid);

        $map = array_fill_keys(array_keys(EmployeeChangeRequest::CATEGORIES), null);

        foreach ($requests as $request) {
            // Keep the most recent non-cancelled per category
            if (!isset($map[$request->category]) || $map[$request->category] === null) {
                $map[$request->category] = $request;
            }
        }

        return $map;
    }

    public function getAllForHR(array $filters = [])
    {
        return $this->repository->getAllForHR($filters);
    }

    public function getAttachmentsForEmployee(int $employid)
    {
        return $this->attachmentRepository->getForEmployee($employid);
    }
}
