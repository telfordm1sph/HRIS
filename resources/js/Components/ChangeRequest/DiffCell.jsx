import { useState } from "react";

// Fields that store a numeric FK — maps field key → shuttle lookup key
const FK_LABEL_MAPS = {
    shuttle: "shuttle",
};

export default function DiffCell({ oldValue, newValue, category, shuttles = [] }) {
    const [expanded, setExpanded] = useState(false);

    // Build id→name map for shuttle
    const shuttleMap = Object.fromEntries(shuttles.map((s) => [s.id, s.shuttle_name]));

    const resolveLabel = (key, val) => {
        if (val == null || val === "") return null;
        if (key === "shuttle") return shuttleMap[val] ?? val;
        return val;
    };

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
            {changed.map((k) => {
                const oldDisplay = resolveLabel(k, oldValue?.[k]);
                const newDisplay = resolveLabel(k, newValue?.[k]);
                return (
                    <div key={k} className="flex items-start gap-1.5 text-[11.5px]">
                        <span className="text-muted-foreground/50 font-mono min-w-[80px] shrink-0">{k}</span>
                        <span className="text-red-600 dark:text-red-400 line-through mr-1">
                            {oldDisplay || <span className="not-italic opacity-40">empty</span>}
                        </span>
                        <span className="text-green-700 dark:text-green-400">
                            {newDisplay || <span className="opacity-40">empty</span>}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
