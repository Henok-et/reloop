import Link from "next/link";
import {
  CLASS_HANDLING_GROUP,
  CLASS_LABELS,
  GIZ_CLASSES,
  HANDLING_GROUPS,
  WORKFLOW_STEPS,
} from "@/lib/constants";
import LandingNav from "@/components/landing/LandingNav";
import ApplianceIcon from "@/components/landing/ApplianceIcon";

const STEP_COPY = {
  capture:
    "The camera opens, or a photo is chosen from the device. The seven classes are listed under the frame, coloured by handling group.",
  identify:
    "The photo is sent to the detector. The photo stays on screen with a timer, and the request can be cancelled. On the free host the first request after idle can take about a minute.",
  verify:
    "Each box is a proposal: Confirm, Wrong class, or Not this. Before that, three on-device checks warn about blur, bad light, or a small image. They never block the upload.",
  guide:
    "Handling notes for that class appear on the card as soon as the item is confirmed or corrected. Rejected items show that they will not be recorded.",
  lot:
    "Next photo adds the decided items and returns to capture. Close lot shows counts by class and by handling group, and downloads the CSV.",
} as const;

const CSV_COLUMNS: { name: string; meaning: string }[] = [
  { name: "lot_id", meaning: "The lot this item belongs to." },
  { name: "item_id", meaning: "One recorded item." },
  { name: "class", meaning: "The class the worker accepted." },
  { name: "handling_group", meaning: "refrigerant or electronics." },
  { name: "source", meaning: "ai_confirmed, ai_corrected, or manual." },
  { name: "detected_class", meaning: "What the model proposed, when it proposed something." },
  { name: "confidence", meaning: "The model's score as a whole-number percent. Empty when the item was added by hand." },
  { name: "photo_index", meaning: "Which photo in the lot the item came from." },
  { name: "recorded_at", meaning: "When the worker's decision was saved." },
  { name: "worker", meaning: "Reserved. This prototype does not ask for a name, so the cell is empty." },
  { name: "site", meaning: "Reserved. This prototype does not ask for a site, so the cell is empty." },
];

const OBSERVATIONS = [
  "A fridge photo was proposed as an air conditioner at 57%. Correcting it to fridge put the item in the refrigerant group and showed the upright-handling note on that card.",
  "A photo of a person's face was proposed as a compressor, once at about 61% and once at about 70%. \u201cNot this\u201d dropped it. Nothing was recorded.",
  "A blank frame was flagged as blurry before upload, returned no detection, and was recorded only after a class was chosen by hand.",
  "The sample photo of stacked air conditioners at a repair shop returned eight proposals: seven between 96% and 100%, and one at 62% marked \u201ccheck closely.\u201d Each still needed a Confirm before it counted.",
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="font-plex-mono text-[11px] uppercase tracking-[0.2em] text-landing-faint">{children}</h2>;
}

export default function AboutPage() {
  const refrigerant = GIZ_CLASSES.filter((name) => CLASS_HANDLING_GROUP[name] === "refrigerant");
  const electronics = GIZ_CLASSES.filter((name) => CLASS_HANDLING_GROUP[name] === "electronics");

  return (
    <main className="flex min-h-dvh flex-col bg-landing-bg font-plex text-landing-text">
      <LandingNav current="about" />

      <article className="mx-auto w-full max-w-3xl flex-1 px-6 py-14 md:py-20">
        <p className="font-plex-mono text-[11px] uppercase tracking-[0.2em] text-landing-faint">About this prototype</p>
        <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight md:text-5xl">
          A worker decides. The lot is the record.
        </h1>
        <p className="mt-6 text-base leading-relaxed text-landing-dim md:text-lg">
          ReLoop is a station for electronic waste. A camera proposes one of seven classes. The person at the
          station confirms, corrects, or rejects that proposal. Confirmed items build into a lot. Closing the lot
          produces a count of refrigerant equipment and electronics, plus a CSV.
        </p>

        <section className="mt-14">
          <SectionLabel>How a lot is built</SectionLabel>
          <ol className="mt-6 space-y-5">
            {WORKFLOW_STEPS.map((step, index) => (
              <li key={step.key} className="grid grid-cols-[2rem_1fr] gap-3">
                <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-landing-border-strong font-plex-mono text-[11px] text-landing-dim">
                  {index + 1}
                </span>
                <div>
                  <p className="font-display text-base font-medium">{step.label}</p>
                  <p className="mt-1 text-sm leading-relaxed text-landing-dim">{STEP_COPY[step.key]}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14">
          <SectionLabel>The data and the model</SectionLabel>
          <div className="mt-5 space-y-3 text-sm leading-relaxed text-landing-dim md:text-base">
            <p>
              The weights in this prototype were trained in a Kaggle notebook. Training used two datasets published
              on Hugging Face, and a further collection of more than 4,000 images. Those extra images were unlabeled
              when they were gathered.
            </p>
            <p>
              The model that ships here is a small YOLO detector. It can name seven classes and nothing else. Mixed
              scrap is not one of them. It draws a box and a score.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <SectionLabel>Seven classes, two groups</SectionLabel>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-landing-border bg-landing-panel p-5">
              <span className="inline-flex rounded-full bg-landing-blue-tag px-2.5 py-1 font-plex-mono text-[10px] font-medium uppercase tracking-[0.16em] text-landing-blue-tag-text">
                {HANDLING_GROUPS.refrigerant.short}
              </span>
              <p className="mt-3 text-sm leading-relaxed text-landing-dim">
                {HANDLING_GROUPS.refrigerant.sortInstruction}
              </p>
              <ul className="mt-4 space-y-2">
                {refrigerant.map((name) => (
                  <li key={name} className="flex items-center gap-2.5 text-sm">
                    <ApplianceIcon name={name} className="h-5 w-5 text-landing-blue" />
                    {CLASS_LABELS[name]}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-landing-border bg-landing-panel p-5">
              <span className="inline-flex rounded-full bg-landing-green-tag px-2.5 py-1 font-plex-mono text-[10px] font-medium uppercase tracking-[0.16em] text-landing-green-tag-text">
                {HANDLING_GROUPS.electronics.short}
              </span>
              <p className="mt-3 text-sm leading-relaxed text-landing-dim">
                {HANDLING_GROUPS.electronics.sortInstruction}
              </p>
              <ul className="mt-4 space-y-2">
                {electronics.map((name) => (
                  <li key={name} className="flex items-center gap-2.5 text-sm">
                    <ApplianceIcon name={name} className="h-5 w-5 text-landing-green" />
                    {CLASS_LABELS[name]}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <SectionLabel>What a score means</SectionLabel>
          <div className="mt-5 space-y-3 text-sm leading-relaxed text-landing-dim md:text-base">
            <p>
              The service returns a box only when the score is 50% or higher. A score under 70% is marked
              &ldquo;check closely&rdquo; so the worker looks again before confirming.
            </p>
            <p>
              The number is how much that region resembles one of the seven classes compared with the other six. It
              is not a probability that the photo contains e-waste. There is no background class, so a photo of a
              person, a room, or an empty frame can still receive a class and a high score. That is why &ldquo;Not
              this&rdquo; exists, and why a rejected box is never written into the lot.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <SectionLabel>The record</SectionLabel>
          <div className="mt-5 space-y-3 text-sm leading-relaxed text-landing-dim md:text-base">
            <p>
              Only confirmed and corrected items enter the lot. An item the model missed can be added by choosing a
              class by hand. The open lot stays in this browser if the page is reloaded. Photos are not stored.
              Closed lots stay in a local history on this device, up to fifty. They are not a shared database across
              sites.
            </p>
            <p>Closing a lot downloads a CSV. Each row is one item.</p>
          </div>
          <dl className="mt-5 divide-y divide-landing-border overflow-hidden rounded-xl border border-landing-border bg-landing-panel">
            {CSV_COLUMNS.map((column) => (
              <div key={column.name} className="grid gap-1 px-5 py-3 sm:grid-cols-[9rem_1fr] sm:gap-4">
                <dt className="font-plex-mono text-xs text-landing-green">{column.name}</dt>
                <dd className="text-sm text-landing-dim">{column.meaning}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-14">
          <SectionLabel>What we observed</SectionLabel>
          <ul className="mt-5 space-y-4">
            {OBSERVATIONS.map((text, index) => (
              <li key={index} className="grid grid-cols-[2rem_1fr] gap-3 text-sm leading-relaxed text-landing-dim">
                <span className="font-plex-mono text-landing-green">0{index + 1}</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-14 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/scan?mode=camera"
            className="inline-flex items-center justify-center rounded-lg bg-reloop-green px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-reloop-green-light"
          >
            Open camera
          </Link>
          <Link
            href="/scan?mode=upload"
            className="inline-flex items-center justify-center rounded-lg border border-landing-border-strong px-6 py-3 text-sm font-medium transition-colors hover:border-landing-dim hover:bg-landing-panel"
          >
            Upload a photo
          </Link>
        </div>
      </article>

      <footer className="border-t border-landing-border px-6 py-5">
        <p className="mx-auto max-w-3xl font-plex-mono text-[11px] uppercase tracking-[0.16em] text-landing-faint">
          ReLoop · phase 1 prototype · photos are not stored
        </p>
      </footer>
    </main>
  );
}
