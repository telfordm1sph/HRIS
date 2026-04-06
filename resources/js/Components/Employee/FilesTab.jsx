import { FileText, FileImage, ExternalLink } from "lucide-react";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-xl border border-border/40 overflow-hidden animate-pulse"
                >
                    <div className="aspect-[4/3] bg-muted/50" />
                    <div className="px-3 py-2.5 space-y-2">
                        <div className="h-3 bg-muted/50 rounded w-3/4" />
                        <div className="h-2 bg-muted/50 rounded w-1/2" />
                        <div className="flex justify-between">
                            <div className="h-2 bg-muted/40 rounded w-1/4" />
                            <div className="h-2 bg-muted/40 rounded w-1/4" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function Empty() {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/30">
            <FileText className="w-12 h-12 mb-3" strokeWidth={1.2} />
            <p className="text-[13px] font-medium">No files uploaded yet.</p>
            <p className="text-[11px] mt-1 text-muted-foreground/25">
                Files attached to change requests will appear here.
            </p>
        </div>
    );
}

// ─── Single card ──────────────────────────────────────────────────────────────

function AttachmentCard({ attachment }) {
    return (
        <a
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col rounded-xl border border-border/50 bg-card overflow-hidden hover:border-border/80 hover:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
            {/* ── Thumbnail ── */}
            <div className="relative aspect-[4/3] bg-muted/20 overflow-hidden flex items-center justify-center shrink-0">
                {attachment.is_image ? (
                    <img
                        src={attachment.url}
                        alt={attachment.original_name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground/30">
                        <FileText className="w-12 h-12" strokeWidth={1} />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground/40">
                            {attachment.mime_type === "application/pdf"
                                ? "PDF"
                                : attachment.mime_type.split("/")[1]?.toUpperCase() ?? "FILE"}
                        </span>
                    </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-200" />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="inline-flex items-center gap-1 bg-background/95 text-foreground text-[10px] font-semibold font-mono px-2 py-1 rounded-md shadow-sm border border-border/50">
                        <ExternalLink className="w-3 h-3" />
                        View
                    </span>
                </div>
            </div>

            {/* ── Info ── */}
            <div className="px-3 py-2.5 flex-1">
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
                <div className="flex items-center justify-between gap-2 mt-auto pt-1">
                    <span className="text-[10px] font-mono text-muted-foreground/40">
                        {attachment.size}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground/40">
                        {attachment.created_at}
                    </span>
                </div>
            </div>
        </a>
    );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function FilesTab({ attachments, loading }) {
    if (loading) return <Skeleton />;
    if (!attachments?.length) return <Empty />;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {attachments.map((att) => (
                <AttachmentCard key={att.id} attachment={att} />
            ))}
        </div>
    );
}
