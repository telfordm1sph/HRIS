const STATUS_STYLES = {
    pending:   "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    approved:  "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    rejected:  "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    cancelled: "bg-muted text-muted-foreground",
};

export default function StatusBadge({ status }) {
    return (
        <span className={`text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${STATUS_STYLES[status]}`}>
            {status}
        </span>
    );
}
