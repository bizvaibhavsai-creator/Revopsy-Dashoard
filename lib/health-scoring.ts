/**
 * Campaign Health Scoring Engine
 *
 * Computes a 0-100 health score per campaign and returns
 * diagnostic issues with actionable recommendations.
 */

import type {
    Campaign,
    CampaignHealth,
    DiagnosticIssue,
    HealthLevel,
    Platform,
} from "@/types/dashboard";

// ── Benchmarks ───────────────────────────────────────────────────

const BENCHMARKS = {
    instantly: {
        openRate: 55,       // % — good open rate for cold email
        replyRate: 8,       // % — solid reply rate
        positiveRate: 40,   // % of replies that are positive
        meetingConversion: 25, // % of positive replies → meetings
        bounceRateMax: 5,   // % max acceptable bounce
    },
    heyreach: {
        acceptanceRate: 30, // % connection acceptance
        replyRate: 12,      // % reply rate on LinkedIn
        meetingConversion: 20,
    },
};

// ── Scoring ──────────────────────────────────────────────────────

export function computeCampaignHealth(campaign: Campaign): CampaignHealth {
    const diagnostics: DiagnosticIssue[] = [];
    let totalScore = 100;

    if (campaign.platform === "instantly") {
        // 1. Deliverability check (open rate)
        if (campaign.openRate !== undefined) {
            if (campaign.openRate < 30) {
                totalScore -= 35;
                diagnostics.push({
                    category: "deliverability",
                    severity: "critical",
                    title: "Severe deliverability issue",
                    description: `Open rate is ${campaign.openRate}% (benchmark: ${BENCHMARKS.instantly.openRate}%). Emails are likely landing in spam.`,
                    recommendation: "Check domain reputation, warm up inboxes, reduce daily send volume, and verify SPF/DKIM/DMARC records.",
                });
            } else if (campaign.openRate < BENCHMARKS.instantly.openRate) {
                totalScore -= 15;
                diagnostics.push({
                    category: "deliverability",
                    severity: "warning",
                    title: "Below-average open rate",
                    description: `Open rate is ${campaign.openRate}% (benchmark: ${BENCHMARKS.instantly.openRate}%). Deliverability could be improved.`,
                    recommendation: "Review subject lines, check sender reputation, and ensure inbox warm-up is active.",
                });
            }
        }

        // 2. Messaging check (reply rate)
        if (campaign.replyRate < 3) {
            totalScore -= 30;
            diagnostics.push({
                category: "messaging",
                severity: "critical",
                title: "Very low reply rate",
                description: `Reply rate is ${campaign.replyRate}% (benchmark: ${BENCHMARKS.instantly.replyRate}%). Your messaging isn't resonating.`,
                recommendation: "A/B test new email copy, personalize opening lines, shorten emails, and strengthen your CTA.",
            });
        } else if (campaign.replyRate < BENCHMARKS.instantly.replyRate) {
            totalScore -= 12;
            diagnostics.push({
                category: "messaging",
                severity: "warning",
                title: "Reply rate below benchmark",
                description: `Reply rate is ${campaign.replyRate}% (benchmark: ${BENCHMARKS.instantly.replyRate}%).`,
                recommendation: "Test different value propositions, add social proof, or try pain-point-based messaging.",
            });
        }

        // 3. SDR follow-up check (replies → meetings)
        if (campaign.positiveReplies > 0 && campaign.meetingsBooked > 0) {
            const meetingRate = (campaign.meetingsBooked / campaign.positiveReplies) * 100;
            if (meetingRate < 15) {
                totalScore -= 20;
                diagnostics.push({
                    category: "follow_up",
                    severity: "critical",
                    title: "Poor reply-to-meeting conversion",
                    description: `Only ${meetingRate.toFixed(0)}% of positive replies converted to meetings (benchmark: ${BENCHMARKS.instantly.meetingConversion}%).`,
                    recommendation: "Review SDR follow-up speed, improve booking flow, add a Calendly link in responses.",
                });
            } else if (meetingRate < BENCHMARKS.instantly.meetingConversion) {
                totalScore -= 10;
                diagnostics.push({
                    category: "follow_up",
                    severity: "warning",
                    title: "Meeting conversion below benchmark",
                    description: `${meetingRate.toFixed(0)}% of positive replies → meetings (benchmark: ${BENCHMARKS.instantly.meetingConversion}%).`,
                    recommendation: "Speed up follow-up response time and simplify the booking process.",
                });
            }
        }

        // 4. Volume check
        if (campaign.leads < 100 && campaign.status === "active") {
            totalScore -= 5;
            diagnostics.push({
                category: "volume",
                severity: "warning",
                title: "Low lead volume",
                description: `Only ${campaign.leads} leads contacted. Sample size may be too small for reliable metrics.`,
                recommendation: "Import more leads or expand your ICP to increase campaign volume.",
            });
        }
    } else {
        // HeyReach (LinkedIn)

        // 1. Targeting check (acceptance rate)
        if (campaign.leads > 0) {
            const acceptanceRate = campaign.positiveReplies > 0
                ? (campaign.positiveReplies / campaign.leads) * 100
                : campaign.replyRate; // fallback

            if (acceptanceRate < 15) {
                totalScore -= 25;
                diagnostics.push({
                    category: "targeting",
                    severity: "critical",
                    title: "Low LinkedIn acceptance rate",
                    description: `Acceptance/engagement rate is very low. Your targeting or profile may need work.`,
                    recommendation: "Optimize your LinkedIn profile, refine ICP targeting, and personalize connection messages.",
                });
            } else if (acceptanceRate < BENCHMARKS.heyreach.acceptanceRate) {
                totalScore -= 12;
                diagnostics.push({
                    category: "targeting",
                    severity: "warning",
                    title: "Below-average acceptance rate",
                    description: `Engagement rate is below benchmark (${BENCHMARKS.heyreach.acceptanceRate}%).`,
                    recommendation: "Test different connection request messages and tighten your ICP filters.",
                });
            }
        }

        // 2. Messaging check (reply rate)
        if (campaign.replyRate < 5) {
            totalScore -= 25;
            diagnostics.push({
                category: "messaging",
                severity: "critical",
                title: "Very low LinkedIn reply rate",
                description: `Reply rate is ${campaign.replyRate}% (benchmark: ${BENCHMARKS.heyreach.replyRate}%).`,
                recommendation: "Shorten follow-up messages, lead with value, and avoid being salesy in the first message.",
            });
        } else if (campaign.replyRate < BENCHMARKS.heyreach.replyRate) {
            totalScore -= 10;
            diagnostics.push({
                category: "messaging",
                severity: "warning",
                title: "Reply rate below benchmark",
                description: `Reply rate is ${campaign.replyRate}% (benchmark: ${BENCHMARKS.heyreach.replyRate}%).`,
                recommendation: "Test conversational messaging, ask questions, and reference mutual connections.",
            });
        }

        // 3. Volume
        if (campaign.leads < 50 && campaign.status === "active") {
            totalScore -= 5;
            diagnostics.push({
                category: "volume",
                severity: "warning",
                title: "Low lead volume",
                description: `Only ${campaign.leads} leads in campaign.`,
                recommendation: "Add more leads from Sales Navigator or expand targeting criteria.",
            });
        }
    }

    // No issues found
    if (diagnostics.length === 0) {
        diagnostics.push({
            category: "general",
            severity: "healthy",
            title: "Campaign is performing well",
            description: "All metrics are at or above benchmark levels.",
            recommendation: "Consider scaling this campaign by increasing daily volume or duplicating into similar ICPs.",
        });
    }

    const score = Math.max(0, Math.min(100, totalScore));
    const level: HealthLevel = score >= 70 ? "healthy" : score >= 40 ? "warning" : "critical";

    return { score, level, diagnostics };
}

/** Get health level color classes */
export function getHealthClasses(level: HealthLevel): { bg: string; text: string; border: string } {
    switch (level) {
        case "healthy":
            return { bg: "bg-success/10", text: "text-success", border: "border-success/30" };
        case "warning":
            return { bg: "bg-warning/10", text: "text-warning", border: "border-warning/30" };
        case "critical":
            return { bg: "bg-danger/10", text: "text-danger", border: "border-danger/30" };
    }
}
