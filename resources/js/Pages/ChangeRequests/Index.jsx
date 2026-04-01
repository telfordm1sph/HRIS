import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import axios from "axios";
import { toast } from "sonner";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLES = {
    pending:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    approved:
        "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    cancelled: "bg-muted text-muted-foreground",
};

function StatusBadge({ status }) {
    return (
        <span
            className={`text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${STATUS_STYLES[status]}`}
        >
            {status}
        </span>
    );
}

// Side-by-side old → new diff for a single request
function DiffCell({ oldValue, newValue }) {
    const [expanded, setExpanded] = useState(false);

    const isArray = Array.isArray(newValue);

    if (isArray) {
        return (
            <button
                onClick={() => setExpanded((e) => !e)}
                className="text-[11px] text-muted-foreground/60 font-mono hover:text-foreground transition-colors"
            >
                {expanded ? "▲ Hide" : `▼ ${newValue.length} row(s)`}
                {expanded && (
                    <pre className="mt-2 text-left text-[10px] bg-muted/30 rounded p-2 whitespace-pre-wrap max-w-xs">
                        {JSON.stringify(newValue, null, 2)}
                    </pre>
                )}
            </button>
        );
    }

    const keys = [
        ...new Set([
            ...Object.keys(oldValue ?? {}),
            ...Object.keys(newValue ?? {}),
        ]),
    ];

    const changed = keys.filter(
        (k) => String(oldValue?.[k] ?? "") !== String(newValue?.[k] ?? ""),
    );

    return (
        <div className="space-y-1">
            {changed.map((k) => (
                <div key={k} className="flex items-start gap-1.5 text-[11.5px]">
                    <span className="text-muted-foreground/50 font-mono min-w-[80px] shrink-0">
                        {k}
                    </span>
                    <span className="text-red-600 dark:text-red-400 line-through mr-1">
                        {oldValue?.[k] || (
                            <span className="not-italic opacity-40">empty</span>
                        )}
                    </span>
                    <span className="text-green-700 dark:text-green-400">
                        {newValue?.[k] || (
                            <span className="opacity-40">empty</span>
                        )}
                    </span>
                </div>
            ))}
        </div>
    );
}

// Inline reject row — shows input + confirm when reject is clicked
function ActionCell({ request, onApprove, onReject }) {
    const [rejecting, setRejecting] = useState(false);
    const [remarks, setRemarks] = useState("");
    const [loading, setLoading] = useState(false);

    if (request.status !== "pending") return null;

    const handleApprove = async () => {
        setLoading(true);
        try {
            await onApprove(request.id);
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!remarks.trim()) {
            toast.error("Please enter rejection remarks.");
            return;
        }
        setLoading(true);
        try {
            await onReject(request.id, remarks);
            setRejecting(false);
            setRemarks("");
        } finally {
            setLoading(false);
        }
    };

    if (rejecting) {
        return (
            <div className="space-y-2 min-w-[200px]">
                <Input
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Rejection reason…"
                    className="text-xs h-8"
                    autoFocus
                />
                <div className="flex gap-1.5">
                    <Button
                        size="sm"
                        variant="destructive"
                        className="text-[11px] h-7"
                        onClick={handleReject}
                        disabled={loading}
                    >
                        Confirm Reject
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-[11px] h-7"
                        onClick={() => {
                            setRejecting(false);
                            setRemarks("");
                        }}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex gap-2">
            <Button
                size="sm"
                className="text-[11px] h-7 bg-green-600 hover:bg-green-700 text-white"
                onClick={handleApprove}
                disabled={loading}
            >
                Approve
            </Button>
            <Button
                size="sm"
                variant="outline"
                className="text-[11px] h-7 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                onClick={() => setRejecting(true)}
                disabled={loading}
            >
                Reject
            </Button>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ChangeRequestsIndex({ requests, filters, categories }) {
    const [localFilters, setLocalFilters] = useState(filters);
    const [rows, setRows] = useState(requests.data ?? []);

    const applyFilters = (overrides = {}) => {
        const merged = { ...localFilters, ...overrides, page: 1 };
        router.get(route("change-requests.index"), merged, {
            preserveScroll: true,
            replace: true,
        });
    };

    const handleApprove = async (id) => {
        try {
            const res = await axios.post(
                route("change-requests.approve", { id }),
            );
            if (res.data.success) {
                toast.success("Request approved.");
                setRows((prev) =>
                    prev.map((r) => (r.id === id ? res.data.data : r)),
                );
            }
        } catch {
            toast.error("Failed to approve.");
        }
    };

    const handleReject = async (id, remarks) => {
        try {
            const res = await axios.post(
                route("change-requests.reject", { id }),
                { remarks },
            );
            if (res.data.success) {
                toast.success("Request rejected.");
                setRows((prev) =>
                    prev.map((r) => (r.id === id ? res.data.data : r)),
                );
            }
        } catch {
            toast.error("Failed to reject.");
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Change Requests — HR Queue" />

            <div className="min-h-screen bg-background">
                {/* Header */}
                <div className="border-b border-border/50 px-6 py-4">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-[18px] font-semibold text-foreground tracking-tight">
                            Change Requests
                        </h1>
                        <p className="text-[13px] text-muted-foreground mt-0.5">
                            Review and action employee profile update requests
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-6">
                    {/* ── Filters ── */}
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        {/* Status tabs */}
                        <div className="flex gap-1 border border-border/50 rounded-lg p-1 bg-muted/20">
                            {["pending", "approved", "rejected", "all"].map(
                                (s) => (
                                    <button
                                        key={s}
                                        onClick={() => {
                                            setLocalFilters((f) => ({
                                                ...f,
                                                status: s,
                                            }));
                                            applyFilters({ status: s });
                                        }}
                                        className={`px-3 py-1 rounded-md text-[11px] font-mono font-semibold uppercase tracking-wider transition-colors
                                        ${
                                            localFilters.status === s
                                                ? "bg-background text-foreground shadow-sm border border-border/50"
                                                : "text-muted-foreground/60 hover:text-muted-foreground"
                                        }`}
                                    >
                                        {s}
                                    </button>
                                ),
                            )}
                        </div>

                        {/* Category filter */}
                        <select
                            value={localFilters.category ?? ""}
                            onChange={(e) => {
                                const v = e.target.value;
                                setLocalFilters((f) => ({ ...f, category: v }));
                                applyFilters({ category: v });
                            }}
                            className="rounded-md border border-input bg-background px-3 py-1.5 text-[12px] font-mono"
                        >
                            <option value="">All Categories</option>
                            {Object.entries(categories).map(([k, v]) => (
                                <option key={k} value={k}>
                                    {v}
                                </option>
                            ))}
                        </select>

                        {/* Employee ID search */}
                        <Input
                            value={localFilters.employid ?? ""}
                            onChange={(e) =>
                                setLocalFilters((f) => ({
                                    ...f,
                                    employid: e.target.value,
                                }))
                            }
                            onKeyDown={(e) =>
                                e.key === "Enter" && applyFilters()
                            }
                            placeholder="Employee ID…"
                            className="w-36 text-[12px] h-8 font-mono"
                        />

                        {/* Date range */}
                        <Input
                            type="date"
                            value={localFilters.date_from ?? ""}
                            onChange={(e) => {
                                setLocalFilters((f) => ({
                                    ...f,
                                    date_from: e.target.value,
                                }));
                                applyFilters({ date_from: e.target.value });
                            }}
                            className="w-40 text-[12px] h-8"
                        />
                        <span className="text-muted-foreground/40 text-[12px]">
                            to
                        </span>
                        <Input
                            type="date"
                            value={localFilters.date_to ?? ""}
                            onChange={(e) => {
                                setLocalFilters((f) => ({
                                    ...f,
                                    date_to: e.target.value,
                                }));
                                applyFilters({ date_to: e.target.value });
                            }}
                            className="w-40 text-[12px] h-8"
                        />
                    </div>

                    {/* ── Table ── */}
                    <div className="rounded-xl border border-border/50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-border/50 bg-muted/30">
                                        {[
                                            "Employee",
                                            "Category",
                                            "Changes",
                                            "Attachment",
                                            "Submitted By",
                                            "Date",
                                            "Status",
                                            "Actions",
                                        ].map((col) => (
                                            <th
                                                key={col}
                                                className="text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 font-mono px-4 py-3 whitespace-nowrap"
                                            >
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {rows.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                className="text-center py-12 text-[13px] text-muted-foreground/40 italic"
                                            >
                                                No change requests found.
                                            </td>
                                        </tr>
                                    )}
                                    {rows.map((req) => (
                                        <tr
                                            key={req.id}
                                            className="hover:bg-muted/20 transition-colors align-top"
                                        >
                                            {/* Employee */}
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <p className="text-[13px] font-mono font-semibold text-foreground">
                                                    {req.employid}
                                                </p>
                                            </td>

                                            {/* Category */}
                                            <td className="px-4 py-3">
                                                <span className="text-[11px] font-mono font-semibold bg-muted/50 border border-border/40 rounded px-2 py-0.5 text-muted-foreground">
                                                    {req.category_label}
                                                </span>
                                            </td>

                                            {/* Changes diff */}
                                            <td className="px-4 py-3 max-w-[280px]">
                                                <DiffCell
                                                    oldValue={req.old_value}
                                                    newValue={req.new_value}
                                                />
                                            </td>

                                            {/* Attachment */}
                                            <td className="px-4 py-3">
                                                {req.attachment ? (
                                                    <a
                                                        href={
                                                            req.attachment.url
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1.5 text-[12px] text-blue-600 dark:text-blue-400 hover:underline"
                                                    >
                                                        <svg
                                                            className="w-3.5 h-3.5 shrink-0"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={
                                                                    1.5
                                                                }
                                                                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                                            />
                                                        </svg>
                                                        <span className="max-w-[120px] truncate">
                                                            {
                                                                req.attachment
                                                                    .original_name
                                                            }
                                                        </span>
                                                    </a>
                                                ) : (
                                                    <span className="text-muted-foreground/30 text-[12px]">
                                                        —
                                                    </span>
                                                )}
                                            </td>

                                            {/* Submitted by */}
                                            <td className="px-4 py-3">
                                                <p className="text-[12.5px] text-foreground/80">
                                                    {req.requested_by?.name}
                                                </p>
                                            </td>

                                            {/* Date */}
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <p className="text-[12px] font-mono text-muted-foreground/70">
                                                    {new Date(
                                                        req.created_at,
                                                    ).toLocaleDateString()}
                                                </p>
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-3">
                                                <StatusBadge
                                                    status={req.status}
                                                />
                                                {req.remarks && (
                                                    <p className="text-[11px] text-muted-foreground/60 mt-1 max-w-[140px]">
                                                        {req.remarks}
                                                    </p>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3">
                                                <ActionCell
                                                    request={req}
                                                    onApprove={handleApprove}
                                                    onReject={handleReject}
                                                />
                                                {req.status === "approved" && (
                                                    <p className="text-[11px] text-muted-foreground/50 font-mono">
                                                        by{" "}
                                                        {req.reviewed_by?.name}
                                                    </p>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {requests.last_page > 1 && (
                            <div className="border-t border-border/40 px-4 py-3 flex items-center justify-between bg-muted/10">
                                <p className="text-[12px] text-muted-foreground/60 font-mono">
                                    Showing {requests.from}–{requests.to} of{" "}
                                    {requests.total}
                                </p>
                                <div className="flex gap-1">
                                    {Array.from(
                                        { length: requests.last_page },
                                        (_, i) => i + 1,
                                    ).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() =>
                                                applyFilters({ page })
                                            }
                                            className={`w-7 h-7 rounded text-[11px] font-mono transition-colors
                                                ${
                                                    requests.current_page ===
                                                    page
                                                        ? "bg-foreground text-background"
                                                        : "hover:bg-muted text-muted-foreground"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
