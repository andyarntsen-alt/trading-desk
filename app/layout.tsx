import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trading Desk – Free Trading Journal",
  description: "Free trading journal with daily prep, checklist, analytics, and cloud sync. Built for disciplined traders.",
  icons: {
    icon: [
      { url: "/brand/tradingdesk-icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/tradingdesk-icon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/brand/tradingdesk-icon-180.png", sizes: "180x180", type: "image/png" },
      { url: "/brand/tradingdesk-icon-152.png", sizes: "152x152", type: "image/png" },
      { url: "/brand/tradingdesk-icon-167.png", sizes: "167x167", type: "image/png" },
    ],
    shortcut: "/brand/favicon.ico",
  },
  themeColor: "#10b981",
  openGraph: {
    type: "website",
    url: "https://trading-desk-ebon.vercel.app/",
    title: "Trading Desk – Free Trading Journal",
    description: "Free trading journal with daily prep, checklist, analytics, and cloud sync. Built for disciplined traders.",
    images: [
      {
        url: "https://trading-desk-ebon.vercel.app/brand/tradingdesk-lockup.png",
        width: 1200,
        height: 630,
        alt: "Trading Desk",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trading Desk – Free Trading Journal",
    description: "Free trading journal with daily prep, checklist, analytics, and cloud sync.",
    images: ["https://trading-desk-ebon.vercel.app/brand/tradingdesk-lockup.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
