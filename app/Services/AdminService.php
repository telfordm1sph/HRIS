<?php

namespace App\Services;

use App\Repositories\AdminRepository;

class AdminService
{
    public function __construct(
        protected AdminRepository $repository
    ) {}

    public function add(int $empId, string $name, string $role, int $updatedBy): void
    {
        if ($this->repository->exists($empId)) {
            return;
        }

        $this->repository->add($empId, $name, $role, $updatedBy);
    }

    public function remove(int $empId): void
    {
        $this->repository->remove($empId);
    }

    public function changeRole(int $empId, string $role, int $updatedBy): void
    {
        $this->repository->updateRole($empId, $role, $updatedBy);
    }
}
