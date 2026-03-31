<?php

namespace App\Repositories;

use App\Models\EmployeeDetail;
use App\Models\EmployeeWorkDetail;

class EmployeeRepository
{
    public function getFullDetailByEmployid(int $employid): ?EmployeeDetail
    {
        return EmployeeDetail::with([
            'workDetail.departmentRel',
            'workDetail.jobTitleRel',
            'workDetail.prodLineRel',
            'workDetail.stationRel',
            'workDetail.empPositionRel',
            'siblings',
            'children',
        ])->where('employid', $employid)->first();
    }

    public function getWorkDetailByEmployid(int $employid)
    {
        return EmployeeWorkDetail::with([
            'departmentRel',
            'jobTitleRel',
            'prodLineRel',
            'stationRel',
            'empPositionRel',
        ])->where('employid', $employid)->first();
    }
}
