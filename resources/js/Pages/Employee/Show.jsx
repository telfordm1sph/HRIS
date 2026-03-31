import { useState } from "react";
import { Head } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

const Field = ({ label, value }) => (
    <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {label}
        </span>
        <span className="text-sm text-foreground font-medium">
            {value ?? <span className="text-muted-foreground/40">—</span>}
        </span>
    </div>
);

const DataTable = ({ columns, rows, emptyMessage }) => (
    <div className="rounded-md border border-border overflow-x-auto">
        <Table>
            <TableHeader>
                <TableRow>
                    {columns.map((col) => (
                        <TableHead key={col}>{col}</TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.length === 0 ? (
                    <TableRow>
                        <TableCell
                            colSpan={columns.length}
                            className="text-center text-muted-foreground py-6"
                        >
                            {emptyMessage}
                        </TableCell>
                    </TableRow>
                ) : (
                    rows.map((row, i) => (
                        <TableRow key={i}>
                            {Object.values(row).map((val, j) => (
                                <TableCell key={j}>{val ?? "—"}</TableCell>
                            ))}
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    </div>
);

const SectionTitle = ({ children }) => (
    <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
        {children}
    </h2>
);

export default function EmployeeShow({ employee }) {
    return (
        <AuthenticatedLayout>
            <Head title={`Employee — ${employee.emp_name}`} />

            <div className="min-h-screen bg-background py-10 px-4">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Header Card */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-5">
                                {/* Avatar */}
                                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shrink-0">
                                    {employee.emp_firstname?.[0] ?? "?"}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-xl font-bold text-foreground truncate">
                                        {employee.emp_name}
                                    </h1>
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                        {employee.emp_jobtitle ?? "—"} ·{" "}
                                        {employee.emp_dept ?? "—"}
                                    </p>
                                    <div className="mt-2">
                                        <Badge
                                            variant={
                                                employee.accstatus == 1
                                                    ? "default"
                                                    : "destructive"
                                            }
                                        >
                                            {employee.accstatus == 1
                                                ? "Active"
                                                : "Inactive"}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Employee ID */}
                                <div className="text-right shrink-0">
                                    <span className="text-xs text-muted-foreground block">
                                        Employee ID
                                    </span>
                                    <p className="text-lg font-mono font-bold text-foreground">
                                        {employee.emp_id}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tabs Card */}
                    <Card>
                        <CardContent className="p-6">
                            <Tabs defaultValue="personal">
                                <TabsList className="mb-6">
                                    <TabsTrigger value="personal">
                                        Personal Details
                                    </TabsTrigger>
                                    <TabsTrigger value="work">
                                        Work Details
                                    </TabsTrigger>
                                </TabsList>

                                {/* Personal Tab */}
                                <TabsContent
                                    value="personal"
                                    className="space-y-8"
                                >
                                    {/* Basic Info */}
                                    <div>
                                        <SectionTitle>
                                            Basic Information
                                        </SectionTitle>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
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
                                            <Field
                                                label="Sex"
                                                value={employee.emp_sex}
                                            />
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
                                            <Field
                                                label="Height"
                                                value={employee.height}
                                            />
                                            <Field
                                                label="Weight"
                                                value={employee.weight}
                                            />
                                            <Field
                                                label="Email"
                                                value={employee.email}
                                            />
                                            <Field
                                                label="Contact No"
                                                value={employee.contact_no}
                                            />
                                            <Field
                                                label="Education"
                                                value={
                                                    employee.educational_attainment
                                                }
                                            />
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Siblings */}
                                    <div>
                                        <SectionTitle>
                                            Siblings (
                                            {employee.siblings?.length ?? 0})
                                        </SectionTitle>
                                        <DataTable
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
                                            emptyMessage="No siblings on record."
                                        />
                                    </div>

                                    <Separator />

                                    {/* Children */}
                                    <div>
                                        <SectionTitle>
                                            Children (
                                            {employee.children?.length ?? 0})
                                        </SectionTitle>
                                        <DataTable
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
                                            emptyMessage="No children on record."
                                        />
                                    </div>
                                </TabsContent>

                                {/* Work Tab */}
                                <TabsContent value="work">
                                    <SectionTitle>
                                        Work Information
                                    </SectionTitle>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
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
                                            value={
                                                employee.service_length
                                                    ? `${employee.service_length} years`
                                                    : null
                                            }
                                        />
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
