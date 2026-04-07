<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

class ProfileRepository
{
    public function findProfile(int $empId): ?object
    {
        return DB::connection('masterlist')
            ->table('employee_masterlist')
            ->select('EMPLOYID', 'EMPNAME', 'JOB_TITLE', 'DEPARTMENT', 'PRODLINE', 'STATION', 'DATEHIRED', 'EMAIL', 'PASSWRD')
            ->where('EMPLOYID', $empId)
            ->first();
    }

    public function updatePassword(int $empId, string $newPassword): void
    {
        DB::connection('masterlist')
            ->table('employee_masterlist')
            ->where('EMPLOYID', $empId)
            ->update(['PASSWRD' => $newPassword]);
    }
}
