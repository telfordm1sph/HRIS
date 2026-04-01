<?php

namespace App\Repositories;

use App\Models\EmployeeChangeRequest;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class EmployeeChangeRequestRepository
{
    // ─── Employee-facing ─────────────────────────────────────────────────────

    /**
     * All non-cancelled requests for a specific employee.
     */
    public function getForEmployee(int $employid): Collection
    {
        return EmployeeChangeRequest::with(['attachment', 'requester', 'reviewer'])
            ->where('employid', $employid)
            ->whereNot('status', EmployeeChangeRequest::STATUS_CANCELLED)
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * Get the single active pending request for a specific category.
     */
    public function getPendingForCategory(int $employid, string $category): ?EmployeeChangeRequest
    {
        return EmployeeChangeRequest::with('attachment')
            ->where('employid', $employid)
            ->where('category', $category)
            ->where('status', EmployeeChangeRequest::STATUS_PENDING)
            ->latest()
            ->first();
    }

    // ─── HR-facing ───────────────────────────────────────────────────────────

    /**
     * Paginated list for the HR table with filters.
     */
    public function getAllForHR(array $filters = []): LengthAwarePaginator
    {
        $query = EmployeeChangeRequest::with(['attachment', 'requester', 'reviewer'])
            ->orderByRaw("FIELD(status, 'pending', 'approved', 'rejected', 'cancelled')")
            ->orderByDesc('created_at');

        // Status filter — default to pending
        $status = $filters['status'] ?? 'pending';
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        // Category filter
        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        // Date range
        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        // Employee search
        if (!empty($filters['employid'])) {
            $query->where('employid', $filters['employid']);
        }

        return $query->paginate($filters['per_page'] ?? 20);
    }

    public function findById(int $id): ?EmployeeChangeRequest
    {
        return EmployeeChangeRequest::with(['attachment', 'requester', 'reviewer'])
            ->find($id);
    }

    // ─── Mutation ────────────────────────────────────────────────────────────

    /**
     * Cancel all pending requests for the same employee + category.
     */
    public function cancelPreviousPending(int $employid, string $category): void
    {
        EmployeeChangeRequest::where('employid', $employid)
            ->where('category', $category)
            ->where('status', EmployeeChangeRequest::STATUS_PENDING)
            ->update(['status' => EmployeeChangeRequest::STATUS_CANCELLED]);
    }

    public function create(array $data): EmployeeChangeRequest
    {
        return EmployeeChangeRequest::create($data);
    }

    public function approve(int $id, ?int $reviewerId = null): EmployeeChangeRequest
    {
        $request = EmployeeChangeRequest::findOrFail($id);

        $updateData = [
            'status'      => EmployeeChangeRequest::STATUS_APPROVED,
            'reviewed_at' => now(),
            'remarks'     => null,
        ];

        // Only set reviewed_by if a reviewer ID is provided
        if ($reviewerId !== null) {
            $updateData['reviewed_by'] = $reviewerId;
        }

        $request->update($updateData);
        return $request->fresh();
    }

    public function reject(int $id, ?int $reviewerId = null, string $remarks): EmployeeChangeRequest
    {
        $request = EmployeeChangeRequest::findOrFail($id);

        $updateData = [
            'status'      => EmployeeChangeRequest::STATUS_REJECTED,
            'reviewed_at' => now(),
            'remarks'     => $remarks,
        ];

        // Only set reviewed_by if a reviewer ID is provided
        if ($reviewerId !== null) {
            $updateData['reviewed_by'] = $reviewerId;
        }

        $request->update($updateData);
        return $request->fresh();
    }
}
