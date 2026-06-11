import type { Metadata, Viewport } from "next";
import { Anton, Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const anton = Anton({
  weight: "400",
  variable: "--font-anton",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HOLMNS — Nawat Suangburanakul",
  description:
    "Nawat 'Holmes' Suangburanakul — software developer, photographer and videographer based in Thailand. Apps, applied AI, stills and motion.",
  openGraph: {
    title: "HOLMNS — Nawat Suangburanakul",
    description: "Software developer, photographer and videographer based in Thailand.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a09",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
