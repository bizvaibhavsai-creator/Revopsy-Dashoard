"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import {
    Mail,
    Linkedin,
    DollarSign,
    CalendarCheck,
    Target,
    TrendingUp,
    Settings,
    ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { getInstantlyMetrics, getHeyReachMetrics } from "@/lib/mock-data";
import { useDashboardStore, useSettingsStore } from "@/lib/store";
import { useInstantly } from "@/hooks/use-instantly";
import { useHeyReach } from "@/hooks/use-heyreach";
import { CHART_COLORS, AVG_DEAL_VALUE, MEETING_TO_OPP_RATE } from "@/lib/constants";
import { getTooltipStyle } from "@/lib/chart-styles";
import type { Platform } from "@/types/dashboard";

interface ROICardConfig {
    platform: Platform;
    name: string;
    icon: React.ReactNode;
    color: string;
    accentBg: string;
}

const CONFIGS: ROICardConfig[] = [
    {
        platform: "instantly",
        name: "Instantly.ai",
        icon: <Mail size={20} />,
        color: CHART_COLORS.instantly,
        accentBg: "bg-instantly/10",
    },
    {
        platform: "heyreach",
        name: "HeyReach",
        icon: <Linkedin size={20} />,
        color: CHART_COLORS.heyreach,
        accentBg: "bg-heyreach/10",
    },
];

function ROICardSingle({ config }: { config: ROICardConfig }) {
    const { timeRange } = useDashboardStore();
    const { channelSpend } = useSettingsStore();
    const { data: instantlyData, isConfigured: iConnected } = useInstantly();
    const { data: heyreachData, isConfigured: hConnected } = useHeyReach();

    const stats = useMemo(() => {
        let meetings: number;

        if (config.platform === "instantly" && iConnected && instantlyData?.overview) {
            meetings = instantlyData.overview.total_meeting_booked;
        } else if (config.platform === "heyreach" && hConnected) {
            meetings = 0; // HeyReach doesn't track meetings directly
        } else {
            const metrics =
                config.platform === "instantly"
                    ? getInstantlyMetrics(timeRange)
                    : getHeyReachMetrics(timeRange);
            meetings = metrics.meetingsBooked;
        }

        const spend = channelSpend[config.platform];
        const costPerMeeting = meetings > 0 ? spend / meetings : 0;
        const opportunities = Math.round(meetings * MEETING_TO_OPP_RATE);
        const pipelineValue = opportunities * AVG_DEAL_VALUE;
        const roi = spend > 0 ? ((pipelineValue - spend) / spend) * 100 : 0;

        return { meetings, spend, costPerMeeting, opportunities, pipelineValue, roi };
    }, [timeRange, channelSpend, config.platform, iConnected, hConnected, instantlyData, heyreachData]);

    const barData = [
        { name: "Spend", value: stats.spend, color: "#8B8B9E" },
        { name: "Pipeline", value: stats.pipelineValue, color: config.color },
    ];

    return (
        <div className={cn("animate-fade-in", config.platform === "instantly" ? "card-glow-warm" : "card-glow-cool")}>
        <article className="rounded-2xl bg-surface p-6">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.accentBg}`}
                        style={{ color: config.color }}
                    >
                        {config.icon}
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-text-primary">{config.name}</h3>
                        <p className="text-xs text-text-muted">Monthly ROI</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-success/10 px-3 py-1">
                    <TrendingUp size={12} className="text-success" />
                    <span className="text-xs font-bold text-success">{stats.roi.toFixed(0)}% ROI</span>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="mb-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-background/50 p-4">
                    <div className="mb-1 flex items-center gap-1.5 text-text-muted">
                        <DollarSign size={12} />
                        <span className="text-xs">Monthly Spend</span>
                    </div>
                    <p className="text-lg font-bold text-text-primary">{formatCurrency(stats.spend)}</p>
                </div>
                <div className="rounded-xl bg-background/50 p-4">
                    <div className="mb-1 flex items-center gap-1.5 text-text-muted">
                        <CalendarCheck size={12} />
                        <span className="text-xs">Meetings</span>
                    </div>
                    <p className="text-lg font-bold text-text-primary">{formatNumber(stats.meetings)}</p>
                </div>
                <div className="rounded-xl bg-background/50 p-4">
                    <div className="mb-1 flex items-center gap-1.5 text-text-muted">
                        <DollarSign size={12} />
                        <span className="text-xs">Cost / Meeting</span>
                    </div>
                    <p className="text-lg font-bold text-text-primary">{formatCurrency(stats.costPerMeeting)}</p>
                </div>
                <div className="rounded-xl bg-background/50 p-4">
                    <div className="mb-1 flex items-center gap-1.5 text-text-muted">
                        <Target size={12} />
                        <span className="text-xs">Opportunities</span>
                    </div>
                    <p className="text-lg font-bold text-text-primary">{formatNumber(stats.opportunities)}</p>
                </div>
            </div>

            {/* Bar Chart: Spend vs Pipeline */}
            <div className="mb-3">
                <p className="mb-2 text-xs text-text-muted">Spend vs Pipeline</p>
                <div className="h-24">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} layout="vertical" margin={{ left: 0, right: 0 }}>
                            <XAxis type="number" hide />
                            <YAxis
                                type="category"
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "var(--txt-mut)", fontSize: 11 }}
                                width={55}
                            />
                            <Tooltip
                                contentStyle={getTooltipStyle()}
                                formatter={(value: number | undefined) => formatCurrency(value ?? 0)}
                            />
                            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={16}>
                                {barData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Pipeline Value */}
            <div className="flex items-center justify-between rounded-xl bg-background/50 p-4">
                <span className="text-xs text-text-muted">Pipeline Value</span>
                <span className="text-base font-bold" style={{ color: config.color }}>
                    {formatCurrency(stats.pipelineValue)}
                </span>
            </div>
        </article>
        </div>
    );
}

export default function ROICards() {
    return (
        <section id="integrations" className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-text-primary">Monthly ROI by Channel</h2>
                    <p className="text-xs text-text-muted">Revenue impact analysis per channel</p>
                </div>
                <Link
                    href="/settings"
                    className="flex min-h-[2.75rem] items-center gap-2 rounded-full bg-surface px-4 py-2 text-xs font-medium text-text-muted shadow-sm transition-colors hover:bg-surface-hover hover:text-text-primary"
                >
                    <Settings size={14} />
                    Edit Spend
                    <ArrowRight size={12} />
                </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {CONFIGS.map((config) => (
                    <ROICardSingle key={config.platform} config={config} />
                ))}
            </div>
        </section>
    );
}
