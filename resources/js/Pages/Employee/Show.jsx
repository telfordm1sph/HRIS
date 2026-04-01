import { useState, useMemo } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Combobox } from "@/components/ui/combobox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { memo } from "react";
import axios from "axios";
import { initials, avatarPalette } from "@/Helpers/employee";
import { toast } from "sonner";
import {
    Field,
    SectionDivider,
    MetaChip,
    FamilyTable,
    TabBtn,
    ApproverCard,
} from "@/Components/Employee/EmployeeComponents";
const EmployeeCombobox = memo(Combobox);
// ─── New Components for Modern Edit & Upload ──────────────────────────────────

// Editable Field with inline edit capability
const EditableField = ({
    label,
    value,
    fieldKey,
    onSave,
    attachmentRequired = false,
    category,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value || "");
    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    const handleSave = async () => {
        if (attachmentRequired && !uploadedFile && editValue !== value) {
            toast.error(`Please upload supporting document for ${label}`);
            return;
        }

        const formData = new FormData();
        formData.append("field", fieldKey);
        formData.append("value", editValue);
        if (uploadedFile) {
            formData.append("attachment", uploadedFile);
            formData.append("category", category);
        }

        try {
            if (uploadedFile) {
                setIsUploading(true);
                const response = await axios.post(
                    route("employee.update-with-attachment"),
                    formData,
                    {
                        headers: { "Content-Type": "multipart/form-data" },
                        onUploadProgress: (progressEvent) => {
                            const percentCompleted = Math.round(
                                (progressEvent.loaded * 100) /
                                    progressEvent.total,
                            );
                            setUploadProgress(percentCompleted);
                        },
                    },
                );
                if (response.data.success) {
                    toast.success(
                        `${label} updated successfully with attachment`,
                    );
                    onSave?.(editValue, response.data.attachment_url);
                }
            } else {
                await axios.patch(
                    route("employee.update", { field: fieldKey }),
                    { value: editValue },
                );
                toast.success(`${label} updated successfully`);
                onSave?.(editValue);
            }
            setIsEditing(false);
            setUploadedFile(null);
            setUploadProgress(0);
        } catch (error) {
            toast.error(`Failed to update ${label}`);
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = [
                "image/jpeg",
                "image/png",
                "application/pdf",
                "image/jpg",
            ];
            if (!validTypes.includes(file.type)) {
                toast.error("Please upload JPEG, PNG, or PDF files only");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size should be less than 5MB");
                return;
            }
            setUploadedFile(file);
        }
    };

    return (
        <div className="group relative">
            {!isEditing ? (
                <div
                    className="cursor-pointer hover:bg-muted/30 rounded-lg p-2 -m-2 transition-colors"
                    onClick={() => setIsEditing(true)}
                >
                    <Label className="text-xs font-medium text-muted-foreground block mb-1">
                        {label}
                    </Label>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground">
                            {value || "—"}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M17 3l4 4-7 7H10v-4l7-7z" />
                                <path d="M4 20h16" />
                            </svg>
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    <Label className="text-xs font-medium text-muted-foreground">
                        {label}
                    </Label>
                    <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder={`Enter ${label.toLowerCase()}`}
                        className="text-sm"
                        autoFocus
                    />
                    {attachmentRequired && (
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">
                                Supporting Document
                            </Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="file"
                                    onChange={handleFileSelect}
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    className="text-xs file:mr-2 file:py-1 file:px-3 file:text-xs file:rounded-md"
                                />
                                {uploadedFile && (
                                    <Badge
                                        variant="secondary"
                                        className="text-xs"
                                    >
                                        {uploadedFile.name}
                                    </Badge>
                                )}
                            </div>
                            {isUploading && (
                                <div className="space-y-1">
                                    <Progress
                                        value={uploadProgress}
                                        className="h-1"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {uploadProgress}% uploaded
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="flex gap-2 pt-1">
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={isUploading}
                        >
                            {isUploading ? "Uploading..." : "Save"}
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                                setIsEditing(false);
                                setUploadedFile(null);
                                setEditValue(value || "");
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Category Card with upload zone for batch updates
const CategoryUploadCard = ({
    title,
    description,
    category,
    onUploadComplete,
    existingAttachments = [],
}) => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleFiles = async (fileList) => {
        const selectedFiles = Array.from(fileList);
        const validFiles = selectedFiles.filter((file) => {
            const validTypes = ["image/jpeg", "image/png", "application/pdf"];
            return (
                validTypes.includes(file.type) && file.size <= 5 * 1024 * 1024
            );
        });

        if (validFiles.length !== selectedFiles.length) {
            toast.error("Some files were skipped (invalid type or >5MB)");
        }

        setFiles(validFiles);

        if (validFiles.length > 0) {
            setUploading(true);
            const formData = new FormData();
            validFiles.forEach((file) =>
                formData.append("attachments[]", file),
            );
            formData.append("category", category);

            try {
                const response = await axios.post(
                    route("employee.upload-category"),
                    formData,
                    {
                        headers: { "Content-Type": "multipart/form-data" },
                    },
                );
                if (response.data.success) {
                    toast.success(
                        `${validFiles.length} file(s) uploaded for ${title}`,
                    );
                    onUploadComplete?.(response.data.attachments);
                    setFiles([]);
                }
            } catch (error) {
                toast.error(`Failed to upload ${title} documents`);
            } finally {
                setUploading(false);
            }
        }
    };

    return (
        <Card className="border-border/50 hover:border-primary/20 transition-all">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                    <span>{title}</span>
                    {existingAttachments.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                            {existingAttachments.length} file(s)
                        </Badge>
                    )}
                </CardTitle>
                <CardDescription className="text-xs">
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
                        dragActive
                            ? "border-primary bg-primary/5"
                            : "border-border/50 hover:border-primary/30"
                    }`}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setDragActive(false);
                        handleFiles(e.dataTransfer.files);
                    }}
                    onClick={() =>
                        document.getElementById(`upload-${category}`)?.click()
                    }
                >
                    <input
                        id={`upload-${category}`}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFiles(e.target.files)}
                        accept=".jpg,.jpeg,.png,.pdf"
                    />
                    <svg
                        className="w-8 h-8 mx-auto text-muted-foreground mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                    </svg>
                    <p className="text-xs text-muted-foreground">
                        {uploading
                            ? "Uploading..."
                            : "Drag & drop or click to upload"}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                        PDF, JPEG, PNG up to 5MB each
                    </p>
                </div>
                {files.length > 0 && !uploading && (
                    <div className="mt-3 space-y-1">
                        {files.map((file, idx) => (
                            <div
                                key={idx}
                                className="text-xs text-muted-foreground flex items-center gap-2"
                            >
                                <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                {file.name}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// Modern Personal Info Editor Modal
const PersonalInfoEditor = ({ employee, onUpdate }) => {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing } = useForm({
        emp_firstname: employee.emp_firstname || "",
        emp_middlename: employee.emp_middlename || "",
        emp_lastname: employee.emp_lastname || "",
        nickname: employee.nickname || "",
        birthday: employee.birthday || "",
        place_of_birth: employee.place_of_birth || "",
        emp_sex: employee.emp_sex || "",
        civil_status: employee.civil_status || "",
        religion: employee.religion || "",
        blood_type: employee.blood_type || "",
        height: employee.height || "",
        weight: employee.weight || "",
        email: employee.email || "",
        contact_no: employee.contact_no || "",
        educational_attainment: employee.educational_attainment || "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("employee.update-personal"), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Personal information updated");
                setOpen(false);
                onUpdate?.();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                    </svg>
                    Edit All
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Personal Information</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>First Name</Label>
                            <Input
                                value={data.emp_firstname}
                                onChange={(e) =>
                                    setData("emp_firstname", e.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Middle Name</Label>
                            <Input
                                value={data.emp_middlename}
                                onChange={(e) =>
                                    setData("emp_middlename", e.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Last Name</Label>
                            <Input
                                value={data.emp_lastname}
                                onChange={(e) =>
                                    setData("emp_lastname", e.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Nickname</Label>
                            <Input
                                value={data.nickname}
                                onChange={(e) =>
                                    setData("nickname", e.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Birthday</Label>
                            <Input
                                type="date"
                                value={data.birthday}
                                onChange={(e) =>
                                    setData("birthday", e.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Place of Birth</Label>
                            <Input
                                value={data.place_of_birth}
                                onChange={(e) =>
                                    setData("place_of_birth", e.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Sex</Label>
                            <select
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={data.emp_sex}
                                onChange={(e) =>
                                    setData("emp_sex", e.target.value)
                                }
                            >
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Civil Status</Label>
                            <Input
                                value={data.civil_status}
                                onChange={(e) =>
                                    setData("civil_status", e.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Contact No</Label>
                            <Input
                                value={data.contact_no}
                                onChange={(e) =>
                                    setData("contact_no", e.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Save Changes
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

// ─── Main Component with Enhanced Personal Section ─────────────────────────────

export default function EmployeeShow({ employee, activeEmployees = [] }) {
    const [tab, setTab] = useState("personal");
    const [personalData, setPersonalData] = useState(employee);

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

    const handleFieldUpdate = (field, value, attachmentUrl) => {
        setPersonalData((prev) => ({ ...prev, [field]: value }));
        if (attachmentUrl) {
            console.log(`Attachment saved for ${field}:`, attachmentUrl);
        }
    };

    const pal = avatarPalette(employee.emp_id);

    // Define which categories require attachments
    const categoriesWithAttachments = [
        {
            id: "civil_status",
            label: "Civil Status",
            requiresFile: true,
            category: "civil_status_docs",
        },
        {
            id: "educational_attainment",
            label: "Education",
            requiresFile: true,
            category: "education_docs",
        },
        {
            id: "birthday",
            label: "Birthday",
            requiresFile: true,
            category: "birth_certificate",
        },
        {
            id: "emp_firstname",
            label: "Name Change",
            requiresFile: true,
            category: "name_change_docs",
        },
    ];

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
                    {/* ── Profile Header with Edit Button ───────────────── */}
                    <div className="flex items-start gap-5 mb-8">
                        <div
                            className={`w-[68px] h-[68px] rounded-2xl flex items-center justify-center text-[20px] font-bold shrink-0 ${pal.bg} ${pal.text}`}
                        >
                            {initials(employee.emp_name)}
                        </div>

                        <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex items-center gap-3 mb-1.5">
                                <h1 className="text-[22px] font-semibold tracking-tight text-foreground leading-none">
                                    {personalData.emp_name || employee.emp_name}
                                </h1>
                                <PersonalInfoEditor
                                    employee={employee}
                                    onUpdate={() => router.reload()}
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

                    {/* ── Tabs ────────────────────────────────────────── */}
                    <div className="border-b border-border/50 flex gap-5 mb-6">
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
                        <TabBtn
                            active={tab === "documents"}
                            onClick={() => setTab("documents")}
                        >
                            Documents
                        </TabBtn>
                    </div>

                    {/* ══════════════════════════════════════════════════
                        MODERN PERSONAL TAB WITH EDITABLE FIELDS & UPLOADS
                    ══════════════════════════════════════════════════ */}
                    {tab === "personal" && (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <SectionDivider title="Basic Information" />
                                <span className="text-[10px] text-muted-foreground/60">
                                    Click any field to edit
                                </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                                <EditableField
                                    label="First Name"
                                    value={personalData.emp_firstname}
                                    fieldKey="emp_firstname"
                                    onSave={(val) =>
                                        handleFieldUpdate("emp_firstname", val)
                                    }
                                    category="name_change"
                                    attachmentRequired={false}
                                />
                                <EditableField
                                    label="Middle Name"
                                    value={personalData.emp_middlename}
                                    fieldKey="emp_middlename"
                                    onSave={(val) =>
                                        handleFieldUpdate("emp_middlename", val)
                                    }
                                />
                                <EditableField
                                    label="Last Name"
                                    value={personalData.emp_lastname}
                                    fieldKey="emp_lastname"
                                    onSave={(val) =>
                                        handleFieldUpdate("emp_lastname", val)
                                    }
                                />
                                <EditableField
                                    label="Nickname"
                                    value={personalData.nickname}
                                    fieldKey="nickname"
                                    onSave={(val) =>
                                        handleFieldUpdate("nickname", val)
                                    }
                                />
                                <EditableField
                                    label="Birthday"
                                    value={personalData.birthday}
                                    fieldKey="birthday"
                                    attachmentRequired={true}
                                    category="birth_certificate"
                                    onSave={(val, url) =>
                                        handleFieldUpdate("birthday", val, url)
                                    }
                                />
                                <EditableField
                                    label="Place of Birth"
                                    value={personalData.place_of_birth}
                                    fieldKey="place_of_birth"
                                    onSave={(val) =>
                                        handleFieldUpdate("place_of_birth", val)
                                    }
                                />
                                <EditableField
                                    label="Sex"
                                    value={personalData.emp_sex}
                                    fieldKey="emp_sex"
                                    onSave={(val) =>
                                        handleFieldUpdate("emp_sex", val)
                                    }
                                />
                                <EditableField
                                    label="Civil Status"
                                    value={personalData.civil_status}
                                    fieldKey="civil_status"
                                    attachmentRequired={true}
                                    category="civil_status_docs"
                                    onSave={(val, url) =>
                                        handleFieldUpdate(
                                            "civil_status",
                                            val,
                                            url,
                                        )
                                    }
                                />
                                <EditableField
                                    label="Religion"
                                    value={personalData.religion}
                                    fieldKey="religion"
                                    onSave={(val) =>
                                        handleFieldUpdate("religion", val)
                                    }
                                />
                                <EditableField
                                    label="Blood Type"
                                    value={personalData.blood_type}
                                    fieldKey="blood_type"
                                    onSave={(val) =>
                                        handleFieldUpdate("blood_type", val)
                                    }
                                />
                                <EditableField
                                    label="Height"
                                    value={personalData.height}
                                    fieldKey="height"
                                    onSave={(val) =>
                                        handleFieldUpdate("height", val)
                                    }
                                />
                                <EditableField
                                    label="Weight"
                                    value={personalData.weight}
                                    fieldKey="weight"
                                    onSave={(val) =>
                                        handleFieldUpdate("weight", val)
                                    }
                                />
                                <EditableField
                                    label="Email"
                                    value={personalData.email}
                                    fieldKey="email"
                                    onSave={(val) =>
                                        handleFieldUpdate("email", val)
                                    }
                                />
                                <EditableField
                                    label="Contact No"
                                    value={personalData.contact_no}
                                    fieldKey="contact_no"
                                    onSave={(val) =>
                                        handleFieldUpdate("contact_no", val)
                                    }
                                />
                                <EditableField
                                    label="Education"
                                    value={personalData.educational_attainment}
                                    fieldKey="educational_attainment"
                                    attachmentRequired={true}
                                    category="education_docs"
                                    onSave={(val, url) =>
                                        handleFieldUpdate(
                                            "educational_attainment",
                                            val,
                                            url,
                                        )
                                    }
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
                        WORK TAB (unchanged but can be modernized similarly)
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

                    {/* ══════════════════════════════════════════════════
                        DOCUMENTS TAB - Category-Based Upload Zone
                    ══════════════════════════════════════════════════ */}
                    {tab === "documents" && (
                        <>
                            <SectionDivider title="Document Management" />
                            <p className="text-sm text-muted-foreground mb-6">
                                Upload supporting documents for personal
                                information updates. Each category can have
                                multiple attachments.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <CategoryUploadCard
                                    title="Civil Status Documents"
                                    description="Marriage certificate, annulment papers, etc."
                                    category="civil_status"
                                    existingAttachments={
                                        employee.civil_status_attachments || []
                                    }
                                />
                                <CategoryUploadCard
                                    title="Education Credentials"
                                    description="Diploma, transcript, certificates"
                                    category="education"
                                    existingAttachments={
                                        employee.education_attachments || []
                                    }
                                />
                                <CategoryUploadCard
                                    title="Birth Certificate"
                                    description="PSA birth certificate or equivalent"
                                    category="birth_certificate"
                                    existingAttachments={
                                        employee.birth_attachments || []
                                    }
                                />
                                <CategoryUploadCard
                                    title="Government IDs"
                                    description="SSS, PhilHealth, Pag-IBIG, TIN"
                                    category="government_ids"
                                    existingAttachments={
                                        employee.gov_id_attachments || []
                                    }
                                />
                                <CategoryUploadCard
                                    title="Name Change Documents"
                                    description="Court order, affidavit, marriage cert"
                                    category="name_change"
                                    existingAttachments={
                                        employee.name_change_attachments || []
                                    }
                                />
                                <CategoryUploadCard
                                    title="Other Supporting Docs"
                                    description="Any additional verification"
                                    category="other"
                                    existingAttachments={
                                        employee.other_attachments || []
                                    }
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
