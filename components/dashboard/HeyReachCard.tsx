"use client";

import { useMemo } from "react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { Linkedin, TrendingUp, TrendingDown, UserPlus, MessageSquare, CalendarCheck, Loader2 } from "lucide-react";
import { cn, formatNumber, formatPercent } from "@/lib/utils";
import { getHeyReachMetrics } from "@/lib/mock-data";
import { useDashboardStore } from "@/lib/store";
import { useHeyReach } from "@/hooks/use-heyreach";
import { CHART_COLORS } from "@/lib/constants";

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
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-heyreach/10 text-heyreach">
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

export default function HeyReachCard() {
    const { timeRange } = useDashboardStore();
    const { data: apiData, isLoading, isConfigured, hasKey } = useHeyReach();

    // Mock data as fallback
    const mockData = useMemo(() => getHeyReachMetrics(timeRange), [timeRange]);

    // Real data from API
    const isRealData = isConfigured && apiData?.totalStats;
    const metrics = isRealData
        ? {
              connectionRequestsSent: apiData.totalStats!.connectionRequestsSent,
              connectionsAccepted: apiData.totalStats!.connectionsAccepted,
              responses: apiData.totalStats!.messagesReceived,
              meetingsBooked: 0, // HeyReach API doesn't directly expose meetings — placeholder
          }
        : {
              connectionRequestsSent: mockData.connectionRequestsSent,
              connectionsAccepted: mockData.connectionsAccepted,
              responses: mockData.responses,
              meetingsBooked: mockData.meetingsBooked,
          };

    const chartData = isRealData
        ? []
        : mockData.sparkline.map((p, i) => ({ idx: i, value: p.value }));

    const showChart = chartData.length > 0;

    return (
        <article className="card-hover rounded-xl border border-border bg-surface p-5 animate-fade-in">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-heyreach/15 font-bold text-heyreach">
                        <Linkedin size={20} />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-text-primary">HeyReach</h2>
                        <p className="text-xs text-text-muted">LinkedIn Outbound</p>
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

            {/* Mini Chart */}
            {showChart && (
                <div className="mb-4 h-16 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="heyreachGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={CHART_COLORS.heyreach} stopOpacity={0.3} />
                                    <stop offset="100%" stopColor={CHART_COLORS.heyreach} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#1A1A23",
                                    border: "1px solid #2A2A3A",
                                    borderRadius: "8px",
                                    color: "#F1F1F4",
                                    fontSize: "12px",
                                }}
                                labelFormatter={() => ""}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={CHART_COLORS.heyreach}
                                strokeWidth={2}
                                fill="url(#heyreachGrad)"
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
                            label="Connection Requests Sent"
                            value={metrics.connectionRequestsSent}
                            change={isRealData ? undefined : mockData.connectionsSentChange}
                            icon={<UserPlus size={16} />}
                        />
                        <MetricItem
                            label="Connections Accepted"
                            value={metrics.connectionsAccepted}
                            change={isRealData ? undefined : mockData.acceptedChange}
                            icon={<Linkedin size={16} />}
                        />
                        <MetricItem
                            label="Responses"
                            value={metrics.responses}
                            change={isRealData ? undefined : mockData.responsesChange}
                            icon={<MessageSquare size={16} />}
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
    );
}
