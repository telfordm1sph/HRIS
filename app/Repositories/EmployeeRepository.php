<?php

namespace App\Repositories;

use App\Models\EmployeeDetail;
use App\Models\EmployeeWorkDetail;

class EmployeeRepository
{
    public function getFullDetailByEmployid(int $employid): ?EmployeeDetail
    {
        return EmployeeDetail::with([
            'workDetail.companyRel',
            'workDetail.departmentRel',
            'workDetail.jobTitleRel',
            'workDetail.prodLineRel',
            'workDetail.stationRel',
            'workDetail.empPositionRel',
            'workDetail.statusRel',
            'workDetail.teamRel',
            'workDetail.classRel',
            'workDetail.shiftRel',
            'workDetail.shuttleRel',
            'workDetail.govInfo',
            'workDetail.approver.approver1Detail',
            'workDetail.approver.approver2Detail',
            'workDetail.approver.approver3Detail',
            'address',
            'parents',
            'spouse',
            'siblings',
            'children',
        ])->where('employid', $employid)->first();
    }

    public function getWorkDetailByEmployid(int $employid)
    {
        return EmployeeWorkDetail::with([
            'companyRel',
            'departmentRel',
            'jobTitleRel',
            'prodLineRel',
            'stationRel',
            'teamRel',
            'empPositionRel',
            'statusRel',
            'classRel',
            'shiftRel',
            'approver.approver1Detail',
            'approver.approver2Detail',
            'approver.approver3Detail',
            'govInfo'
        ])->where('employid', $employid)->first();
    }
    public function getActiveEmployeeList(array $params = []): array
    {
        $query = EmployeeDetail::where('accstatus', 1)
            ->where('employid', '!=', 0)
            ->whereRaw("CAST(employid AS CHAR) NOT LIKE '5%'");

        // Search functionality
        if (!empty($params['search'])) {
            $search = $params['search'];
            $query->where(function ($q) use ($search) {
                $q->where('employid', 'like', "%{$search}%")
                    ->orWhere('firstname', 'like', "%{$search}%")
                    ->orWhere('middlename', 'like', "%{$search}%")
                    ->orWhere('lastname', 'like', "%{$search}%");
            });
        }

        // Ordering
        $query->orderBy('firstname');

        // Pagination
        $perPage = $params['per_page'] ?? 50;
        $page = $params['page'] ?? 1;
        $paginated = $query->paginate($perPage, ['employid', 'firstname', 'middlename', 'lastname'], 'page', $page);

        return [
            'data' => $paginated->items(),
            'current_page' => $paginated->currentPage(),
            'last_page' => $paginated->lastPage(),
            'per_page' => $paginated->perPage(),
            'total' => $paginated->total(),
        ];
    }
}
