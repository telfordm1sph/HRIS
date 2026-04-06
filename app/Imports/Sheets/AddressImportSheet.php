<?php

namespace App\Imports\Sheets;

use App\Models\EmployeeAddress;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithStartRow;

class AddressImportSheet implements ToCollection, WithStartRow
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

            $rowNum   = $index + 2;
            $employid = trim((string) ($row[0] ?? ''));

            if ($employid === '') {
                $this->errors[] = ['row' => $rowNum, 'field' => 'Employee ID', 'message' => 'Required.'];
                $this->skipped++;
                continue;
            }

            try {
                EmployeeAddress::updateOrCreate(
                    ['employid' => $employid],
                    [
                        'house_no'       => trim((string) ($row[1] ?? '')),
                        'brgy'           => trim((string) ($row[2] ?? '')),
                        'city'           => trim((string) ($row[3] ?? '')),
                        'province'       => trim((string) ($row[4] ?? '')),
                        'perma_house_no' => trim((string) ($row[5] ?? '')),
                        'perma_brgy'     => trim((string) ($row[6] ?? '')),
                        'perma_city'     => trim((string) ($row[7] ?? '')),
                        'perma_province' => trim((string) ($row[8] ?? '')),
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
        return array_map(fn($e) => array_merge(['sheet' => 'Address'], $e), $this->errors);
    }
}
