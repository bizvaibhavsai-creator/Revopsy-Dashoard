import type { Metadata } from "next";
import ThemeProvider from "@/components/shared/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Outbound Engine | B2B Cold Email Lead Generation",
  description:
    "Cold email strategy, targeting, infrastructure, and campaign management for B2B companies that need more qualified meetings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
