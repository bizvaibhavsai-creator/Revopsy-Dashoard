"use client";

import { useMemo } from "react";
import {
    Pause,
    TrendingUp,
    ArrowRightLeft,
    Copy,
    Wrench,
    Lightbulb,
    ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCampaigns } from "@/lib/mock-data";
import { generateRecommendations } from "@/lib/recommendations";
import { useInstantly } from "@/hooks/use-instantly";
import { useHeyReach } from "@/hooks/use-heyreach";
import type { Campaign, Recommendation } from "@/types/dashboard";

const TYPE_ICONS: Record<Recommendation["type"], React.ReactNode> = {
    pause: <Pause size={14} />,
    increase_spend: <TrendingUp size={14} />,
    channel_shift: <ArrowRightLeft size={14} />,
    duplicate: <Copy size={14} />,
    optimize: <Wrench size={14} />,
    general: <Lightbulb size={14} />,
};

const PRIORITY_COLORS: Record<Recommendation["priority"], { bg: string; text: string; dot: string }> = {
    high: { bg: "bg-danger/10", text: "text-danger", dot: "bg-danger" },
    medium: { bg: "bg-warning/10", text: "text-warning", dot: "bg-warning" },
    low: { bg: "bg-text-muted/10", text: "text-text-muted", dot: "bg-text-muted" },
};

function buildCampaignsFromApi(
    instantlyData: ReturnType<typeof useInstantly>["data"],
    heyreachData: ReturnType<typeof useHeyReach>["data"],
    iConnected: boolean,
    hConnected: boolean
): Campaign[] {
    if (!iConnected && !hConnected) return getCampaigns();
    const merged: Campaign[] = [];
    if (iConnected && instantlyData?.campaigns) {
        for (const c of instantlyData.campaigns) {
            merged.push({
                id: c.id, name: c.name, platform: "instantly",
                leads: 0, replyRate: 0, positiveReplies: 0, meetingsBooked: 0,
                status: c.status === 1 ? "active" : c.status === 2 ? "paused" : "completed",
                lastUpdated: "—",
            });
        }
    }
    if (hConnected && heyreachData?.campaigns) {
        for (const c of heyreachData.campaigns) {
            const stats = c.stats;
            const totalSent = (stats?.connectionRequestsSent ?? 0) + (stats?.messagesSent ?? 0);
            const totalReplies = stats?.messagesReceived ?? 0;
            merged.push({
                id: String(c.id), name: c.name, platform: "heyreach",
                leads: stats?.connectionRequestsSent ?? 0,
                replyRate: totalSent > 0 ? +((totalReplies / totalSent) * 100).toFixed(1) : 0,
                positiveReplies: totalReplies, meetingsBooked: 0,
                status: (c.status?.toLowerCase() as "active" | "paused" | "completed") || "active",
                lastUpdated: "—",
            });
        }
    }
    return merged;
}

export default function RecommendationsPanel() {
    const { data: iData, isConfigured: iConn } = useInstantly();
    const { data: hData, isConfigured: hConn } = useHeyReach();

    const campaigns = useMemo(() => buildCampaignsFromApi(iData, hData, iConn, hConn), [iData, hData, iConn, hConn]);
    const recs = useMemo(() => generateRecommendations(campaigns), [campaigns]);

    return (
        <section className="animate-fade-in rounded-xl border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border p-5">
                <div className="flex items-center gap-2">
                    <Lightbulb size={18} className="text-primary" />
                    <div>
                        <h2 className="text-base font-semibold text-text-primary">Recommendations</h2>
                        <p className="text-xs text-text-muted">{recs.length} action items based on campaign data</p>
                    </div>
                </div>
            </div>

            <div className="divide-y divide-border-subtle">
                {recs.slice(0, 6).map((rec) => {
                    const priority = PRIORITY_COLORS[rec.priority];
                    return (
                        <div key={rec.id} className="flex items-start gap-3 p-4 transition-colors hover:bg-surface-hover/50">
                            <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", priority.bg, priority.text)}>
                                {TYPE_ICONS[rec.type]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="mb-1 flex items-center gap-2">
                                    <p className="text-sm font-medium text-text-primary">{rec.title}</p>
                                    <span className={cn("inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase", priority.bg, priority.text)}>
                                        <span className={cn("h-1.5 w-1.5 rounded-full", priority.dot)} />
                                        {rec.priority}
                                    </span>
                                </div>
                                <p className="mb-1 text-xs text-text-muted">{rec.description}</p>
                                <div className="flex items-center gap-3 text-[11px]">
                                    <span className="text-text-muted">
                                        <strong className="text-text-secondary">Evidence:</strong> {rec.evidence}
                                    </span>
                                </div>
                                <p className="mt-1 text-[11px] text-primary">{rec.impact}</p>
                            </div>
                            <ChevronRight size={14} className="mt-2 shrink-0 text-text-muted" />
                        </div>
                    );
                })}
            </div>

            {recs.length === 0 && (
                <div className="flex h-32 items-center justify-center text-sm text-text-muted">
                    All campaigns are performing well! No action items.
                </div>
            )}
        </section>
    );
}
