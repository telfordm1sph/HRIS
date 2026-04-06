<?php

namespace App\Imports\Sheets;

use App\Models\EmployeeDetail;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithStartRow;

class EmployeeDetailsImportSheet implements ToCollection, WithStartRow
{
    private array $errors  = [];
    private int   $processed = 0;
    private int   $skipped   = 0;

    public function startRow(): int
    {
        return 2; // row 1 is header
    }

    public function collection(Collection $rows): void
    {
        foreach ($rows as $index => $row) {
            // Skip blank rows
            if ($row->filter(fn($v) => $v !== null && $v !== '')->isEmpty()) {
                continue;
            }

            $rowNum   = $index + 2;
            $employid = trim((string) ($row[0] ?? ''));

            if ($employid === '') {
                $this->errors[] = ['row' => $rowNum, 'field' => 'Employee ID', 'message' => 'Required.'];
                $this->skipped++;
                continue;
            }

            $firstname = trim((string) ($row[1] ?? ''));
            $lastname  = trim((string) ($row[3] ?? ''));

            if ($firstname === '' || $lastname === '') {
                $this->errors[] = ['row' => $rowNum, 'field' => 'Name', 'message' => 'First name and last name are required.'];
                $this->skipped++;
                continue;
            }

            try {
                $birthday = null;
                if (!empty($row[5])) {
                    $birthday = Carbon::parse($row[5])->format('Y-m-d');
                }

                EmployeeDetail::updateOrCreate(
                    ['employid' => $employid],
                    [
                        'firstname'              => $firstname,
                        'middlename'             => trim((string) ($row[2] ?? '')),
                        'lastname'               => $lastname,
                        'nickname'               => trim((string) ($row[4] ?? '')),
                        'birthday'               => $birthday,
                        'place_of_birth'         => trim((string) ($row[6] ?? '')),
                        'emp_sex'                => trim((string) ($row[7] ?? '')),
                        'email'                  => trim((string) ($row[8] ?? '')),
                        'contact_no'             => trim((string) ($row[9] ?? '')),
                        'civil_status'           => trim((string) ($row[10] ?? '')),
                        'religion'               => trim((string) ($row[11] ?? '')),
                        'height'                 => $row[12] !== null && $row[12] !== '' ? (float) $row[12] : null,
                        'weight'                 => $row[13] !== null && $row[13] !== '' ? (float) $row[13] : null,
                        'blood_type'             => trim((string) ($row[14] ?? '')),
                        'educational_attainment' => trim((string) ($row[15] ?? '')),
                    ]
                );

                $this->processed++;
            } catch (\Throwable $e) {
                $this->errors[] = ['row' => $rowNum, 'field' => 'general', 'message' => $e->getMessage()];
                $this->skipped++;
            }
        }
    }

    public function getResult(): array
    {
        return ['processed' => $this->processed, 'skipped' => $this->skipped];
    }

    public function getErrors(): array
    {
        return array_map(fn($e) => array_merge(['sheet' => 'Employee Details'], $e), $this->errors);
    }
}
