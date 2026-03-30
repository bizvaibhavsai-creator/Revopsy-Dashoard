import { NextRequest, NextResponse } from "next/server";
import {
    fetchInstantlyCampaigns,
    fetchInstantlyAnalyticsOverview,
    fetchInstantlyCampaignAnalytics,
} from "@/lib/api/instantly";

/**
 * Normalize raw Instantly analytics into the shape the frontend expects.
 */
function normalizeAnalytics(raw: {
    emails_sent_count?: number;
    open_count_unique?: number;
    new_leads_contacted_count?: number;
    reply_count_unique?: number;
    total_interested?: number;
    total_opportunities?: number;
    reply_count?: number;
    bounced_count?: number;
    unsubscribed_count?: number;
    total_meeting_booked?: number;
    total_meeting_completed?: number;
    total_opportunity_value?: number;
    contacted_count?: number;
}) {
    return {
        total_emails_sent: raw.emails_sent_count ?? 0,
        emails_read: raw.open_count_unique ?? 0,
        new_leads_contacted: raw.new_leads_contacted_count ?? 0,
        leads_replied: raw.reply_count_unique ?? 0,
        leads_interested: raw.total_interested ?? 0,
        total_opportunities: raw.total_opportunities ?? 0,
        total_replies: raw.reply_count ?? 0,
        bounced: raw.bounced_count ?? 0,
        unsubscribed: raw.unsubscribed_count ?? 0,
        total_meeting_booked: raw.total_meeting_booked ?? 0,
        total_meeting_completed: raw.total_meeting_completed ?? 0,
        total_opportunity_value: raw.total_opportunity_value ?? 0,
        contacted_count: raw.contacted_count ?? 0,
    };
}

/**
 * GET /api/instantly
 * Proxy route for Instantly.ai API.
 * API key is sent via X-Instantly-Key header from the client.
 * Returns normalized overview analytics + per-campaign analytics.
 */
export async function GET(request: NextRequest) {
    const apiKey = request.headers.get("X-Instantly-Key");

    if (!apiKey) {
        return NextResponse.json({ configured: false, error: "No API key provided" }, { status: 200 });
    }

    try {
        // Fetch campaigns and global analytics overview in parallel
        const [campaignsRes, rawAnalytics] = await Promise.all([
            fetchInstantlyCampaigns(apiKey),
            fetchInstantlyAnalyticsOverview(apiKey),
        ]);

        const overview = normalizeAnalytics(rawAnalytics);
        const campaignItems = campaignsRes?.items || [];

        // Fetch per-campaign analytics in parallel (batched to avoid rate limits)
        const perCampaignResults = await Promise.allSettled(
            campaignItems.map((c) => fetchInstantlyCampaignAnalytics(apiKey, c.id))
        );

        // Map campaigns with their individual analytics
        const campaigns = campaignItems.map((c, i) => {
            const result = perCampaignResults[i];
            const analytics =
                result.status === "fulfilled" ? normalizeAnalytics(result.value) : undefined;

            return {
                id: c.id,
                name: c.name,
                status: c.status,
                timestamp: c.timestamp_updated || c.timestamp_created,
                analytics,
            };
        });

        return NextResponse.json({
            configured: true,
            overview,
            campaigns,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[Instantly API Error]", message);
        return NextResponse.json(
            { configured: true, error: message },
            { status: 502 }
        );
    }
}
