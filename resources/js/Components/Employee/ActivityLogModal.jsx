import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";

const SECTION_LABELS = {
    EmployeeDetail:     "Personal Info",
    EmployeeWorkDetail: "Work Details",
    EmployeeAddress:    "Address",
    EmployeeApprover:   "Approvers",
    EmployeeParent:     "Parent",
    EmployeeSpouse:     "Spouse",
    EmployeeSibling:    "Sibling",
    EmployeeChild:      "Child",
    EmployeeGovInfo:    "Government Info",
};

const ACTION_CONFIG = {
    UPDATED:  { label: "Updated",  cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
    CREATED:  { label: "Created",  cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
    DELETED:  { label: "Deleted",  cls: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
    RESTORED: { label: "Restored", cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
};

function formatKey(key) {
    return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(val) {
    if (val === null || val === undefined || val === "") return "—";
    return String(val);
}

function formatDateTime(dt) {
    if (!dt) return "—";
    const d = new Date(dt);
    return d.toLocaleString("en-PH", {
        month: "short", day: "numeric", year: "numeric",
        hour: "numeric", minute: "2-digit", hour12: true,
    });
}

function ActorAvatar({ name }) {
    const initials = name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase() || "?";

    return (
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0 select-none">
            {initials}
        </div>
    );
}

function LogCard({ log, isLast }) {
    const action = ACTION_CONFIG[log.action_type] ?? { label: log.action_type, cls: "bg-muted text-muted-foreground" };
    const section = SECTION_LABELS[log.section] ?? log.section;

    const isUpdate  = log.action_type === "UPDATED";
    const isCreate  = log.action_type === "CREATED";
    const isDelete  = log.action_type === "DELETED";

    const values = isUpdate
        ? Object.keys(log.new_values ?? {}).map((k) => ({
              key: k,
              old: (log.old_values ?? {})[k],
              new: log.new_values[k],
          }))
        : isCreate
        ? Object.keys(log.new_values ?? {}).map((k) => ({ key: k, val: log.new_values[k] }))
        : Object.keys(log.old_values ?? {}).map((k) => ({ key: k, val: log.old_values[k] }));

    return (
        <div className="flex gap-3">
            {/* Timeline spine */}
            <div className="flex flex-col items-center">
                <ActorAvatar name={log.action_by_name} />
                {!isLast && <div className="w-px flex-1 bg-border/40 mt-1" />}
            </div>

            {/* Card */}
            <div className="pb-4 flex-1 min-w-0">
                <div className="rounded-xl border border-border/50 bg-card shadow-sm p-3.5">
                    {/* Header row */}
                    <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                        <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${action.cls}`}>
                            {action.label}
                        </span>
                        <span className="text-[12px] font-medium text-foreground">{section}</span>
                        <span className="flex-1" />
                        <span className="text-[10px] text-muted-foreground/50 font-mono whitespace-nowrap">
                            {formatDateTime(log.action_at)}
                        </span>
                    </div>

                    {/* Diff / values */}
                    {values.length > 0 && (
                        <div className="space-y-1 mb-2.5">
                            {values.map((v) =>
                                isUpdate ? (
                                    <div key={v.key} className="flex items-start gap-1.5 text-[11px] flex-wrap">
                                        <span className="text-muted-foreground/60 w-28 shrink-0">{formatKey(v.key)}</span>
                                        <span className="line-through text-red-500/70">{formatValue(v.old)}</span>
                                        <span className="text-muted-foreground/40">→</span>
                                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">{formatValue(v.new)}</span>
                                    </div>
                                ) : (
                                    <div key={v.key} className="flex items-start gap-1.5 text-[11px]">
                                        <span className="text-muted-foreground/60 w-28 shrink-0">{formatKey(v.key)}</span>
                                        <span className={isDelete ? "line-through text-red-500/70" : "text-foreground"}>
                                            {formatValue(v.val)}
                                        </span>
                                    </div>
                                )
                            )}
                        </div>
                    )}

                    {/* Remarks */}
                    {log.remarks && (
                        <p className="text-[11px] text-muted-foreground italic mb-2">&ldquo;{log.remarks}&rdquo;</p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center gap-1.5 pt-2 border-t border-border/30">
                        <span className="text-[11px] text-muted-foreground">{log.action_by_name}</span>
                        {log.action_by_id === 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground/60 font-mono">
                                Admin
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ActivityLogModal({ employid, onClose }) {
    const [logs, setLogs]       = useState([]);
    const [page, setPage]       = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [total, setTotal]     = useState(null);
    const scrollRef  = useRef(null);
    const fetchingRef = useRef(false);

    const fetchPage = useCallback(async (p) => {
        if (fetchingRef.current) return;
        fetchingRef.current = true;
        setLoading(true);
        try {
            const res = await axios.get(
                route("employees.history", { employid }),
                { params: { page: p } }
            );
            const { data, has_more, total: t } = res.data;
            setLogs((prev) => (p === 1 ? data : [...prev, ...data]));
            setHasMore(has_more);
            setPage(p);
            if (p === 1) setTotal(t);
        } catch {
            // silent
        } finally {
            setLoading(false);
            fetchingRef.current = false;
        }
    }, [employid]);

    // Initial load
    useEffect(() => {
        fetchPage(1);
    }, [fetchPage]);

    // Infinite scroll
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const onScroll = () => {
            if (
                el.scrollHeight - el.scrollTop - el.clientHeight < 100 &&
                hasMore &&
                !fetchingRef.current
            ) {
                fetchPage(page + 1);
            }
        };
        el.addEventListener("scroll", onScroll);
        return () => el.removeEventListener("scroll", onScroll);
    }, [hasMore, page, fetchPage]);

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="relative z-10 w-full max-w-lg bg-background border border-border/50 rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50 shrink-0">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-[15px] font-semibold text-foreground">Activity History</h2>
                        <p className="text-[11px] text-muted-foreground">
                            {total !== null
                                ? `${total} change${total !== 1 ? "s" : ""} recorded`
                                : "Loading…"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors text-[13px] shrink-0"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
                    {/* Empty state */}
                    {!loading && logs.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xl mb-3">
                                📋
                            </div>
                            <p className="text-[14px] font-medium text-foreground">No history yet</p>
                            <p className="text-[12px] text-muted-foreground mt-1">
                                No changes have been recorded for this employee.
                            </p>
                        </div>
                    )}

                    {/* Log entries */}
                    {logs.map((log, i) => (
                        <LogCard
                            key={log.id}
                            log={log}
                            isLast={i === logs.length - 1 && !hasMore}
                        />
                    ))}

                    {/* Loading spinner */}
                    {loading && (
                        <div className="flex items-center justify-center py-6">
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}

                    {/* End of list */}
                    {!hasMore && logs.length > 0 && (
                        <p className="text-center text-[11px] text-muted-foreground/40 font-mono py-3">
                            — end of history —
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
