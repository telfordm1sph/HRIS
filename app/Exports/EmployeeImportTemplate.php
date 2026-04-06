<?php

namespace App\Exports;

use App\Exports\Sheets\AddressSheet;
use App\Exports\Sheets\EmployeeDetailsSheet;
use App\Exports\Sheets\GovInfoSheet;
use App\Exports\Sheets\LookupsSheet;
use App\Exports\Sheets\WorkDetailsSheet;
use App\Models\EmployeeClass;
use App\Models\EmployeeDepartment;
use App\Models\EmployeePosition;
use App\Models\EmployeeShift;
use App\Models\EmployeeStatus;
use App\Models\JobTitle;
use App\Models\ProdLine;
use App\Models\Shuttle;
use App\Models\Station;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class EmployeeImportTemplate implements WithMultipleSheets
{
    public array $lookups;

    public function __construct()
    {
        $this->lookups = [
            'departments' => EmployeeDepartment::pluck('dept_name')->toArray(),
            'prodlines'   => ProdLine::pluck('pl_name')->toArray(),
            'job_titles'  => JobTitle::pluck('position')->toArray(),
            'stations'    => Station::pluck('station_name')->toArray(),
            'statuses'    => EmployeeStatus::pluck('status_name')->toArray(),
            'classes'     => EmployeeClass::pluck('class_name')->toArray(),
            'shifts'      => EmployeeShift::pluck('shift_name')->toArray(),
            'shuttles'    => Shuttle::pluck('shuttle_name')->toArray(),
            'positions'   => EmployeePosition::pluck('emp_position_name')->toArray(),
        ];
    }

    public function sheets(): array
    {
        return [
            new LookupsSheet($this->lookups),      // index 0 — must be first so named ranges exist when WorkDetails runs
            new EmployeeDetailsSheet(),             // index 1
            new WorkDetailsSheet($this->lookups),  // index 2
            new AddressSheet(),                    // index 3
            new GovInfoSheet(),                    // index 4
        ];
    }
}
