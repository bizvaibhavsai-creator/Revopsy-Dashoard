"use client";

import { Search, Bell, User, Sun, Moon, Menu } from "lucide-react";
import { useMemo, useState } from "react";
import { useSettingsStore } from "@/lib/store";
import { getCampaigns } from "@/lib/mock-data";
import { generateAlerts, formatRelativeTime } from "@/lib/anomaly-detection";
import { useInstantly } from "@/hooks/use-instantly";
import { useHeyReach } from "@/hooks/use-heyreach";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Campaign } from "@/types/dashboard";

export default function Navbar() {
    const { theme, toggleTheme, toggleSidebar } = useSettingsStore();
    const [showAlerts, setShowAlerts] = useState(false);

    const { data: iData, isConfigured: iConn } = useInstantly();
    const { data: hData, isConfigured: hConn } = useHeyReach();

    // Generate alerts for notification bell
    const alerts = useMemo(() => {
        let campaigns: Campaign[];
        if (!iConn && !hConn) {
            campaigns = getCampaigns();
        } else {
            campaigns = [];
            if (iConn && iData?.campaigns) {
                for (const c of iData.campaigns) {
                    campaigns.push({
                        id: c.id, name: c.name, platform: "instantly",
                        leads: 0, replyRate: 0, positiveReplies: 0, meetingsBooked: 0,
                        status: c.status === 1 ? "active" : c.status === 2 ? "paused" : "completed",
                        lastUpdated: "—",
                    });
                }
            }
            if (hConn && hData?.campaigns) {
                for (const c of hData.campaigns) {
                    const stats = c.stats;
                    const totalSent = (stats?.connectionRequestsSent ?? 0) + (stats?.messagesSent ?? 0);
                    const totalReplies = stats?.messagesReceived ?? 0;
                    campaigns.push({
                        id: String(c.id), name: c.name, platform: "heyreach",
                        leads: stats?.connectionRequestsSent ?? 0,
                        replyRate: totalSent > 0 ? +((totalReplies / totalSent) * 100).toFixed(1) : 0,
                        positiveReplies: totalReplies, meetingsBooked: 0,
                        status: (c.status?.toLowerCase() as "active" | "paused" | "completed") || "active",
                        lastUpdated: "—",
                    });
                }
            }
        }
        return generateAlerts(campaigns, { instantly: iConn, heyreach: hConn });
    }, [iData, hData, iConn, hConn]);

    const unreadCount = alerts.filter((a) => !a.read).length;
    const criticalCount = alerts.filter((a) => a.severity === "critical" && !a.read).length;

    return (
        <header
            className="sticky top-0 z-30 flex h-16 items-center justify-between bg-surface/95 px-6 sm:px-8 backdrop-blur-xl"
            style={{ boxShadow: "var(--nav-shadow)" }}
        >
            {/* Left — Hamburger + Logo + Product Name */}
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    aria-label="Open navigation"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
                >
                    <Menu size={20} />
                </button>
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary font-bold text-white text-sm">
                        R
                    </div>
                    <div className="hidden sm:block">
                        <span className="text-base font-semibold text-text-primary">RevOps</span>
                        <span className="ml-1.5 text-sm font-normal text-text-muted">Dashboard</span>
                    </div>
                </Link>
            </div>

            {/* Right — Search, Theme, Notifications, Profile */}
            <div className="flex items-center gap-2">
                {/* Search */}
                <button
                    aria-label="Search (Cmd+K)"
                    className="flex h-10 items-center gap-2 rounded-full bg-surface-hover/60 px-4 text-sm text-text-muted transition-colors hover:bg-surface-hover hover:text-text-secondary"
                >
                    <Search size={15} />
                    <span className="hidden md:inline">Search...</span>
                    <kbd className="ml-1 hidden rounded-md bg-surface-active/60 px-1.5 py-0.5 text-[10px] text-text-muted md:inline">
                        ⌘K
                    </kbd>
                </button>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
                    className="relative flex h-10 w-10 items-center justify-center rounded-full text-text-muted transition-all hover:bg-surface-hover hover:text-text-primary"
                >
                    <Sun
                        size={18}
                        className={`absolute transition-all duration-300 ${theme === "light"
                                ? "rotate-0 scale-100 opacity-100"
                                : "rotate-90 scale-0 opacity-0"
                            }`}
                    />
                    <Moon
                        size={18}
                        className={`absolute transition-all duration-300 ${theme === "dark"
                                ? "rotate-0 scale-100 opacity-100"
                                : "-rotate-90 scale-0 opacity-0"
                            }`}
                    />
                </button>

                {/* Notifications Bell */}
                <div className="relative">
                    <button
                        onClick={() => setShowAlerts(!showAlerts)}
                        aria-label="View notifications"
                        className="relative flex h-10 w-10 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
                    >
                        <Bell size={18} />
                        {unreadCount > 0 && (
                            <span className={cn(
                                "absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white",
                                criticalCount > 0 ? "bg-danger" : "bg-primary"
                            )}>
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Dropdown */}
                    {showAlerts && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowAlerts(false)} />
                            <div
                                className="absolute right-0 top-12 z-50 w-80 rounded-2xl bg-surface"
                                style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.15)" }}
                            >
                                <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
                                    <p className="text-sm font-semibold text-text-primary">Notifications</p>
                                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                                        {unreadCount} new
                                    </span>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {alerts.slice(0, 8).map((alert) => (
                                        <div
                                            key={alert.id}
                                            className={cn(
                                                "flex items-start gap-2.5 border-b border-border-subtle px-4 py-3 transition-colors hover:bg-surface-hover/50",
                                                !alert.read && "bg-primary/5"
                                            )}
                                        >
                                            <span className="mt-0.5 text-sm">
                                                {alert.severity === "critical" ? "🔴" : alert.severity === "warning" ? "🟡" : "🟢"}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-text-primary">{alert.title}</p>
                                                <p className="mt-0.5 text-[11px] text-text-muted line-clamp-2">{alert.message}</p>
                                            </div>
                                            <span className="shrink-0 text-[10px] text-text-muted">{formatRelativeTime(alert.timestamp)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-border-subtle p-2">
                                    <Link
                                        href="/dashboard/command-center"
                                        onClick={() => setShowAlerts(false)}
                                        className="flex items-center justify-center rounded-xl px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                                    >
                                        View all in Command Center →
                                    </Link>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* User Profile */}
                <button
                    aria-label="User menu"
                    className="flex h-10 items-center gap-2 rounded-full px-2 text-text-secondary transition-colors hover:bg-surface-hover"
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                        <User size={16} />
                    </div>
                    <span className="hidden text-sm font-medium md:inline">Admin</span>
                </button>
            </div>
        </header>
    );
}
