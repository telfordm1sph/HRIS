<?php

namespace App\Models;

use App\Traits\Loggable;
use Illuminate\Database\Eloquent\Model;

class EmployeeSpouse extends Model
{
    use Loggable;
    protected $table      = 'employee_spouse';
    protected $connection = 'masterlist';
    public    $timestamps = false;

    protected $fillable = [
        'employid',
        'spouse_name',
        'spouse_bday',
        'spouse_age',
        'spouse_gender',
        'date_of_marriage',
        'created_at',
    ];
}
