<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeGovInfo extends Model
{
    protected $table = 'employee_gov_info';

    public $timestamps = false;

    protected $fillable = [
        'employid',
        'tin_no',
        'sss_no',
        'philhealth_no',
        'pagibig_no',
        'bank_acct_no'
    ];
}
