import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ReLoop — AI-Assisted E-Waste Tracking & Circular Guidance",
  description:
    "Identify, verify and route electronic waste with AI-assisted visual detection. Built on the official GIZ E-Waste Database.",
  keywords: [
    "e-waste",
    "recycling",
    "YOLO",
    "AI detection",
    "circular economy",
    "GIZ",
    "electronic waste",
  ],
  authors: [{ name: "ReLoop" }],
  openGraph: {
    title: "ReLoop — AI-Assisted E-Waste Tracking",
    description: "Identify, verify and route electronic waste with AI-assisted visual detection.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
