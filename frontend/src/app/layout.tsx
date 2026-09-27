import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { landingFontClass } from "@/components/landing/fonts";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ReLoop — E-waste station",
  description:
    "A camera proposes one of seven appliance classes, a worker confirms, corrects, or rejects it, and confirmed items build a lot with counts by handling group. Trained on public e-waste image sets.",
  keywords: ["e-waste", "recycling", "YOLO", "object detection", "circular economy", "electronic waste", "Ghana"],
  authors: [{ name: "ReLoop" }],
  openGraph: {
    title: "ReLoop — Every appliance gets a second opinion",
    description:
      "A camera proposes, a worker decides, and a closed lot gives counts of refrigerant equipment and electronics.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${landingFontClass}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
