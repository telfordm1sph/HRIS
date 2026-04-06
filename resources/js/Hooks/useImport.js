import { useEffect, useRef, useState } from "react";
import { router, usePage } from "@inertiajs/react";

export function useImport() {
    const { flash } = usePage().props;

    const fileInputRef              = useRef(null);
    const [file, setFile]           = useState(null);
    const [dragging, setDragging]   = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error)   toast.error(flash.error);
    }, [flash.success, flash.error]);

    const handleFile = (f) => {
        if (f && (f.name.endsWith(".xlsx") || f.name.endsWith(".xls"))) {
            setFile(f);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        handleFile(e.dataTransfer.files[0]);
    };

    const handleSubmit = () => {
        if (!file) return;
        setUploading(true);

        const data = new FormData();
        data.append("file", file);

        router.post(route("import.upload"), data, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => {
                setUploading(false);
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
            },
        });
    };

    return { fileInputRef, file, dragging, setDragging, uploading, handleFile, handleDrop, handleSubmit };
}
