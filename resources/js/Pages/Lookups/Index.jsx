import { useMemo, useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    flexRender,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import LookupModal from "@/Components/Lookup/LookupModal";
import { Button } from "@/Components/ui/button";
import {
    Pencil,
    Trash2,
    Plus,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
} from "lucide-react";

const APP_PREFIX = "/" + (import.meta.env.VITE_APP_NAME ?? "HRIS");

export default function LookupsIndex({ types, type, fields, items }) {
    const {
        props: { flash },
    } = usePage();

    const [modal, setModal] = useState({ open: false, item: null });
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [sorting, setSorting] = useState([]);

    // ── Switch lookup type ───────────────────────────────────────────────────
    const switchType = (slug) => {
        if (slug === type) return;
        setDeleteTarget(null);
        router.get(
            `${APP_PREFIX}/lookups`,
            { type: slug },
            { only: ["type", "fields", "items"], preserveScroll: true },
        );
    };

    // ── Delete ───────────────────────────────────────────────────────────────
    const executeDelete = (id) => {
        router.delete(`${APP_PREFIX}/lookups/${type}/${id}`, {
            only: ["items"],
            preserveScroll: true,
            onFinish: () => setDeleteTarget(null),
        });
    };

    // ── TanStack column defs (built from registry fields) ───────────────────
    const columnDefs = useMemo(() => {
        const dataCols = fields.map((f) => ({
            accessorKey: f.name,
            header: f.label,
            cell: ({ getValue }) => {
                const v = getValue();
                return v != null && v !== "" ? (
                    <span className="max-w-[220px] truncate block">{v}</span>
                ) : (
                    <span className="text-muted-foreground/25">—</span>
                );
            },
        }));

        const actionCol = {
            id: "actions",
            header: "",
            enableSorting: false,
            cell: ({ row }) => {
                const item = row.original;
                if (deleteTarget === item.id) {
                    return (
                        <div className="flex items-center justify-end gap-2">
                            <span className="text-[11px] text-destructive font-mono">
                                Delete?
                            </span>
                            <Button
                                size="sm"
                                variant="destructive"
                                className="h-6 text-[11px] px-2.5"
                                onClick={() => executeDelete(item.id)}
                            >
                                Confirm
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-[11px] px-2.5"
                                onClick={() => setDeleteTarget(null)}
                            >
                                Cancel
                            </Button>
                        </div>
                    );
                }
                return (
                    <div className="flex items-center justify-end gap-1">
                        <button
                            onClick={() => setModal({ open: true, item })}
                            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            title="Edit"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => setDeleteTarget(item.id)}
                            className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                            title="Delete"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                );
            },
        };

        return [...dataCols, actionCol];
    }, [fields, deleteTarget]);

    const table = useReactTable({
        data: items,
        columns: columnDefs,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize: 10 } },
    });

    return (
        <AuthenticatedLayout>
            <Head title="Lookup Maintenance" />

            <div className="min-h-screen bg-background">
                {/* ── Page header ── */}
                <div className="border-b border-border/50 px-6 py-4">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-[18px] font-semibold text-foreground tracking-tight">
                            Lookup Maintenance
                        </h1>
                        <p className="text-[13px] text-muted-foreground mt-0.5">
                            Manage reference data used across employee records
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-6">
                    {/* ── Flash ── */}
                    {(flash?.success || flash?.error) && (
                        <div
                            className={`mb-5 rounded-lg border px-4 py-2.5 text-[13px] ${
                                flash?.error
                                    ? "border-destructive/30 bg-destructive/5 text-destructive"
                                    : "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                            }`}
                        >
                            {flash?.error ?? flash?.success}
                        </div>
                    )}

                    {/* ── Two-pane layout ── */}
                    <div className="flex gap-5 items-start">
                        {/* ── Left: type list ── */}
                        <aside className="w-52 shrink-0 rounded-xl border border-border/50 overflow-hidden sticky top-6">
                            <div className="px-3 py-2.5 border-b border-border/40 bg-muted/20">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 font-mono">
                                    Lookup Types
                                </p>
                            </div>
                            <nav className="py-1">
                                {Object.entries(types).map(([slug, label]) => (
                                    <button
                                        key={slug}
                                        onClick={() => switchType(slug)}
                                        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-[13px] transition-colors text-left
                                            ${
                                                type === slug
                                                    ? "bg-primary/10 text-primary font-semibold border-r-2 border-primary"
                                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                            }`}
                                    >
                                        <span className="truncate">
                                            {label}
                                        </span>
                                        {type === slug && (
                                            <span className="shrink-0 text-[10px] font-mono rounded-full px-1.5 py-0.5 bg-primary/20 text-primary">
                                                {items.length}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </nav>
                        </aside>

                        {/* ── Right: table ── */}
                        <div className="flex-1 min-w-0 rounded-xl border border-border/50 overflow-hidden">
                            {/* Toolbar */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/10">
                                <div>
                                    <p className="text-[14px] font-semibold text-foreground">
                                        {types[type]}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground/50 font-mono">
                                        {items.length} record
                                        {items.length !== 1 ? "s" : ""}
                                    </p>
                                </div>
                                <Button
                                    size="sm"
                                    className="h-7 text-[12px] gap-1.5"
                                    onClick={() =>
                                        setModal({ open: true, item: null })
                                    }
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add
                                </Button>
                            </div>

                            {/* TanStack + shadcn table */}
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        {table.getHeaderGroups().map((hg) => (
                                            <TableRow
                                                key={hg.id}
                                                className="bg-muted/30 hover:bg-muted/30"
                                            >
                                                {hg.headers.map((header) => {
                                                    const canSort =
                                                        header.column.getCanSort();
                                                    const sorted =
                                                        header.column.getIsSorted();
                                                    return (
                                                        <TableHead
                                                            key={header.id}
                                                            className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 font-mono whitespace-nowrap"
                                                        >
                                                            {header.isPlaceholder ? null : canSort ? (
                                                                <button
                                                                    onClick={header.column.getToggleSortingHandler()}
                                                                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                                                                >
                                                                    {flexRender(
                                                                        header
                                                                            .column
                                                                            .columnDef
                                                                            .header,
                                                                        header.getContext(),
                                                                    )}
                                                                    {sorted ===
                                                                    "asc" ? (
                                                                        <ChevronUp className="w-3 h-3" />
                                                                    ) : sorted ===
                                                                      "desc" ? (
                                                                        <ChevronDown className="w-3 h-3" />
                                                                    ) : (
                                                                        <ChevronsUpDown className="w-3 h-3 opacity-40" />
                                                                    )}
                                                                </button>
                                                            ) : (
                                                                flexRender(
                                                                    header
                                                                        .column
                                                                        .columnDef
                                                                        .header,
                                                                    header.getContext(),
                                                                )
                                                            )}
                                                        </TableHead>
                                                    );
                                                })}
                                            </TableRow>
                                        ))}
                                    </TableHeader>

                                    <TableBody>
                                        {table.getRowModel().rows.length ===
                                        0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={columnDefs.length}
                                                    className="text-center py-12 text-[13px] text-muted-foreground/40 italic"
                                                >
                                                    No records yet. Click Add to
                                                    create one.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            table
                                                .getRowModel()
                                                .rows.map((row) => (
                                                    <TableRow
                                                        key={row.id}
                                                        className={
                                                            deleteTarget ===
                                                            row.original.id
                                                                ? "bg-destructive/5"
                                                                : ""
                                                        }
                                                    >
                                                        {row
                                                            .getVisibleCells()
                                                            .map((cell) => (
                                                                <TableCell
                                                                    key={
                                                                        cell.id
                                                                    }
                                                                    className="text-[13px] py-2.5"
                                                                >
                                                                    {flexRender(
                                                                        cell
                                                                            .column
                                                                            .columnDef
                                                                            .cell,
                                                                        cell.getContext(),
                                                                    )}
                                                                </TableCell>
                                                            ))}
                                                    </TableRow>
                                                ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {table.getPageCount() > 1 && (
                                <div className="border-t border-border/40 px-4 py-3 flex items-center justify-between bg-muted/10">
                                    <p className="text-[12px] text-muted-foreground/60 font-mono">
                                        Page{" "}
                                        {table.getState().pagination.pageIndex +
                                            1}{" "}
                                        of {table.getPageCount()}
                                        {" · "}
                                        {items.length} total
                                    </p>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-[11px]"
                                            onClick={() => table.previousPage()}
                                            disabled={
                                                !table.getCanPreviousPage()
                                            }
                                        >
                                            Prev
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-[11px]"
                                            onClick={() => table.nextPage()}
                                            disabled={!table.getCanNextPage()}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <LookupModal
                open={modal.open}
                onClose={() => setModal({ open: false, item: null })}
                type={type}
                fields={fields}
                item={modal.item}
                appPrefix={APP_PREFIX}
            />
        </AuthenticatedLayout>
    );
}
