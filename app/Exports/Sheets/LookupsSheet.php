<?php

namespace App\Exports\Sheets;

use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class LookupsSheet implements WithTitle, WithEvents
{
    // Column letter → lookup key → display header
    // Order here must match what WorkDetailsSheet::NAMED_RANGES maps to
    public const COLUMNS = [
        'A' => ['key' => 'departments', 'header' => 'Department'],
        'B' => ['key' => 'prodlines',   'header' => 'Prod Line'],
        'C' => ['key' => 'job_titles',  'header' => 'Job Title'],
        'D' => ['key' => 'stations',    'header' => 'Station'],
        'E' => ['key' => 'statuses',    'header' => 'Emp Status'],
        'F' => ['key' => 'classes',     'header' => 'Emp Class'],
        'G' => ['key' => 'shifts',      'header' => 'Shift Type'],
        'H' => ['key' => 'shuttles',    'header' => 'Shuttle'],
        'I' => ['key' => 'positions',   'header' => 'Position'],
    ];

    public function __construct(private readonly array $lookups) {}

    public function title(): string
    {
        return 'Lookups';
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                foreach (self::COLUMNS as $col => $config) {
                    $sheet->setCellValue($col . '1', $config['header']);
                    $sheet->getColumnDimension($col)->setWidth(24);

                    foreach ($this->lookups[$config['key']] as $i => $value) {
                        $sheet->setCellValue($col . ($i + 2), $value);
                    }
                }

                // Style header row to signal "do not edit"
                $lastCol = array_key_last(self::COLUMNS);
                $sheet->getStyle("A1:{$lastCol}1")->applyFromArray([
                    'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '6B7280']],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                ]);

                // NOTE: Do NOT hide this sheet. Excel blocks dropdown validation
                // from referencing hidden sheets. Keep it visible but last in the tab order.
            },
        ];
    }
}
