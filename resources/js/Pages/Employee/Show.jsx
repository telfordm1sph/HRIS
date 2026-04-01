import { useState, useMemo } from "react";
import { Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { memo } from "react";

import EditSectionDropdown from "@/Components/ChangeRequest/EditSectionDropdown";
import ChangeRequestModal from "@/Components/ChangeRequest/ChangeRequestModal";
import {
    NameForm,
    CivilStatusForm,
    AddressForm,
    EducationForm,
    ParentForm,
    SpouseForm,
    FamilyTableForm,
    OthersForm,
} from "@/Components/ChangeRequest/Forms/CategoryForms";

import { initials, avatarPalette } from "@/Helpers/employee";
import {
    Field,
    SectionDivider,
    MetaChip,
    FamilyTable,
    TabBtn,
    ApproverCard,
} from "@/Components/Employee/EmployeeComponents";

const EmployeeCombobox = memo(Combobox);

// ─── Pending badge shown under a section title ────────────────────────────────

function PendingBadge({ request }) {
    if (!request) return null;

    if (request.status === "pending") {
        return (
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                ⏳ pending approval
            </span>
        );
    }
    if (request.status === "rejected") {
        return (
            <span
                className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                title={request.remarks ?? ""}
            >
                ❌ rejected {request.remarks ? `— ${request.remarks}` : ""}
            </span>
        );
    }
    return null;
}

// ─── Build old_value snapshot per category from employee prop ─────────────────

function buildOldValue(category, employee) {
    switch (category) {
        case "name":
            return {
                firstname: employee.emp_firstname,
                middlename: employee.emp_middlename,
                lastname: employee.emp_lastname,
            };
        case "civil_status":
            return { civil_status: employee.civil_status };
        case "education":
            return { educational_attainment: employee.educational_attainment };
        case "address":
            return {
                house_no: employee.address?.house_no ?? "",
                brgy: employee.address?.brgy ?? "",
                city: employee.address?.city ?? "",
                province: employee.address?.province ?? "",
                perma_house_no: employee.address?.perma_house_no ?? "",
                perma_brgy: employee.address?.perma_brgy ?? "",
                perma_city: employee.address?.perma_city ?? "",
                perma_province: employee.address?.perma_province ?? "",
            };
        case "father": {
            const f =
                employee.parent?.find((p) => p.parent_gender === "Male") ?? {};
            return {
                parent_name: f.parent_name ?? "",
                parent_bday: f.parent_bday ?? "",
                parent_age: f.parent_age ?? "",
                parent_gender: "Male",
            };
        }
        case "mother": {
            const m =
                employee.parent?.find((p) => p.parent_gender === "Female") ??
                {};
            return {
                parent_name: m.parent_name ?? "",
                parent_bday: m.parent_bday ?? "",
                parent_age: m.parent_age ?? "",
                parent_gender: "Female",
            };
        }
        case "spouse":
            return employee.spouse ?? [];
        case "children":
            return employee.children ?? [];
        case "siblings":
            return employee.siblings ?? [];
        case "others":
            return {
                nickname: employee.nickname,
                email: employee.email,
                contact_no: employee.contact_no,
                religion: employee.religion,
                blood_type: employee.blood_type,
                height: employee.height,
                weight: employee.weight,
            };
        default:
            return {};
    }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function EmployeeShow({
    employee,
    activeEmployees = [],
    changeRequests = {},
}) {
    const [tab, setTab] = useState("personal");
    const [modalCategory, setModalCategory] = useState(null); // which modal is open
    const [formValue, setFormValue] = useState(null); // controlled form state
    console.log(employee);

    // changeRequests is a map: { name: {...}, civil_status: null, ... }
    // passed from controller via getPendingMapForEmployee()
    const [pendingMap, setPendingMap] = useState(changeRequests);

    const pal = avatarPalette(employee.emp_id);
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

    // Open modal — initialize form value from current employee data
    const openModal = (category) => {
        setFormValue(buildOldValue(category, employee));
        setModalCategory(category);
    };

    const closeModal = () => {
        setModalCategory(null);
        setFormValue(null);
    };

    const handleSuccess = (newRequest) => {
        setPendingMap((prev) => ({
            ...prev,
            [newRequest.category]: newRequest,
        }));
    };

    // Render the correct form inside the modal
    const renderForm = () => {
        if (!modalCategory || formValue === null) return null;

        switch (modalCategory) {
            case "name":
                return <NameForm value={formValue} onChange={setFormValue} />;
            case "civil_status":
                return (
                    <CivilStatusForm
                        value={formValue}
                        onChange={setFormValue}
                    />
                );
            case "address":
                return (
                    <AddressForm value={formValue} onChange={setFormValue} />
                );
            case "education":
                return (
                    <EducationForm value={formValue} onChange={setFormValue} />
                );
            case "father":
                return (
                    <ParentForm
                        value={formValue}
                        onChange={setFormValue}
                        gender="Male"
                    />
                );
            case "mother":
                return (
                    <ParentForm
                        value={formValue}
                        onChange={setFormValue}
                        gender="Female"
                    />
                );
            case "spouse":
                return <SpouseForm value={formValue} onChange={setFormValue} />;
            case "children":
                return (
                    <FamilyTableForm
                        value={formValue}
                        onChange={setFormValue}
                        config={{
                            nameKey: "child_name",
                            bdayKey: "child_bday",
                            ageKey: "child_age",
                            genderKey: "child_gender",
                            rowLabel: "Child",
                        }}
                    />
                );
            case "siblings":
                return (
                    <FamilyTableForm
                        value={formValue}
                        onChange={setFormValue}
                        config={{
                            nameKey: "sibling_name",
                            bdayKey: "sibling_bday",
                            ageKey: "sibling_age",
                            genderKey: "sibling_gender",
                            rowLabel: "Sibling",
                        }}
                    />
                );
            case "others":
                return <OthersForm value={formValue} onChange={setFormValue} />;
            default:
                return null;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`${employee.emp_name} — Employee Profile`} />

            <div className="min-h-screen bg-background">
                {/* ── Sticky Top Bar ──────────────────────────────────── */}
                <div className="border-b border-border/50 bg-background/90 backdrop-blur-md sticky top-0 z-10">
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
                    {/* ── Profile Header ── */}
                    <div className="flex items-start gap-5 mb-8">
                        <div
                            className={`w-[68px] h-[68px] rounded-2xl flex items-center justify-center text-[20px] font-bold shrink-0 ${pal.bg} ${pal.text}`}
                        >
                            {initials(employee.emp_name)}
                        </div>

                        <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex items-center gap-3 mb-1.5">
                                <h1 className="text-[22px] font-semibold tracking-tight text-foreground leading-none">
                                    {employee.emp_name}
                                </h1>
                                {/* ← Edit Section Dropdown */}
                                <EditSectionDropdown
                                    onSelect={openModal}
                                    pendingMap={pendingMap}
                                />
                            </div>
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

                    {/* ── Tabs ── */}
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

                    {/* ══ PERSONAL TAB ══ */}
                    {tab === "personal" && (
                        <>
                            <SectionDivider title="Basic Information" />
                            <PendingBadge request={pendingMap["name"]} />
                            <PendingBadge
                                request={pendingMap["civil_status"]}
                            />
                            <PendingBadge request={pendingMap["education"]} />
                            <PendingBadge request={pendingMap["others"]} />
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5 mt-3">
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

                            <SectionDivider title="Address" />
                            <PendingBadge request={pendingMap["address"]} />
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-5 mt-3">
                                <Field
                                    label="House No."
                                    value={employee.address?.house_no}
                                />
                                <Field
                                    label="Barangay"
                                    value={employee.address?.brgy}
                                />
                                <Field
                                    label="City"
                                    value={employee.address?.city}
                                />
                                <Field
                                    label="Province"
                                    value={employee.address?.province}
                                />
                                <Field
                                    label="Perma House."
                                    value={employee.address?.perma_house_no}
                                />
                                <Field
                                    label="Perma Brgy."
                                    value={employee.address?.perma_brgy}
                                />
                                <Field
                                    label="Perma City"
                                    value={employee.address?.perma_city}
                                />
                                <Field
                                    label="Perma Prov."
                                    value={employee.address?.perma_province}
                                />
                            </div>

                            <SectionDivider title="Family" />
                            <div className="flex flex-wrap gap-2 mb-4">
                                <PendingBadge request={pendingMap["father"]} />
                                <PendingBadge request={pendingMap["mother"]} />
                                <PendingBadge request={pendingMap["spouse"]} />
                                <PendingBadge
                                    request={pendingMap["children"]}
                                />
                                <PendingBadge
                                    request={pendingMap["siblings"]}
                                />
                            </div>
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

                    {/* ══ WORK TAB ══ */}
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

            {/* ── Change Request Modal ── */}
            {modalCategory && (
                <ChangeRequestModal
                    open={!!modalCategory}
                    onClose={closeModal}
                    employid={employee.emp_id}
                    category={modalCategory}
                    oldValue={buildOldValue(modalCategory, employee)}
                    newValue={formValue}
                    existingRequest={pendingMap[modalCategory]}
                    onSuccess={handleSuccess}
                >
                    {renderForm()}
                </ChangeRequestModal>
            )}
        </AuthenticatedLayout>
    );
}
