export default function SheetSummary({ label, result }) {
    if (!result) return null;
    return (
        <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
            <span className="text-[13px] text-foreground/80">{label}</span>
            <div className="flex gap-4 text-[12px] font-mono">
                <span className="text-green-600 dark:text-green-400">
                    {result.processed} processed
                </span>
                {result.skipped > 0 && (
                    <span className="text-amber-600 dark:text-amber-400">
                        {result.skipped} skipped
                    </span>
                )}
            </div>
        </div>
    );
}
