import type { TimeRange } from "@/types/dashboard";

/** Time range options for the dashboard toggle */
export const TIME_RANGE_OPTIONS: { label: string; value: TimeRange }[] = [
    { label: "Today", value: "today" },
    { label: "7 Days", value: "7d" },
    { label: "30 Days", value: "30d" },
    { label: "90 Days", value: "90d" },
];

/** Chart color palette */
export const CHART_COLORS = {
    instantly: "#c45a3c",
    heyreach: "#d4894e",
    positive: "#34D399",
    negative: "#F87171",
    muted: "#8B8B9E",
} as const;

/** Default channel spend values */
export const DEFAULT_CHANNEL_SPEND = {
    instantly: 500,
    heyreach: 300,
} as const;

/** Average deal value for ROI calculation */
export const AVG_DEAL_VALUE = 5000;

/** Conversion rate from meeting to opportunity */
export const MEETING_TO_OPP_RATE = 0.35;
