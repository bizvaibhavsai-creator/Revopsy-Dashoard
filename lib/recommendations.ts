/**
 * Rules-Based Recommendations Engine
 *
 * Analyzes campaign performance data and generates
 * prescriptive recommendations with evidence.
 */

import type { Campaign, Recommendation, Platform } from "@/types/dashboard";
import { computeCampaignHealth } from "@/lib/health-scoring";

let recIdCounter = 0;
function nextId(): string {
    return `rec-${++recIdCounter}-${Date.now()}`;
}

export function generateRecommendations(campaigns: Campaign[]): Recommendation[] {
    const recs: Recommendation[] = [];
    recIdCounter = 0;

    const activeCampaigns = campaigns.filter((c) => c.status === "active");
    const instantlyCampaigns = activeCampaigns.filter((c) => c.platform === "instantly");
    const heyreachCampaigns = activeCampaigns.filter((c) => c.platform === "heyreach");

    // ── Per-campaign recommendations ──

    for (const campaign of activeCampaigns) {
        const health = computeCampaignHealth(campaign);

        // Pause recommendation for critical campaigns
        if (health.score < 30) {
            recs.push({
                id: nextId(),
                type: "pause",
                priority: "high",
                title: `Pause "${campaign.name}"`,
                description: `This campaign has a health score of ${health.score}/100 and is underperforming across key metrics.`,
                evidence: health.diagnostics.map((d) => d.title).join(", "),
                impact: "Pausing prevents wasted spend and protects sender reputation.",
                campaignId: campaign.id,
                platform: campaign.platform,
            });
        }

        // Optimization for warning campaigns
        if (health.score >= 30 && health.score < 70) {
            const topIssue = health.diagnostics[0];
            if (topIssue) {
                recs.push({
                    id: nextId(),
                    type: "optimize",
                    priority: "medium",
                    title: `Optimize "${campaign.name}"`,
                    description: topIssue.recommendation,
                    evidence: topIssue.description,
                    impact: `Fixing ${topIssue.category} issues could improve health score from ${health.score} to ${Math.min(100, health.score + 25)}.`,
                    campaignId: campaign.id,
                    platform: campaign.platform,
                });
            }
        }

        // Duplicate top performers
        if (health.score >= 85 && campaign.leads > 500 && campaign.meetingsBooked > 10) {
            recs.push({
                id: nextId(),
                type: "duplicate",
                priority: "medium",
                title: `Scale "${campaign.name}" into similar ICPs`,
                description: `This is a top-performing campaign with a health score of ${health.score}/100. Duplicate it to reach adjacent audiences.`,
                evidence: `${campaign.meetingsBooked} meetings from ${campaign.leads} leads (${campaign.replyRate}% reply rate).`,
                impact: "Duplicating into 2-3 similar ICPs could 2-3x meetings without additional experimentation.",
                campaignId: campaign.id,
                platform: campaign.platform,
            });
        }
    }

    // ── Cross-channel recommendations ──

    if (instantlyCampaigns.length > 0 && heyreachCampaigns.length > 0) {
        const avgInstantlyReply = instantlyCampaigns.reduce((s, c) => s + c.replyRate, 0) / instantlyCampaigns.length;
        const avgHeyreachReply = heyreachCampaigns.reduce((s, c) => s + c.replyRate, 0) / heyreachCampaigns.length;

        if (avgHeyreachReply > avgInstantlyReply * 1.5) {
            recs.push({
                id: nextId(),
                type: "channel_shift",
                priority: "high",
                title: "Shift volume from email to LinkedIn",
                description: `LinkedIn is generating ${avgHeyreachReply.toFixed(1)}% reply rate vs ${avgInstantlyReply.toFixed(1)}% for email. Consider moving budget to HeyReach.`,
                evidence: `HeyReach reply rate is ${((avgHeyreachReply / avgInstantlyReply) * 100 - 100).toFixed(0)}% higher than Instantly.`,
                impact: "Reallocating 30% of email volume to LinkedIn could increase overall meetings by 15-25%.",
            });
        } else if (avgInstantlyReply > avgHeyreachReply * 1.5) {
            recs.push({
                id: nextId(),
                type: "channel_shift",
                priority: "high",
                title: "Shift volume from LinkedIn to email",
                description: `Email is generating ${avgInstantlyReply.toFixed(1)}% reply rate vs ${avgHeyreachReply.toFixed(1)}% for LinkedIn. Consider increasing email volume.`,
                evidence: `Instantly reply rate is ${((avgInstantlyReply / avgHeyreachReply) * 100 - 100).toFixed(0)}% higher than HeyReach.`,
                impact: "Reallocating budget to the higher-performing channel could improve meeting efficiency.",
            });
        }
    }

    // ── Spend recommendations ──

    const topPerformer = activeCampaigns
        .filter((c) => c.meetingsBooked > 5)
        .sort((a, b) => b.replyRate - a.replyRate)[0];

    if (topPerformer && topPerformer.replyRate > 15) {
        recs.push({
            id: nextId(),
            type: "increase_spend",
            priority: "medium",
            title: `Increase spend on ${topPerformer.platform === "instantly" ? "Instantly" : "HeyReach"}`,
            description: `"${topPerformer.name}" is your best-performing campaign at ${topPerformer.replyRate}% reply rate. Increasing volume here has the best ROI.`,
            evidence: `${topPerformer.meetingsBooked} meetings from ${topPerformer.leads} leads.`,
            impact: "Increasing daily send volume by 50% on top campaigns typically yields 30-40% more meetings.",
            platform: topPerformer.platform,
        });
    }

    // No campaigns case
    if (activeCampaigns.length === 0) {
        recs.push({
            id: nextId(),
            type: "general",
            priority: "high",
            title: "No active campaigns detected",
            description: "Connect your API keys in Settings to see real campaign data and get actionable recommendations.",
            evidence: "Dashboard is in demo mode.",
            impact: "Real data enables health scoring, anomaly detection, and ROI optimization.",
        });
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return recs;
}
