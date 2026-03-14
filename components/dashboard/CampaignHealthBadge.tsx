"use client";

import { cn } from "@/lib/utils";
import type { HealthLevel } from "@/types/dashboard";
import { getHealthClasses } from "@/lib/health-scoring";
import { ShieldCheck, AlertTriangle, ShieldAlert } from "lucide-react";

interface CampaignHealthBadgeProps {
    score: number;
    level: HealthLevel;
    compact?: boolean;
}

const ICONS: Record<HealthLevel, React.ReactNode> = {
    healthy: <ShieldCheck size={12} />,
    warning: <AlertTriangle size={12} />,
    critical: <ShieldAlert size={12} />,
};

export default function CampaignHealthBadge({ score, level, compact = false }: CampaignHealthBadgeProps) {
    const classes = getHealthClasses(level);

    if (compact) {
        return (
            <div
                className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold", classes.bg, classes.text)}
                title={`Health: ${score}/100`}
            >
                {ICONS[level]}
                {score}
            </div>
        );
    }

    return (
        <div
            className={cn(
                "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                classes.bg,
                classes.text
            )}
        >
            {ICONS[level]}
            <span>{score}/100</span>
        </div>
    );
}
