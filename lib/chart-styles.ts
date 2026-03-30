/** Shared Recharts tooltip content styles that adapt to the current theme via CSS variables */
export function getTooltipStyle(): React.CSSProperties {
    return {
        backgroundColor: "var(--tooltip-bg)",
        border: "none",
        borderRadius: "12px",
        color: "var(--tooltip-text)",
        fontSize: "12px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.12)",
        padding: "10px 14px",
    };
}

/** Shared tooltip item style to ensure text is visible in both themes */
export function getTooltipItemStyle(): React.CSSProperties {
    return {
        color: "var(--tooltip-text)",
        fontSize: "12px",
    };
}
