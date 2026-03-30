"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Settings,
    Zap,
    BarChart3,
    Target,
    Radio,
    X,
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
    const isOpen = !sidebarCollapsed;

    const managementItems = NAV_ITEMS.filter((item) => item.group === "management");
    const systemItems = NAV_ITEMS.filter((item) => item.group === "system");

    return (
        <>
            {/* Backdrop overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity"
                    onClick={toggleSidebar}
                    aria-hidden="true"
                />
            )}

            {/* Drawer panel */}
            <nav
                aria-label="Main navigation"
                className={cn(
                    "fixed left-0 top-0 z-50 flex h-screen w-72 flex-col bg-surface transition-transform duration-300 ease-in-out",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
                style={{ boxShadow: isOpen ? "4px 0 24px rgba(0,0,0,0.1)" : "none" }}
            >
                {/* Header — Logo + Close */}
                <div className="flex h-16 items-center justify-between px-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary font-bold text-white text-sm">
                            R
                        </div>
                        <span className="text-lg font-semibold tracking-tight text-text-primary">
                            RevOps
                        </span>
                    </div>
                    <button
                        onClick={toggleSidebar}
                        aria-label="Close navigation"
                        className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Management Links */}
                <div className="flex-1 overflow-y-auto px-4 py-4">
                    <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">
                        Management
                    </p>
                    <ul className="space-y-1" role="list">
                        {managementItems.map((item) => {
                            const isActive = item.href === "/dashboard"
                                ? pathname === "/dashboard"
                                : pathname === item.href || pathname.startsWith(item.href.split("#")[0]);
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={toggleSidebar}
                                        className={cn(
                                            "flex min-h-[2.75rem] items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-primary/10 text-primary"
                                                : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                                        )}
                                        aria-current={isActive ? "page" : undefined}
                                    >
                                        <span className="shrink-0">{item.icon}</span>
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="my-4 border-t border-border-subtle" />

                    <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">
                        System
                    </p>
                    <ul className="space-y-1" role="list">
                        {systemItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={toggleSidebar}
                                        className={cn(
                                            "flex min-h-[2.75rem] items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-primary/10 text-primary"
                                                : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                                        )}
                                        aria-current={isActive ? "page" : undefined}
                                    >
                                        <span className="shrink-0">{item.icon}</span>
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </nav>
        </>
    );
}
