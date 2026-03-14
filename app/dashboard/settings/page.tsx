"use client";

import { useState, useCallback } from "react";
import { Save, ArrowLeft, DollarSign, Mail, Linkedin, Key, CheckCircle2, XCircle, Loader2, AlertTriangle, Eye, EyeOff, Trash2, Bell, Target } from "lucide-react";
import Link from "next/link";
import { useSettingsStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

type ConnectionStatus = "idle" | "testing" | "success" | "error";

function ApiKeyInput({
    platform,
    label,
    icon,
    iconBg,
    iconText,
}: {
    platform: "instantly" | "heyreach";
    label: string;
    icon: React.ReactNode;
    iconBg: string;
    iconText: string;
}) {
    const { apiKeys, setApiKey, clearApiKey } = useSettingsStore();
    const currentKey = apiKeys[platform];
    const [inputValue, setInputValue] = useState(currentKey);
    const [showKey, setShowKey] = useState(false);
    const [status, setStatus] = useState<ConnectionStatus>(currentKey ? "success" : "idle");
    const [errorMsg, setErrorMsg] = useState("");

    const handleTestConnection = useCallback(async () => {
        if (!inputValue.trim()) return;
        setStatus("testing");
        setErrorMsg("");

        try {
            const res = await fetch("/api/validate-key", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ platform, apiKey: inputValue.trim() }),
            });
            const data = await res.json();
            if (data.valid) {
                setStatus("success");
                setApiKey(platform, inputValue.trim());
            } else {
                setStatus("error");
                setErrorMsg(data.error || "Invalid API key");
            }
        } catch {
            setStatus("error");
            setErrorMsg("Connection failed. Please try again.");
        }
    }, [inputValue, platform, setApiKey]);

    const handleClear = () => {
        clearApiKey(platform);
        setInputValue("");
        setStatus("idle");
        setErrorMsg("");
    };

    return (
        <div className="rounded-lg border border-border-subtle bg-background/50 p-4">
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", iconBg, iconText)}>
                        {icon}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-text-primary">{label}</p>
                        <p className="text-xs text-text-muted">
                            {platform === "instantly" ? "Bearer Token Auth" : "X-API-KEY Header"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {status === "success" && currentKey && (
                        <span className="flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                            <CheckCircle2 size={12} /> Connected
                        </span>
                    )}
                    {status === "error" && (
                        <span className="flex items-center gap-1 rounded-full bg-danger/10 px-2.5 py-1 text-xs font-medium text-danger">
                            <XCircle size={12} /> Error
                        </span>
                    )}
                    {status === "testing" && (
                        <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                            <Loader2 size={12} className="animate-spin" /> Testing
                        </span>
                    )}
                    {status === "idle" && !currentKey && (
                        <span className="flex items-center gap-1 rounded-full bg-text-muted/10 px-2.5 py-1 text-xs font-medium text-text-muted">
                            Not configured
                        </span>
                    )}
                </div>
            </div>

            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                        type={showKey ? "text" : "password"}
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            if (status === "error") setStatus("idle");
                        }}
                        placeholder={`Enter your ${label} API key`}
                        className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-10 text-sm text-text-primary placeholder:text-text-muted/50 transition-colors focus:border-primary focus:outline-none"
                    />
                    <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text-primary"
                        aria-label={showKey ? "Hide API key" : "Show API key"}
                    >
                        {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                </div>
                <button
                    onClick={handleTestConnection}
                    disabled={!inputValue.trim() || status === "testing"}
                    className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary/10 px-4 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {status === "testing" ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                    Test & Save
                </button>
                {currentKey && (
                    <button
                        onClick={handleClear}
                        className="inline-flex h-10 items-center gap-1 rounded-lg bg-danger/10 px-3 text-xs font-semibold text-danger transition-colors hover:bg-danger/20"
                        aria-label="Remove API key"
                    >
                        <Trash2 size={12} />
                    </button>
                )}
            </div>

            {errorMsg && (
                <p className="mt-2 flex items-center gap-1 text-xs text-danger">
                    <AlertTriangle size={12} /> {errorMsg}
                </p>
            )}
            {status === "success" && currentKey && (
                <p className="mt-2 text-xs text-success">
                    ✓ API key saved. Dashboard will reload with real data.
                </p>
            )}
        </div>
    );
}

export default function SettingsPage() {
    const { channelSpend, setChannelSpend, alertEmail, setAlertEmail, weeklyMeetingTarget, setWeeklyMeetingTarget } = useSettingsStore();
    const [instantlySpend, setInstantlySpend] = useState(channelSpend.instantly.toString());
    const [heyreachSpend, setHeyreachSpend] = useState(channelSpend.heyreach.toString());
    const [emailInput, setEmailInput] = useState(alertEmail);
    const [targetInput, setTargetInput] = useState(weeklyMeetingTarget.toString());
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        const instantly = parseFloat(instantlySpend) || 0;
        const heyreach = parseFloat(heyreachSpend) || 0;
        setChannelSpend({ instantly, heyreach });
        setAlertEmail(emailInput.trim());
        setWeeklyMeetingTarget(parseInt(targetInput) || 20);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
                <p className="mt-1 text-sm text-text-muted">
                    Connect your platforms, configure alerts, and set dashboard targets.
                </p>
            </div>

            {/* API Integrations */}
            <div className="rounded-xl border border-border bg-surface p-6">
                <div className="mb-1 flex items-center gap-2">
                    <Key size={18} className="text-primary" />
                    <h2 className="text-base font-semibold text-text-primary">API Integrations</h2>
                </div>
                <p className="mb-6 text-xs text-text-muted">
                    Connect your outbound platforms to pull real-time analytics. After saving a valid key, the dashboard will automatically load live data.
                </p>
                <div className="space-y-4">
                    <ApiKeyInput
                        platform="instantly"
                        label="Instantly.ai"
                        icon={<Mail size={16} />}
                        iconBg="bg-instantly/15"
                        iconText="text-instantly"
                    />
                    <ApiKeyInput
                        platform="heyreach"
                        label="HeyReach"
                        icon={<Linkedin size={16} />}
                        iconBg="bg-heyreach/15"
                        iconText="text-heyreach"
                    />
                </div>
            </div>

            {/* Alert Notifications */}
            <div className="rounded-xl border border-border bg-surface p-6">
                <div className="mb-1 flex items-center gap-2">
                    <Bell size={18} className="text-primary" />
                    <h2 className="text-base font-semibold text-text-primary">Alert Notifications</h2>
                </div>
                <p className="mb-6 text-xs text-text-muted">
                    Receive email alerts when campaigns drop in performance, reply rates change, or systems go offline.
                </p>
                <div>
                    <label htmlFor="alert-email" className="mb-2 block text-sm font-medium text-text-secondary">
                        Alert Email Address
                    </label>
                    <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                            id="alert-email"
                            type="email"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            placeholder="you@company.com"
                            className="h-12 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm text-text-primary transition-colors focus:border-primary focus:outline-none"
                        />
                    </div>
                    <p className="mt-1 text-xs text-text-muted">
                        {alertEmail ? `Alerts will be sent to: ${alertEmail}` : "No email configured. In-app alerts only."}
                    </p>
                </div>
            </div>

            {/* Goals & Targets */}
            <div className="rounded-xl border border-border bg-surface p-6">
                <div className="mb-1 flex items-center gap-2">
                    <Target size={18} className="text-primary" />
                    <h2 className="text-base font-semibold text-text-primary">Goals & Targets</h2>
                </div>
                <p className="mb-6 text-xs text-text-muted">
                    Set your weekly meeting target for pacing and forecasting calculations.
                </p>
                <div>
                    <label htmlFor="weekly-target" className="mb-2 block text-sm font-medium text-text-secondary">
                        Weekly Meeting Target
                    </label>
                    <input
                        id="weekly-target"
                        type="number"
                        min="1"
                        value={targetInput}
                        onChange={(e) => setTargetInput(e.target.value)}
                        className="h-12 w-full rounded-lg border border-border bg-background px-4 text-sm text-text-primary transition-colors focus:border-primary focus:outline-none"
                        placeholder="20"
                    />
                    <p className="mt-1 text-xs text-text-muted">
                        Current target: {weeklyMeetingTarget} meetings / week
                    </p>
                </div>
            </div>

            {/* Channel Spend */}
            <div className="rounded-xl border border-border bg-surface p-6">
                <h2 className="mb-1 text-base font-semibold text-text-primary">Channel Spend</h2>
                <p className="mb-6 text-xs text-text-muted">
                    Enter your monthly spend for each outbound channel. Used for cost per meeting and ROI calculations.
                </p>
                <div className="space-y-5">
                    <div>
                        <label htmlFor="instantly-spend" className="mb-2 flex items-center gap-2 text-sm font-medium text-text-secondary">
                            <div className="flex h-6 w-6 items-center justify-center rounded bg-instantly/15 text-instantly"><Mail size={14} /></div>
                            Instantly.ai — Monthly Spend
                        </label>
                        <div className="relative">
                            <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                            <input
                                id="instantly-spend"
                                type="number"
                                min="0"
                                step="50"
                                value={instantlySpend}
                                onChange={(e) => setInstantlySpend(e.target.value)}
                                className="h-12 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm text-text-primary transition-colors focus:border-primary focus:outline-none"
                                placeholder="500"
                            />
                        </div>
                        <p className="mt-1 text-xs text-text-muted">Current: {formatCurrency(channelSpend.instantly)} / month</p>
                    </div>
                    <div>
                        <label htmlFor="heyreach-spend" className="mb-2 flex items-center gap-2 text-sm font-medium text-text-secondary">
                            <div className="flex h-6 w-6 items-center justify-center rounded bg-heyreach/15 text-heyreach"><Linkedin size={14} /></div>
                            HeyReach — Monthly Spend
                        </label>
                        <div className="relative">
                            <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                            <input
                                id="heyreach-spend"
                                type="number"
                                min="0"
                                step="50"
                                value={heyreachSpend}
                                onChange={(e) => setHeyreachSpend(e.target.value)}
                                className="h-12 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm text-text-primary transition-colors focus:border-primary focus:outline-none"
                                placeholder="300"
                            />
                        </div>
                        <p className="mt-1 text-xs text-text-muted">Current: {formatCurrency(channelSpend.heyreach)} / month</p>
                    </div>
                </div>

                <div className="mt-6 flex items-center gap-3">
                    <button
                        onClick={handleSave}
                        className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
                    >
                        <Save size={16} /> Save All Settings
                    </button>
                    {saved && (
                        <span className="text-sm font-medium text-success animate-fade-in">✓ Saved successfully</span>
                    )}
                </div>
            </div>

            {/* Where to find API keys */}
            <div className="rounded-xl border border-border-subtle bg-surface/50 p-5">
                <h3 className="mb-2 text-sm font-semibold text-text-primary">Where to Find Your API Keys</h3>
                <ul className="space-y-2 text-xs text-text-muted">
                    <li className="flex items-start gap-2">
                        <Mail size={14} className="mt-0.5 shrink-0 text-instantly" />
                        <span>
                            <strong className="text-text-secondary">Instantly.ai:</strong>{" "}
                            <a href="https://app.instantly.ai/app/settings/integrations" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary-hover">
                                Settings → Integrations → API
                            </a>
                        </span>
                    </li>
                    <li className="flex items-start gap-2">
                        <Linkedin size={14} className="mt-0.5 shrink-0 text-heyreach" />
                        <span>
                            <strong className="text-text-secondary">HeyReach:</strong>{" "}
                            <a href="https://app.heyreach.io/settings" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary-hover">
                                Settings → API
                            </a>
                        </span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
