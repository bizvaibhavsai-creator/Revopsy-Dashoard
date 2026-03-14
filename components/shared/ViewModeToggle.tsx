"use client";

import { Eye, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/lib/store";
import type { ViewMode } from "@/types/dashboard";

const MODES: { value: ViewMode; label: string; icon: React.ReactNode }[] = [
    { value: "exec", label: "Exec", icon: <Briefcase size={14} /> },
    { value: "operator", label: "Operator", icon: <Eye size={14} /> },
];

export default function ViewModeToggle() {
    const { viewMode, setViewMode } = useDashboardStore();

    return (
        <div className="flex items-center rounded-lg border border-border bg-background p-0.5">
            {MODES.map((mode) => (
                <button
                    key={mode.value}
                    onClick={() => setViewMode(mode.value)}
                    className={cn(
                        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                        viewMode === mode.value
                            ? "bg-primary text-white shadow-sm"
                            : "text-text-muted hover:text-text-primary"
                    )}
                    aria-label={`Switch to ${mode.label} view`}
                >
                    {mode.icon}
                    {mode.label}
                </button>
            ))}
        </div>
    );
}
