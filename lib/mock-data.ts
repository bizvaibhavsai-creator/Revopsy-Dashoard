import type {
    InstantlyMetrics,
    HeyReachMetrics,
    AggregatedMetrics,
    Campaign,
    ChartDataPoint,
    TimeRange,
    SparklinePoint,
} from "@/types/dashboard";

/** Generate sparkline data points */
function generateSparkline(base: number, points = 7): SparklinePoint[] {
    return Array.from({ length: points }, () => ({
        value: base + Math.floor(Math.random() * base * 0.4 - base * 0.2),
    }));
}

/** Get Instantly.ai metrics for a given time range */
export function getInstantlyMetrics(range: TimeRange): InstantlyMetrics & { sparkline: SparklinePoint[] } {
    const multipliers: Record<TimeRange, number> = {
        today: 1,
        "7d": 7,
        "30d": 30,
        "90d": 90,
    };
    const m = multipliers[range];

    return {
        totalEmailsSent: Math.round(145 * m * (0.9 + Math.random() * 0.2)),
        totalResponses: Math.round(18 * m * (0.9 + Math.random() * 0.2)),
        positiveResponses: Math.round(8 * m * (0.9 + Math.random() * 0.2)),
        meetingsBooked: Math.round(3 * m * (0.85 + Math.random() * 0.3)),
        emailsSentChange: +(5 + Math.random() * 15).toFixed(1),
        responsesChange: +(-3 + Math.random() * 20).toFixed(1),
        positiveChange: +(2 + Math.random() * 12).toFixed(1),
        meetingsChange: +(-5 + Math.random() * 25).toFixed(1),
        sparkline: generateSparkline(18 * m),
    };
}

/** Get HeyReach metrics for a given time range */
export function getHeyReachMetrics(range: TimeRange): HeyReachMetrics & { sparkline: SparklinePoint[] } {
    const multipliers: Record<TimeRange, number> = {
        today: 1,
        "7d": 7,
        "30d": 30,
        "90d": 90,
    };
    const m = multipliers[range];

    return {
        connectionRequestsSent: Math.round(85 * m * (0.9 + Math.random() * 0.2)),
        connectionsAccepted: Math.round(32 * m * (0.9 + Math.random() * 0.2)),
        responses: Math.round(12 * m * (0.9 + Math.random() * 0.2)),
        meetingsBooked: Math.round(2 * m * (0.85 + Math.random() * 0.3)),
        connectionsSentChange: +(8 + Math.random() * 12).toFixed(1),
        acceptedChange: +(3 + Math.random() * 15).toFixed(1),
        responsesChange: +(-2 + Math.random() * 18).toFixed(1),
        meetingsChange: +(-4 + Math.random() * 22).toFixed(1),
        sparkline: generateSparkline(12 * m),
    };
}

/** Get aggregated metrics across all channels */
export function getAggregatedMetrics(range: TimeRange): AggregatedMetrics {
    const instantly = getInstantlyMetrics(range);
    const heyreach = getHeyReachMetrics(range);

    return {
        totalLeadsContacted: instantly.totalEmailsSent + heyreach.connectionRequestsSent,
        totalResponses: instantly.totalResponses + heyreach.responses,
        totalMeetingsBooked: instantly.meetingsBooked + heyreach.meetingsBooked,
        leadsChange: +((instantly.emailsSentChange + heyreach.connectionsSentChange) / 2).toFixed(1),
        responsesChange: +((instantly.responsesChange + heyreach.responsesChange) / 2).toFixed(1),
        meetingsChange: +((instantly.meetingsChange + heyreach.meetingsChange) / 2).toFixed(1),
        meetingsByPlatform: {
            instantly: instantly.meetingsBooked,
            heyreach: heyreach.meetingsBooked,
        },
    };
}

/** Generate chart data for channel analytics */
export function getChartData(range: TimeRange): ChartDataPoint[] {
    const days: Record<TimeRange, number> = {
        today: 24,
        "7d": 7,
        "30d": 30,
        "90d": 12,
    };
    const count = days[range];
    const now = new Date();

    return Array.from({ length: count }, (_, i) => {
        const date = new Date(now);
        if (range === "today") {
            date.setHours(date.getHours() - (count - 1 - i));
            return {
                date: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
                instantly: Math.round(3 + Math.random() * 12),
                heyreach: Math.round(2 + Math.random() * 8),
            };
        } else if (range === "90d") {
            date.setDate(date.getDate() - (count - 1 - i) * 7);
            return {
                date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                instantly: Math.round(80 + Math.random() * 60),
                heyreach: Math.round(40 + Math.random() * 40),
            };
        } else {
            date.setDate(date.getDate() - (count - 1 - i));
            return {
                date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                instantly: Math.round(10 + Math.random() * 25),
                heyreach: Math.round(5 + Math.random() * 18),
            };
        }
    });
}

/** Get campaign data for the leaderboard */
export function getCampaigns(): Campaign[] {
    return [
        {
            id: "c1",
            name: "SaaS Decision Makers Q1",
            platform: "instantly",
            leads: 2450,
            replyRate: 12.4,
            positiveReplies: 89,
            meetingsBooked: 34,
            status: "active",
            lastUpdated: "2 hours ago",
            openRate: 62.3,
            clickRate: 8.1,
        },
        {
            id: "c2",
            name: "VP Engineering Outreach",
            platform: "heyreach",
            leads: 1820,
            replyRate: 18.7,
            positiveReplies: 124,
            meetingsBooked: 28,
            status: "active",
            lastUpdated: "1 hour ago",
        },
        {
            id: "c3",
            name: "Series A Founders",
            platform: "instantly",
            leads: 3100,
            replyRate: 9.8,
            positiveReplies: 67,
            meetingsBooked: 21,
            status: "active",
            lastUpdated: "3 hours ago",
            openRate: 58.1,
            clickRate: 6.4,
        },
        {
            id: "c4",
            name: "CTO LinkedIn Connect",
            platform: "heyreach",
            leads: 950,
            replyRate: 22.1,
            positiveReplies: 78,
            meetingsBooked: 19,
            status: "paused",
            lastUpdated: "1 day ago",
        },
        {
            id: "c5",
            name: "E-commerce Leaders",
            platform: "instantly",
            leads: 4200,
            replyRate: 7.2,
            positiveReplies: 53,
            meetingsBooked: 15,
            status: "completed",
            lastUpdated: "3 days ago",
            openRate: 51.2,
            clickRate: 5.8,
        },
        {
            id: "c6",
            name: "Head of Growth Outbound",
            platform: "heyreach",
            leads: 1340,
            replyRate: 15.9,
            positiveReplies: 92,
            meetingsBooked: 24,
            status: "active",
            lastUpdated: "5 hours ago",
        },
        {
            id: "c7",
            name: "Mid-Market AE Targets",
            platform: "instantly",
            leads: 1870,
            replyRate: 11.3,
            positiveReplies: 45,
            meetingsBooked: 12,
            status: "active",
            lastUpdated: "30 minutes ago",
            openRate: 55.7,
            clickRate: 7.2,
        },
        {
            id: "c8",
            name: "RevOps Professionals",
            platform: "heyreach",
            leads: 780,
            replyRate: 25.6,
            positiveReplies: 65,
            meetingsBooked: 17,
            status: "active",
            lastUpdated: "4 hours ago",
        },
    ];
}
