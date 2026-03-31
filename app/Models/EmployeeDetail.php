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

    public function siblings()
    {
        return $this->hasMany(Sibling::class, 'employid', 'employid');
    }

    public function children()
    {
        return $this->hasMany(Child::class, 'employid', 'employid');
    }
}
