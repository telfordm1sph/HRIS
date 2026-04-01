<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeParent extends Model
{
    protected $table      = 'employee_parent';
    protected $connection = 'masterlist';
    public    $timestamps = false;

    protected $fillable = [
        'employid',
        'parent_name',
        'parent_bday',
        'parent_age',
        'parent_gender',
        'created_at',
    ];
}
