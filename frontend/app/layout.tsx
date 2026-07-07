import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: { default: "Lumora AI", template: "%s — Lumora AI" },
  description: "Next-generation AI workspace with RAG, real-time streaming, and document intelligence.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
        style={{ fontFamily: "var(--font-geist-sans), Inter, system-ui, sans-serif" }}>
        {children}
        <Toaster position="top-right" toastOptions={{
          style: {
            background: "rgba(10,5,20,0.95)",
            color: "rgba(255,255,255,0.87)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            fontSize: "13px",
            backdropFilter: "blur(20px)",
          },
          success: { iconTheme: { primary: "#34d399", secondary: "#020408" } },
          error: { iconTheme: { primary: "#f87171", secondary: "#020408" } },
        }} />
      </body>
    </html>
  );
}
