"use client";

import Sidebar from "@/components/shared/Sidebar";
import Navbar from "@/components/shared/Navbar";
import { useSettingsStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { sidebarCollapsed } = useSettingsStore();

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div
                className={cn(
                    "flex flex-1 flex-col transition-all duration-300",
                    sidebarCollapsed ? "ml-16" : "ml-60"
                )}
            >
                <Navbar />
                <main className="flex-1 px-6 py-6">{children}</main>
            </div>
        </div>
    );
}
