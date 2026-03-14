"use client";

import { useMemo, useState } from "react";
import {
    Radio,
    AlertTriangle,
    ShieldAlert,
    Zap,
    CheckCircle2,
    BarChart3,
    Target,
    Settings,
    Wifi,
    WifiOff,
    RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCampaigns } from "@/lib/mock-data";
import { generateAlerts, alertsToFeedItems, formatRelativeTime } from "@/lib/anomaly-detection";
import { generateRecommendations } from "@/lib/recommendations";
import { useInstantly } from "@/hooks/use-instantly";
import { useHeyReach } from "@/hooks/use-heyreach";
import type { Alert, Campaign, FeedItem } from "@/types/dashboard";
import Link from "next/link";

function SystemStatusCard({
    name,
    connected,
    icon,
}: {
    name: string;
    connected: boolean;
    icon: React.ReactNode;
}) {
    return (
        <div className={cn(
            "flex items-center gap-3 rounded-lg border p-3",
            connected ? "border-success/30 bg-success/5" : "border-border-subtle bg-surface"
        )}>
            <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", connected ? "bg-success/15 text-success" : "bg-text-muted/10 text-text-muted")}>
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">{name}</p>
                <p className={cn("text-xs", connected ? "text-success" : "text-text-muted")}>
                    {connected ? "Connected" : "Not configured"}
                </p>
            </div>
            {connected ? <Wifi size={14} className="text-success" /> : <WifiOff size={14} className="text-text-muted/50" />}
        </div>
    );
}

function FeedItemCard({ item }: { item: FeedItem }) {
    const severityClasses = {
        healthy: "border-success/20 bg-success/5",
        warning: "border-warning/20 bg-warning/5",
        critical: "border-danger/20 bg-danger/5",
    };

    return (
        <div className={cn(
            "flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-surface-hover/50",
            item.severity ? severityClasses[item.severity] : "border-border-subtle"
        )}>
            <span className="mt-0.5 text-base">{item.icon}</span>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{item.title}</p>
                <p className="mt-0.5 text-xs text-text-muted">{item.description}</p>
            </div>
            <span className="shrink-0 text-[11px] text-text-muted">{formatRelativeTime(item.timestamp)}</span>
        </div>
    );
}

export default function CommandCenterPage() {
    const { data: iData, isConfigured: iConn } = useInstantly();
    const { data: hData, isConfigured: hConn } = useHeyReach();
    const [filter, setFilter] = useState<"all" | "critical" | "warning" | "system">("all");

    const campaigns = useMemo((): Campaign[] => {
        if (!iConn && !hConn) return getCampaigns();
        const merged: Campaign[] = [];
        if (iConn && iData?.campaigns) {
            for (const c of iData.campaigns) {
                merged.push({
                    id: c.id, name: c.name, platform: "instantly",
                    leads: 0, replyRate: 0, positiveReplies: 0, meetingsBooked: 0,
                    status: c.status === 1 ? "active" : c.status === 2 ? "paused" : "completed",
                    lastUpdated: "—",
                });
            }
        }
        if (hConn && hData?.campaigns) {
            for (const c of hData.campaigns) {
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
    }, [iConn, hConn, iData, hData]);

    const alerts = useMemo(() => generateAlerts(campaigns, { instantly: iConn, heyreach: hConn }), [campaigns, iConn, hConn]);
    const feedItems = useMemo(() => alertsToFeedItems(alerts), [alerts]);

    const filteredItems = useMemo(() => {
        if (filter === "all") return feedItems;
        if (filter === "critical") return feedItems.filter((i) => i.severity === "critical");
        if (filter === "warning") return feedItems.filter((i) => i.severity === "warning");
        if (filter === "system") return feedItems.filter((i) => i.type === "system");
        return feedItems;
    }, [feedItems, filter]);

    const criticalCount = alerts.filter((a) => a.severity === "critical" && !a.read).length;
    const warningCount = alerts.filter((a) => a.severity === "warning" && !a.read).length;

    return (
        <main className="min-h-screen bg-background">
            <div className="mx-auto max-w-5xl px-6 py-10">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                            <Radio size={20} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-text-primary">Command Center</h1>
                            <p className="text-sm text-text-muted">Real-time operational intelligence</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <RefreshCw size={14} className="text-text-muted" />
                        <span className="text-xs text-text-muted">Auto-refreshes every 60s</span>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <div className="rounded-xl border border-border bg-surface p-4 text-center">
                        <p className="text-xs text-text-muted">Total Alerts</p>
                        <p className="text-2xl font-bold text-text-primary">{alerts.length}</p>
                    </div>
                    <div className="rounded-xl border border-danger/30 bg-danger/5 p-4 text-center">
                        <p className="text-xs text-danger">Critical</p>
                        <p className="text-2xl font-bold text-danger">{criticalCount}</p>
                    </div>
                    <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 text-center">
                        <p className="text-xs text-warning">Warnings</p>
                        <p className="text-2xl font-bold text-warning">{warningCount}</p>
                    </div>
                    <div className="rounded-xl border border-success/30 bg-success/5 p-4 text-center">
                        <p className="text-xs text-success">Systems OK</p>
                        <p className="text-2xl font-bold text-success">{(iConn ? 1 : 0) + (hConn ? 1 : 0)}/2</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Live Feed */}
                    <div className="lg:col-span-2">
                        <div className="rounded-xl border border-border bg-surface">
                            <div className="flex items-center justify-between border-b border-border p-4">
                                <h2 className="text-sm font-semibold text-text-primary">Live Feed</h2>
                                <div className="flex gap-1">
                                    {(["all", "critical", "warning", "system"] as const).map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => setFilter(f)}
                                            className={cn(
                                                "rounded-md px-2.5 py-1 text-[11px] font-medium capitalize transition-colors",
                                                filter === f
                                                    ? "bg-primary/15 text-primary"
                                                    : "text-text-muted hover:text-text-primary"
                                            )}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="max-h-[600px] space-y-2 overflow-y-auto p-4">
                                {filteredItems.length > 0 ? (
                                    filteredItems.map((item) => <FeedItemCard key={item.id} item={item} />)
                                ) : (
                                    <div className="flex h-40 items-center justify-center text-sm text-text-muted">
                                        No alerts in this category
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* System Status */}
                        <div className="rounded-xl border border-border bg-surface p-4">
                            <h3 className="mb-3 text-sm font-semibold text-text-primary">System Status</h3>
                            <div className="space-y-2">
                                <SystemStatusCard
                                    name="Instantly.ai"
                                    connected={iConn}
                                    icon={<Zap size={14} />}
                                />
                                <SystemStatusCard
                                    name="HeyReach"
                                    connected={hConn}
                                    icon={<BarChart3 size={14} />}
                                />
                            </div>
                            {(!iConn || !hConn) && (
                                <Link
                                    href="/settings"
                                    className="mt-3 flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                                >
                                    <Settings size={12} />
                                    Configure in Settings
                                </Link>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="rounded-xl border border-border bg-surface p-4">
                            <h3 className="mb-3 text-sm font-semibold text-text-primary">Quick Actions</h3>
                            <div className="space-y-2">
                                <Link
                                    href="/"
                                    className="flex items-center gap-2 rounded-lg bg-background/50 px-3 py-2.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-hover"
                                >
                                    <Target size={14} className="text-primary" />
                                    View Dashboard
                                </Link>
                                <Link
                                    href="/settings"
                                    className="flex items-center gap-2 rounded-lg bg-background/50 px-3 py-2.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-hover"
                                >
                                    <Settings size={14} className="text-text-muted" />
                                    Manage Settings
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
