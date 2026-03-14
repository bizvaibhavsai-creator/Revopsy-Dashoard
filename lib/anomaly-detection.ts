/**
 * Anomaly Detection & Alert Generation
 *
 * Analyzes campaign data to detect anomalies and generate
 * alert notifications for the command center and in-app feed.
 */

import type { Alert, Campaign, FeedItem, HealthLevel } from "@/types/dashboard";
import { computeCampaignHealth } from "@/lib/health-scoring";

let alertIdCounter = 0;
function nextAlertId(): string {
    return `alert-${++alertIdCounter}-${Date.now()}`;
}

/**
 * Generate alerts based on campaign health and system status.
 */
export function generateAlerts(
    campaigns: Campaign[],
    apiStatus: { instantly: boolean; heyreach: boolean }
): Alert[] {
    const alerts: Alert[] = [];
    alertIdCounter = 0;
    const now = Date.now();

    // Campaign health alerts
    for (const campaign of campaigns) {
        if (campaign.status !== "active") continue;

        const health = computeCampaignHealth(campaign);

        if (health.level === "critical") {
            alerts.push({
                id: nextAlertId(),
                type: "risk",
                severity: "critical",
                title: `${campaign.name} is critical`,
                message: `Health score dropped to ${health.score}/100. ${health.diagnostics[0]?.title || "Multiple issues detected."}`,
                timestamp: now,
                read: false,
                campaignId: campaign.id,
                platform: campaign.platform,
            });
        } else if (health.level === "warning") {
            alerts.push({
                id: nextAlertId(),
                type: "anomaly",
                severity: "warning",
                title: `${campaign.name} needs attention`,
                message: `Health score is ${health.score}/100. ${health.diagnostics[0]?.title || "Performance below benchmark."}`,
                timestamp: now - 60000 * Math.floor(Math.random() * 120), // stagger
                read: false,
                campaignId: campaign.id,
                platform: campaign.platform,
            });
        }
    }

    // Reply rate anomaly detection
    const activeCampaigns = campaigns.filter((c) => c.status === "active");
    const lowReplyCampaigns = activeCampaigns.filter((c) => c.replyRate < 3 && c.leads > 200);
    if (lowReplyCampaigns.length >= 2) {
        alerts.push({
            id: nextAlertId(),
            type: "anomaly",
            severity: "critical",
            title: "Reply rate drop across multiple campaigns",
            message: `${lowReplyCampaigns.length} campaigns have reply rates below 3%. Possible deliverability or messaging issue across accounts.`,
            timestamp: now - 30000,
            read: false,
        });
    }

    // API disconnection alerts
    if (!apiStatus.instantly) {
        alerts.push({
            id: nextAlertId(),
            type: "system",
            severity: "warning",
            title: "Instantly.ai not connected",
            message: "Add your Instantly API key in Settings to see real campaign data.",
            timestamp: now - 300000,
            read: false,
            platform: "instantly",
        });
    }
    if (!apiStatus.heyreach) {
        alerts.push({
            id: nextAlertId(),
            type: "system",
            severity: "warning",
            title: "HeyReach not connected",
            message: "Add your HeyReach API key in Settings to see LinkedIn outbound data.",
            timestamp: now - 300000,
            read: false,
            platform: "heyreach",
        });
    }

    // Milestone alerts for good campaigns
    const topCampaigns = activeCampaigns.filter((c) => c.meetingsBooked >= 20);
    for (const campaign of topCampaigns) {
        alerts.push({
            id: nextAlertId(),
            type: "milestone",
            severity: "healthy",
            title: `${campaign.name} hit ${campaign.meetingsBooked} meetings!`,
            message: `This campaign is performing well with a ${campaign.replyRate}% reply rate.`,
            timestamp: now - 600000 * Math.floor(Math.random() * 10),
            read: true,
            campaignId: campaign.id,
            platform: campaign.platform,
        });
    }

    // Sort by timestamp (newest first)
    alerts.sort((a, b) => b.timestamp - a.timestamp);

    return alerts;
}

/**
 * Convert alerts to feed items for the command center.
 */
export function alertsToFeedItems(alerts: Alert[]): FeedItem[] {
    return alerts.map((alert) => ({
        id: alert.id,
        type: alert.type === "milestone" ? "milestone" : alert.type === "system" ? "system" : "alert",
        icon:
            alert.type === "risk"
                ? "🔴"
                : alert.type === "anomaly"
                ? "⚠️"
                : alert.type === "system"
                ? "🔌"
                : "🎯",
        title: alert.title,
        description: alert.message,
        timestamp: alert.timestamp,
        severity: alert.severity,
    }));
}

/**
 * Format relative time for feed items.
 */
export function formatRelativeTime(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}
