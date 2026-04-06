<?php

namespace App\Http\Controllers\General;

use App\Exports\EmployeeImportTemplate;
use App\Http\Controllers\Controller;
use App\Imports\EmployeeImport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ImportController extends Controller
{
    public function index()
    {
        return Inertia::render('Import/Index');
    }

    public function downloadTemplate()
    {
        return Excel::download(
            new EmployeeImportTemplate(),
            'employee_import_template.xlsx'
        );
    }

    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls|max:10240',
        ]);

        $import = new EmployeeImport();
        Excel::import($import, $request->file('file'));

        $result = $import->getResult();
        $total  = collect($result['sheets'])->sum('processed');

        if ($result['total_errors'] > 0) {
            return back()
                ->with('success', "Import complete — {$total} row(s) processed.")
                ->with('error', "{$result['total_errors']} row(s) had errors and were skipped.");
        }

        return back()->with('success', "Import complete — {$total} row(s) processed successfully.");
    }
}
