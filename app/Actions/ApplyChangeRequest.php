<?php

namespace App\Actions;

use App\Models\EmployeeChangeRequest;
use App\Models\EmployeeAddress;
use App\Models\EmployeeChild;
use App\Models\EmployeeDetail;
use App\Models\EmployeeParent;
use App\Models\EmployeeSibling;
use App\Models\EmployeeSpouse;
use App\Models\EmployeeWorkDetail;
use Illuminate\Support\Facades\DB;

class ApplyChangeRequest
{
    /**
     * Write the approved new_value back to the correct masterlist table(s).
     * All writes happen in a transaction scoped to the masterlist connection.
     */
    public function execute(EmployeeChangeRequest $request): void
    {
        $employid = $request->employid;
        $data     = $request->new_value;

        DB::connection('masterlist')->transaction(function () use ($request, $employid, $data) {
            match ($request->category) {
                'name'         => $this->applyName($employid, $data),
                'civil_status' => $this->applyCivilStatus($employid, $data),
                'education'    => $this->applyEducation($employid, $data),
                'others'       => $this->applyOthers($employid, $data),
                'address'      => $this->applyAddress($employid, $data),
                'father'       => $this->applyParent($employid, $data, 'Male'),
                'mother'       => $this->applyParent($employid, $data, 'Female'),
                'spouse'       => $this->applySpouse($employid, $data),
                'children'     => $this->applyChildren($employid, $data),
                'siblings'     => $this->applySiblings($employid, $data),
                default        => throw new \InvalidArgumentException(
                    "Unknown category: {$request->category}"
                ),
            };
        });
    }

    // ─── employee_details updates ─────────────────────────────────────────────

    private function applyName(int $employid, array $data): void
    {
        EmployeeDetail::on('masterlist')
            ->where('employid', $employid)
            ->update([
                'firstname'  => $data['firstname'],
                'middlename' => $data['middlename'],
                'lastname'   => $data['lastname'],
            ]);
    }

    private function applyCivilStatus(int $employid, array $data): void
    {
        EmployeeDetail::on('masterlist')
            ->where('employid', $employid)
            ->update(['civil_status' => $data['civil_status']]);
    }

    private function applyEducation(int $employid, array $data): void
    {
        EmployeeDetail::on('masterlist')
            ->where('employid', $employid)
            ->update(['educational_attainment' => $data['educational_attainment']]);
    }

    private function applyOthers(int $employid, array $data): void
    {
        EmployeeDetail::on('masterlist')
            ->where('employid', $employid)
            ->update([
                'nickname'    => $data['nickname']    ?? null,
                'email'       => $data['email']       ?? null,
                'contact_no'  => $data['contact_no']  ?? null,
                'religion'    => $data['religion']    ?? null,
                'blood_type'  => $data['blood_type']  ?? null,
                'height'      => $data['height']      ?? null,
                'weight'      => $data['weight']      ?? null,
            ]);

        EmployeeWorkDetail::on('masterlist')
            ->where('employid', $employid)
            ->update(['shuttle' => $data['shuttle'] ?? null]);
    }

    // ─── employee_address update ──────────────────────────────────────────────

    private function applyAddress(int $employid, array $data): void
    {
        EmployeeAddress::on('masterlist')
            ->updateOrCreate(
                ['employid' => $employid],
                [
                    'house_no'         => $data['house_no']         ?? null,
                    'brgy'             => $data['brgy']             ?? null,
                    'city'             => $data['city']             ?? null,
                    'province'         => $data['province']         ?? null,
                    'perma_house_no'   => $data['perma_house_no']   ?? null,
                    'perma_brgy'       => $data['perma_brgy']       ?? null,
                    'perma_city'       => $data['perma_city']       ?? null,
                    'perma_province'   => $data['perma_province']   ?? null,
                ]
            );
    }

    // ─── employee_parent update ───────────────────────────────────────────────

    private function applyParent(int $employid, array $data, string $gender): void
    {
        EmployeeParent::on('masterlist')
            ->updateOrCreate(
                ['employid' => $employid, 'parent_gender' => $gender],
                [
                    'parent_name'   => $data['parent_name']   ?? null,
                    'parent_bday'   => $data['parent_bday']   ?? null,
                    'parent_age'    => $data['parent_age']    ?? null,
                    'parent_gender' => $gender,
                ]
            );
    }

    // ─── Array syncs (delete all + re-insert) ────────────────────────────────

    private function applySpouse(int $employid, array $rows): void
    {
        EmployeeSpouse::on('masterlist')->where('employid', $employid)->delete();

        foreach ($rows as $row) {
            EmployeeSpouse::on('masterlist')->create([
                'employid'      => $employid,
                'spouse_name'   => $row['spouse_name']   ?? null,
                'spouse_bday'   => $row['spouse_bday']   ?? null,
                'spouse_age'    => $row['spouse_age']    ?? null,
                'spouse_gender' => $row['spouse_gender'] ?? null,
            ]);
        }
    }

    private function applyChildren(int $employid, array $rows): void
    {
        EmployeeChild::on('masterlist')->where('employid', $employid)->delete();

        foreach ($rows as $row) {
            EmployeeChild::on('masterlist')->create([
                'employid'     => $employid,
                'child_name'   => $row['child_name']   ?? null,
                'child_bday'   => $row['child_bday']   ?? null,
                'child_age'    => $row['child_age']    ?? null,
                'child_gender' => $row['child_gender'] ?? null,
            ]);
        }
    }

    private function applySiblings(int $employid, array $rows): void
    {
        EmployeeSibling::on('masterlist')->where('employid', $employid)->delete();

        foreach ($rows as $row) {
            EmployeeSibling::on('masterlist')->create([
                'employid'       => $employid,
                'sibling_name'   => $row['sibling_name']   ?? null,
                'sibling_bday'   => $row['sibling_bday']   ?? null,
                'sibling_age'    => $row['sibling_age']    ?? null,
                'sibling_gender' => $row['sibling_gender'] ?? null,
            ]);
        }
    }
}
