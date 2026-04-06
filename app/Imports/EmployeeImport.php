<?php

namespace App\Imports;

use App\Imports\Resolvers\LookupResolver;
use App\Imports\Sheets\AddressImportSheet;
use App\Imports\Sheets\ApproverImportSheet;
use App\Imports\Sheets\ChildrenImportSheet;
use App\Imports\Sheets\EmployeeDetailsImportSheet;
use App\Imports\Sheets\GovInfoImportSheet;
use App\Imports\Sheets\ParentsImportSheet;
use App\Imports\Sheets\SiblingsImportSheet;
use App\Imports\Sheets\SpouseImportSheet;
use App\Imports\Sheets\WorkDetailsImportSheet;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class EmployeeImport implements WithMultipleSheets
{
    private EmployeeDetailsImportSheet $detailsSheet;
    private WorkDetailsImportSheet     $workSheet;
    private AddressImportSheet         $addressSheet;
    private GovInfoImportSheet         $govInfoSheet;
    private ApproverImportSheet        $approverSheet;
    private ParentsImportSheet         $parentsSheet;
    private SpouseImportSheet          $spouseSheet;
    private ChildrenImportSheet        $childrenSheet;
    private SiblingsImportSheet        $siblingsSheet;

    public function __construct()
    {
        $resolver = new LookupResolver();
        $resolver->boot();

        $this->detailsSheet  = new EmployeeDetailsImportSheet();
        $this->workSheet     = new WorkDetailsImportSheet($resolver);
        $this->addressSheet  = new AddressImportSheet();
        $this->govInfoSheet  = new GovInfoImportSheet();
        $this->approverSheet = new ApproverImportSheet();
        $this->parentsSheet  = new ParentsImportSheet();
        $this->spouseSheet   = new SpouseImportSheet();
        $this->childrenSheet = new ChildrenImportSheet();
        $this->siblingsSheet = new SiblingsImportSheet();
    }

    /**
     * Keyed by sheet index (0-based). Sheets not in the uploaded file are silently skipped.
     * Index 0 is the Lookups sheet (template-only, not imported).
     */
    public function sheets(): array
    {
        return [
            1 => $this->detailsSheet,
            2 => $this->workSheet,
            3 => $this->addressSheet,
            4 => $this->govInfoSheet,
            5 => $this->approverSheet,
            6 => $this->parentsSheet,
            7 => $this->spouseSheet,
            8 => $this->childrenSheet,
            9 => $this->siblingsSheet,
        ];
    }

    public function getResult(): array
    {
        $errors = array_merge(
            $this->detailsSheet->getErrors(),
            $this->workSheet->getErrors(),
            $this->addressSheet->getErrors(),
            $this->govInfoSheet->getErrors(),
            $this->approverSheet->getErrors(),
            $this->parentsSheet->getErrors(),
            $this->spouseSheet->getErrors(),
            $this->childrenSheet->getErrors(),
            $this->siblingsSheet->getErrors(),
        );

        return [
            'sheets' => [
                'Employee Details' => $this->detailsSheet->getResult(),
                'Work Details'     => $this->workSheet->getResult(),
                'Address'          => $this->addressSheet->getResult(),
                'Government Info'  => $this->govInfoSheet->getResult(),
                'Approver'         => $this->approverSheet->getResult(),
                'Parents'          => $this->parentsSheet->getResult(),
                'Spouse'           => $this->spouseSheet->getResult(),
                'Children'         => $this->childrenSheet->getResult(),
                'Siblings'         => $this->siblingsSheet->getResult(),
            ],
            'errors'       => $errors,
            'total_errors' => count($errors),
        ];
    }
}
