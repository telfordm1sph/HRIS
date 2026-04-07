import { useState } from "react";
import { router } from "@inertiajs/react";
import { Combobox } from "@/Components/ui/combobox";
import { DatePicker } from "@/Components/ui/date-picker";

export default function AdminEditableField({
    label,
    value,              // display string
    fieldKey,           // DB column name to send
    idValue,            // current FK id (for lookup fields)
    options,            // [{ value, label }] — always uses Combobox when present
    type = "text",      // 'text' | 'date' | 'number'
    employid,           // base64-encoded employee id
    table = "personal", // personal | work | address | approver
}) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft]     = useState(undefined);
    const [saving, setSaving]   = useState(false);

    const startEdit = () => {
        setDraft(options ? (idValue ?? null) : (value ?? ""));
        setEditing(true);
    };

    const cancel = () => {
        setEditing(false);
        setDraft(undefined);
    };

    const save = () => {
        setSaving(true);
        router.patch(
            route("employees.admin-update", { employid }),
            { table, field: fieldKey, value: draft },
            {
                preserveScroll: true,
                onSuccess: () => { setEditing(false); setSaving(false); },
                onError:   () => setSaving(false),
            },
        );
    };

    return (
        <div className="flex flex-col gap-1 group">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 font-mono flex items-center gap-1.5">
                {label}
                {!editing && (
                    <button
                        type="button"
                        onClick={startEdit}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/50 hover:text-foreground"
                        title="Edit"
                    >
                        <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293z"/>
                        </svg>
                    </button>
                )}
            </span>

            {!editing ? (
                <span className={`text-[13.5px] leading-snug ${value ? "text-foreground" : "text-muted-foreground/30"}`}>
                    {value ?? "—"}
                </span>
            ) : (
                <div className="flex flex-col gap-1.5">
                    {options && (
                        <Combobox
                            options={options}
                            value={draft}
                            onChange={setDraft}
                            clearable
                        />
                    )}
                    {!options && type === "date" && (
                        <DatePicker
                            value={draft || null}
                            onChange={setDraft}
                        />
                    )}
                    {!options && type !== "date" && (
                        <input
                            autoFocus
                            type={type}
                            value={draft ?? ""}
                            onChange={e => setDraft(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
                            className="h-[30px] text-[12px] rounded-md border border-input bg-background px-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full"
                        />
                    )}
                    <div className="flex gap-1.5">
                        <button
                            type="button"
                            onClick={save}
                            disabled={saving}
                            className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-foreground text-background hover:bg-foreground/80 disabled:opacity-50"
                        >
                            {saving ? "Saving…" : "Save"}
                        </button>
                        <button
                            type="button"
                            onClick={cancel}
                            disabled={saving}
                            className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground hover:bg-muted/70"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
