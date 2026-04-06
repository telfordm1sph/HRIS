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

class AddressSheet implements WithTitle, WithHeadings, FromArray, WithColumnWidths, WithStyles, WithEvents
{
    public function title(): string
    {
        return 'Address';
    }

    public function headings(): array
    {
        return [
            'Employee ID',
            'House No. / Street (Current)',
            'Barangay (Current)',
            'City / Municipality (Current)',
            'Province (Current)',
            'House No. / Street (Permanent)',
            'Barangay (Permanent)',
            'City / Municipality (Permanent)',
            'Province (Permanent)',
        ];
    }

    public function array(): array
    {
        return [];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 14, 'B' => 30, 'C' => 24, 'D' => 28, 'E' => 22,
            'F' => 30, 'G' => 24, 'H' => 28, 'I' => 22,
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
            },
        ];
    }
}
