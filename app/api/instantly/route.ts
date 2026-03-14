import { NextRequest, NextResponse } from "next/server";
import { fetchInstantlyCampaigns, fetchInstantlyAnalyticsOverview } from "@/lib/api/instantly";

/**
 * GET /api/instantly
 * Proxy route for Instantly.ai API.
 * API key is sent via X-Instantly-Key header from the client.
 * Returns per-campaign analytics so the leaderboard has real data.
 */
export async function GET(request: NextRequest) {
    const apiKey = request.headers.get("X-Instantly-Key");

    if (!apiKey) {
        return NextResponse.json({ configured: false, error: "No API key provided" }, { status: 200 });
    }

    try {
        // Fetch campaigns and analytics overview in parallel
        const [campaignsRes, analyticsRes] = await Promise.all([
            fetchInstantlyCampaigns(apiKey),
            fetchInstantlyAnalyticsOverview(apiKey),
        ]);

        // Build per-campaign analytics map
        const perCampaignMap = new Map<string, {
            total_emails_sent: number;
            emails_read: number;
            new_leads_contacted: number;
            leads_replied: number;
            leads_interested: number;
            total_opportunities: number;
            total_replies: number;
            bounced: number;
            unsubscribed: number;
        }>();

        if (Array.isArray(analyticsRes)) {
            for (const item of analyticsRes) {
                if (item.campaign_id) {
                    perCampaignMap.set(item.campaign_id, item);
                }
            }
        }

        // Aggregate overview across all campaigns
        const overview = Array.isArray(analyticsRes)
            ? analyticsRes.reduce(
                  (acc, item) => ({
                      total_emails_sent: acc.total_emails_sent + (item.total_emails_sent || 0),
                      emails_read: acc.emails_read + (item.emails_read || 0),
                      new_leads_contacted: acc.new_leads_contacted + (item.new_leads_contacted || 0),
                      leads_replied: acc.leads_replied + (item.leads_replied || 0),
                      leads_interested: acc.leads_interested + (item.leads_interested || 0),
                      total_opportunities: acc.total_opportunities + (item.total_opportunities || 0),
                      total_replies: acc.total_replies + (item.total_replies || 0),
                      bounced: acc.bounced + (item.bounced || 0),
                      unsubscribed: acc.unsubscribed + (item.unsubscribed || 0),
                  }),
                  {
                      total_emails_sent: 0,
                      emails_read: 0,
                      new_leads_contacted: 0,
                      leads_replied: 0,
                      leads_interested: 0,
                      total_opportunities: 0,
                      total_replies: 0,
                      bounced: 0,
                      unsubscribed: 0,
                  }
              )
            : analyticsRes;

        // Map campaigns with their individual analytics
        const campaigns = (campaignsRes?.items || []).map((c) => {
            const stats = perCampaignMap.get(c.id);
            return {
                id: c.id,
                name: c.name,
                status: c.status,
                timestamp: c.timestamp,
                analytics: stats ? {
                    totalEmailsSent: stats.total_emails_sent,
                    emailsRead: stats.emails_read,
                    newLeadsContacted: stats.new_leads_contacted,
                    leadsReplied: stats.leads_replied,
                    leadsInterested: stats.leads_interested,
                    totalOpportunities: stats.total_opportunities,
                    totalReplies: stats.total_replies,
                    bounced: stats.bounced,
                    unsubscribed: stats.unsubscribed,
                } : undefined,
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
