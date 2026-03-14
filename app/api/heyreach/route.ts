import { NextRequest, NextResponse } from "next/server";
import { fetchHeyReachCampaigns } from "@/lib/api/heyreach";

/**
 * GET /api/heyreach
 * Proxy route for HeyReach API.
 * API key is sent via X-HeyReach-Key header from the client.
 */
export async function GET(request: NextRequest) {
    const apiKey = request.headers.get("X-HeyReach-Key");

    if (!apiKey) {
        return NextResponse.json({ configured: false, error: "No API key provided" }, { status: 200 });
    }

    try {
        // Fetch all campaigns (first page, up to 50)
        const campaignsRes = await fetchHeyReachCampaigns(apiKey);

        const campaigns = (campaignsRes?.items || []).map((c) => ({
            id: c.id,
            name: c.name,
            status: c.status,
            createdAt: c.createdAt,
            stats: c.stats || undefined,
        }));

        // Aggregate stats across all campaigns
        const totalStats = campaigns.reduce(
            (acc, c) => {
                if (c.stats) {
                    acc.connectionRequestsSent += c.stats.connectionRequestsSent || 0;
                    acc.connectionsAccepted += c.stats.connectionsAccepted || 0;
                    acc.messagesSent += c.stats.messagesSent || 0;
                    acc.messagesReceived += c.stats.messagesReceived || 0;
                }
                return acc;
            },
            {
                connectionRequestsSent: 0,
                connectionsAccepted: 0,
                messagesSent: 0,
                messagesReceived: 0,
            }
        );

        return NextResponse.json({
            configured: true,
            campaigns,
            totalStats,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[HeyReach API Error]", message);
        return NextResponse.json(
            { configured: true, error: message },
            { status: 502 }
        );
    }
}
