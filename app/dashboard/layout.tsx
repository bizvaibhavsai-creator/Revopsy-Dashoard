"use client";

import Sidebar from "@/components/shared/Sidebar";
import Navbar from "@/components/shared/Navbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <Sidebar />
            <main className="mx-auto max-w-[1400px] px-6 sm:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
