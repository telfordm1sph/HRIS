import { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";

/**
 * LookupModal — add / edit a single lookup record.
 *
 * Props:
 *   open       {bool}
 *   onClose    {() => void}
 *   type       {string}   — lookup slug (e.g. "companies")
 *   fields     {Array}    — field config from the registry
 *   item       {object|null} — null = add mode, object = edit mode
 *   appPrefix  {string}   — e.g. "/HRIS"
 */
export default function LookupModal({ open, onClose, type, fields, item, appPrefix }) {
    const isEdit = item !== null;

    const buildDefaults = () =>
        Object.fromEntries(fields.map((f) => [f.name, ""]));

    const { data, setData, post, patch, processing, errors, reset, clearErrors } =
        useForm(buildDefaults());

    // Populate form when item changes (edit mode) or reset (add mode)
    useEffect(() => {
        if (!open) return;
        clearErrors();
        if (isEdit) {
            const vals = buildDefaults();
            fields.forEach((f) => {
                vals[f.name] = item[f.name] ?? "";
            });
            setData(vals);
        } else {
            reset();
        }
    }, [open, item]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const opts = {
            preserveScroll: true,
            only: ["items"],
            onSuccess: () => onClose(),
        };

        if (isEdit) {
            patch(`${appPrefix}/lookups/${type}/${item.id}`, opts);
        } else {
            post(`${appPrefix}/lookups/${type}`, opts);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-[15px] font-semibold">
                        {isEdit ? "Edit Record" : "Add Record"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                    {fields.map((field) => (
                        <div key={field.name} className="space-y-1.5">
                            <Label className="text-[12px] font-medium text-foreground/80">
                                {field.label}
                                {field.required && (
                                    <span className="text-destructive ml-1">*</span>
                                )}
                            </Label>

                            {field.type === "textarea" ? (
                                <Textarea
                                    value={data[field.name]}
                                    onChange={(e) => setData(field.name, e.target.value)}
                                    rows={3}
                                    className="text-[13px] resize-none"
                                    placeholder={field.label}
                                />
                            ) : (
                                <Input
                                    type={field.type === "number" ? "number" : "text"}
                                    value={data[field.name]}
                                    onChange={(e) => setData(field.name, e.target.value)}
                                    className="text-[13px]"
                                    placeholder={field.label}
                                />
                            )}

                            {errors[field.name] && (
                                <p className="text-[11px] text-destructive font-mono">
                                    {errors[field.name]}
                                </p>
                            )}
                        </div>
                    ))}

                    <DialogFooter className="pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={processing}>
                            {processing ? "Saving…" : isEdit ? "Save Changes" : "Add Record"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
