<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeDetail extends Model
{
    protected $table      = 'employee_details';
    protected $connection = 'masterlist';
    protected $primaryKey = 'employid';
    public    $timestamps = false;

    protected $fillable = [
        'employid',
        'firstname',
        'middlename',
        'lastname',
        'nickname',
        'birthday',
        'place_of_birth',
        'emp_sex',
        'email',
        'contact_no',
        'civil_status',
        'religion',
        'height',
        'weight',
        'blood_type',
        'educational_attainment',
        'accstatus',
        'biometric_status',
        'created_at',
    ];

    public function workDetail()
    {
        return $this->hasOne(EmployeeWorkDetail::class, 'employid', 'employid');
    }
    public function address()
    {
        return $this->hasMany(EmployeeAddress::class, 'employid', 'employid');
    }
    public function parents()
    {
        return $this->hasMany(EmployeeParent::class, 'employid', 'employid');
    }
    public function spouse()
    {
        return $this->hasMany(EmployeeSpouse::class, 'employid', 'employid');
    }
    public function siblings()
    {
        return $this->hasMany(EmployeeSibling::class, 'employid', 'employid');
    }

    public function children()
    {
        return $this->hasMany(EmployeeChild::class, 'employid', 'employid');
    }
}
