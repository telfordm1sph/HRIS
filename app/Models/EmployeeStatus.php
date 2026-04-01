<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeStatus extends Model
{
    protected $table = 'emp_status';
    protected $connection = 'masterlist';
    public $timestamps = false;

    protected $fillable = [
        'status_name',
    ];
}
