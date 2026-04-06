import { useState } from "react";

export default function DiffCell({ oldValue, newValue }) {
    const [expanded, setExpanded] = useState(false);

    if (Array.isArray(newValue)) {
        return (
            <button
                onClick={() => setExpanded((e) => !e)}
                className="text-[11px] text-muted-foreground/60 font-mono hover:text-foreground transition-colors"
            >
                {expanded ? "▲ Hide" : `▼ ${newValue.length} row(s)`}
                {expanded && (
                    <pre className="mt-2 text-left text-[10px] bg-muted/30 rounded p-2 whitespace-pre-wrap max-w-xs">
                        {JSON.stringify(newValue, null, 2)}
                    </pre>
                )}
            </button>
        );
    }

    const keys = [...new Set([...Object.keys(oldValue ?? {}), ...Object.keys(newValue ?? {})])];
    const changed = keys.filter((k) => String(oldValue?.[k] ?? "") !== String(newValue?.[k] ?? ""));

    return (
        <div className="space-y-1">
            {changed.map((k) => (
                <div key={k} className="flex items-start gap-1.5 text-[11.5px]">
                    <span className="text-muted-foreground/50 font-mono min-w-[80px] shrink-0">{k}</span>
                    <span className="text-red-600 dark:text-red-400 line-through mr-1">
                        {oldValue?.[k] || <span className="not-italic opacity-40">empty</span>}
                    </span>
                    <span className="text-green-700 dark:text-green-400">
                        {newValue?.[k] || <span className="opacity-40">empty</span>}
                    </span>
                </div>
            ))}
        </div>
    );
}
