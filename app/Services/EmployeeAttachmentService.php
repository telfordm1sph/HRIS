<?php

namespace App\Services;

use App\Repositories\EmployeeAttachmentRepository;

class EmployeeAttachmentService
{
    public function __construct(
        protected EmployeeAttachmentRepository $repository
    ) {}

    /**
     * Return formatted attachment list for the employee profile Files tab.
     */
    public function getForEmployee(int $employid): array
    {
        return $this->repository
            ->getForEmployee($employid)
            ->map(fn ($a) => [
                'id'            => $a->id,
                'original_name' => $a->original_name,
                'description'   => $a->description,
                'mime_type'     => $a->mime_type,
                'size'          => $a->size_formatted,
                'is_image'      => $a->is_image,
                'url'           => $a->url,
                'created_at'    => $a->created_at?->format('M d, Y'),
            ])
            ->values()
            ->all();
    }
}
