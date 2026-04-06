<?php

namespace App\Imports\Sheets;

use App\Models\EmployeeSpouse;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithStartRow;

class SpouseImportSheet implements ToCollection, WithStartRow
{
    private array $errors    = [];
    private int   $processed = 0;
    private int   $skipped   = 0;

    public function startRow(): int
    {
        return 2;
    }

    public function collection(Collection $rows): void
    {
        foreach ($rows as $index => $row) {
            if ($row->filter(fn($v) => $v !== null && $v !== '')->isEmpty()) {
                continue;
            }

            $rowNum     = $index + 2;
            $employid   = trim((string) ($row[0] ?? ''));
            $spouseName = trim((string) ($row[1] ?? ''));

            if ($employid === '') {
                $this->errors[] = ['row' => $rowNum, 'field' => 'Employee ID', 'message' => 'Required.'];
                $this->skipped++;
                continue;
            }

            if ($spouseName === '') {
                $this->errors[] = ['row' => $rowNum, 'field' => 'Spouse Name', 'message' => 'Required.'];
                $this->skipped++;
                continue;
            }

            try {
                $birthday        = null;
                $dateOfMarriage  = null;

                if (!empty($row[2])) {
                    $birthday = Carbon::parse($row[2])->format('Y-m-d');
                }
                if (!empty($row[5])) {
                    $dateOfMarriage = Carbon::parse($row[5])->format('Y-m-d');
                }

                EmployeeSpouse::firstOrCreate(
                    ['employid' => $employid, 'spouse_name' => $spouseName],
                    [
                        'spouse_bday'      => $birthday,
                        'spouse_age'       => $row[3] !== null && $row[3] !== '' ? (int) $row[3] : null,
                        'spouse_gender'    => trim((string) ($row[4] ?? '')) ?: null,
                        'date_of_marriage' => $dateOfMarriage,
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
        return array_map(fn($e) => array_merge(['sheet' => 'Spouse'], $e), $this->errors);
    }
}
