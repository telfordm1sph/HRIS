<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

class AdminRepository
{
    public function exists(int $empId): bool
    {
        return DB::table('admin')->where('emp_id', $empId)->exists();
    }

    public function add(int $empId, string $name, string $role, int $updatedBy): void
    {
        DB::table('admin')->insert([
            'emp_id'          => $empId,
            'emp_name'        => $name,
            'emp_role'        => $role,
            'last_updated_by' => $updatedBy,
        ]);
    }

    public function remove(int $empId): void
    {
        DB::table('admin')->where('emp_id', $empId)->delete();
    }

    public function updateRole(int $empId, string $role, int $updatedBy): void
    {
        DB::table('admin')->where('emp_id', $empId)->update([
            'emp_role'        => $role,
            'last_updated_by' => $updatedBy,
        ]);
    }
}
