<?php

namespace App\Models;

use App\Traits\Loggable;
use Illuminate\Database\Eloquent\Model;

class EmployeeApprover extends Model
{
    use Loggable;
    protected $table = 'employee_approver';
    protected $connection = 'masterlist';
    public $timestamps = false;

    protected $fillable = [
        'employid',
        'approver1',
        'approver2',
        'approver3',
    ];

    // Add these relationships to fetch approver employee details
    public function approver1Detail()
    {
        return $this->belongsTo(EmployeeDetail::class, 'approver1', 'employid');
    }

    public function approver2Detail()
    {
        return $this->belongsTo(EmployeeDetail::class, 'approver2', 'employid');
    }

    public function approver3Detail()
    {
        return $this->belongsTo(EmployeeDetail::class, 'approver3', 'employid');
    }
}
