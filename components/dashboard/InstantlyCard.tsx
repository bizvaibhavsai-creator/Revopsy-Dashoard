"use client";

import { useMemo } from "react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { Mail, TrendingUp, TrendingDown, ThumbsUp, CalendarCheck, Loader2 } from "lucide-react";
import { cn, formatNumber, formatPercent } from "@/lib/utils";
import { getInstantlyMetrics } from "@/lib/mock-data";
import { useDashboardStore } from "@/lib/store";
import { useInstantly } from "@/hooks/use-instantly";
import { CHART_COLORS } from "@/lib/constants";
import { getTooltipStyle } from "@/lib/chart-styles";

interface MetricItemProps {
    label: string;
    value: number;
    change?: number;
    icon: React.ReactNode;
}

function MetricItem({ label, value, change, icon }: MetricItemProps) {
    const isPositive = (change ?? 0) >= 0;
    return (
        <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-instantly/10 text-instantly">
                    {icon}
                </div>
                <div>
                    <p className="text-xs text-text-muted">{label}</p>
                    <p className="text-lg font-bold text-text-primary">{formatNumber(value)}</p>
                </div>
            </div>
            {change !== undefined && (
                <div
                    className={cn(
                        "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold",
                        isPositive ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                    )}
                >
                    {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {formatPercent(change)}
                </div>
            )}
        </div>
    );
}

function SkeletonMetric() {
    return (
        <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
                <div className="h-9 w-9 animate-pulse rounded-lg bg-surface-hover" />
                <div className="space-y-2">
                    <div className="h-3 w-24 animate-pulse rounded bg-surface-hover" />
                    <div className="h-5 w-16 animate-pulse rounded bg-surface-hover" />
                </div>
            </div>
            <div className="h-6 w-16 animate-pulse rounded-full bg-surface-hover" />
        </div>
    );
}

export default function InstantlyCard() {
    const { timeRange } = useDashboardStore();
    const { data: apiData, isLoading, isConfigured, hasKey } = useInstantly();

    // Mock data as fallback
    const mockData = useMemo(() => getInstantlyMetrics(timeRange), [timeRange]);

    // Determine which data to show
    const isRealData = isConfigured && apiData?.overview;
    const metrics = isRealData
        ? {
              totalEmailsSent: apiData.overview!.total_emails_sent,
              totalResponses: apiData.overview!.total_replies,
              positiveResponses: apiData.overview!.leads_interested,
              meetingsBooked: apiData.overview!.total_meeting_booked,
          }
        : {
              totalEmailsSent: mockData.totalEmailsSent,
              totalResponses: mockData.totalResponses,
              positiveResponses: mockData.positiveResponses,
              meetingsBooked: mockData.meetingsBooked,
          };

    const chartData = isRealData
        ? [] // No sparkline from API — we'll hide the chart or show empty
        : mockData.sparkline.map((p, i) => ({ idx: i, value: p.value }));

    const showChart = chartData.length > 0;

    return (
        <div className="card-glow-warm animate-fade-in">
        <article className="rounded-2xl bg-surface p-6">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-instantly/15 font-bold text-instantly">
                        <Mail size={20} />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-text-primary">Instantly.ai</h2>
                        <p className="text-xs text-text-muted">Email Outbound</p>
                    </div>
                </div>
                {isLoading && hasKey ? (
                    <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                        <Loader2 size={12} className="animate-spin" />
                        Loading
                    </span>
                ) : isConfigured ? (
                    <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                        ● Connected
                    </span>
                ) : (
                    <span className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">
                        Demo Mode
                    </span>
                )}
            </div>

            {/* Mini Chart — only shown in demo mode or when we have sparkline data */}
            {showChart && (
                <div className="mb-4 h-16 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="instantlyGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={CHART_COLORS.instantly} stopOpacity={0.3} />
                                    <stop offset="100%" stopColor={CHART_COLORS.instantly} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Tooltip
                                contentStyle={getTooltipStyle()}
                                labelFormatter={() => ""}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={CHART_COLORS.instantly}
                                strokeWidth={2}
                                fill="url(#instantlyGrad)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Metrics */}
            <div className="divide-y divide-border-subtle">
                {isLoading && hasKey ? (
                    <>
                        <SkeletonMetric />
                        <SkeletonMetric />
                        <SkeletonMetric />
                        <SkeletonMetric />
                    </>
                ) : (
                    <>
                        <MetricItem
                            label="Total Emails Sent"
                            value={metrics.totalEmailsSent}
                            change={isRealData ? undefined : mockData.emailsSentChange}
                            icon={<Mail size={16} />}
                        />
                        <MetricItem
                            label="Total Responses"
                            value={metrics.totalResponses}
                            change={isRealData ? undefined : mockData.responsesChange}
                            icon={<TrendingUp size={16} />}
                        />
                        <MetricItem
                            label="Positive Responses"
                            value={metrics.positiveResponses}
                            change={isRealData ? undefined : mockData.positiveChange}
                            icon={<ThumbsUp size={16} />}
                        />
                        <MetricItem
                            label="Meetings Booked"
                            value={metrics.meetingsBooked}
                            change={isRealData ? undefined : mockData.meetingsChange}
                            icon={<CalendarCheck size={16} />}
                        />
                    </>
                )}
            </div>
        </article>
        </div>
    );
}
