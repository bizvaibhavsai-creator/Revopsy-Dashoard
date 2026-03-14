"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/lib/store";

/**
 * Syncs the Zustand `theme` state to the `data-theme` attribute on <html>.
 * Renders nothing — purely a side-effect component.
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const theme = useSettingsStore((s) => s.theme);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    return <>{children}</>;
}
