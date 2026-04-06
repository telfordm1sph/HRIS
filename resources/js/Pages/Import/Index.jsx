import { useRef, useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button } from "@/components/ui/button";

// ─── Sub-components ────────────────────────────────────────────────────────────

function SheetSummary({ label, result }) {
    if (!result) return null;
    return (
        <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
            <span className="text-[13px] text-foreground/80">{label}</span>
            <div className="flex gap-4 text-[12px] font-mono">
                <span className="text-green-600 dark:text-green-400">
                    {result.processed} processed
                </span>
                {result.skipped > 0 && (
                    <span className="text-amber-600 dark:text-amber-400">
                        {result.skipped} skipped
                    </span>
                )}
            </div>
        </div>
    );
}

function ErrorTable({ errors }) {
    if (!errors?.length) return null;
    return (
        <div className="mt-4">
            <p className="text-[12px] font-semibold text-red-600 dark:text-red-400 mb-2">
                {errors.length} error{errors.length !== 1 ? "s" : ""} found
            </p>
            <div className="rounded-lg border border-red-200 dark:border-red-900 overflow-hidden">
                <table className="w-full text-[12px]">
                    <thead>
                        <tr className="bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-900">
                            {["Sheet", "Row", "Field", "Issue"].map((h) => (
                                <th
                                    key={h}
                                    className="text-left px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-red-700 dark:text-red-400 font-mono"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-red-100 dark:divide-red-900/40">
                        {errors.map((e, i) => (
                            <tr
                                key={i}
                                className="bg-background hover:bg-red-50/50 dark:hover:bg-red-950/20"
                            >
                                <td className="px-3 py-2 font-mono text-muted-foreground">
                                    {e.sheet}
                                </td>
                                <td className="px-3 py-2 font-mono text-muted-foreground">
                                    {e.row}
                                </td>
                                <td className="px-3 py-2 text-foreground/70">
                                    {e.field}
                                </td>
                                <td className="px-3 py-2 text-red-700 dark:text-red-400">
                                    {e.message}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ImportIndex() {
    const { props } = usePage();
    const result = props.flash?.import_result ?? null;

    const fileInputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleFile = (f) => {
        if (f && (f.name.endsWith(".xlsx") || f.name.endsWith(".xls"))) {
            setFile(f);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        handleFile(e.dataTransfer.files[0]);
    };

    const handleSubmit = () => {
        if (!file) return;
        setUploading(true);

        const data = new FormData();
        data.append("file", file);

        router.post(route("import.upload"), data, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => {
                setUploading(false);
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
            },
        });
    };

    const totalProcessed = result
        ? Object.values(result.sheets).reduce((s, r) => s + r.processed, 0)
        : 0;

    return (
        <AuthenticatedLayout>
            <Head title="Employee Import" />

            <div className="min-h-screen bg-background">
                {/* Header */}
                <div className="border-b border-border/50 px-6 py-4">
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-[18px] font-semibold text-foreground tracking-tight">
                            Employee Import
                        </h1>
                        <p className="text-[13px] text-muted-foreground mt-0.5">
                            Bulk-create or update employees via Excel template
                        </p>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
                    {/* Step 1 — Download template */}
                    <div className="rounded-xl border border-border/50 p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-[13px] font-semibold text-foreground">
                                    Step 1 — Download the template
                                </p>
                                <p className="text-[12px] text-muted-foreground mt-1">
                                    The template includes all 4 sheets with live
                                    dropdowns populated from the current lookup
                                    tables.
                                </p>
                            </div>
                            <a href={route("import.template")} className="shrink-0">
                                <Button variant="outline" size="sm" className="text-[12px] gap-1.5">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download Template
                                </Button>
                            </a>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2 text-[11.5px] text-muted-foreground/70">
                            {[
                                ["Sheet 1", "Employee Details — personal info, static dropdowns"],
                                ["Sheet 2", "Work Details — department, shift, etc. (live dropdowns)"],
                                ["Sheet 3", "Address — current & permanent"],
                                ["Sheet 4", "Government Info — TIN, SSS, PhilHealth, Pag-IBIG"],
                            ].map(([sheet, desc]) => (
                                <div key={sheet} className="flex gap-2">
                                    <span className="font-mono font-semibold text-foreground/50 w-16 shrink-0">{sheet}</span>
                                    <span>{desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Step 2 — Upload */}
                    <div className="rounded-xl border border-border/50 p-5">
                        <p className="text-[13px] font-semibold text-foreground mb-3">
                            Step 2 — Upload filled template
                        </p>

                        {/* Drop zone */}
                        <div
                            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`relative border-2 border-dashed rounded-lg px-6 py-10 text-center cursor-pointer transition-colors
                                ${dragging
                                    ? "border-primary bg-primary/5"
                                    : "border-border/50 hover:border-border hover:bg-muted/20"
                                }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                className="hidden"
                                onChange={(e) => handleFile(e.target.files[0])}
                            />

                            {file ? (
                                <div className="space-y-1">
                                    <svg className="w-8 h-8 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-[13px] font-medium text-foreground">{file.name}</p>
                                    <p className="text-[11px] text-muted-foreground">
                                        {(file.size / 1024).toFixed(1)} KB — click to change
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <svg className="w-8 h-8 text-muted-foreground/30 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <p className="text-[13px] text-muted-foreground">
                                        Drop your .xlsx file here, or click to browse
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-3 flex justify-end">
                            <Button
                                onClick={handleSubmit}
                                disabled={!file || uploading}
                                size="sm"
                                className="text-[12px] min-w-[110px]"
                            >
                                {uploading ? "Importing…" : "Import"}
                            </Button>
                        </div>
                    </div>

                    {/* Results */}
                    {result && (
                        <div className="rounded-xl border border-border/50 p-5 space-y-4">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${result.total_errors === 0 ? "bg-green-500" : "bg-amber-500"}`} />
                                <p className="text-[13px] font-semibold text-foreground">
                                    Import complete — {totalProcessed} row{totalProcessed !== 1 ? "s" : ""} processed
                                </p>
                            </div>

                            <div className="rounded-lg border border-border/40 px-4 py-1">
                                {Object.entries(result.sheets).map(([label, r]) => (
                                    <SheetSummary key={label} label={label} result={r} />
                                ))}
                            </div>

                            <ErrorTable errors={result.errors} />
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
