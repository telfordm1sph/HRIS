<?php

namespace App\Http\Controllers\General;

use App\Http\Controllers\Controller;
use App\Services\AdminService;
use App\Services\DataTableService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function __construct(
        protected DataTableService $datatable,
        protected AdminService     $adminService,
    ) {}

    public function index(Request $request)
    {
        $result = $this->datatable->handle(
            $request,
            'mysql',
            'admin',
            [
                'searchColumns' => ['EMPNAME', 'EMPLOYID', 'JOB_TITLE', 'DEPARTMENT'],
            ]
        );

        if ($result instanceof \Symfony\Component\HttpFoundation\StreamedResponse) {
            return $result;
        }

        return Inertia::render('Admin/Admin', [
            'tableData'    => $result['data'],
            'tableFilters' => $request->only([
                'search', 'perPage', 'sortBy', 'sortDirection',
                'start', 'end', 'dropdownSearchValue', 'dropdownFields',
            ]),
        ]);
    }

    public function index_addAdmin(Request $request)
    {
        $result = $this->datatable->handle(
            $request,
            'masterlist',
            'employee_masterlist',
            [
                'conditions' => function ($query) {
                    return $query->where('ACCSTATUS', 1)->whereNot('EMPLOYID', 0);
                },
                'searchColumns' => ['EMPNAME', 'EMPLOYID', 'JOB_TITLE', 'DEPARTMENT'],
            ]
        );

        if ($result instanceof \Symfony\Component\HttpFoundation\StreamedResponse) {
            return $result;
        }

        return Inertia::render('Admin/NewAdmin', [
            'tableData'    => $result['data'],
            'tableFilters' => $request->only([
                'search', 'perPage', 'sortBy', 'sortDirection',
                'start', 'end', 'dropdownSearchValue', 'dropdownFields',
            ]),
        ]);
    }

    public function addAdmin(Request $request)
    {
        $this->adminService->add(
            empId:     (int) $request->input('id'),
            name:      $request->input('name'),
            role:      $request->input('role'),
            updatedBy: (int) session('emp_data.emp_id'),
        );

        return back()->with('success', 'Admin added successfully.');
    }

    public function removeAdmin(Request $request)
    {
        $this->adminService->remove((int) $request->input('id'));

        return back()->with('success', 'Admin removed successfully.');
    }

    public function changeAdminRole(Request $request)
    {
        $empId = (int) $request->input('id');
        $role  = $request->input('role');

        $this->adminService->changeRole($empId, $role, (int) session('emp_data.emp_id'));

        // If the current user changed their own role, update session immediately
        if ((int) session('emp_data.emp_id') === $empId) {
            $empData = session('emp_data');
            $empData['emp_system_role'] = $role;
            session()->put('emp_data', $empData);
        }

        return back()->with('success', 'Admin role changed successfully.');
    }
}
