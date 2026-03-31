<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Child extends Model
{
    protected $table      = 'children';
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
