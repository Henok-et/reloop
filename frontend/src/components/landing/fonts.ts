import { IBM_Plex_Mono, IBM_Plex_Sans, Space_Grotesk } from "next/font/google";

/**
 * Landing-page fonts. The CSS variables are set on <html> so the Tailwind
 * theme can resolve them, but only the landing page uses the font-display,
 * font-plex, and font-plex-mono utilities. The station and About keep Inter.
 */
export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

export const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const landingFontClass = `${spaceGrotesk.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`;
