import { useState } from "react";
import { FileText, FileSpreadsheet, FileCode, Download, ZoomIn, File } from "lucide-react";

import { Skeleton } from "@/Components/ui/skeleton";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fileTypeLabel(mimeType) {
    if (!mimeType) return "FILE";
    const map = {
        "application/pdf":                                                  "PDF",
        "application/msword":                                               "DOC",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
        "application/vnd.ms-excel":                                         "XLS",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
    };
    return map[mimeType] ?? mimeType.split("/")[1]?.toUpperCase() ?? "FILE";
}

function FileIcon({ mimeType }) {
    if (mimeType?.includes("pdf"))        return <FileText className="w-10 h-10" strokeWidth={1} />;
    if (mimeType?.includes("spreadsheet") || mimeType?.includes("excel"))
                                          return <FileSpreadsheet className="w-10 h-10" strokeWidth={1} />;
    if (mimeType?.includes("word"))       return <FileCode className="w-10 h-10" strokeWidth={1} />;
    return <File className="w-10 h-10" strokeWidth={1} />;
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function FilesSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                    <Skeleton className="aspect-[4/3] rounded-none" />
                    <CardContent className="p-3 space-y-2">
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-2 w-1/2" />
                        <div className="flex justify-between">
                            <Skeleton className="h-2 w-1/4" />
                            <Skeleton className="h-2 w-1/4" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function FilesEmpty() {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="w-7 h-7 text-muted-foreground/40" strokeWidth={1.2} />
            </div>
            <p className="text-[13px] font-medium text-foreground">No files uploaded yet</p>
            <p className="text-[11px] mt-1 text-muted-foreground/50">
                Files attached to change requests will appear here.
            </p>
        </div>
    );
}

// ─── Image preview dialog ─────────────────────────────────────────────────────

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
                <div className="flex items-center justify-center bg-muted/30 max-h-[70vh] overflow-auto p-2">
                    <img
                        src={attachment.url}
                        alt={attachment.original_name}
                        className="max-w-full max-h-[65vh] object-contain rounded"
                    />
                </div>
                <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
                    <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="font-mono text-[10px]">
                            {fileTypeLabel(attachment.mime_type)}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">{attachment.size}</span>
                        <span className="text-[11px] text-muted-foreground">{attachment.created_at}</span>
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

// ─── Single attachment card ───────────────────────────────────────────────────

function AttachmentCard({ attachment, onPreview }) {
    const isImage = attachment.is_image;

    return (
        <Card className="overflow-hidden group transition-all duration-200 hover:shadow-md hover:border-border/80">
            {/* Thumbnail area */}
            <div
                className="relative aspect-[4/3] bg-muted/20 overflow-hidden flex items-center justify-center cursor-pointer"
                onClick={() => isImage && onPreview(attachment)}
            >
                {isImage ? (
                    <>
                        <img
                            src={attachment.url}
                            alt={attachment.original_name}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                        {/* Image hover overlay */}
                        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-200 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <div className="bg-background/90 rounded-full p-2 shadow-md">
                                    <ZoomIn className="w-4 h-4 text-foreground" />
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground/30">
                        <FileIcon mimeType={attachment.mime_type} />
                        <Badge variant="secondary" className="font-mono text-[10px] uppercase">
                            {fileTypeLabel(attachment.mime_type)}
                        </Badge>
                    </div>
                )}
            </div>

            {/* Info area */}
            <CardContent className="p-3">
                <p
                    className="text-[12.5px] font-medium text-foreground truncate leading-snug mb-0.5"
                    title={attachment.original_name}
                >
                    {attachment.original_name}
                </p>
                {attachment.description && (
                    <p
                        className="text-[11px] text-muted-foreground/60 truncate mb-1.5"
                        title={attachment.description}
                    >
                        {attachment.description}
                    </p>
                )}
                <div className="flex items-center justify-between gap-2 mt-2">
                    <span className="text-[10px] font-mono text-muted-foreground/50">{attachment.size}</span>
                    {isImage ? (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-[10px]"
                            asChild
                        >
                            <a href={attachment.url} download={attachment.original_name}>
                                <Download className="w-3 h-3 mr-1" />
                                Save
                            </a>
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-[10px]"
                            asChild
                        >
                            <a href={attachment.url} download={attachment.original_name}>
                                <Download className="w-3 h-3 mr-1" />
                                Download
                            </a>
                        </Button>
                    )}
                </div>
                <span className="text-[10px] font-mono text-muted-foreground/40 mt-1 block">
                    {attachment.created_at}
                </span>
            </CardContent>
        </Card>
    );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function FilesTab({ attachments, loading }) {
    const [preview, setPreview] = useState(null);

    if (loading) return <FilesSkeleton />;
    if (!attachments?.length) return <FilesEmpty />;

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {attachments.map((att) => (
                    <AttachmentCard
                        key={att.id}
                        attachment={att}
                        onPreview={setPreview}
                    />
                ))}
            </div>

            <ImagePreviewDialog
                attachment={preview}
                open={!!preview}
                onClose={() => setPreview(null)}
            />
        </>
    );
}
