<?php

namespace App\Repositories;

use App\Models\EmployeeAddress;
use App\Models\EmployeeApprover;
use App\Models\EmployeeChild;
use App\Models\EmployeeClass;
use App\Models\EmployeeCompany;
use App\Models\EmployeeDepartment;
use App\Models\EmployeeDetail;
use App\Models\EmployeeParent;
use App\Models\EmployeePosition;
use App\Models\EmployeeShift;
use App\Models\EmployeeSibling;
use App\Models\EmployeeSpouse;
use App\Models\EmployeeStatus;
use App\Models\EmployeeWorkDetail;
use App\Models\JobTitle;
use App\Models\ProdLine;
use App\Models\Shuttle;
use App\Models\Station;
use App\Models\Team;

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

    public function getAuthDetailByEmployid(int $employid): ?EmployeeDetail
    {
        return EmployeeDetail::with([
            'workDetail',
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
            'shuttleRel',
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

    // ── Lookup tables ─────────────────────────────────────────────────────────

    public function getIndexLookups(): array
    {
        return [
            'companies'   => EmployeeCompany::on('masterlist')->orderBy('company_name')->pluck('company_name', 'id'),
            'departments' => EmployeeDepartment::on('masterlist')->orderBy('dept_name')->pluck('dept_name', 'id'),
            'statuses'    => EmployeeStatus::on('masterlist')->orderBy('status_name')->pluck('status_name', 'id'),
            'classes'     => EmployeeClass::on('masterlist')->orderBy('class_name')->pluck('class_name', 'id'),
        ];
    }

    public function getAdminLookups(): array
    {
        $toOptions = fn($items, $labelKey) => $items->map(fn($r) => ['value' => $r->id, 'label' => $r->$labelKey])->values()->all();

        return [
            'companies'   => $toOptions(EmployeeCompany::on('masterlist')->orderBy('company_name')->get(),   'company_name'),
            'departments' => $toOptions(EmployeeDepartment::on('masterlist')->orderBy('dept_name')->get(),    'dept_name'),
            'jobTitles'   => $toOptions(JobTitle::on('masterlist')->orderBy('position')->get(),               'position'),
            'prodLines'   => $toOptions(ProdLine::on('masterlist')->orderBy('pl_name')->get(),                'pl_name'),
            'stations'    => $toOptions(Station::on('masterlist')->orderBy('station_name')->get(),            'station_name'),
            'teams'       => $toOptions(Team::on('masterlist')->orderBy('team_name')->get(),                  'team_name'),
            'positions'   => $toOptions(EmployeePosition::on('masterlist')->orderBy('emp_position_name')->get(), 'emp_position_name'),
            'statuses'    => $toOptions(EmployeeStatus::on('masterlist')->orderBy('status_name')->get(),      'status_name'),
            'classes'     => $toOptions(EmployeeClass::on('masterlist')->orderBy('class_name')->get(),        'class_name'),
            'shifts'      => $toOptions(EmployeeShift::on('masterlist')->orderBy('shift_name')->get(),        'shift_name'),
            'shuttles'    => $toOptions(Shuttle::on('masterlist')->orderBy('shuttle_name')->get(),            'shuttle_name'),
        ];
    }

    // ── Admin direct-write methods ────────────────────────────────────────────

    public function updatePersonalField(int $empId, string $field, mixed $value): void
    {
        EmployeeDetail::on('masterlist')
            ->where('employid', $empId)
            ->update([$field => $value ?: null]);
    }

    public function updateWorkField(int $empId, string $field, mixed $value): void
    {
        EmployeeWorkDetail::on('masterlist')
            ->where('employid', $empId)
            ->update([$field => $value ?: null]);
    }

    public function updateAddressField(int $empId, string $field, mixed $value): void
    {
        EmployeeAddress::on('masterlist')
            ->where('employid', $empId)
            ->update([$field => $value ?: null]);
    }

    public function updateApproverField(int $empId, string $field, mixed $value): void
    {
        EmployeeApprover::on('masterlist')
            ->where('employid', $empId)
            ->update([$field => $value ?: null]);
    }

    public function updateFamilyRow(string $familyType, int $rowId, int $empId, array $payload): void
    {
        match ($familyType) {
            'parent'  => EmployeeParent::on('masterlist')->where('id', $rowId)->where('employid', $empId)->update($payload),
            'spouse'  => EmployeeSpouse::on('masterlist')->where('id', $rowId)->where('employid', $empId)->update($payload),
            'sibling' => EmployeeSibling::on('masterlist')->where('id', $rowId)->where('employid', $empId)->update($payload),
            'child'   => EmployeeChild::on('masterlist')->where('id', $rowId)->where('employid', $empId)->update($payload),
        };
    }

    public function addFamilyRow(string $familyType, int $empId, array $data): void
    {
        $payload = array_merge(['employid' => $empId], $data);

        match ($familyType) {
            'parent'  => EmployeeParent::on('masterlist')->create($payload),
            'spouse'  => EmployeeSpouse::on('masterlist')->create($payload),
            'sibling' => EmployeeSibling::on('masterlist')->create($payload),
            'child'   => EmployeeChild::on('masterlist')->create($payload),
        };
    }

    public function deleteFamilyRow(string $familyType, int $rowId, int $empId): void
    {
        match ($familyType) {
            'parent'  => EmployeeParent::on('masterlist')->where('id', $rowId)->where('employid', $empId)->delete(),
            'spouse'  => EmployeeSpouse::on('masterlist')->where('id', $rowId)->where('employid', $empId)->delete(),
            'sibling' => EmployeeSibling::on('masterlist')->where('id', $rowId)->where('employid', $empId)->delete(),
            'child'   => EmployeeChild::on('masterlist')->where('id', $rowId)->where('employid', $empId)->delete(),
        };
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
