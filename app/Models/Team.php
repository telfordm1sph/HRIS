<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    protected $table = 'teams';
    protected $connection = 'masterlist';
    protected $primaryKey = 'id';

    public $timestamps = false;

    protected $fillable = [
        'team_name',
    ];
}
