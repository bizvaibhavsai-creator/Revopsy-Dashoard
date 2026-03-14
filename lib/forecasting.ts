/**
 * Forecasting & Pacing Engine
 *
 * Projects weekly meeting targets based on current velocity
 * and returns pacing status.
 */

import type { PacingData } from "@/types/dashboard";

/**
 * Calculate pacing data based on current meetings and target.
 *
 * @param currentMeetings - meetings booked this week (or period)
 * @param weeklyTarget - target meetings per week
 * @param dayOfWeek - current day of week (0=Sun, 1=Mon, ..., 6=Sat)
 */
export function calculatePacing(
    currentMeetings: number,
    weeklyTarget: number,
    dayOfWeek?: number
): PacingData {
    const now = new Date();
    const day = dayOfWeek ?? now.getDay();

    // Business days elapsed (Mon=1 through current day, capped at 5)
    const businessDayMap: Record<number, number> = {
        0: 5, // Sunday — full week passed
        1: 1, // Monday
        2: 2,
        3: 3,
        4: 4,
        5: 5, // Friday
        6: 5, // Saturday — full work week
    };

    const daysElapsed = businessDayMap[day] || 3;
    const totalBusinessDays = 5;
    const daysRemaining = Math.max(0, totalBusinessDays - daysElapsed);

    // Daily run rate
    const dailyRunRate = daysElapsed > 0 ? currentMeetings / daysElapsed : 0;

    // Projected week-end total
    const projectedWeekEnd = currentMeetings + dailyRunRate * daysRemaining;

    // Required daily rate to hit target
    const requiredDailyRate =
        daysRemaining > 0
            ? Math.max(0, (weeklyTarget - currentMeetings) / daysRemaining)
            : 0;

    // Pacing percentage
    const expectedByNow = (daysElapsed / totalBusinessDays) * weeklyTarget;
    const pacingPercent =
        expectedByNow > 0 ? (currentMeetings / expectedByNow) * 100 : currentMeetings > 0 ? 100 : 0;

    // Status
    let pacingStatus: PacingData["pacingStatus"];
    if (pacingPercent >= 110) {
        pacingStatus = "ahead";
    } else if (pacingPercent >= 85) {
        pacingStatus = "on_track";
    } else if (pacingPercent >= 50) {
        pacingStatus = "behind";
    } else {
        pacingStatus = "at_risk";
    }

    return {
        weeklyTarget,
        currentWeekMeetings: currentMeetings,
        projectedWeekEnd: Math.round(projectedWeekEnd),
        pacingStatus,
        pacingPercent: Math.round(pacingPercent),
        daysRemaining,
        dailyRunRate: +dailyRunRate.toFixed(1),
        requiredDailyRate: +requiredDailyRate.toFixed(1),
    };
}

/** Get status color classes */
export function getPacingClasses(status: PacingData["pacingStatus"]): {
    bg: string;
    text: string;
    label: string;
} {
    switch (status) {
        case "ahead":
            return { bg: "bg-success/10", text: "text-success", label: "Ahead of pace" };
        case "on_track":
            return { bg: "bg-success/10", text: "text-success", label: "On track" };
        case "behind":
            return { bg: "bg-warning/10", text: "text-warning", label: "Behind pace" };
        case "at_risk":
            return { bg: "bg-danger/10", text: "text-danger", label: "At risk" };
    }
}
