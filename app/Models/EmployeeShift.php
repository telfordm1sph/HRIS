<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeShift extends Model
{
    protected $table = 'shift_types';
    protected $connection = 'masterlist';
    public $timestamps = false;

    protected $fillable = [
        'shift_name',
    ];
}
