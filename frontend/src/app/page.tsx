"use client";

import { useStoredActiveLot } from "@/lib/lot";
import LandingNav from "@/components/landing/LandingNav";
import Hero from "@/components/landing/Hero";
import Purpose from "@/components/landing/Purpose";
import ScanEntry from "@/components/landing/ScanEntry";

export default function HomePage() {
  const storedLot = useStoredActiveLot();
  const activeLot = storedLot && storedLot.items.length > 0 ? storedLot : null;

  return (
    <main className="flex min-h-dvh flex-col bg-landing-bg font-plex text-landing-text">
      <LandingNav />
      <Hero />
      <Purpose />
      <ScanEntry activeLot={activeLot} />

      <footer className="mt-auto border-t border-landing-border px-6 py-5">
        <p className="mx-auto max-w-6xl font-plex-mono text-[11px] uppercase tracking-[0.16em] text-landing-faint">
          ReLoop · phase 1 prototype · seven classes
        </p>
      </footer>
    </main>
  );
}
