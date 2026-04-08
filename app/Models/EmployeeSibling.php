<?php

namespace App\Models;

use App\Traits\Loggable;
use Illuminate\Database\Eloquent\Model;

class EmployeeSibling extends Model
{
    use Loggable;
    protected $table      = 'employee_siblings';
    protected $connection = 'masterlist';
    public    $timestamps = false;

    protected $fillable = [
        'employid',
        'sibling_name',
        'sibling_bday',
        'sibling_age',
        'sibling_gender',
        'created_at',
    ];
}
