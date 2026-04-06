import { useState, useMemo, useCallback, useRef } from "react";
import { router } from "@inertiajs/react";
import { avatarPalette } from "@/Helpers/employee";

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
                shuttle: employee.shuttle ?? null,
            };
        default:
            return {};
    }
}

export function useEmployeeShow(employee, changeRequests = {}) {
    const [tab, setTab] = useState("personal");
    const [attachmentsLoading, setAttachmentsLoading] = useState(false);
    const attachmentsFetched = useRef(false);
    const [modalCategory, setModalCategory] = useState(null);
    const [formValue, setFormValue] = useState(null);
    const [oldValueSnapshot, setOldValueSnapshot] = useState(null);
    const [pendingMap, setPendingMap] = useState(changeRequests);

    const pal = useMemo(
        () => avatarPalette(employee.emp_id),
        [employee.emp_id],
    );

    const loadOptions = useCallback(
        (search, page) =>
            new Promise((resolve) => {
                router.reload({
                    only: ["activeEmployees"],
                    data: { q: btoa(JSON.stringify({ search, page, per_page: 50 })) },
                    onSuccess: (pg) => {
                        const result = pg.props.activeEmployees;
                        resolve({
                            options: (result?.data ?? result ?? []).map(
                                (emp) => ({
                                    value: emp.employid,
                                    label: `${emp.employid} — ${emp.emp_name}`,
                                }),
                            ),
                            hasMore:
                                (result?.current_page ?? 1) <
                                (result?.last_page ?? 1),
                        });
                    },
                    onError: () => resolve({ options: [], hasMore: false }),
                });
            }),
        [],
    );

    const employeeOptions = useMemo(
        () => [
            {
                value: employee.emp_id,
                label: `${employee.emp_id} — ${employee.emp_name}`,
            },
        ],
        [employee.emp_id, employee.emp_name],
    );

    const handleEmployeeChange = useCallback(
        (employid) => {
            if (!employid || employid === employee.emp_id) return;
            router.visit(route("employees.show", { employid: btoa(employid) }), {
                preserveScroll: false,
            });
        },
        [employee.emp_id],
    );

    const openModal = useCallback(
        (category) => {
            const snapshot = buildOldValue(category, employee);
            setOldValueSnapshot(snapshot);
            setFormValue(snapshot);
            setModalCategory(category);
        },
        [employee],
    );

    const closeModal = useCallback(() => {
        setModalCategory(null);
        setFormValue(null);
        setOldValueSnapshot(null);
    }, []);

    const handleSuccess = useCallback((newRequest) => {
        setPendingMap((prev) => ({
            ...prev,
            [newRequest.category]: newRequest,
        }));
    }, []);

    const handleTabChange = useCallback((newTab) => {
        setTab(newTab);
        if (newTab === "files" && !attachmentsFetched.current) {
            attachmentsFetched.current = true;
            setAttachmentsLoading(true);
            router.reload({
                only: ["attachments"],
                onFinish: () => setAttachmentsLoading(false),
            });
        }
    }, []);

    return {
        tab,
        attachmentsLoading,
        modalCategory,
        formValue,
        setFormValue,
        oldValueSnapshot,
        pendingMap,
        pal,
        loadOptions,
        employeeOptions,
        handleEmployeeChange,
        openModal,
        closeModal,
        handleSuccess,
        handleTabChange,
    };
}
