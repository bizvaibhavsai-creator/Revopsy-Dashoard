"use client";

import { useMemo } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";
import { getChartData } from "@/lib/mock-data";
import { useDashboardStore } from "@/lib/store";
import { useInstantly } from "@/hooks/use-instantly";
import { useHeyReach } from "@/hooks/use-heyreach";
import { CHART_COLORS } from "@/lib/constants";

export default function ChannelAnalyticsChart() {
    const { timeRange } = useDashboardStore();
    const { isConfigured: iConnected } = useInstantly();
    const { isConfigured: hConnected } = useHeyReach();

    // For now, we use mock chart data since the APIs don't return daily time-series in the current endpoints
    // When real daily analytics endpoints are wired up, this will use real data
    const data = useMemo(() => getChartData(timeRange), [timeRange]);

    const isAnyRealData = iConnected || hConnected;

    return (
        <section
            id="analytics"
            className="animate-fade-in rounded-xl border border-border bg-surface p-5"
        >
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-text-primary">Channel Analytics</h2>
                    <p className="text-xs text-text-muted">
                        {timeRange === "today"
                            ? "Hourly activity"
                            : timeRange === "90d"
                                ? "Weekly activity"
                                : "Daily activity"}{" "}
                        across all channels
                        {isAnyRealData && " (trend visualization)"}
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <span
                            className="inline-block h-3 w-3 rounded-full"
                            style={{ backgroundColor: CHART_COLORS.instantly }}
                        />
                        <span className="text-xs text-text-muted">Instantly.ai</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span
                            className="inline-block h-3 w-3 rounded-full"
                            style={{ backgroundColor: CHART_COLORS.heyreach }}
                        />
                        <span className="text-xs text-text-muted">HeyReach</span>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="instantlyAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={CHART_COLORS.instantly} stopOpacity={0.2} />
                                <stop offset="100%" stopColor={CHART_COLORS.instantly} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="heyreachAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={CHART_COLORS.heyreach} stopOpacity={0.2} />
                                <stop offset="100%" stopColor={CHART_COLORS.heyreach} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" vertical={false} />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#8B8B9E", fontSize: 11 }}
                            dy={8}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#8B8B9E", fontSize: 11 }}
                            dx={-5}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#1A1A23",
                                border: "1px solid #2A2A3A",
                                borderRadius: "8px",
                                color: "#F1F1F4",
                                fontSize: "12px",
                            }}
                        />
                        <Legend
                            verticalAlign="top"
                            align="right"
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: "12px", paddingBottom: "12px", display: "none" }}
                        />
                        <Area
                            type="monotone"
                            dataKey="instantly"
                            name="Instantly.ai"
                            stroke={CHART_COLORS.instantly}
                            strokeWidth={2.5}
                            fill="url(#instantlyAreaGrad)"
                            dot={false}
                            activeDot={{ r: 5, strokeWidth: 0 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="heyreach"
                            name="HeyReach"
                            stroke={CHART_COLORS.heyreach}
                            strokeWidth={2.5}
                            fill="url(#heyreachAreaGrad)"
                            dot={false}
                            activeDot={{ r: 5, strokeWidth: 0 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}
