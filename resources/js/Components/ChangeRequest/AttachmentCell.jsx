import { useState } from "react";
import { Download, File, FileText, FileSpreadsheet, ZoomIn } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";

function fileTypeLabel(mimeType, originalName) {
    if (!mimeType) {
        const ext = originalName?.split(".").pop()?.toUpperCase();
        return ext ?? "FILE";
    }
    const map = {
        "application/pdf": "PDF",
        "application/msword": "DOC",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
        "application/vnd.ms-excel": "XLS",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
    };
    return map[mimeType] ?? mimeType.split("/")[1]?.toUpperCase() ?? "FILE";
}

function FileTypeIcon({ mimeType }) {
    if (mimeType?.includes("pdf"))
        return <FileText className="w-5 h-5 text-muted-foreground/40" strokeWidth={1.2} />;
    if (mimeType?.includes("spreadsheet") || mimeType?.includes("excel"))
        return <FileSpreadsheet className="w-5 h-5 text-muted-foreground/40" strokeWidth={1.2} />;
    return <File className="w-5 h-5 text-muted-foreground/40" strokeWidth={1.2} />;
}

function ImagePreviewDialog({ attachment, open, onClose }) {
    if (!attachment) return null;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-3xl p-0 overflow-hidden">
                <DialogHeader className="px-4 pt-4 pb-2">
                    <DialogTitle className="text-[14px] font-medium truncate pr-6">
                        {attachment.original_name}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex items-center justify-center bg-muted/30 max-h-[65vh] overflow-auto p-2">
                    <img
                        src={attachment.url}
                        alt={attachment.original_name}
                        className="max-w-full max-h-[60vh] object-contain rounded"
                    />
                </div>

                <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono text-[10px]">
                            {fileTypeLabel(attachment.mime_type, attachment.original_name)}
                        </Badge>
                        {attachment.size && (
                            <span className="text-[11px] text-muted-foreground">{attachment.size}</span>
                        )}
                    </div>
                    <Button asChild size="sm" variant="outline">
                        <a href={attachment.url} download={attachment.original_name}>
                            <Download className="w-3.5 h-3.5 mr-1.5" />
                            Download
                        </a>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function AttachmentCell({ attachment }) {
    const [previewOpen, setPreviewOpen] = useState(false);

    if (!attachment) {
        return <span className="text-muted-foreground/30 text-[12px]">—</span>;
    }

    if (attachment.is_image) {
        return (
            <>
                <button
                    onClick={() => setPreviewOpen(true)}
                    className="group relative w-16 h-16 rounded-lg overflow-hidden border border-border/50 bg-muted/20 hover:border-border transition-all duration-200 shrink-0"
                >
                    <img
                        src={attachment.url}
                        alt={attachment.original_name}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/15 transition-colors flex items-center justify-center">
                        <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                    </div>
                </button>

                <ImagePreviewDialog
                    attachment={attachment}
                    open={previewOpen}
                    onClose={() => setPreviewOpen(false)}
                />
            </>
        );
    }

    // Non-image: show type badge + download button
    return (
        <div className="flex flex-col items-start gap-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
                <FileTypeIcon mimeType={attachment.mime_type} />
                <span
                    className="text-[11px] text-foreground/70 truncate max-w-[110px]"
                    title={attachment.original_name}
                >
                    {attachment.original_name}
                </span>
            </div>
            <Button asChild size="sm" variant="outline" className="h-6 px-2 text-[10px]">
                <a href={attachment.url} download={attachment.original_name}>
                    <Download className="w-3 h-3 mr-1" />
                    Download
                </a>
            </Button>
        </div>
    );
}
