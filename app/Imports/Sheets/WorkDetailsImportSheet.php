<?php

namespace App\Imports\Sheets;

use App\Imports\Resolvers\LookupResolver;
use App\Models\EmployeeWorkDetail;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithStartRow;

class WorkDetailsImportSheet implements ToCollection, WithStartRow
{
    private array $errors    = [];
    private int   $processed = 0;
    private int   $skipped   = 0;

    public function __construct(private readonly LookupResolver $resolver) {}

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

            $rowErrors = [];

            $department  = $this->resolver->resolveOrError('department',  $row[2],  $rowNum, 'Department',        $rowErrors);
            $prodline    = $this->resolver->resolveOrError('prodline',    $row[3],  $rowNum, 'Production Line',   $rowErrors);
            $jobTitle    = $this->resolver->resolveOrError('job_title',   $row[4],  $rowNum, 'Job Title',         $rowErrors);
            $station     = $this->resolver->resolveOrError('station',     $row[5],  $rowNum, 'Station',           $rowErrors);
            $empstatus   = $this->resolver->resolveOrError('empstatus',   $row[7],  $rowNum, 'Employment Status', $rowErrors);
            $empclass    = $this->resolver->resolveOrError('empclass',    $row[8],  $rowNum, 'Employment Class',  $rowErrors);
            $shiftType   = $this->resolver->resolveOrError('shift_type',  $row[9],  $rowNum, 'Shift Type',        $rowErrors);
            $shuttle     = $this->resolver->resolveOrError('shuttle',     $row[10], $rowNum, 'Shuttle',           $rowErrors);
            $empposition = $this->resolver->resolveOrError('empposition', $row[11], $rowNum, 'Position',          $rowErrors);

            if (!empty($rowErrors)) {
                $this->errors   = array_merge($this->errors, $rowErrors);
                $this->skipped++;
                continue;
            }

            try {
                $dateHired = !empty($row[12]) ? Carbon::parse($row[12])->format('Y-m-d') : null;
                $dateReg   = !empty($row[13]) ? Carbon::parse($row[13])->format('Y-m-d') : null;

                EmployeeWorkDetail::updateOrCreate(
                    ['employid' => $employid],
                    [
                        'company'    => trim((string) ($row[1] ?? '')),
                        'department' => $department,
                        'prodline'   => $prodline,
                        'job_title'  => $jobTitle,
                        'station'    => $station,
                        'team'       => trim((string) ($row[6] ?? '')),
                        'empstatus'  => $empstatus,
                        'empclass'   => $empclass,
                        'shift_type' => $shiftType,
                        'shuttle'    => $shuttle,
                        'empposition'=> $empposition,
                        'date_hired' => $dateHired,
                        'date_reg'   => $dateReg,
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
        return array_map(fn($e) => array_merge(['sheet' => 'Work Details'], $e), $this->errors);
    }
}
