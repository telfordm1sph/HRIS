<?php

namespace App\Repositories;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

class LookupRepository
{
    public function all(string $modelClass, string $orderBy): Collection
    {
        return $modelClass::orderBy($orderBy)->get();
    }

    public function create(string $modelClass, array $data): Model
    {
        return $modelClass::create($data);
    }

    public function update(string $modelClass, int $id, array $data): bool
    {
        return (bool) $modelClass::where('id', $id)->update($data);
    }

    public function delete(string $modelClass, int $id): void
    {
        $modelClass::where('id', $id)->delete();
    }
}
