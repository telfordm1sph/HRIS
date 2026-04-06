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
    public function getEmployeeListWithWorkDetail(array $params = []): array
    {
        $query = EmployeeDetail::with([
            'workDetail.companyRel',
            'workDetail.departmentRel',
            'workDetail.jobTitleRel',
            'workDetail.prodLineRel',
            'workDetail.stationRel',
            'workDetail.teamRel',
            'workDetail.empPositionRel',
            'workDetail.statusRel',
            'workDetail.classRel',
            'workDetail.shiftRel',
            'workDetail.shuttleRel',
            'workDetail.govInfo',
        ])
        ->where('accstatus', 1)
        ->where('employid', '!=', 0)
        ->whereRaw("CAST(employid AS CHAR) NOT LIKE '5%'");

        if (!empty($params['search'])) {
            $s = $params['search'];
            $query->where(function ($q) use ($s) {
                $q->where('employid', 'like', "%{$s}%")
                  ->orWhere('firstname', 'like', "%{$s}%")
                  ->orWhere('lastname', 'like', "%{$s}%")
                  ->orWhere('middlename', 'like', "%{$s}%");
            });
        }

        $hasWorkFilter = !empty($params['company']) || !empty($params['department'])
            || !empty($params['status']) || !empty($params['class']);

        if ($hasWorkFilter) {
            $query->whereHas('workDetail', function ($q) use ($params) {
                if (!empty($params['company']))    $q->where('company',    $params['company']);
                if (!empty($params['department'])) $q->where('department', $params['department']);
                if (!empty($params['status']))     $q->where('empstatus',  $params['status']);
                if (!empty($params['class']))      $q->where('empclass',   $params['class']);
            });
        }

        $query->orderBy('firstname');
        $perPage   = $params['per_page'] ?? 50;
        $paginated = $query->paginate($perPage, ['*'], 'page', $params['page'] ?? 1);

        return [
            'data'         => $paginated->items(),
            'current_page' => $paginated->currentPage(),
            'last_page'    => $paginated->lastPage(),
            'per_page'     => $paginated->perPage(),
            'total'        => $paginated->total(),
        ];
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
