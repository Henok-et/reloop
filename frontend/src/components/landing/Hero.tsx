import ClassDiagram from "./ClassDiagram";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden px-6 pt-14 pb-16 md:pt-20 md:pb-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Image
          src="/recycle-mark.png"
          alt=""
          width={800}
          height={800}
          priority
          className="absolute top-1/2 right-[-8%] h-[130%] w-auto max-w-none -translate-y-1/2 opacity-85 md:right-[6%] md:h-[150%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(243,246,242,0.97)_0%,rgba(243,246,242,0.85)_38%,rgba(243,246,242,0.15)_68%,rgba(243,246,242,0)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-landing-bg" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-6xl gap-12 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-center">
        <div>
          <p className="font-plex-mono text-[11px] uppercase tracking-[0.2em] text-landing-faint">
            E-waste station · phase 1
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight text-landing-text sm:text-5xl md:text-[3.4rem]">
            Every appliance gets a second opinion.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-landing-dim md:text-lg">
            ReLoop is a station for collection-point workers. A camera proposes what an item is, from real
            scrapyard photos. The worker confirms, corrects, or rejects it. Nothing is counted until a person
            says so.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#station"
              className="inline-flex items-center justify-center rounded-lg bg-reloop-green px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-reloop-green-light"
            >
              Open the station
            </a>
            <a
              href="#purpose"
              className="inline-flex items-center justify-center rounded-lg border border-landing-border-strong px-6 py-3 text-sm font-medium text-landing-text transition-colors hover:border-landing-dim hover:bg-landing-panel"
            >
              Why it works this way
            </a>
          </div>
        </div>

        <ClassDiagram />
      </div>
    </section>
  );
}
