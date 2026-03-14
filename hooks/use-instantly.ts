"use client";

import useSWR from "swr";
import { useSettingsStore } from "@/lib/store";
import type { InstantlyApiResponse } from "@/types/dashboard";

const fetcher = async (url: string, apiKey: string): Promise<InstantlyApiResponse> => {
    const res = await fetch(url, {
        headers: { "X-Instantly-Key": apiKey },
    });
    if (!res.ok && res.status !== 502) {
        throw new Error(`Failed to fetch: ${res.status}`);
    }
    return res.json();
};

/**
 * SWR hook for Instantly.ai data.
 * Fetches from the proxy route, revalidates every 60 seconds.
 * Returns mock-fallback-friendly shape.
 */
export function useInstantly() {
    const apiKey = useSettingsStore((s) => s.apiKeys.instantly);
    const hasKey = Boolean(apiKey);

    const { data, error, isLoading, mutate } = useSWR(
        hasKey ? ["/api/instantly", apiKey] : null,
        ([url, key]) => fetcher(url, key),
        {
            refreshInterval: 60_000,
            revalidateOnFocus: false,
            dedupingInterval: 30_000,
        }
    );

    return {
        data: data ?? null,
        isLoading,
        error: error ?? (data?.error ? new Error(data.error) : null),
        isConfigured: hasKey && data?.configured === true,
        hasKey,
        mutate,
    };
}
