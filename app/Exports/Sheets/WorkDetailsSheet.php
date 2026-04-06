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

class WorkDetailsSheet implements WithTitle, WithHeadings, FromArray, WithColumnWidths, WithStyles, WithEvents
{
    private const DATA_ROWS = 500;

    // Column → [header, lookup key (null = free text)]
    private const COLUMNS = [
        'A' => ['Employee ID',               null],
        'B' => ['Company',                   null],
        'C' => ['Department',                'departments'],
        'D' => ['Production Line',           'prodlines'],
        'E' => ['Job Title',                 'job_titles'],
        'F' => ['Station',                   'stations'],
        'G' => ['Team',                      null],
        'H' => ['Employment Status',         'statuses'],
        'I' => ['Employment Class',          'classes'],
        'J' => ['Shift Type',                'shifts'],
        'K' => ['Shuttle',                   'shuttles'],
        'L' => ['Position',                  'positions'],
        'M' => ['Date Hired (YYYY-MM-DD)',   null],
        'N' => ['Date Regular (YYYY-MM-DD)', null],
    ];

    public function __construct(private readonly array $lookups) {}

    public function title(): string
    {
        return 'Work Details';
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
            'A' => 14, 'B' => 18, 'C' => 22, 'D' => 22,
            'E' => 28, 'F' => 18, 'G' => 14, 'H' => 22,
            'I' => 20, 'J' => 20, 'K' => 18, 'L' => 20,
            'M' => 24, 'N' => 24,
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
                $sheet    = $event->sheet->getDelegate();
                $lastRow  = self::DATA_ROWS + 1;

                // Build reverse map: lookup key → Lookups sheet column letter
                $keyToCol = [];
                foreach (LookupsSheet::COLUMNS as $letter => $config) {
                    $keyToCol[$config['key']] = $letter;
                }

                foreach (self::COLUMNS as $col => [, $lookupKey]) {
                    if ($lookupKey === null) {
                        continue;
                    }

                    $lookupsCol = $keyToCol[$lookupKey];
                    $count      = count($this->lookups[$lookupKey]);
                    $endRow     = $count + 1; // +1 because row 1 is the header

                    // Direct reference to the visible Lookups sheet — most reliable approach
                    $formula = "Lookups!\${$lookupsCol}\$2:\${$lookupsCol}\${$endRow}";

                    $this->applyDropdown($sheet, "{$col}2:{$col}{$lastRow}", $formula);
                }

                $sheet->freezePane('A2');
            },
        ];
    }

    private function applyDropdown(Worksheet $sheet, string $range, string $formula): void
    {
        $validation = new DataValidation();
        $validation->setType(DataValidation::TYPE_LIST)
            ->setErrorStyle(DataValidation::STYLE_STOP)
            ->setAllowBlank(true)
            ->setShowDropDown(true)    // true = show the dropdown arrow (PhpSpreadsheet inverts this when writing OOXML)
            ->setShowErrorMessage(true)
            ->setErrorTitle('Invalid value')
            ->setError('Please select a value from the dropdown list.')
            ->setFormula1($formula);

        $sheet->setDataValidation($range, $validation);
    }
}
