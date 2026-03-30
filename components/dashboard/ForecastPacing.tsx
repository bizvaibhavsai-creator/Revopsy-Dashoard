"use client";

import { useMemo } from "react";
import { Target, TrendingUp, TrendingDown, CalendarCheck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { calculatePacing, getPacingClasses } from "@/lib/forecasting";
import { getInstantlyMetrics, getHeyReachMetrics } from "@/lib/mock-data";
import { useDashboardStore, useSettingsStore } from "@/lib/store";
import { useInstantly } from "@/hooks/use-instantly";
import { useHeyReach } from "@/hooks/use-heyreach";

export default function ForecastPacing() {
    const { timeRange } = useDashboardStore();
    const { weeklyMeetingTarget } = useSettingsStore();
    const { data: iData, isConfigured: iConn } = useInstantly();
    const { data: hData, isConfigured: hConn } = useHeyReach();

    const pacing = useMemo(() => {
        let meetings: number;
        if (iConn || hConn) {
            meetings =
                (iConn ? (iData?.overview?.total_meeting_booked ?? 0) : 0) +
                (hConn ? 0 : 0); // HeyReach doesn't track meetings directly
        } else {
            const iMetrics = getInstantlyMetrics(timeRange);
            const hMetrics = getHeyReachMetrics(timeRange);
            meetings = iMetrics.meetingsBooked + hMetrics.meetingsBooked;
        }
        return calculatePacing(meetings, weeklyMeetingTarget);
    }, [iData, hData, iConn, hConn, weeklyMeetingTarget, timeRange]);

    const statusClasses = getPacingClasses(pacing.pacingStatus);
    const pacingBarWidth = Math.min(100, pacing.pacingPercent);

    return (
        <div className="card-glow animate-fade-in">
        <article className="rounded-2xl bg-surface p-6">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Target size={18} className="text-primary" />
                    <div>
                        <h2 className="text-base font-semibold text-text-primary">Weekly Pacing</h2>
                        <p className="text-xs text-text-muted">
                            Target: {pacing.weeklyTarget} meetings / week
                        </p>
                    </div>
                </div>
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", statusClasses.bg, statusClasses.text)}>
                    {statusClasses.label}
                </span>
            </div>

            {/* Pacing Bar */}
            <div className="mb-4">
                <div className="mb-1 flex items-center justify-between text-xs text-text-muted">
                    <span>{pacing.currentWeekMeetings} of {pacing.weeklyTarget} meetings</span>
                    <span>{pacing.pacingPercent}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-background/80">
                    <div
                        className={cn(
                            "h-full rounded-full transition-all duration-700",
                            pacing.pacingStatus === "ahead" || pacing.pacingStatus === "on_track"
                                ? "bg-success"
                                : pacing.pacingStatus === "behind"
                                ? "bg-warning"
                                : "bg-danger"
                        )}
                        style={{ width: `${pacingBarWidth}%` }}
                    />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-background/50 p-4">
                    <div className="mb-1 flex items-center gap-1.5 text-text-muted">
                        <TrendingUp size={12} />
                        <span className="text-xs">Daily Run Rate</span>
                    </div>
                    <p className="text-lg font-bold text-text-primary">{pacing.dailyRunRate}</p>
                    <p className="text-[10px] text-text-muted">meetings / day</p>
                </div>
                <div className="rounded-xl bg-background/50 p-4">
                    <div className="mb-1 flex items-center gap-1.5 text-text-muted">
                        <Target size={12} />
                        <span className="text-xs">Required Rate</span>
                    </div>
                    <p className={cn("text-lg font-bold", pacing.requiredDailyRate > pacing.dailyRunRate ? "text-danger" : "text-success")}>
                        {pacing.requiredDailyRate}
                    </p>
                    <p className="text-[10px] text-text-muted">meetings / day needed</p>
                </div>
                <div className="rounded-xl bg-background/50 p-4">
                    <div className="mb-1 flex items-center gap-1.5 text-text-muted">
                        <CalendarCheck size={12} />
                        <span className="text-xs">Projected Total</span>
                    </div>
                    <p className={cn("text-lg font-bold", pacing.projectedWeekEnd >= pacing.weeklyTarget ? "text-success" : "text-warning")}>
                        {pacing.projectedWeekEnd}
                    </p>
                    <p className="text-[10px] text-text-muted">meetings by week end</p>
                </div>
                <div className="rounded-xl bg-background/50 p-4">
                    <div className="mb-1 flex items-center gap-1.5 text-text-muted">
                        <Clock size={12} />
                        <span className="text-xs">Days Left</span>
                    </div>
                    <p className="text-lg font-bold text-text-primary">{pacing.daysRemaining}</p>
                    <p className="text-[10px] text-text-muted">business days</p>
                </div>
            </div>
        </article>
        </div>
    );
}
