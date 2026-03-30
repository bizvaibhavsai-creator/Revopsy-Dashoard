"use client";

import { cn } from "@/lib/utils";
import { TIME_RANGE_OPTIONS } from "@/lib/constants";
import { useDashboardStore } from "@/lib/store";

export default function TimeRangeToggle() {
    const { timeRange, setTimeRange } = useDashboardStore();

    return (
        <div
            role="tablist"
            aria-label="Select time range"
            className="inline-flex items-center gap-1 rounded-full bg-surface p-1 shadow-sm"
        >
            {TIME_RANGE_OPTIONS.map((option) => (
                <button
                    key={option.value}
                    role="tab"
                    aria-selected={timeRange === option.value}
                    onClick={() => setTimeRange(option.value)}
                    className={cn(
                        "min-h-[2.75rem] rounded-full px-4 py-2 text-sm font-medium transition-all",
                        timeRange === option.value
                            ? "bg-primary text-white shadow-md shadow-primary/25"
                            : "text-text-muted hover:bg-surface-hover hover:text-text-primary"
                    )}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}
