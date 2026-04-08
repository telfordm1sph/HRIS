<?php

namespace App\Models;

use App\Traits\Loggable;
use Illuminate\Database\Eloquent\Model;

class EmployeeChild extends Model
{
    use Loggable;
    protected $table      = 'employee_children';
    protected $connection = 'masterlist';
    public    $timestamps = false;

    protected $fillable = [
        'employid',
        'child_name',
        'child_bday',
        'child_age',
        'child_gender',
        'created_at',
    ];
}
