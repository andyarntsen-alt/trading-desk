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
  title: "Trading Desk – Day Trading Journal",
  description: "Your complete trading journal – Daily prep, checklist, Monte Carlo and analysis in one place",
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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Trading Desk",
  },
  themeColor: "#10b981",
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
