import { initials, avatarPalette } from "@/Helpers/employee";

export const Field = ({ label, value }) => (
    <div className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 font-mono">
            {label}
        </span>
        <span
            className={`text-[13.5px] leading-snug ${value ? "text-foreground" : "text-muted-foreground/30"}`}
        >
            {value ?? "—"}
        </span>
    </div>
);

export const SectionDivider = ({ title }) => (
    <div className="flex items-center gap-3 mt-8 mb-5">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50 font-mono whitespace-nowrap">
            {title}
        </span>
        <div className="flex-1 h-px bg-border/50" />
    </div>
);

export const MetaChip = ({ children }) =>
    children ? (
        <span className="text-[11px] font-mono bg-muted/50 border border-border/50 rounded-md px-2 py-0.5 text-muted-foreground">
            {children}
        </span>
    ) : null;

export const FamilyTable = ({ title, rows, columns, emptyMsg }) => (
    <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70 mb-2.5 font-mono">
            {title}{" "}
            <span className="font-normal opacity-50">({rows.length})</span>
        </p>
        {rows.length === 0 ? (
            <p className="text-[13px] text-muted-foreground/40 italic py-2">
                {emptyMsg}
            </p>
        ) : (
            <div className="rounded-lg border border-border/50 overflow-hidden">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-muted/30">
                            {columns.map((col) => (
                                <th
                                    key={col}
                                    className="text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60 px-3 py-2 font-mono"
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr
                                key={i}
                                className="border-t border-border/30 hover:bg-muted/20 transition-colors"
                            >
                                {Object.values(row).map((val, j) => (
                                    <td
                                        key={j}
                                        className="px-3 py-2.5 text-[13px] text-foreground/80"
                                    >
                                        {val ?? (
                                            <span className="text-muted-foreground/30">
                                                —
                                            </span>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

export const TabBtn = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`relative pb-2.5 px-1 text-[11px] font-bold uppercase tracking-widest font-mono transition-colors
            ${
                active
                    ? "text-foreground"
                    : "text-muted-foreground/50 hover:text-muted-foreground"
            }`}
    >
        {children}
        {active && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground rounded-full" />
        )}
    </button>
);

export const ApproverCard = ({ label, value, colorId }) => {
    if (!value) return null;
    const namePart = value.includes(" - ")
        ? value.split(" - ").slice(1).join(" - ")
        : value;
    const idPart = value.includes(" - ") ? value.split(" - ")[0] : null;

    // Use the actual approver ID if available, otherwise use colorId
    // This ensures consistent colors based on the actual employee ID
    const approverId = idPart ? parseInt(idPart, 10) : colorId;
    const pal = avatarPalette(approverId);

    return (
        <div className="flex items-center gap-3 rounded-xl border border-border/50 px-4 py-3 bg-muted/10">
            <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-[12px] font-bold shrink-0 ${pal.bg} ${pal.text}`}
            >
                {initials(namePart)}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50 mb-0.5">
                    {label}
                </p>
                <p className="text-[13px] font-medium text-foreground truncate leading-snug">
                    {namePart}
                </p>
                {idPart && (
                    <p className="text-[11px] font-mono text-muted-foreground/50">
                        ID {idPart}
                    </p>
                )}
            </div>
        </div>
    );
};
