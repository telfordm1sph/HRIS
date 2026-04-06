import { useState } from "react";
import { router, usePage } from "@inertiajs/react";

export function useChangeRequests(filters) {
    const { errors } = usePage().props;
    const [localFilters, setLocalFilters] = useState(filters);

    const applyFilters = (overrides = {}) => {
        router.get(
            route("change-requests.index"),
            { ...localFilters, ...overrides, page: 1 },
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
