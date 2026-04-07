<?php

namespace App\Services;

use App\Repositories\ProfileRepository;

class ProfileService
{
    public function __construct(
        protected ProfileRepository $repository
    ) {}

    public function getProfile(int $empId): ?object
    {
        return $this->repository->findProfile($empId);
    }

    /**
     * Returns true on success, or an error string on failure.
     */
    public function changePassword(int $empId, string $currentPassword, string $newPassword): true|string
    {
        $profile = $this->repository->findProfile($empId);

        if (!$profile || $profile->PASSWRD !== $currentPassword) {
            return 'Current password is incorrect.';
        }

        $this->repository->updatePassword($empId, $newPassword);

        return true;
    }
}
