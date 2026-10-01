import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { ToastProvider } from "@/context/ToastContext";

export const metadata: Metadata = {
  title: "TrackPoint — Fleet Dispatch & GPS Tracking Platform",
  description: "A configured cloud platform for NorthLine Freight & Logistics (NT) featuring live GPS tracking, automated dispatch, digital e-POD, and automated invoicing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
