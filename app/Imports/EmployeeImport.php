<?php

namespace App\Imports;

use App\Imports\Resolvers\LookupResolver;
use App\Imports\Sheets\AddressImportSheet;
use App\Imports\Sheets\EmployeeDetailsImportSheet;
use App\Imports\Sheets\GovInfoImportSheet;
use App\Imports\Sheets\WorkDetailsImportSheet;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class EmployeeImport implements WithMultipleSheets
{
    private EmployeeDetailsImportSheet $detailsSheet;
    private WorkDetailsImportSheet     $workSheet;
    private AddressImportSheet         $addressSheet;
    private GovInfoImportSheet         $govInfoSheet;

    public function __construct()
    {
        $resolver = new LookupResolver();
        $resolver->boot();

        $this->detailsSheet = new EmployeeDetailsImportSheet();
        $this->workSheet    = new WorkDetailsImportSheet($resolver);
        $this->addressSheet = new AddressImportSheet();
        $this->govInfoSheet = new GovInfoImportSheet();
    }

    /**
     * Keyed by sheet index (0-based). Sheets not in the uploaded file are silently skipped.
     */
    public function sheets(): array
    {
        return [
            0 => $this->detailsSheet,
            1 => $this->workSheet,
            2 => $this->addressSheet,
            3 => $this->govInfoSheet,
        ];
    }

    public function getResult(): array
    {
        $errors = array_merge(
            $this->detailsSheet->getErrors(),
            $this->workSheet->getErrors(),
            $this->addressSheet->getErrors(),
            $this->govInfoSheet->getErrors(),
        );

        return [
            'sheets' => [
                'Employee Details' => $this->detailsSheet->getResult(),
                'Work Details'     => $this->workSheet->getResult(),
                'Address'          => $this->addressSheet->getResult(),
                'Government Info'  => $this->govInfoSheet->getResult(),
            ],
            'errors'      => $errors,
            'total_errors' => count($errors),
        ];
    }
}
