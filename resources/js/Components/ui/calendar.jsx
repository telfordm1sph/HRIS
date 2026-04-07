import { useNavigation, DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/Components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";

const MONTHS = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR + 5 - 1950 + 1 }, (_, i) => 1950 + i);

function CustomCaption({ displayMonth }) {
    const { goToMonth, previousMonth, nextMonth } = useNavigation();

    const month = displayMonth.getMonth();
    const year  = displayMonth.getFullYear();

    const handleMonth = (val) => {
        const d = new Date(displayMonth);
        d.setMonth(Number(val));
        goToMonth(d);
    };

    const handleYear = (val) => {
        const d = new Date(displayMonth);
        d.setFullYear(Number(val));
        goToMonth(d);
    };

    return (
        <div className="flex items-center justify-between px-1 pt-1">
            <button
                type="button"
                onClick={() => previousMonth && goToMonth(previousMonth)}
                disabled={!previousMonth}
                className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-7 w-7 p-0 opacity-70 hover:opacity-100"
                )}
            >
                <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex gap-1">
                <Select value={String(month)} onValueChange={handleMonth}>
                    <SelectTrigger className="h-7 w-[110px] text-xs px-2 focus:ring-0">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-52">
                        {MONTHS.map((m, i) => (
                            <SelectItem key={i} value={String(i)} className="text-xs">
                                {m}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={String(year)} onValueChange={handleYear}>
                    <SelectTrigger className="h-7 w-[70px] text-xs px-2 focus:ring-0">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-52">
                        {YEARS.map((y) => (
                            <SelectItem key={y} value={String(y)} className="text-xs">
                                {y}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <button
                type="button"
                onClick={() => nextMonth && goToMonth(nextMonth)}
                disabled={!nextMonth}
                className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-7 w-7 p-0 opacity-70 hover:opacity-100"
                )}
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
}

export function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-3", className)}
            classNames={{
                months:           "flex flex-col sm:flex-row gap-y-4 sm:gap-x-4",
                month:            "flex flex-col gap-y-3",
                caption:          "flex justify-center relative items-center",
                caption_label:    "hidden",
                nav:              "hidden",
                table:            "w-full border-collapse",
                head_row:         "flex",
                head_cell:        "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
                row:              "flex w-full mt-1",
                cell:             cn(
                    "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                    "[&:has([aria-selected])]:bg-accent",
                    "[&:has([aria-selected].day-outside)]:bg-accent/50",
                    "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
                ),
                day:              cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
                ),
                day_selected:     "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today:        "bg-accent text-accent-foreground",
                day_outside:      "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:opacity-30",
                day_disabled:     "text-muted-foreground opacity-50",
                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden:       "invisible",
                ...classNames,
            }}
            components={{ Caption: CustomCaption }}
            {...props}
        />
    );
}
