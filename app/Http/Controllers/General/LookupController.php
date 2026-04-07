<?php

namespace App\Http\Controllers\General;

use App\Http\Controllers\Controller;
use App\Services\LookupService;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LookupController extends Controller
{
    public function __construct(
        protected LookupService $service
    ) {}

    public function index(Request $request): Response
    {
        $type   = $request->get('type', 'companies');
        $config = $this->service->resolve($type);

        return Inertia::render('Lookups/Index', [
            'types'  => $this->service->getTypes(),
            'type'   => $type,
            'fields' => $config['fields'],
            'items'  => $this->service->all($type),
        ]);
    }

    public function store(Request $request, string $type): RedirectResponse
    {
        $request->validate($this->service->validationRules($type));

        $config = $this->service->resolve($type);
        $data   = $request->only(array_column($config['fields'], 'name'));

        $this->service->create($type, $data);

        return back()->with('success', 'Record created successfully.');
    }

    public function update(Request $request, string $type, int $id): RedirectResponse
    {
        $request->validate($this->service->validationRules($type));

        $config = $this->service->resolve($type);
        $data   = $request->only(array_column($config['fields'], 'name'));

        $this->service->update($type, $id, $data);

        return back()->with('success', 'Record updated successfully.');
    }

    public function destroy(string $type, int $id): RedirectResponse
    {
        try {
            $this->service->delete($type, $id);
        } catch (QueryException) {
            return back()->with('error', 'Cannot delete — this record is still referenced by employee data.');
        }

        return back()->with('success', 'Record deleted.');
    }
}
