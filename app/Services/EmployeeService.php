<?php

namespace App\Services;

use App\Repositories\EmployeeRepository;

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

                // 👨‍👩‍👧 Family
                'siblings' => $employee->siblings->map(fn($s) => [
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
                'emp_dept_id'      => $work->department   ?? null,
                'emp_dept'         => $work->departmentRel->dept_name          ?? null,
                'emp_jobtitle_id'  => $work->job_title    ?? null,
                'emp_jobtitle'     => $work->jobTitleRel->position              ?? null,
                'emp_prodline_id'  => $work->prodline     ?? null,
                'emp_prodline'     => $work->prodLineRel->pl_name               ?? null,
                'emp_station_id'   => $work->station      ?? null,
                'emp_station'      => $work->stationRel->station_name           ?? null,
                'emp_position_id'  => $work->empposition  ?? null,
                'emp_position'     => $work->empPositionRel->emp_position_name  ?? null,
                'emp_status'       => $work->empstatus    ?? null,
                'emp_class'        => $work->empclass     ?? null,
                'shift_type'       => $work->shift_type   ?? null,
                'date_hired'       => $work->date_hired   ?? null,
                'date_reg'         => $work->date_reg     ?? null,
                'service_length'   => $work->service_length ?? null,
            ],
        ];
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
                'emp_position_id' => $work->empposition,
                'emp_position'    => $work->empPositionRel->emp_position_name  ?? null,
                'emp_status'      => $work->empstatus,
                'emp_class'       => $work->empclass,
                'shift_type'      => $work->shift_type,
                'date_hired'      => $work->date_hired,
                'date_reg'        => $work->date_reg,
                'service_length'  => $work->service_length,
            ],
        ];
    }

    private function notFound(): array
    {
        return [
            'success' => false,
            'message' => 'Employee not found.',
        ];
    }
}
