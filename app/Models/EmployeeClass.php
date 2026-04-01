<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeClass extends Model
{
    protected $table = 'emp_class';
    protected $connection = 'masterlist';
    public $timestamps = false;

    protected $fillable = [
        'class_name',
    ];
}
