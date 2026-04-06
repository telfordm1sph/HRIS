import { useRef, useState } from "react";
import { router } from "@inertiajs/react";

export function useImport(result) {
    const fileInputRef = useRef(null);
    const [file, setFile]         = useState(null);
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);

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

    const totalProcessed = result
        ? Object.values(result.sheets).reduce((s, r) => s + r.processed, 0)
        : 0;

    return { fileInputRef, file, dragging, setDragging, uploading, handleFile, handleDrop, handleSubmit, totalProcessed };
}
