import { useState } from "react";
import { router, usePage } from "@inertiajs/react";

export function useChangeRequests(filters) {
    const { errors } = usePage().props;
    const [localFilters, setLocalFilters] = useState(filters);

    const applyFilters = (overrides = {}) => {
        const merged = {
            ...localFilters,
            ...overrides,
            // preserve explicit page override; otherwise reset to 1 on filter change
            page: overrides.page ?? 1,
        };
        router.get(
            route("change-requests.index"),
            { filters: btoa(JSON.stringify(merged)) },
            { preserveScroll: true, replace: true }
        );
    };

    const handleApprove = (id, onFinish) => {
        router.post(
            route("change-requests.approve", { id }),
            {},
            {
                preserveScroll: true,
                only: ["requests"],
                onError: () => toast.error(errors.message ?? "Failed to approve."),
                onFinish,
            }
        );
    };

    const handleReject = (id, remarks, onFinish) => {
        router.post(
            route("change-requests.reject", { id }),
            { remarks },
            {
                preserveScroll: true,
                only: ["requests"],
                onError: () => toast.error(errors.message ?? "Failed to reject."),
                onFinish,
            }
        );
    };

    return { localFilters, setLocalFilters, applyFilters, handleApprove, handleReject };
}
