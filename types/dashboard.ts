/** Time range options for filtering dashboard data */
export type TimeRange = "today" | "7d" | "30d" | "90d";

/** Platform/channel identifiers */
export type Platform = "instantly" | "heyreach";

/** Metrics for Instantly.ai email outbound channel */
export interface InstantlyMetrics {
    totalEmailsSent: number;
    totalResponses: number;
    positiveResponses: number;
    meetingsBooked: number;
    emailsSentChange: number;
    responsesChange: number;
    positiveChange: number;
    meetingsChange: number;
}

/** Metrics for HeyReach LinkedIn outbound channel */
export interface HeyReachMetrics {
    connectionRequestsSent: number;
    connectionsAccepted: number;
    responses: number;
    meetingsBooked: number;
    connectionsSentChange: number;
    acceptedChange: number;
    responsesChange: number;
    meetingsChange: number;
}

/** Aggregated metrics across all channels */
export interface AggregatedMetrics {
    totalLeadsContacted: number;
    totalResponses: number;
    totalMeetingsBooked: number;
    leadsChange: number;
    responsesChange: number;
    meetingsChange: number;
    meetingsByPlatform: {
        instantly: number;
        heyreach: number;
    };
}

/** Single data point for time-series charts */
export interface ChartDataPoint {
    date: string;
    instantly: number;
    heyreach: number;
}

/** Campaign row data for the leaderboard table */
export interface Campaign {
    id: string;
    name: string;
    platform: Platform;
    leads: number;
    replyRate: number;
    positiveReplies: number;
    meetingsBooked: number;
    status: "active" | "paused" | "completed";
    lastUpdated: string;
    openRate?: number;
    clickRate?: number;
}

/** Channel spend settings */
export interface ChannelSpend {
    instantly: number;
    heyreach: number;
}

/** ROI calculation data for a single channel */
export interface ROIData {
    channelName: string;
    platform: Platform;
    monthlySpend: number;
    meetingsGenerated: number;
    costPerMeeting: number;
    opportunitiesCreated: number;
    pipelineValue: number;
    roiPercentage: number;
}

/** Mini chart data point for sparkline in KPI cards */
export interface SparklinePoint {
    value: number;
}

/** API connection status */
export type ApiConnectionStatus = "connected" | "disconnected" | "error" | "loading";

/** Instantly API analytics overview response (normalized by our proxy route) */
export interface InstantlyAnalyticsOverview {
    total_emails_sent: number;
    emails_read: number;
    new_leads_contacted: number;
    leads_replied: number;
    leads_interested: number;
    total_opportunities: number;
    total_replies: number;
    bounced: number;
    unsubscribed: number;
    total_meeting_booked: number;
    total_meeting_completed: number;
    total_opportunity_value: number;
    contacted_count: number;
}

/** Per-campaign analytics (same shape as overview, normalized by proxy route) */
export type InstantlyCampaignAnalytics = InstantlyAnalyticsOverview;

/** Instantly campaign from API */
export interface InstantlyCampaign {
    id: string;
    name: string;
    status: number; // 0=draft, 1=active, 2=paused, 3=completed
    timestamp?: string;
    analytics?: InstantlyCampaignAnalytics;
}

/** HeyReach campaign from API */
export interface HeyReachCampaign {
    id: number;
    name: string;
    status: string;
    createdAt?: string;
    stats?: {
        connectionRequestsSent?: number;
        connectionsAccepted?: number;
        messagesSent?: number;
        messagesReceived?: number;
        inmailsSent?: number;
        inmailsReceived?: number;
    };
}

/** Aggregated API response for Instantly proxy route */
export interface InstantlyApiResponse {
    configured: boolean;
    overview?: InstantlyAnalyticsOverview;
    campaigns?: InstantlyCampaign[];
    error?: string;
}

/** Aggregated API response for HeyReach proxy route */
export interface HeyReachApiResponse {
    configured: boolean;
    campaigns?: HeyReachCampaign[];
    totalStats?: {
        connectionRequestsSent: number;
        connectionsAccepted: number;
        messagesSent: number;
        messagesReceived: number;
    };
    error?: string;
}

// ── Premium Feature Types ──────────────────────────────────────────

/** View mode for exec vs operator dashboards */
export type ViewMode = "exec" | "operator";

/** Health score severity */
export type HealthLevel = "healthy" | "warning" | "critical";

/** Diagnostic issue category */
export type DiagnosticCategory =
    | "deliverability"
    | "messaging"
    | "follow_up"
    | "targeting"
    | "volume"
    | "general";

/** Single diagnostic issue for a campaign */
export interface DiagnosticIssue {
    category: DiagnosticCategory;
    severity: HealthLevel;
    title: string;
    description: string;
    recommendation: string;
}

/** Campaign health assessment */
export interface CampaignHealth {
    score: number; // 0-100
    level: HealthLevel;
    diagnostics: DiagnosticIssue[];
}

/** Alert notification */
export interface Alert {
    id: string;
    type: "anomaly" | "risk" | "system" | "milestone";
    severity: HealthLevel;
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
    campaignId?: string;
    platform?: Platform;
}

/** Recommendation from the rules engine */
export interface Recommendation {
    id: string;
    type: "pause" | "increase_spend" | "channel_shift" | "duplicate" | "optimize" | "general";
    priority: "high" | "medium" | "low";
    title: string;
    description: string;
    evidence: string;
    impact: string;
    campaignId?: string;
    platform?: Platform;
}

/** Forecasting / pacing data */
export interface PacingData {
    weeklyTarget: number;
    currentWeekMeetings: number;
    projectedWeekEnd: number;
    pacingStatus: "ahead" | "on_track" | "behind" | "at_risk";
    pacingPercent: number; // % through target
    daysRemaining: number;
    dailyRunRate: number;
    requiredDailyRate: number;
}

/** Command center feed item */
export interface FeedItem {
    id: string;
    type: "alert" | "milestone" | "system" | "recommendation";
    icon: string;
    title: string;
    description: string;
    timestamp: number;
    severity?: HealthLevel;
    actionUrl?: string;
}
