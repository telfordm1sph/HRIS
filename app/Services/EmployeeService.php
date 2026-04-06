<?php

namespace App\Services;

use App\Repositories\EmployeeRepository;
use Illuminate\Support\Collection;

class EmployeeService
{
    public function __construct(
        protected EmployeeRepository $repository
    ) {}

    public function getFullDetail(int $employid): array
    {
        $employee = $this->repository->getFullDetailByEmployid($employid);

        if (!$employee) {
            return $this->notFound();
        }

        $work = $employee->workDetail;

        return [
            'success' => true,
            'data'    => [
                // 👤 Personal
                'emp_id'                  => $employee->employid,
                'emp_name'                => trim($employee->firstname . ' ' . $employee->middlename . ' ' . $employee->lastname),
                'emp_firstname'           => $employee->firstname,
                'emp_middlename'          => $employee->middlename,
                'emp_lastname'            => $employee->lastname,
                'nickname'                => $employee->nickname,
                'birthday'                => $employee->birthday,
                'place_of_birth'          => $employee->place_of_birth,
                'emp_sex'                 => $employee->emp_sex,
                'email'                   => $employee->email,
                'contact_no'              => $employee->contact_no,
                'civil_status'            => $employee->civil_status,
                'religion'                => $employee->religion,
                'height'                  => $employee->height,
                'weight'                  => $employee->weight,
                'blood_type'              => $employee->blood_type,
                'educational_attainment'  => $employee->educational_attainment,
                'accstatus'               => $employee->accstatus,

                // 🏠 Address
                'address' => $employee->address?->first() ? [
                    'house_no'       => $employee->address->first()->house_no,
                    'brgy'           => $employee->address->first()->brgy,
                    'city'           => $employee->address->first()->city,
                    'province'       => $employee->address->first()->province,

                    'perma_house_no' => $employee->address->first()->perma_house_no,
                    'perma_brgy'     => $employee->address->first()->perma_brgy,
                    'perma_city'     => $employee->address->first()->perma_city,
                    'perma_province' => $employee->address->first()->perma_province,
                ] : null,
                // 👨‍👩‍👧‍👦 Parents
                'parent' =>  $employee->parents->map(fn($p) => [
                    'id'             => $p->id,
                    'parent_name'   => $p->parent_name,
                    'parent_bday'   => $p->parent_bday,
                    'parent_age'    => $p->parent_age,
                    'parent_gender' => $p->parent_gender,
                ]),

                // 💍 Spouse
                'spouse' => $employee->spouse->map(fn($sp) => [
                    'id'             => $sp->id,
                    'spouse_name'   => $sp->spouse_name,
                    'spouse_bday'   => $sp->spouse_bday,
                    'spouse_age'    => $sp->spouse_age,
                    'spouse_gender' => $sp->spouse_gender,
                ]),

                // 👨‍👩‍👧 Family
                'siblings' =>  $employee->siblings->map(fn($s) => [
                    'id'             => $s->id,
                    'sibling_name'   => $s->sibling_name,
                    'sibling_bday'   => $s->sibling_bday,
                    'sibling_age'    => $s->sibling_age,
                    'sibling_gender' => $s->sibling_gender,
                ]),

                'children' => $employee->children->map(fn($c) => [
                    'id'           => $c->id,
                    'child_name'   => $c->child_name,
                    'child_bday'   => $c->child_bday,
                    'child_age'    => $c->child_age,
                    'child_gender' => $c->child_gender,
                ]),

                // 🏢 Work
                'company_id'      => $work->company       ?? null,
                'company'         => $work->companyRel->company_name ?? null,
                'emp_dept_id'      => $work->department   ?? null,
                'emp_dept'         => $work->departmentRel->dept_name ?? null,
                'emp_jobtitle_id'  => $work->job_title    ?? null,
                'emp_jobtitle'     => $work->jobTitleRel->position ?? null,
                'emp_prodline_id'  => $work->prodline     ?? null,
                'emp_prodline'     => $work->prodLineRel->pl_name ?? null,
                'emp_station_id'   => $work->station      ?? null,
                'emp_station'      => $work->stationRel->station_name ?? null,
                'team_id'          => $work->team         ?? null,
                'team'             => $work->teamRel->team_name ?? null,
                'emp_position_id'  => $work->empposition  ?? null,
                'emp_position'     => $work->empPositionRel->emp_position_name  ?? null,
                'emp_status_id'    => $work->empstatus    ?? null,
                'emp_status'       => $work->statusRel->status_name  ?? null,
                'emp_class_id'     => $work->empclass     ?? null,
                'emp_class'        => $work->classRel->class_name  ?? null,
                'shift_type_id'    => $work->shift_type   ?? null,
                'shift_type'       => $work->shiftRel->shift_name  ?? null,
                'shuttle_id'       => $work->shuttle      ?? null,
                'shuttle'          => $work->shuttleRel->shuttle_name ?? null,
                'date_hired'       => $work->date_hired   ?? null,
                'date_reg'         => $work->date_reg     ?? null,
                'service_length'   => $work->service_length ?? null,

                // 🏛 Government Info
                'gov_info' => $work && $work->govInfo ? [
                    'tin_no'         => $work->govInfo->tin_no,
                    'sss_no'         => $work->govInfo->sss_no,
                    'philhealth_no'  => $work->govInfo->philhealth_no,
                    'pagibig_no'     => $work->govInfo->pagibig_no,
                    'bank_acct_no'   => $work->govInfo->bank_acct_no,
                ] : null,

                // 👤 Approvers - Using eager loaded data (NO N+1 queries!)
                'approver' => $this->formatApproverData($work->approver ?? null),
            ],
        ];
    }

    /**
     * Format approver data using already loaded relationships
     * This method does NOT execute additional database queries
     */
    private function formatApproverData($approver): ?array
    {
        if (!$approver) {
            return null;
        }

        return [
            // Approver 1
            'approver1_id' => $approver->approver1,
            'approver1' => $this->formatApproverName($approver->approver1, $approver->approver1Detail),

            // Approver 2
            'approver2_id' => $approver->approver2,
            'approver2' => $this->formatApproverName($approver->approver2, $approver->approver2Detail),

            // Approver 3
            'approver3_id' => $approver->approver3,
            'approver3' => $this->formatApproverName($approver->approver3, $approver->approver3Detail),
        ];
    }

    /**
     * Format single approver name as "ID - Full Name"
     */
    private function formatApproverName($approverId, $approverDetail): ?string
    {
        if (!$approverId) {
            return null;
        }

        if ($approverDetail) {
            $fullName = trim($approverDetail->firstname . ' ' . $approverDetail->middlename . ' ' . $approverDetail->lastname);
            return $approverId . ' - ' . $fullName;
        }

        return (string) $approverId;
    }

    public function getWorkDetail(int $employid): array
    {
        $work = $this->repository->getWorkDetailByEmployid($employid);

        if (!$work) {
            return $this->notFound();
        }

        return [
            'success' => true,
            'data'    => [
                'emp_id'          => $work->employid,
                'emp_dept_id'     => $work->department,
                'emp_dept'        => $work->departmentRel->dept_name          ?? null,
                'emp_jobtitle_id' => $work->job_title,
                'emp_jobtitle'    => $work->jobTitleRel->position              ?? null,
                'emp_prodline_id' => $work->prodline,
                'emp_prodline'    => $work->prodLineRel->pl_name               ?? null,
                'emp_station_id'  => $work->station,
                'emp_station'     => $work->stationRel->station_name           ?? null,
                'team_id'     => $work->team,
                'team'        => $work->teamRel->team_name                 ?? null,
                'emp_position_id' => $work->empposition,
                'emp_position'    => $work->empPositionRel->emp_position_name  ?? null,
                'emp_status'      => $work->empstatus,
                'emp_class'       => $work->empclass,
                'shift_type'      => $work->shift_type,
                'date_hired'      => $work->date_hired,
                'date_reg'        => $work->date_reg,
                'service_length'  => $work->service_length,
                // Add approvers to work detail as well
                'approver'        => $this->formatApproverData($work->approver ?? null),
            ],
        ];
    }
    public function getActiveEmployeeList(array $params = []): array
    {
        $result = $this->repository->getActiveEmployeeList($params);

        // Format the data
        $result['data'] = array_map(function ($e) {
            return [
                'employid' => $e['employid'],
                'emp_name' => trim($e['firstname'] . ' ' . $e['middlename'] . ' ' . $e['lastname']),
            ];
        }, $result['data']);

        return $result;
    }
    private function notFound(): array
    {
        return [
            'success' => false,
            'message' => 'Employee not found.',
        ];
    }
}
