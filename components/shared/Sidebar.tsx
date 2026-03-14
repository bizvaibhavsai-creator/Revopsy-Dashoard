"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Settings,
    ChevronLeft,
    ChevronRight,
    Zap,
    BarChart3,
    Target,
    Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/lib/store";

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    group: "management" | "system";
}

const NAV_ITEMS: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} />, group: "management" },
    { label: "Command Center", href: "/dashboard/command-center", icon: <Radio size={20} />, group: "management" },
    { label: "Analytics", href: "/dashboard#analytics", icon: <BarChart3 size={20} />, group: "management" },
    { label: "Campaigns", href: "/dashboard#campaigns", icon: <Target size={20} />, group: "management" },
    { label: "Integrations", href: "/dashboard#integrations", icon: <Zap size={20} />, group: "system" },
    { label: "Settings", href: "/dashboard/settings", icon: <Settings size={20} />, group: "system" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { sidebarCollapsed, toggleSidebar } = useSettingsStore();

    const managementItems = NAV_ITEMS.filter((item) => item.group === "management");
    const systemItems = NAV_ITEMS.filter((item) => item.group === "system");

    return (
        <nav
            aria-label="Main navigation"
            className={cn(
                "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-surface transition-all duration-300",
                sidebarCollapsed ? "w-16" : "w-60"
            )}
        >
            {/* Logo */}
            <div className="flex h-16 items-center border-b border-border px-4">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary font-bold text-white">
                        R
                    </div>
                    {!sidebarCollapsed && (
                        <span className="whitespace-nowrap text-lg font-semibold tracking-tight text-text-primary">
                            RevOps
                        </span>
                    )}
                </div>
            </div>

            {/* Management Links */}
            <div className="flex-1 overflow-y-auto px-3 py-4">
                {!sidebarCollapsed && (
                    <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-text-muted">
                        Management
                    </p>
                )}
                <ul className="space-y-1" role="list">
                    {managementItems.map((item) => {
                        const isActive = item.href === "/dashboard"
                            ? pathname === "/dashboard"
                            : pathname === item.href || pathname.startsWith(item.href.split("#")[0]);
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex min-h-[2.75rem] items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary/10 text-primary border-l-2 border-primary"
                                            : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                                    )}
                                    aria-current={isActive ? "page" : undefined}
                                    title={sidebarCollapsed ? item.label : undefined}
                                >
                                    <span className="shrink-0">{item.icon}</span>
                                    {!sidebarCollapsed && <span>{item.label}</span>}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                <div className="my-4 border-t border-border-subtle" />

                {!sidebarCollapsed && (
                    <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-text-muted">
                        System
                    </p>
                )}
                <ul className="space-y-1" role="list">
                    {systemItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex min-h-[2.75rem] items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary/10 text-primary border-l-2 border-primary"
                                            : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                                    )}
                                    aria-current={isActive ? "page" : undefined}
                                    title={sidebarCollapsed ? item.label : undefined}
                                >
                                    <span className="shrink-0">{item.icon}</span>
                                    {!sidebarCollapsed && <span>{item.label}</span>}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Collapse Toggle */}
            <div className="border-t border-border p-3">
                <button
                    onClick={toggleSidebar}
                    aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    className="flex min-h-[2.75rem] w-full items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
                >
                    {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>
        </nav>
    );
}
