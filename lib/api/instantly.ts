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

/** Fetch list of all campaigns */
export async function fetchInstantlyCampaigns(apiKey: string) {
    return instantlyFetch<{ items: Array<{ id: string; name: string; status: number; timestamp?: string }> }>({
        apiKey,
        endpoint: "/api/v2/campaigns",
        params: { limit: "100" },
    });
}

/** Fetch analytics overview (aggregated across all campaigns) */
export async function fetchInstantlyAnalyticsOverview(
    apiKey: string,
    options?: { campaignId?: string; startDate?: string; endDate?: string }
) {
    const params: Record<string, string> = {};
    if (options?.campaignId) params.campaign_id = options.campaignId;
    if (options?.startDate) params.start_date = options.startDate;
    if (options?.endDate) params.end_date = options.endDate;

    return instantlyFetch<Array<{
        campaign_id?: string;
        campaign_name?: string;
        total_emails_sent: number;
        emails_read: number;
        new_leads_contacted: number;
        leads_replied: number;
        leads_interested: number;
        total_opportunities: number;
        total_replies: number;
        bounced: number;
        unsubscribed: number;
    }>>({
        apiKey,
        endpoint: "/api/v2/campaigns/analytics/overview",
        params,
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
