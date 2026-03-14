/** Shared Recharts tooltip content styles that adapt to the current theme via CSS variables */
export function getTooltipStyle(): React.CSSProperties {
    return {
        backgroundColor: "var(--tooltip-bg)",
        border: "1px solid var(--tooltip-border)",
        borderRadius: "8px",
        color: "var(--tooltip-text)",
        fontSize: "12px",
        boxShadow: "0 4px 12px var(--card-shadow)",
    };
}

/** Shared tooltip item style to ensure text is visible in both themes */
export function getTooltipItemStyle(): React.CSSProperties {
    return {
        color: "var(--tooltip-text)",
        fontSize: "12px",
    };
}
