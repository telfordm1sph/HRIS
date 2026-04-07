import { useState } from "react";
import { router } from "@inertiajs/react";
import { Trash2, Plus } from "lucide-react";
import { Combobox } from "@/Components/ui/combobox";
import { DatePicker } from "@/Components/ui/date-picker";

const GENDER_OPTIONS = [
    { value: "Male",   label: "Male"   },
    { value: "Female", label: "Female" },
];

function computeAge(bday) {
    if (!bday) return "";
    const today = new Date();
    const birth = new Date(bday);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age >= 0 ? String(age) : "";
}

function emptyRow(config) {
    return {
        [config.nameKey]:   "",
        [config.bdayKey]:   "",
        [config.ageKey]:    "",
        [config.genderKey]: "Male",
    };
}

// ── Single editable cell ────────────────────────────────────────────────────

function EditCell({ value, field, rowId, familyType, employid, readonly = false }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft]     = useState(value ?? "");
    const [saving, setSaving]   = useState(false);

    if (readonly) {
        return (
            <span className="text-foreground/50 block select-none text-[12px]">
                {value || "—"}
            </span>
        );
    }

    const commit = (val) => {
        const finalVal = val !== undefined ? val : draft;
        if (String(finalVal) === String(value ?? "")) { setEditing(false); return; }
        setSaving(true);
        router.patch(
            route("employees.admin-update", { employid }),
            { table: "family", family_type: familyType, row_id: rowId, field, value: finalVal },
            {
                preserveScroll: true,
                onSuccess: () => { setSaving(false); setEditing(false); },
                onError:   () => setSaving(false),
            },
        );
    };

    if (!editing) {
        return (
            <span
                className="cursor-pointer hover:underline decoration-dotted text-foreground/80 block truncate text-[12px]"
                title="Click to edit"
                onClick={() => { setDraft(value ?? ""); setEditing(true); }}
            >
                {value || <span className="text-muted-foreground/30">—</span>}
            </span>
        );
    }

    if (field.endsWith("_gender")) {
        return (
            <Combobox
                options={GENDER_OPTIONS}
                value={draft}
                onChange={(val) => { setDraft(val); commit(val); }}
                clearable={false}
            />
        );
    }

    if (field.endsWith("_bday")) {
        return (
            <DatePicker
                value={draft || null}
                onChange={(val) => { setDraft(val ?? ""); commit(val ?? ""); }}
            />
        );
    }

    return (
        <input
            autoFocus
            type="text"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={() => commit()}
            onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
            disabled={saving}
            className="h-8 w-full text-[12px] rounded-md border border-input bg-background px-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
    );
}

// ── Main component ──────────────────────────────────────────────────────────

export default function AdminFamilyTable({ title, rows, config, employid }) {
    const { nameKey, bdayKey, ageKey, genderKey, familyType } = config;

    const [adding, setAdding]     = useState(false);
    const [newRow, setNewRow]     = useState(() => emptyRow(config));
    const [saving, setSaving]     = useState(false);
    const [deleting, setDeleting] = useState(null);

    const handleBdayChange = (bday) => {
        setNewRow(r => ({ ...r, [bdayKey]: bday ?? "", [ageKey]: computeAge(bday) }));
    };

    const handleAdd = () => {
        setSaving(true);
        router.post(
            route("employees.admin-family-add", { employid }),
            { family_type: familyType, data: newRow },
            {
                preserveScroll: true,
                onSuccess: () => { setSaving(false); setAdding(false); setNewRow(emptyRow(config)); },
                onError:   () => setSaving(false),
            },
        );
    };

    const handleDelete = (rowId) => {
        setDeleting(rowId);
        router.delete(
            route("employees.admin-family-delete", { employid, rowId }),
            {
                data: { family_type: familyType },
                preserveScroll: true,
                onSuccess: () => setDeleting(null),
                onError:   () => setDeleting(null),
            },
        );
    };

    return (
        <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70 mb-2.5 font-mono flex items-center gap-2">
                {title} <span className="font-normal opacity-50">({rows.length})</span>
            </p>

            <div className="rounded-lg border border-border/50 overflow-hidden">
                <table className="w-full border-collapse text-sm table-fixed">
                    <colgroup>
                        <col className="w-[30%]" />   {/* Name */}
                        <col className="w-[28%]" />   {/* Birthday */}
                        <col className="w-[10%]" />   {/* Age */}
                        <col className="w-[24%]" />   {/* Gender */}
                        <col className="w-[8%]" />    {/* Delete */}
                    </colgroup>
                    <thead>
                        <tr className="bg-muted/30">
                            {["Name", "Birthday", "Age", "Gender", ""].map((col, i) => (
                                <th
                                    key={i}
                                    className="text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60 px-3 py-2 font-mono"
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 && !adding && (
                            <tr>
                                <td colSpan={5} className="px-3 py-3 text-[12px] text-muted-foreground/40 italic">
                                    No records.
                                </td>
                            </tr>
                        )}

                        {rows.map((row) => (
                            <tr key={row.id} className="border-t border-border/30 hover:bg-muted/10 transition-colors">
                                <td className="px-3 py-2">
                                    <EditCell value={row[nameKey]}   field={nameKey}   rowId={row.id} familyType={familyType} employid={employid} />
                                </td>
                                <td className="px-3 py-2">
                                    <EditCell value={row[bdayKey]}   field={bdayKey}   rowId={row.id} familyType={familyType} employid={employid} />
                                </td>
                                <td className="px-3 py-2">
                                    <EditCell value={row[ageKey]}    field={ageKey}    rowId={row.id} familyType={familyType} employid={employid} readonly />
                                </td>
                                <td className="px-3 py-2">
                                    <EditCell value={row[genderKey]} field={genderKey} rowId={row.id} familyType={familyType} employid={employid} />
                                </td>
                                <td className="px-3 py-2 text-center">
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(row.id)}
                                        disabled={deleting === row.id}
                                        className="text-destructive hover:text-destructive/70 transition-colors disabled:opacity-30"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {/* Add-row inline form */}
                        {adding && (
                            <tr className="border-t border-border/50 bg-muted/20">
                                <td className="px-3 py-2">
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Name"
                                        value={newRow[nameKey]}
                                        onChange={e => setNewRow(r => ({ ...r, [nameKey]: e.target.value }))}
                                        className="h-8 w-full text-[12px] rounded-md border border-input bg-background px-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <DatePicker
                                        value={newRow[bdayKey] || null}
                                        onChange={handleBdayChange}
                                        placeholder="Birthday"
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <span className="text-[12px] text-foreground/50 block text-center">
                                        {newRow[ageKey] || "—"}
                                    </span>
                                </td>
                                <td className="px-3 py-2">
                                    <Combobox
                                        options={GENDER_OPTIONS}
                                        value={newRow[genderKey]}
                                        onChange={val => setNewRow(r => ({ ...r, [genderKey]: val ?? "Male" }))}
                                        clearable={false}
                                    />
                                </td>
                                <td className="px-3 py-2" />
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add / confirm-add row actions */}
            {adding ? (
                <div className="flex gap-2 mt-2">
                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-md border border-primary bg-primary text-primary-foreground text-[11px] font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        {saving ? "Saving…" : "Save Row"}
                    </button>
                    <button
                        type="button"
                        onClick={() => { setAdding(false); setNewRow(emptyRow(config)); }}
                        disabled={saving}
                        className="px-4 h-8 rounded-md border border-border text-[11px] font-semibold text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setAdding(true)}
                    className="mt-2 w-full flex items-center justify-center gap-1.5 h-8 rounded-md border border-dashed border-border/70 text-[11px] font-semibold text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Add Row
                </button>
            )}
        </div>
    );
}
