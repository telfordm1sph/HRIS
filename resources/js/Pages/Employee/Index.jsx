import { useState } from "react";
import { Head } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Input } from "@/components/ui/input";
import EmployeeTable from "@/Components/Employee/EmployeeTable";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmployeeIndex({ employees, filters, lookups }) {
    const [localFilters, setLocalFilters] = useState({
        search:     filters.search     ?? "",
        company:    filters.company    ?? "",
        department: filters.department ?? "",
        status:     filters.status     ?? "",
        class:      filters.class      ?? "",
        per_page:   filters.per_page   ?? "25",
    });

    function encodeFilters(f) {
        return btoa(JSON.stringify(f));
    }

    function applyFilters(overrides = {}) {
        const merged = { ...localFilters, ...overrides, page: 1 };
        router.get(route("employees.index"), { filters: encodeFilters(merged) }, {
            preserveScroll: true,
            replace: true,
        });
    }

    function goToPage(page) {
        router.get(
            route("employees.index"),
            { filters: encodeFilters({ ...localFilters, page }) },
            { preserveScroll: true, replace: true }
        );
    }

    const { current_page, last_page, total, per_page } = employees;
    const from = (current_page - 1) * per_page + 1;
    const to   = Math.min(current_page * per_page, total);

    // Build page window: show ±2 pages around current
    function pageWindow() {
        const pages = [];
        const start = Math.max(1, current_page - 2);
        const end   = Math.min(last_page, current_page + 2);
        if (start > 1) pages.push(1);
        if (start > 2) pages.push("...");
        for (let i = start; i <= end; i++) pages.push(i);
        if (end < last_page - 1) pages.push("...");
        if (end < last_page) pages.push(last_page);
        return pages;
    }

    return (
        <AuthenticatedLayout>
            <Head title="Employees" />

            <div className="min-h-screen bg-background">
                {/* Header */}
                <div className="border-b border-border/50 px-6 py-4">
                    <div className="max-w-full mx-auto">
                        <h1 className="text-[18px] font-semibold text-foreground tracking-tight">
                            Employees
                        </h1>
                        <p className="text-[13px] text-muted-foreground mt-0.5">
                            {total.toLocaleString()} active employee{total !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>

                <div className="mx-auto px-6 py-6">
                    {/* ── Filters toolbar ── */}
                    <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-0.5">
                        {/* Search */}
                        <div className="relative shrink-0">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/50" />
                            <Input
                                value={localFilters.search}
                                onChange={(e) => setLocalFilters((f) => ({ ...f, search: e.target.value }))}
                                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                                placeholder="Search name or ID…"
                                className="pl-8 w-56 text-[12px] h-8"
                            />
                        </div>

                        {/* Divider */}
                        <div className="h-5 w-px bg-border shrink-0" />

                        {/* Dropdowns */}
                        {[
                            { key: "company",    placeholder: "Company",    options: lookups.companies },
                            { key: "department", placeholder: "Department", options: lookups.departments },
                            { key: "status",     placeholder: "Status",     options: lookups.statuses },
                            { key: "class",      placeholder: "Class",      options: lookups.classes },
                        ].map(({ key, placeholder, options }) => (
                            <select
                                key={key}
                                value={localFilters[key]}
                                onChange={(e) => {
                                    setLocalFilters((f) => ({ ...f, [key]: e.target.value }));
                                    applyFilters({ [key]: e.target.value });
                                }}
                                className="shrink-0 rounded-md border border-input bg-background px-3 py-1.5 text-[12px] h-8 text-muted-foreground focus:text-foreground"
                            >
                                <option value="">All {placeholder}s</option>
                                {Object.entries(options).map(([id, name]) => (
                                    <option key={id} value={id}>{name}</option>
                                ))}
                            </select>
                        ))}

                        {/* Clear */}
                        {(localFilters.search || localFilters.company || localFilters.department || localFilters.status || localFilters.class) && (
                            <button
                                onClick={() => {
                                    const cleared = { search: "", company: "", department: "", status: "", class: "", per_page: localFilters.per_page };
                                    setLocalFilters(cleared);
                                    router.get(route("employees.index"), { filters: encodeFilters({ ...cleared, page: 1 }) }, { preserveScroll: true, replace: true });
                                }}
                                className="shrink-0 text-[12px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                            >
                                × Clear
                            </button>
                        )}
                    </div>

                    {/* ── Table ── */}
                    <EmployeeTable data={employees.data} />

                    {/* ── Pagination ── */}
                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <p className="text-[12px] text-muted-foreground/60 font-mono">
                                Showing {from.toLocaleString()}–{to.toLocaleString()} of {total.toLocaleString()}
                            </p>
                            <select
                                value={localFilters.per_page}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setLocalFilters((f) => ({ ...f, per_page: val }));
                                    applyFilters({ per_page: val });
                                }}
                                className="rounded-md border border-input bg-background px-2 py-1 text-[12px] font-mono h-7"
                            >
                                {[10, 25, 50, 100].map((n) => (
                                    <option key={n} value={n}>{n} / page</option>
                                ))}
                            </select>
                        </div>

                        {last_page > 1 && (
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7"
                                    disabled={current_page === 1}
                                    onClick={() => goToPage(current_page - 1)}
                                >
                                    <ChevronLeft className="size-3.5" />
                                </Button>

                                {pageWindow().map((p, i) =>
                                    p === "..." ? (
                                        <span key={`ellipsis-${i}`} className="px-1 text-[12px] text-muted-foreground/40">…</span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => goToPage(p)}
                                            className={`w-7 h-7 rounded text-[11px] font-mono transition-colors
                                                ${current_page === p
                                                    ? "bg-foreground text-background"
                                                    : "hover:bg-muted text-muted-foreground"
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    )
                                )}

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7"
                                    disabled={current_page === last_page}
                                    onClick={() => goToPage(current_page + 1)}
                                >
                                    <ChevronRight className="size-3.5" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
