<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sibling extends Model
{
    protected $table      = 'siblings';
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
