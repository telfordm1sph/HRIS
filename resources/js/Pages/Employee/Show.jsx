import { useState, useMemo } from "react";
import { Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Combobox } from "@/components/ui/combobox";
import { Badge } from "@/components/ui/badge";
import { memo } from "react";
import axios from "axios";
// ─── Helpers ──────────────────────────────────────────────────────────────────
const EmployeeCombobox = memo(Combobox);
const initials = (name = "") =>
    name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase() || "?";

const AVATAR_PALETTES = [
    {
        bg: "bg-violet-100 dark:bg-violet-900/60",
        text: "text-violet-700 dark:text-violet-300",
    },
    {
        bg: "bg-sky-100 dark:bg-sky-900/60",
        text: "text-sky-700 dark:text-sky-300",
    },
    {
        bg: "bg-emerald-100 dark:bg-emerald-900/60",
        text: "text-emerald-700 dark:text-emerald-300",
    },
    {
        bg: "bg-rose-100 dark:bg-rose-900/60",
        text: "text-rose-700 dark:text-rose-300",
    },
    {
        bg: "bg-amber-100 dark:bg-amber-900/60",
        text: "text-amber-700 dark:text-amber-300",
    },
    {
        bg: "bg-cyan-100 dark:bg-cyan-900/60",
        text: "text-cyan-700 dark:text-cyan-300",
    },
];

const avatarPalette = (id) =>
    AVATAR_PALETTES[Number(id) % AVATAR_PALETTES.length];

// ─── Micro UI ─────────────────────────────────────────────────────────────────

const Field = ({ label, value }) => (
    <div className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 font-mono">
            {label}
        </span>
        <span
            className={`text-[13.5px] leading-snug ${value ? "text-foreground" : "text-muted-foreground/30"}`}
        >
            {value ?? "—"}
        </span>
    </div>
);

const SectionDivider = ({ title }) => (
    <div className="flex items-center gap-3 mt-8 mb-5">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50 font-mono whitespace-nowrap">
            {title}
        </span>
        <div className="flex-1 h-px bg-border/50" />
    </div>
);

const MetaChip = ({ children }) =>
    children ? (
        <span className="text-[11px] font-mono bg-muted/50 border border-border/50 rounded-md px-2 py-0.5 text-muted-foreground">
            {children}
        </span>
    ) : null;

const FamilyTable = ({ title, rows, columns, emptyMsg }) => (
    <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70 mb-2.5 font-mono">
            {title}{" "}
            <span className="font-normal opacity-50">({rows.length})</span>
        </p>
        {rows.length === 0 ? (
            <p className="text-[13px] text-muted-foreground/40 italic py-2">
                {emptyMsg}
            </p>
        ) : (
            <div className="rounded-lg border border-border/50 overflow-hidden">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-muted/30">
                            {columns.map((col) => (
                                <th
                                    key={col}
                                    className="text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60 px-3 py-2 font-mono"
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr
                                key={i}
                                className="border-t border-border/30 hover:bg-muted/20 transition-colors"
                            >
                                {Object.values(row).map((val, j) => (
                                    <td
                                        key={j}
                                        className="px-3 py-2.5 text-[13px] text-foreground/80"
                                    >
                                        {val ?? (
                                            <span className="text-muted-foreground/30">
                                                —
                                            </span>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

const TabBtn = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`relative pb-2.5 px-1 text-[11px] font-bold uppercase tracking-widest font-mono transition-colors
            ${
                active
                    ? "text-foreground"
                    : "text-muted-foreground/50 hover:text-muted-foreground"
            }`}
    >
        {children}
        {active && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground rounded-full" />
        )}
    </button>
);

const ApproverCard = ({ label, value, colorId }) => {
    if (!value) return null;
    const namePart = value.includes(" - ")
        ? value.split(" - ").slice(1).join(" - ")
        : value;
    const idPart = value.includes(" - ") ? value.split(" - ")[0] : null;
    const pal = avatarPalette(colorId);
    return (
        <div className="flex items-center gap-3 rounded-xl border border-border/50 px-4 py-3 bg-muted/10">
            <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-[12px] font-bold shrink-0 ${pal.bg} ${pal.text}`}
            >
                {initials(namePart)}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50 mb-0.5">
                    {label}
                </p>
                <p className="text-[13px] font-medium text-foreground truncate leading-snug">
                    {namePart}
                </p>
                {idPart && (
                    <p className="text-[11px] font-mono text-muted-foreground/50">
                        ID {idPart}
                    </p>
                )}
            </div>
        </div>
    );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function EmployeeShow({ employee, activeEmployees = [] }) {
    const [tab, setTab] = useState("personal");

    const loadOptions = async (search, page) => {
        const response = await axios.get(route("employees.options"), {
            params: { search, page, per_page: 50 },
        });
        return {
            options: response.data.data.map((emp) => ({
                value: emp.employid,
                label: `${emp.employid} — ${emp.emp_name}`,
            })),
            hasMore: response.data.current_page < response.data.last_page,
        };
    };

    const employeeOptions = useMemo(
        () =>
            (activeEmployees.data || activeEmployees).map((emp) => ({
                value: emp.employid,
                label: `${emp.employid} — ${emp.emp_name}`,
            })),
        [activeEmployees],
    );

    const handleEmployeeChange = (employid) => {
        if (!employid || employid === employee.emp_id) return;
        router.visit(route("employees.show", { employid }), {
            preserveScroll: false,
        });
    };

    const pal = avatarPalette(employee.emp_id);

    return (
        <AuthenticatedLayout>
            <Head title={`${employee.emp_name} — Employee Profile`} />

            <div className="min-h-screen bg-background">
                {/* ── Sticky Top Bar ──────────────────────────────────── */}
                <div className="border-b border-border/50 bg-background/90 backdrop-blur-md">
                    <div className="max-w-5xl mx-auto px-6 py-2.5 flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 font-mono whitespace-nowrap">
                            Active Employee
                        </span>
                        <div className="w-72">
                            <EmployeeCombobox
                                options={employeeOptions}
                                value={employee.emp_id}
                                onChange={handleEmployeeChange}
                                placeholder="Select employee…"
                                clearable={false}
                                style={{ height: "32px", fontSize: "13px" }}
                                loadOptions={loadOptions}
                            />
                        </div>
                        <div className="flex-1" />
                        <Badge
                            variant={
                                employee.accstatus == 1
                                    ? "default"
                                    : "destructive"
                            }
                            className="text-[10px] uppercase tracking-widest font-mono px-2"
                        >
                            {employee.accstatus == 1 ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-6 py-8">
                    {/* ── Profile Header ──────────────────────────────── */}
                    <div className="flex items-start gap-5 mb-8">
                        <div
                            className={`w-[68px] h-[68px] rounded-2xl flex items-center justify-center text-[20px] font-bold shrink-0 ${pal.bg} ${pal.text}`}
                        >
                            {initials(employee.emp_name)}
                        </div>

                        <div className="flex-1 min-w-0 pt-0.5">
                            <h1 className="text-[22px] font-semibold tracking-tight text-foreground leading-none mb-1.5">
                                {employee.emp_name}
                            </h1>
                            <p className="text-[13px] text-muted-foreground mb-3 leading-relaxed">
                                {[
                                    employee.emp_jobtitle,
                                    employee.emp_dept,
                                    employee.emp_prodline,
                                ]
                                    .filter(Boolean)
                                    .join("  ·  ") || "—"}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                                <MetaChip>{employee.emp_status}</MetaChip>
                                <MetaChip>{employee.emp_class}</MetaChip>
                                <MetaChip>{employee.shift_type}</MetaChip>
                            </div>
                        </div>

                        <div className="text-right shrink-0 pt-0.5">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-0.5">
                                Employee ID
                            </span>
                            <span className="text-[28px] font-mono font-bold text-foreground leading-none block">
                                {employee.emp_id}
                            </span>
                            {employee.date_hired && (
                                <span className="text-[11px] text-muted-foreground/50 block mt-1.5">
                                    Hired {employee.date_hired}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* ── Tabs ────────────────────────────────────────── */}
                    <div className="border-b border-border/50 flex gap-5 mb-2">
                        <TabBtn
                            active={tab === "personal"}
                            onClick={() => setTab("personal")}
                        >
                            Personal
                        </TabBtn>
                        <TabBtn
                            active={tab === "work"}
                            onClick={() => setTab("work")}
                        >
                            Work
                        </TabBtn>
                    </div>

                    {/* ══════════════════════════════════════════════════
                        PERSONAL TAB
                    ══════════════════════════════════════════════════ */}
                    {tab === "personal" && (
                        <>
                            <SectionDivider title="Basic Information" />
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5">
                                <Field
                                    label="First Name"
                                    value={employee.emp_firstname}
                                />
                                <Field
                                    label="Middle Name"
                                    value={employee.emp_middlename}
                                />
                                <Field
                                    label="Last Name"
                                    value={employee.emp_lastname}
                                />
                                <Field
                                    label="Nickname"
                                    value={employee.nickname}
                                />
                                <Field
                                    label="Birthday"
                                    value={employee.birthday}
                                />
                                <Field
                                    label="Place of Birth"
                                    value={employee.place_of_birth}
                                />
                                <Field label="Sex" value={employee.emp_sex} />
                                <Field
                                    label="Civil Status"
                                    value={employee.civil_status}
                                />
                                <Field
                                    label="Religion"
                                    value={employee.religion}
                                />
                                <Field
                                    label="Blood Type"
                                    value={employee.blood_type}
                                />
                                <Field label="Height" value={employee.height} />
                                <Field label="Weight" value={employee.weight} />
                                <Field label="Email" value={employee.email} />
                                <Field
                                    label="Contact No"
                                    value={employee.contact_no}
                                />
                                <Field
                                    label="Education"
                                    value={employee.educational_attainment}
                                />
                            </div>

                            <SectionDivider title="Family" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FamilyTable
                                    title="Parents"
                                    columns={[
                                        "Name",
                                        "Birthday",
                                        "Age",
                                        "Gender",
                                    ]}
                                    rows={(employee.parent ?? []).map((p) => ({
                                        name: p.parent_name,
                                        bday: p.parent_bday,
                                        age: p.parent_age,
                                        gender: p.parent_gender,
                                    }))}
                                    emptyMsg="No parents on record."
                                />
                                <FamilyTable
                                    title="Spouse"
                                    columns={[
                                        "Name",
                                        "Birthday",
                                        "Age",
                                        "Gender",
                                    ]}
                                    rows={(employee.spouse ?? []).map((sp) => ({
                                        name: sp.spouse_name,
                                        bday: sp.spouse_bday,
                                        age: sp.spouse_age,
                                        gender: sp.spouse_gender,
                                    }))}
                                    emptyMsg="No spouse on record."
                                />
                                <FamilyTable
                                    title="Siblings"
                                    columns={[
                                        "Name",
                                        "Birthday",
                                        "Age",
                                        "Gender",
                                    ]}
                                    rows={(employee.siblings ?? []).map(
                                        (s) => ({
                                            name: s.sibling_name,
                                            bday: s.sibling_bday,
                                            age: s.sibling_age,
                                            gender: s.sibling_gender,
                                        }),
                                    )}
                                    emptyMsg="No siblings on record."
                                />
                                <FamilyTable
                                    title="Children"
                                    columns={[
                                        "Name",
                                        "Birthday",
                                        "Age",
                                        "Gender",
                                    ]}
                                    rows={(employee.children ?? []).map(
                                        (c) => ({
                                            name: c.child_name,
                                            bday: c.child_bday,
                                            age: c.child_age,
                                            gender: c.child_gender,
                                        }),
                                    )}
                                    emptyMsg="No children on record."
                                />
                            </div>
                        </>
                    )}

                    {/* ══════════════════════════════════════════════════
                        WORK TAB
                    ══════════════════════════════════════════════════ */}
                    {tab === "work" && (
                        <>
                            <SectionDivider title="Work Information" />
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5">
                                <Field
                                    label="Department"
                                    value={employee.emp_dept}
                                />
                                <Field
                                    label="Job Title"
                                    value={employee.emp_jobtitle}
                                />
                                <Field
                                    label="Product Line"
                                    value={employee.emp_prodline}
                                />
                                <Field
                                    label="Station"
                                    value={employee.emp_station}
                                />
                                <Field
                                    label="Position"
                                    value={employee.emp_position}
                                />
                                <Field
                                    label="Employee Status"
                                    value={employee.emp_status}
                                />
                                <Field
                                    label="Employee Class"
                                    value={employee.emp_class}
                                />
                                <Field
                                    label="Shift Type"
                                    value={employee.shift_type}
                                />
                                <Field
                                    label="Date Hired"
                                    value={employee.date_hired}
                                />
                                <Field
                                    label="Date Regularized"
                                    value={employee.date_reg}
                                />
                                <Field
                                    label="Service Length"
                                    value={employee.service_length}
                                />
                            </div>

                            {employee.gov_info && (
                                <>
                                    <SectionDivider title="Government Information" />
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5">
                                        <Field
                                            label="TIN No"
                                            value={employee.gov_info.tin_no}
                                        />
                                        <Field
                                            label="SSS No"
                                            value={employee.gov_info.sss_no}
                                        />
                                        <Field
                                            label="PhilHealth No"
                                            value={
                                                employee.gov_info.philhealth_no
                                            }
                                        />
                                        <Field
                                            label="Pag-IBIG No"
                                            value={employee.gov_info.pagibig_no}
                                        />
                                        <Field
                                            label="Bank Account"
                                            value={
                                                employee.gov_info.bank_acct_no
                                            }
                                        />
                                    </div>
                                </>
                            )}

                            {employee.approver && (
                                <>
                                    <SectionDivider title="Approvers" />
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <ApproverCard
                                            label="Approver 1"
                                            value={employee.approver.approver1}
                                            colorId={1}
                                        />
                                        <ApproverCard
                                            label="Approver 2"
                                            value={employee.approver.approver2}
                                            colorId={2}
                                        />
                                        <ApproverCard
                                            label="Approver 3"
                                            value={employee.approver.approver3}
                                            colorId={3}
                                        />
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
