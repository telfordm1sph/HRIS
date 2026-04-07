<?php

namespace App\Services;

use App\Repositories\EmployeeAttachmentRepository;
use Illuminate\Http\UploadedFile;

class EmployeeAttachmentService
{
    public function __construct(
        protected EmployeeAttachmentRepository $repository
    ) {}

    public function store(int $employid, int $uploadedBy, UploadedFile $file, string $description = ''): array
    {
        $a = $this->repository->store($employid, $uploadedBy, $file, $description);

        return [
            'id'            => $a->id,
            'original_name' => $a->original_name,
            'description'   => $a->description,
            'size'          => $a->size_formatted,
            'is_image'      => $a->is_image,
            'url'           => $a->url,
        ];
    }

    public function findForView(int $id): ?array
    {
        $a = $this->repository->findById($id);
        if (!$a) return null;

        return [
            'file_path'     => $a->file_path,
            'original_name' => $a->original_name,
            'mime_type'     => $a->mime_type,
        ];
    }

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
