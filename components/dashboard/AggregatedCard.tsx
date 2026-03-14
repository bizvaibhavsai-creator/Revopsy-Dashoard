"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Users, MessageSquare, CalendarCheck, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { cn, formatNumber, formatPercent } from "@/lib/utils";
import { getAggregatedMetrics } from "@/lib/mock-data";
import { useDashboardStore } from "@/lib/store";
import { useInstantly } from "@/hooks/use-instantly";
import { useHeyReach } from "@/hooks/use-heyreach";
import { CHART_COLORS } from "@/lib/constants";
import { getTooltipStyle, getTooltipItemStyle } from "@/lib/chart-styles";

interface TotalMetricProps {
    label: string;
    value: number;
    change?: number;
    icon: React.ReactNode;
}

function TotalMetric({ label, value, change, icon }: TotalMetricProps) {
    const isPositive = (change ?? 0) >= 0;
    return (
        <div className="flex items-center gap-3 rounded-lg bg-background/50 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-xs text-text-muted">{label}</p>
                <div className="flex items-center gap-2">
                    <p className="text-xl font-bold text-text-primary">{formatNumber(value)}</p>
                    {change !== undefined && (
                        <span
                            className={cn(
                                "flex items-center gap-0.5 text-xs font-semibold",
                                isPositive ? "text-success" : "text-danger"
                            )}
                        >
                            {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                            {formatPercent(change)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AggregatedCard() {
    const { timeRange } = useDashboardStore();
    const { data: instantlyData, isConfigured: instantlyConnected } = useInstantly();
    const { data: heyreachData, isConfigured: heyreachConnected } = useHeyReach();

    const mockData = useMemo(() => getAggregatedMetrics(timeRange), [timeRange]);

    // Use real data when both are connected, mixed when one is connected, or mock
    const isAnyRealData = instantlyConnected || heyreachConnected;

    const totalLeadsContacted = isAnyRealData
        ? (instantlyConnected ? (instantlyData?.overview?.total_emails_sent ?? 0) : 0) +
          (heyreachConnected ? (heyreachData?.totalStats?.connectionRequestsSent ?? 0) : 0)
        : mockData.totalLeadsContacted;

    const totalResponses = isAnyRealData
        ? (instantlyConnected ? (instantlyData?.overview?.total_replies ?? 0) : 0) +
          (heyreachConnected ? (heyreachData?.totalStats?.messagesReceived ?? 0) : 0)
        : mockData.totalResponses;

    const totalMeetingsBooked = isAnyRealData
        ? (instantlyConnected ? (instantlyData?.overview?.total_opportunities ?? 0) : 0)
        : mockData.totalMeetingsBooked;

    const instantlyMeetings = instantlyConnected
        ? (instantlyData?.overview?.total_opportunities ?? 0)
        : mockData.meetingsByPlatform.instantly;

    const heyreachMeetings = heyreachConnected
        ? 0 // HeyReach API doesn't directly track meetings
        : mockData.meetingsByPlatform.heyreach;

    const pieData = [
        { name: "Instantly.ai", value: instantlyMeetings },
        { name: "HeyReach", value: heyreachMeetings },
    ];

    const COLORS = [CHART_COLORS.instantly, CHART_COLORS.heyreach];

    const isLoading = false; // Both hooks handle their own loading

    return (
        <article className="card-hover flex flex-col rounded-xl border border-border bg-surface p-5 animate-fade-in">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-text-primary">All Channels</h2>
                    <p className="text-xs text-text-muted">Aggregated Performance</p>
                </div>
                {isAnyRealData ? (
                    <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                        ● Live
                    </span>
                ) : (
                    <span className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">
                        Demo
                    </span>
                )}
            </div>

            {/* KPIs */}
            <div className="mb-5 space-y-3">
                <TotalMetric
                    label="Total Leads Contacted"
                    value={totalLeadsContacted}
                    change={isAnyRealData ? undefined : mockData.leadsChange}
                    icon={<Users size={18} />}
                />
                <TotalMetric
                    label="Total Responses"
                    value={totalResponses}
                    change={isAnyRealData ? undefined : mockData.responsesChange}
                    icon={<MessageSquare size={18} />}
                />
                <TotalMetric
                    label="Total Meetings Booked"
                    value={totalMeetingsBooked}
                    change={isAnyRealData ? undefined : mockData.meetingsChange}
                    icon={<CalendarCheck size={18} />}
                />
            </div>

            {/* Pie Chart — Meetings by Platform */}
            <div className="flex-1">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
                    Meetings by Platform
                </p>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={70}
                                paddingAngle={4}
                                dataKey="value"
                                strokeWidth={0}
                            >
                                {pieData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={getTooltipStyle()}
                                itemStyle={getTooltipItemStyle()}
                                labelStyle={getTooltipItemStyle()}
                            />
                            <Legend
                                verticalAlign="bottom"
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{ fontSize: "12px", color: "var(--txt-mut)" }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </article>
    );
}
