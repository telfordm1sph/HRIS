<?php

namespace App\Http\Controllers\General;

use App\Http\Controllers\Controller;
use App\Services\ProfileService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function __construct(
        protected ProfileService $profileService
    ) {}

    public function index()
    {
        $empId   = (int) session('emp_data.emp_id');
        $profile = $empId ? $this->profileService->getProfile($empId) : null;

        return Inertia::render('Profile', [
            'profile' => $profile,
        ]);
    }

    public function changePassword(Request $request)
    {
        $credentials = $request->validate([
            'current_password' => 'required',
            'new_password'     => 'required|confirmed',
        ], [
            'current_password.required' => 'The current password field is required.',
            'new_password.required'     => 'The new password field is required.',
            'new_password.confirmed'    => 'The new password and confirmation do not match.',
        ]);

        $result = $this->profileService->changePassword(
            (int) session('emp_data.emp_id'),
            $credentials['current_password'],
            $credentials['new_password'],
        );

        if ($result !== true) {
            return back()->withErrors(['current_password' => $result]);
        }

        return back()->with('success', 'Password changed successfully.');
    }
}
