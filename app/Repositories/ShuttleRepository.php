<?php

namespace App\Repositories;

use App\Models\Shuttle;
use Illuminate\Support\Collection;

class ShuttleRepository
{
    public function getAll(): Collection
    {
        return Shuttle::orderBy('shuttle_name')->get(['id', 'shuttle_name']);
    }
}
