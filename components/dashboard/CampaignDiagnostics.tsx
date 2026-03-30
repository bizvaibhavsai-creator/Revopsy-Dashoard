"use client";

import { cn } from "@/lib/utils";
import type { DiagnosticIssue, HealthLevel } from "@/types/dashboard";
import { getHealthClasses } from "@/lib/health-scoring";
import {
    ShieldAlert,
    MessageSquareWarning,
    UserX,
    Target,
    BarChart3,
    CheckCircle2,
    Lightbulb,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    deliverability: <ShieldAlert size={14} />,
    messaging: <MessageSquareWarning size={14} />,
    follow_up: <UserX size={14} />,
    targeting: <Target size={14} />,
    volume: <BarChart3 size={14} />,
    general: <CheckCircle2 size={14} />,
};

const CATEGORY_LABELS: Record<string, string> = {
    deliverability: "Deliverability",
    messaging: "Messaging",
    follow_up: "SDR Follow-up",
    targeting: "Targeting",
    volume: "Volume",
    general: "General",
};

interface CampaignDiagnosticsProps {
    diagnostics: DiagnosticIssue[];
    campaignName: string;
}

export default function CampaignDiagnostics({ diagnostics, campaignName }: CampaignDiagnosticsProps) {
    return (
        <div className="space-y-3 rounded-xl bg-background/50 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                Diagnostics for &quot;{campaignName}&quot;
            </p>

            {diagnostics.map((issue, idx) => {
                const classes = getHealthClasses(issue.severity);
                return (
                    <div
                        key={idx}
                        className={cn("rounded-xl p-4 shadow-sm", "bg-surface")}
                    >
                        <div className="mb-2 flex items-center gap-2">
                            <div className={cn("flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium", classes.bg, classes.text)}>
                                {CATEGORY_ICONS[issue.category]}
                                {CATEGORY_LABELS[issue.category]}
                            </div>
                        </div>
                        <p className="mb-1 text-sm font-medium text-text-primary">{issue.title}</p>
                        <p className="mb-2 text-xs text-text-muted">{issue.description}</p>
                        <div className="flex items-start gap-1.5 rounded-xl bg-primary/5 p-3">
                            <Lightbulb size={12} className="mt-0.5 shrink-0 text-primary" />
                            <p className="text-xs text-primary">{issue.recommendation}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
