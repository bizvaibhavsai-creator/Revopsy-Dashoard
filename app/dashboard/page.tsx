"use client";

import { useDashboardStore } from "@/lib/store";
import InstantlyCard from "@/components/dashboard/InstantlyCard";
import HeyReachCard from "@/components/dashboard/HeyReachCard";
import AggregatedCard from "@/components/dashboard/AggregatedCard";
import ChannelAnalyticsChart from "@/components/dashboard/ChannelAnalyticsChart";
import CampaignLeaderboard from "@/components/dashboard/CampaignLeaderboard";
import ROICards from "@/components/dashboard/ROICards";
import ForecastPacing from "@/components/dashboard/ForecastPacing";
import RecommendationsPanel from "@/components/dashboard/RecommendationsPanel";
import TimeRangeToggle from "@/components/shared/TimeRangeToggle";
import ViewModeToggle from "@/components/shared/ViewModeToggle";

export default function DashboardPage() {
    const { viewMode } = useDashboardStore();

    return (
        <div className="space-y-8">
            {/* Header — Title + Toggle Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-text-primary">
                        {viewMode === "exec" ? "Executive Overview" : "Operator Dashboard"}
                    </h1>
                    <p className="text-xs text-text-muted">
                        {viewMode === "exec"
                            ? "Pipeline, spend efficiency, and risk flags"
                            : "Campaign health, diagnostics, and daily operations"}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ViewModeToggle />
                    <TimeRangeToggle />
                </div>
            </div>

            {viewMode === "exec" ? (
                /* ─── EXEC VIEW ─── */
                <>
                    {/* Top KPIs: Aggregated + Pacing */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <AggregatedCard />
                        <ForecastPacing />
                    </div>

                    {/* Channel ROI */}
                    <ROICards />

                    {/* Recommendations */}
                    <RecommendationsPanel />

                    {/* Channel Analytics Chart */}
                    <ChannelAnalyticsChart />
                </>
            ) : (
                /* ─── OPERATOR VIEW ─── */
                <>
                    {/* Platform Cards */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <InstantlyCard />
                        <HeyReachCard />
                        <AggregatedCard />
                    </div>

                    {/* Pacing + Recommendations side by side */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <ForecastPacing />
                        <RecommendationsPanel />
                    </div>

                    {/* Channel Analytics Chart */}
                    <ChannelAnalyticsChart />

                    {/* Campaign Leaderboard with Health Scoring */}
                    <CampaignLeaderboard />

                    {/* ROI Cards */}
                    <ROICards />
                </>
            )}
        </div>
    );
}
