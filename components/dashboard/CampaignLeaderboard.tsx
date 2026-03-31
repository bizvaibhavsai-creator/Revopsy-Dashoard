"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, ExternalLink, Loader2, ChevronDown, ChevronRight, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCampaigns } from "@/lib/mock-data";
import { useInstantly } from "@/hooks/use-instantly";
import { useHeyReach } from "@/hooks/use-heyreach";
import { computeCampaignHealth } from "@/lib/health-scoring";
import CampaignHealthBadge from "./CampaignHealthBadge";
import CampaignDiagnostics from "./CampaignDiagnostics";
import type { Campaign, Platform, CampaignHealth } from "@/types/dashboard";

const STATUS_STYLES: Record<string, string> = {
    active: "bg-success/10 text-success",
    paused: "bg-warning/10 text-warning",
    completed: "bg-text-muted/10 text-text-muted",
    draft: "bg-text-muted/10 text-text-muted",
};

const PLATFORM_STYLES: Record<Platform, { bg: string; text: string; label: string }> = {
    instantly: { bg: "bg-instantly/10", text: "text-instantly", label: "Instantly.ai" },
    heyreach: { bg: "bg-heyreach/10", text: "text-heyreach", label: "HeyReach" },
};

function mapInstantlyStatus(status: number): "active" | "paused" | "completed" {
    switch (status) {
        case 1: return "active";
        case 2: return "paused";
        case 3: return "completed";
        default: return "paused";
    }
}

function getCampaignUrl(campaign: Campaign): string | null {
    if (campaign.platform === "instantly") {
        return `https://app.instantly.ai/app/campaign/${campaign.id}/analytics`;
    }
    if (campaign.platform === "heyreach") {
        return `https://app.heyreach.io/campaigns/${campaign.id}`;
    }
    return null;
}

type SortKey = "leads" | "replyRate" | "positiveReplies" | "meetingsBooked" | "healthScore";

interface CampaignWithHealth extends Campaign {
    health: CampaignHealth;
}

export default function CampaignLeaderboard() {
    const { data: instantlyData, isConfigured: iConnected, isLoading: iLoading, hasKey: iHasKey } = useInstantly();
    const { data: heyreachData, isConfigured: hConnected, isLoading: hLoading, hasKey: hHasKey } = useHeyReach();

    const [sortKey, setSortKey] = useState<SortKey>("healthScore");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc"); // critical first
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused" | "completed" | "draft">("all");
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);

    const isAnyRealData = iConnected || hConnected;
    const isLoading = (iHasKey && iLoading) || (hHasKey && hLoading);

    const campaignsWithHealth: CampaignWithHealth[] = useMemo(() => {
        let rawCampaigns: Campaign[];
        if (!isAnyRealData) {
            rawCampaigns = getCampaigns();
        } else {
            rawCampaigns = [];
            if (iConnected && instantlyData?.campaigns) {
                for (const c of instantlyData.campaigns) {
                    const a = c.analytics;
                    const leadsContacted = a?.new_leads_contacted ?? 0;
                    const emailsSent = a?.total_emails_sent ?? 0;
                    const emailsRead = a?.emails_read ?? 0;
                    const replies = a?.total_replies ?? 0;
                    const interested = a?.leads_interested ?? 0;
                    const meetings = a?.total_meeting_booked ?? 0;
                    rawCampaigns.push({
                        id: c.id, name: c.name, platform: "instantly",
                        leads: leadsContacted,
                        replyRate: leadsContacted > 0 ? +((replies / leadsContacted) * 100).toFixed(1) : 0,
                        positiveReplies: interested,
                        meetingsBooked: meetings,
                        openRate: emailsSent > 0 ? +((emailsRead / emailsSent) * 100).toFixed(1) : undefined,
                        status: mapInstantlyStatus(c.status),
                        lastUpdated: c.timestamp
                            ? new Date(c.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                            : "—",
                    });
                }
            }
            if (hConnected && heyreachData?.campaigns) {
                for (const c of heyreachData.campaigns) {
                    const stats = c.stats;
                    const connSent = stats?.connectionRequestsSent ?? 0;
                    const msgSent = stats?.messagesSent ?? 0;
                    const msgReceived = stats?.messagesReceived ?? 0;
                    const totalOutbound = connSent + msgSent;
                    rawCampaigns.push({
                        id: String(c.id), name: c.name, platform: "heyreach",
                        leads: connSent,
                        replyRate: totalOutbound > 0 ? +((msgReceived / totalOutbound) * 100).toFixed(1) : 0,
                        positiveReplies: msgReceived, meetingsBooked: 0,
                        status: (c.status?.toLowerCase() as "active" | "paused" | "completed") || "active",
                        lastUpdated: c.createdAt
                            ? new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                            : "—",
                    });
                }
            }
        }
        return rawCampaigns.map((c) => ({ ...c, health: computeCampaignHealth(c) }));
    }, [isAnyRealData, iConnected, hConnected, instantlyData, heyreachData]);

    const sorted = useMemo(() => {
        const filtered = statusFilter === "all"
            ? campaignsWithHealth
            : campaignsWithHealth.filter((c) => c.status === statusFilter);
        return [...filtered].sort((a, b) => {
            let diff: number;
            if (sortKey === "healthScore") {
                diff = a.health.score - b.health.score;
            } else {
                diff = a[sortKey] - b[sortKey];
            }
            return sortDir === "desc" ? -diff : diff;
        });
    }, [campaignsWithHealth, sortKey, sortDir, statusFilter]);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir((d) => (d === "desc" ? "asc" : "desc"));
        } else {
            setSortKey(key);
            setSortDir(key === "healthScore" ? "asc" : "desc");
        }
    };

    const SortButton = ({ label, field }: { label: string; field: SortKey }) => (
        <button
            onClick={() => handleSort(field)}
            className="flex min-h-[2.75rem] items-center gap-1 text-xs font-medium uppercase tracking-wider text-text-muted transition-colors hover:text-text-primary"
            aria-label={`Sort by ${label}`}
        >
            {label}
            <ArrowUpDown
                size={12}
                className={cn(sortKey === field ? "text-primary" : "text-text-muted/50")}
            />
        </button>
    );

    // Summary counts
    const healthyCt = campaignsWithHealth.filter((c) => c.health.level === "healthy").length;
    const warningCt = campaignsWithHealth.filter((c) => c.health.level === "warning").length;
    const criticalCt = campaignsWithHealth.filter((c) => c.health.level === "critical").length;

    // Available status options with counts
    const statusOptions = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const c of campaignsWithHealth) {
            counts[c.status] = (counts[c.status] || 0) + 1;
        }
        return Object.entries(counts)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([status, count]) => ({ status, count }));
    }, [campaignsWithHealth]);

    return (
        <div className="card-glow animate-fade-in">
        <section id="campaigns" className="rounded-2xl bg-surface overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-subtle p-6">
                <div>
                    <h2 className="text-base font-semibold text-text-primary">Campaign Leaderboard</h2>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-text-muted">
                        <span>{sorted.length}{statusFilter !== "all" ? ` ${statusFilter}` : ""} campaign{sorted.length !== 1 ? "s" : ""}{statusFilter !== "all" ? ` of ${campaignsWithHealth.length}` : ""}</span>
                        <span className="text-success">● {healthyCt} healthy</span>
                        {warningCt > 0 && <span className="text-warning">● {warningCt} warning</span>}
                        {criticalCt > 0 && <span className="text-danger">● {criticalCt} critical</span>}
                    </div>
                </div>
                {isAnyRealData ? (
                    <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">● Live</span>
                ) : (
                    <span className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">Demo</span>
                )}
            </div>

            {isLoading && (
                <div className="flex h-40 items-center justify-center gap-2 text-sm text-text-muted">
                    <Loader2 size={16} className="animate-spin" />
                    Loading campaigns...
                </div>
            )}

            {!isLoading && (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]" role="grid">
                        <thead>
                            <tr className="border-b border-border-subtle">
                                <th className="w-8 px-2 py-3" />
                                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">Campaign</th>
                                <th className="px-3 py-3 text-left"><SortButton label="Health" field="healthScore" /></th>
                                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">Platform</th>
                                <th className="px-3 py-3 text-left"><SortButton label="Leads" field="leads" /></th>
                                <th className="px-3 py-3 text-left"><SortButton label="Reply %" field="replyRate" /></th>
                                <th className="px-3 py-3 text-left"><SortButton label="Positive" field="positiveReplies" /></th>
                                <th className="px-3 py-3 text-left"><SortButton label="Meetings" field="meetingsBooked" /></th>
                                <th className="px-3 py-3 text-left">
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                            className={cn(
                                                "flex min-h-[2.75rem] items-center gap-1.5 text-xs font-medium uppercase tracking-wider transition-colors hover:text-text-primary",
                                                statusFilter !== "all" ? "text-primary" : "text-text-muted"
                                            )}
                                            aria-label="Filter by status"
                                        >
                                            <Filter size={12} />
                                            {statusFilter === "all" ? "Status" : statusFilter}
                                            <ChevronDown size={10} />
                                        </button>
                                        {showStatusDropdown && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setShowStatusDropdown(false)} />
                                                <div className="absolute left-0 top-10 z-50 w-44 rounded-xl bg-surface py-1" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}>
                                                    <button
                                                        onClick={() => { setStatusFilter("all"); setShowStatusDropdown(false); }}
                                                        className={cn(
                                                            "flex w-full items-center justify-between px-3 py-2 text-xs transition-colors hover:bg-surface-hover",
                                                            statusFilter === "all" ? "text-primary font-semibold" : "text-text-secondary"
                                                        )}
                                                    >
                                                        All Statuses
                                                        <span className="text-text-muted">{campaignsWithHealth.length}</span>
                                                    </button>
                                                    {statusOptions.map(({ status, count }) => (
                                                        <button
                                                            key={status}
                                                            onClick={() => { setStatusFilter(status as typeof statusFilter); setShowStatusDropdown(false); }}
                                                            className={cn(
                                                                "flex w-full items-center justify-between px-3 py-2 text-xs capitalize transition-colors hover:bg-surface-hover",
                                                                statusFilter === status ? "text-primary font-semibold" : "text-text-secondary"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <span className={cn("inline-block h-2 w-2 rounded-full", STATUS_STYLES[status]?.split(" ")[0] || "bg-text-muted/30")} />
                                                                {status}
                                                            </div>
                                                            <span className="text-text-muted">{count}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </th>
                                <th className="px-3 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-muted"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle">
                            {sorted.map((campaign) => {
                                const platform = PLATFORM_STYLES[campaign.platform];
                                const status = STATUS_STYLES[campaign.status] || STATUS_STYLES.active;
                                const campaignUrl = getCampaignUrl(campaign);
                                const isExpanded = expandedId === `${campaign.platform}-${campaign.id}`;
                                const uniqueId = `${campaign.platform}-${campaign.id}`;

                                return (
                                    <tr key={uniqueId} className="group">
                                        <td colSpan={10} className="p-0">
                                            {/* Main Row */}
                                            <div
                                                className={cn(
                                                    "flex cursor-pointer items-center transition-colors hover:bg-surface-hover/50",
                                                    isExpanded && "bg-surface-hover/30"
                                                )}
                                                onClick={() => setExpandedId(isExpanded ? null : uniqueId)}
                                            >
                                                <div className="w-8 py-4 pl-3">
                                                    {isExpanded ? (
                                                        <ChevronDown size={14} className="text-text-muted" />
                                                    ) : (
                                                        <ChevronRight size={14} className="text-text-muted" />
                                                    )}
                                                </div>
                                                <div className="flex-1 px-5 py-4">
                                                    <p className="text-sm font-medium text-text-primary">{campaign.name}</p>
                                                </div>
                                                <div className="w-24 px-3 py-4">
                                                    <CampaignHealthBadge score={campaign.health.score} level={campaign.health.level} compact />
                                                </div>
                                                <div className="w-28 px-3 py-4">
                                                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", platform.bg, platform.text)}>
                                                        {platform.label}
                                                    </span>
                                                </div>
                                                <div className="w-20 px-3 py-4 text-sm text-text-secondary">{campaign.leads.toLocaleString()}</div>
                                                <div className="w-20 px-3 py-4 text-sm text-text-secondary">{campaign.replyRate}%</div>
                                                <div className="w-20 px-3 py-4 text-sm text-text-secondary">{campaign.positiveReplies}</div>
                                                <div className="w-20 px-3 py-4 text-sm font-semibold text-text-primary">{campaign.meetingsBooked}</div>
                                                <div className="w-24 px-3 py-4">
                                                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium capitalize", status)}>
                                                        {campaign.status}
                                                    </span>
                                                </div>
                                                <div className="w-12 px-3 py-4 text-right">
                                                    {campaignUrl ? (
                                                        <a
                                                            href={campaignUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            aria-label={`Open in ${platform.label}`}
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-active hover:text-text-primary"
                                                        >
                                                            <ExternalLink size={14} />
                                                        </a>
                                                    ) : (
                                                        <span className="inline-flex h-8 w-8 items-center justify-center text-text-muted/30">
                                                            <ExternalLink size={14} />
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Expandable Diagnostics */}
                                            {isExpanded && (
                                                <div className="border-t border-border-subtle bg-background/30 px-5 py-4">
                                                    <CampaignDiagnostics
                                                        diagnostics={campaign.health.diagnostics}
                                                        campaignName={campaign.name}
                                                    />
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {!isLoading && sorted.length === 0 && (
                <div className="flex h-40 items-center justify-center text-sm text-text-muted">No campaigns found</div>
            )}
        </section>
        </div>
    );
}
