import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    ChevronDown,
    User,
    Heart,
    MapPin,
    GraduationCap,
    Users,
    Baby,
    MoreHorizontal,
} from "lucide-react";

const CATEGORIES = [
    { key: "name", label: "Name", icon: User },
    { key: "civil_status", label: "Civil Status", icon: Heart },
    { key: "address", label: "Address", icon: MapPin },
    { key: "education", label: "Education", icon: GraduationCap },
    { key: "father", label: "Father", icon: User },
    { key: "mother", label: "Mother", icon: User },
    { key: "spouse", label: "Spouse", icon: Heart },
    { key: "children", label: "Children", icon: Baby },
    { key: "siblings", label: "Siblings", icon: Users },
    { key: "others", label: "Others", icon: MoreHorizontal },
];

// pendingMap: { name: {status:'pending',...}, civil_status: null, ... }
export default function EditSectionDropdown({ onSelect, pendingMap = {} }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleSelect = (category) => {
        setOpen(false);
        onSelect(category);
    };

    return (
        <div className="relative" ref={ref}>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen((o) => !o)}
                className="gap-2 text-[12px] font-semibold uppercase tracking-wider font-mono"
            >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <path
                        d="M2 4h12M2 8h8M2 12h5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                </svg>
                Edit Section
                <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
                />
            </Button>

            {open && (
                <div className="absolute right-0 top-full mt-1.5 z-50 w-52 rounded-xl border border-border/60 bg-background shadow-lg overflow-hidden">
                    <div className="py-1">
                        {CATEGORIES.map(({ key, label, icon: Icon }) => {
                            const req = pendingMap[key];
                            const status = req?.status;

                            return (
                                <button
                                    key={key}
                                    onClick={() => handleSelect(key)}
                                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-[13px] hover:bg-muted/50 transition-colors text-left group"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Icon className="w-[14px] h-[14px] text-muted-foreground/60 shrink-0" />
                                        <span className="text-foreground">
                                            {label}
                                        </span>
                                    </div>

                                    {/* Status indicator */}
                                    {status === "pending" && (
                                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                                            pending
                                        </span>
                                    )}
                                    {status === "rejected" && (
                                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400">
                                            rejected
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
