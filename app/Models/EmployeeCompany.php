<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeCompany extends Model
{
    protected $table = 'companies';
    protected $connection = 'masterlist';
    protected $primaryKey = 'id';

    public $timestamps = false;

    protected $fillable = [
        'company_name',
    ];
}
