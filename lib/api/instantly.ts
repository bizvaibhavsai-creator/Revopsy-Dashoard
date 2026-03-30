/**
 * Instantly.ai API v2 Client
 * Base URL: https://api.instantly.ai
 * Auth: Bearer token
 */

const INSTANTLY_BASE_URL = "https://api.instantly.ai";

interface InstantlyRequestOptions {
    apiKey: string;
    endpoint: string;
    params?: Record<string, string>;
}

async function instantlyFetch<T>({ apiKey, endpoint, params }: InstantlyRequestOptions): Promise<T> {
    const url = new URL(`${INSTANTLY_BASE_URL}${endpoint}`);
    if (params) {
        Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }

    const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Instantly API error ${res.status}: ${errorText}`);
    }

    return res.json();
}

/** Actual Instantly v2 API analytics response shape */
export interface InstantlyRawAnalytics {
    emails_sent_count: number;
    contacted_count: number;
    new_leads_contacted_count: number;
    open_count: number;
    open_count_unique: number;
    open_count_unique_by_step: number;
    reply_count: number;
    reply_count_unique: number;
    reply_count_unique_by_step: number;
    reply_count_automatic: number;
    reply_count_automatic_unique: number;
    reply_count_automatic_unique_by_step: number;
    bounced_count: number;
    unsubscribed_count: number;
    total_opportunities: number;
    total_opportunity_value: number;
    total_interested: number;
    total_meeting_booked: number;
    total_meeting_completed: number;
    total_closed: number;
    link_click_count: number;
    link_click_count_unique: number;
    link_click_count_unique_by_step: number;
}

/** Actual Instantly v2 campaign list item shape */
export interface InstantlyRawCampaign {
    id: string;
    name: string;
    status: number;
    timestamp_created?: string;
    timestamp_updated?: string;
}

/** Fetch list of all campaigns */
export async function fetchInstantlyCampaigns(apiKey: string) {
    return instantlyFetch<{ items: InstantlyRawCampaign[]; next_starting_after?: string }>({
        apiKey,
        endpoint: "/api/v2/campaigns",
        params: { limit: "100" },
    });
}

/** Fetch analytics overview — returns a single aggregated object */
export async function fetchInstantlyAnalyticsOverview(apiKey: string) {
    return instantlyFetch<InstantlyRawAnalytics>({
        apiKey,
        endpoint: "/api/v2/campaigns/analytics/overview",
    });
}

/** Fetch analytics for a specific campaign (filter param is "id", not "campaign_id") */
export async function fetchInstantlyCampaignAnalytics(apiKey: string, campaignId: string) {
    return instantlyFetch<InstantlyRawAnalytics>({
        apiKey,
        endpoint: "/api/v2/campaigns/analytics/overview",
        params: { id: campaignId },
    });
}

/** Validate an Instantly API key by fetching campaigns (lightweight check) */
export async function validateInstantlyKey(apiKey: string): Promise<boolean> {
    try {
        await instantlyFetch({
            apiKey,
            endpoint: "/api/v2/campaigns",
            params: { limit: "1" },
        });
        return true;
    } catch {
        return false;
    }
}
