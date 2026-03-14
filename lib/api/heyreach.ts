/**
 * HeyReach API Client
 * Base URL: https://api.heyreach.io/api/public
 * Auth: X-API-KEY header
 */

const HEYREACH_BASE_URL = "https://api.heyreach.io/api/public";

interface HeyReachRequestOptions {
    apiKey: string;
    endpoint: string;
    method?: "GET" | "POST";
    body?: unknown;
}

async function heyreachFetch<T>({ apiKey, endpoint, method = "GET", body }: HeyReachRequestOptions): Promise<T> {
    const url = `${HEYREACH_BASE_URL}${endpoint}`;

    const res = await fetch(url, {
        method,
        headers: {
            "X-API-KEY": apiKey,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HeyReach API error ${res.status}: ${errorText}`);
    }

    return res.json();
}

/** Fetch all campaigns (paginated) */
export async function fetchHeyReachCampaigns(apiKey: string, page = 0, pageSize = 50) {
    return heyreachFetch<{
        items: Array<{
            id: number;
            name: string;
            status: string;
            createdAt?: string;
            senderAccounts?: Array<{ linkedInAccountId: number }>;
            stats?: {
                connectionRequestsSent?: number;
                connectionsAccepted?: number;
                messagesSent?: number;
                messagesReceived?: number;
                inmailsSent?: number;
                inmailsReceived?: number;
            };
        }>;
        totalCount: number;
    }>({
        apiKey,
        endpoint: "/campaign/GetAll",
        method: "POST",
        body: {
            offset: page * pageSize,
            limit: pageSize,
        },
    });
}

/** Fetch stats for a specific campaign */
export async function fetchHeyReachCampaignStats(apiKey: string, campaignId: number) {
    return heyreachFetch<{
        connectionRequestsSent?: number;
        connectionsAccepted?: number;
        messagesSent?: number;
        messagesReceived?: number;
        inmailsSent?: number;
        inmailsReceived?: number;
    }>({
        apiKey,
        endpoint: `/campaign/${campaignId}/stats`,
    });
}

/** Validate a HeyReach API key by fetching campaigns (lightweight check) */
export async function validateHeyReachKey(apiKey: string): Promise<boolean> {
    try {
        await heyreachFetch({
            apiKey,
            endpoint: "/campaign/GetAll",
            method: "POST",
            body: { offset: 0, limit: 1 },
        });
        return true;
    } catch {
        return false;
    }
}
