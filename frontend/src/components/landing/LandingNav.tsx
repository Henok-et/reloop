import Link from "next/link";

interface Props {
  current?: "about";
}

export default function LandingNav({ current }: Props) {
  return (
    <nav className="border-b border-landing-border px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link
          href="/"
          className="font-display text-sm font-bold uppercase tracking-[0.18em] text-landing-text"
        >
          ReLoop
        </Link>
        <div className="flex items-center gap-5 text-sm">
          <Link
            href="/about"
            aria-current={current === "about" ? "page" : undefined}
            className={
              current === "about"
                ? "text-landing-text"
                : "text-landing-dim transition-colors hover:text-landing-text"
            }
          >
            About
          </Link>
          <Link href="/scan" className="text-landing-dim transition-colors hover:text-landing-text">
            Scan station
          </Link>
        </div>
      </div>
    </nav>
  );
}
