<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeAddress extends Model
{
    protected $table = 'employee_address';
    protected $connection = 'masterlist';
    protected $primaryKey = 'id';

    public $timestamps = false;

    protected $fillable = [
        'employid',
        'house_no',
        'brgy',
        'city',
        'province',
        'perma_house_no',
        'perma_brgy',
        'perma_city',
        'perma_province'
    ];
}
