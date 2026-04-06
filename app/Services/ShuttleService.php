<?php

namespace App\Services;

use App\Repositories\ShuttleRepository;
use Illuminate\Support\Collection;

class ShuttleService
{
    public function __construct(
        protected ShuttleRepository $repository
    ) {}

    public function getAll(): Collection
    {
        return $this->repository->getAll();
    }
}
