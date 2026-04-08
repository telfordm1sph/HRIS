import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/Components/ui/combobox";
import { DatePicker } from "@/Components/ui/date-picker";
import StatusBadge from "@/Components/ChangeRequest/StatusBadge";
import DiffCell from "@/Components/ChangeRequest/DiffCell";
import ActionCell from "@/Components/ChangeRequest/ActionCell";
import AttachmentCell from "@/Components/ChangeRequest/AttachmentCell";
import { useChangeRequests } from "@/Hooks/useChangeRequests";

export default function ChangeRequestsIndex({ requests, filters, categories, shuttles = [] }) {
    const { localFilters, setLocalFilters, applyFilters, handleApprove, handleReject } =
        useChangeRequests(filters);

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
                            {["pending", "approved", "rejected", "all"].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => {
                                        setLocalFilters((f) => ({ ...f, status: s }));
                                        applyFilters({ status: s });
                                    }}
                                    className={`px-3 py-1 rounded-md text-[11px] font-mono font-semibold uppercase tracking-wider transition-colors
                                        ${localFilters.status === s
                                            ? "bg-background text-foreground shadow-sm border border-border/50"
                                            : "text-muted-foreground/60 hover:text-muted-foreground"
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>

                        {/* Category filter */}
                        <Combobox
                            options={Object.entries(categories).map(([k, v]) => ({ value: k, label: v }))}
                            value={localFilters.category ?? ""}
                            onChange={(val) => {
                                const category = val ?? "";
                                setLocalFilters((f) => ({ ...f, category }));
                                applyFilters({ category });
                            }}
                            placeholder="All Categories"
                            allowCustomValue={false}
                            className="h-8 text-[12px] w-44"
                        />

                        {/* Employee ID search */}
                        <Input
                            value={localFilters.employid ?? ""}
                            onChange={(e) => setLocalFilters((f) => ({ ...f, employid: e.target.value }))}
                            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                            placeholder="Employee ID…"
                            className="w-36 text-[12px] h-8 font-mono"
                        />

                        {/* Date range */}
                        <DatePicker
                            value={localFilters.date_from ?? ""}
                            onChange={(val) => {
                                const date_from = val ?? "";
                                setLocalFilters((f) => ({ ...f, date_from }));
                                applyFilters({ date_from });
                            }}
                            placeholder="From date"
                            className="w-36"
                        />
                        <span className="text-muted-foreground/40 text-[12px]">—</span>
                        <DatePicker
                            value={localFilters.date_to ?? ""}
                            onChange={(val) => {
                                const date_to = val ?? "";
                                setLocalFilters((f) => ({ ...f, date_to }));
                                applyFilters({ date_to });
                            }}
                            placeholder="To date"
                            className="w-36"
                        />
                    </div>

                    {/* ── Table ── */}
                    <div className="rounded-xl border border-border/50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-border/50 bg-muted/30">
                                        {["Employee", "Category", "Changes", "Attachment", "Submitted By", "Date", "Status", "Actions"].map((col) => (
                                            <th key={col} className="text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 font-mono px-4 py-3 whitespace-nowrap">
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {requests.data.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="text-center py-12 text-[13px] text-muted-foreground/40 italic">
                                                No change requests found.
                                            </td>
                                        </tr>
                                    )}
                                    {requests.data.map((req) => (
                                        <tr key={req.id} className="hover:bg-muted/20 transition-colors align-top">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <p className="text-[13px] font-mono font-semibold text-foreground">{req.employid}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-[11px] font-mono font-semibold bg-muted/50 border border-border/40 rounded px-2 py-0.5 text-muted-foreground">
                                                    {req.category_label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 max-w-[280px]">
                                                <DiffCell oldValue={req.old_value} newValue={req.new_value} category={req.category} shuttles={shuttles} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <AttachmentCell attachment={req.attachment} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-[12.5px] text-foreground/80">{req.requested_by?.name}</p>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <p className="text-[12px] font-mono text-muted-foreground/70">
                                                    {new Date(req.created_at).toLocaleDateString()}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={req.status} />
                                                {req.remarks && (
                                                    <p className="text-[11px] text-muted-foreground/60 mt-1 max-w-[140px]">{req.remarks}</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <ActionCell
                                                    request={req}
                                                    onApprove={handleApprove}
                                                    onReject={handleReject}
                                                />
                                                {req.status === "approved" && (
                                                    <p className="text-[11px] text-muted-foreground/50 font-mono">
                                                        by {req.reviewed_by?.name}
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
                                    Showing {requests.from}–{requests.to} of {requests.total}
                                </p>
                                <div className="flex gap-1">
                                    {Array.from({ length: requests.last_page }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => applyFilters({ page })}
                                            className={`w-7 h-7 rounded text-[11px] font-mono transition-colors
                                                ${requests.current_page === page
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
