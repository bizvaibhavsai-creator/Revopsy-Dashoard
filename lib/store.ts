"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TimeRange, ChannelSpend, ViewMode } from "@/types/dashboard";
import { DEFAULT_CHANNEL_SPEND } from "@/lib/constants";

export type Theme = "dark" | "light";

interface ApiKeys {
    instantly: string;
    heyreach: string;
}

interface DashboardState {
    timeRange: TimeRange;
    setTimeRange: (range: TimeRange) => void;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
}

interface SettingsState {
    channelSpend: ChannelSpend;
    setChannelSpend: (spend: Partial<ChannelSpend>) => void;
    sidebarCollapsed: boolean;
    toggleSidebar: () => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    apiKeys: ApiKeys;
    setApiKey: (platform: "instantly" | "heyreach", key: string) => void;
    clearApiKey: (platform: "instantly" | "heyreach") => void;
    alertEmail: string;
    setAlertEmail: (email: string) => void;
    weeklyMeetingTarget: number;
    setWeeklyMeetingTarget: (target: number) => void;
}

/** Dashboard state — selected time range + view mode */
export const useDashboardStore = create<DashboardState>((set) => ({
    timeRange: "30d",
    setTimeRange: (range) => set({ timeRange: range }),
    viewMode: "operator",
    setViewMode: (mode) => set({ viewMode: mode }),
}));

/** Settings state — persisted to localStorage */
export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            channelSpend: { ...DEFAULT_CHANNEL_SPEND },
            setChannelSpend: (spend) =>
                set((state) => ({
                    channelSpend: { ...state.channelSpend, ...spend },
                })),
            sidebarCollapsed: false,
            toggleSidebar: () =>
                set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
            theme: "dark" as Theme,
            setTheme: (theme) => set({ theme }),
            toggleTheme: () =>
                set((state) => ({
                    theme: state.theme === "dark" ? "light" : "dark",
                })),
            apiKeys: { instantly: "", heyreach: "" },
            setApiKey: (platform, key) =>
                set((state) => ({
                    apiKeys: { ...state.apiKeys, [platform]: key },
                })),
            clearApiKey: (platform) =>
                set((state) => ({
                    apiKeys: { ...state.apiKeys, [platform]: "" },
                })),
            alertEmail: "",
            setAlertEmail: (email) => set({ alertEmail: email }),
            weeklyMeetingTarget: 20,
            setWeeklyMeetingTarget: (target) => set({ weeklyMeetingTarget: target }),
        }),
        {
            name: "revops-settings",
        }
    )
);

