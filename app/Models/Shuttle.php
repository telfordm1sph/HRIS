<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shuttle extends Model
{
    protected $table = 'shuttles';
    protected $connection = 'masterlist';
    protected $primaryKey = 'id';

    public $timestamps = false;

    protected $fillable = [
        'shuttle_name',
    ];
}
