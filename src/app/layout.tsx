import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "@/styles/globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "BetGuard",
  description: "BetGuard all-in-one tool for finding your next VIP player",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("bg-background min-h-screen font-sans antialiased", inter.variable)}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
