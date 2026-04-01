<?php

namespace App\Models;

use App\Traits\Loggable;
use Illuminate\Database\Eloquent\Model;

class EmployeeParent extends Model
{
    use Loggable;
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
