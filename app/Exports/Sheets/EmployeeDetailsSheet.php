<?php

namespace App\Exports\Sheets;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class EmployeeDetailsSheet implements WithTitle, WithHeadings, FromArray, WithColumnWidths, WithStyles, WithEvents
{
    private const DATA_ROWS = 500;
    private const LAST_COL  = 'P';

    // Column → [header, dropdown values (null = free text)]
    private const COLUMNS = [
        'A' => ['Employee ID',            null],
        'B' => ['First Name',             null],
        'C' => ['Middle Name',            null],
        'D' => ['Last Name',              null],
        'E' => ['Nickname',               null],
        'F' => ['Birthday (YYYY-MM-DD)',  null],
        'G' => ['Place of Birth',         null],
        'H' => ['Sex',                    ['Male', 'Female']],
        'I' => ['Email',                  null],
        'J' => ['Contact No.',            null],
        'K' => ['Civil Status',           ['Single', 'Married', 'Widowed', 'Separated', 'Annulled']],
        'L' => ['Religion',               null],
        'M' => ['Height (cm)',            null],
        'N' => ['Weight (kg)',            null],
        'O' => ['Blood Type',             ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']],
        'P' => ['Educational Attainment', ['Elementary', 'High School', 'Senior High School', 'Vocational / Tech-Voc', 'College', 'Post-Graduate']],
    ];

    public function title(): string
    {
        return 'Employee Details';
    }

    public function headings(): array
    {
        return array_column(self::COLUMNS, 0);
    }

    public function array(): array
    {
        return [];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 14, 'B' => 18, 'C' => 18, 'D' => 18, 'E' => 14,
            'F' => 20, 'G' => 22, 'H' => 10, 'I' => 26, 'J' => 16,
            'K' => 16, 'L' => 16, 'M' => 12, 'N' => 12, 'O' => 12,
            'P' => 26,
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E3A5F']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ],
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $lastRow = self::DATA_ROWS + 1;

                foreach (self::COLUMNS as $col => $config) {
                    [, $options] = $config;

                    if ($options !== null) {
                        $formula = '"' . implode(',', $options) . '"';
                        $this->applyDropdown($sheet, "{$col}2:{$col}{$lastRow}", $formula);
                    }
                }

                // Freeze header row
                $sheet->freezePane('A2');

                // Note row below headers
                $noteCol = 'A';
                $sheet->getStyle('A1:' . self::LAST_COL . '1')
                    ->getAlignment()->setWrapText(true);
            },
        ];
    }

    private function applyDropdown(Worksheet $sheet, string $range, string $formula): void
    {
        $validation = new DataValidation();
        $validation->setType(DataValidation::TYPE_LIST)
            ->setErrorStyle(DataValidation::STYLE_INFORMATION)
            ->setAllowBlank(true)
            ->setShowDropDown(true)    // true = show the dropdown arrow (PhpSpreadsheet inverts this when writing OOXML)
            ->setShowErrorMessage(true)
            ->setErrorTitle('Invalid value')
            ->setError('Please select a value from the dropdown list.')
            ->setFormula1($formula);

        $sheet->setDataValidation($range, $validation);
    }
}
