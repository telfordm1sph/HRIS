<?php

namespace App\Exports\Sheets;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class GovInfoSheet implements WithTitle, WithHeadings, FromArray, WithColumnWidths, WithStyles, WithEvents
{
    public function title(): string
    {
        return 'Government Info';
    }

    public function headings(): array
    {
        return [
            'Employee ID',
            'TIN No.',
            'SSS No.',
            'PhilHealth No.',
            'Pag-IBIG No.',
            'Bank Account No.',
        ];
    }

    public function array(): array
    {
        return [];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 14, 'B' => 20, 'C' => 20,
            'D' => 20, 'E' => 20, 'F' => 24,
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
                $event->sheet->getDelegate()->freezePane('A2');

                // All 5 sheets now exist — set Employee Details (index 1) as active on open
                $event->sheet->getParent()->setActiveSheetIndex(1);
            },
        ];
    }
}
