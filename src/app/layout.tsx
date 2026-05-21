import type { Metadata, Viewport } from "next";
import { ToastProvider } from "@/providers/toast-provider";
import { getSiteUrl } from "@/lib/env.server";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#030712",
};

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ArchFlow AI — Design Production-Grade Systems with AI",
    template: "%s | ArchFlow AI",
  },
  description:
    "Transform your project ideas into complete system design blueprints — architecture, database, APIs, security, and deployment plans.",
  applicationName: "ArchFlow AI",
  keywords: [
    "system design",
    "architecture",
    "AI",
    "blueprint",
    "Supabase",
    "Next.js",
  ],
  authors: [{ name: "ArchFlow AI" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "ArchFlow AI",
    title: "ArchFlow AI — Design Production-Grade Systems with AI",
    description:
      "AI-powered system design studio with architecture blueprints, visual diagrams, and engineering intelligence.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ArchFlow AI",
    description:
      "AI-powered system design blueprints and visual architecture studio.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark antialiased">
      <body className="page-shell min-h-screen-safe bg-background font-sans text-foreground">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
