<?php

namespace App\Imports\Sheets;

use App\Models\EmployeeParent;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithStartRow;

class ParentsImportSheet implements ToCollection, WithStartRow
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

            $rowNum      = $index + 2;
            $employid    = trim((string) ($row[0] ?? ''));
            $parentName  = trim((string) ($row[1] ?? ''));

            if ($employid === '') {
                $this->errors[] = ['row' => $rowNum, 'field' => 'Employee ID', 'message' => 'Required.'];
                $this->skipped++;
                continue;
            }

            if ($parentName === '') {
                $this->errors[] = ['row' => $rowNum, 'field' => 'Parent Name', 'message' => 'Required.'];
                $this->skipped++;
                continue;
            }

            try {
                $birthday = null;
                if (!empty($row[2])) {
                    $birthday = Carbon::parse($row[2])->format('Y-m-d');
                }

                EmployeeParent::firstOrCreate(
                    ['employid' => $employid, 'parent_name' => $parentName],
                    [
                        'parent_bday'   => $birthday,
                        'parent_age'    => $row[3] !== null && $row[3] !== '' ? (int) $row[3] : null,
                        'parent_gender' => trim((string) ($row[4] ?? '')) ?: null,
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
        return array_map(fn($e) => array_merge(['sheet' => 'Parents'], $e), $this->errors);
    }
}
