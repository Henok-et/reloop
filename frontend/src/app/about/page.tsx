import Link from "next/link";
import {
  AI_LIMITATIONS_NOTE,
  CLASS_HANDLING_GROUP,
  CLASS_LABELS,
  GIZ_CLASSES,
  HANDLING_GROUPS,
  WORKFLOW_STEPS,
} from "@/lib/constants";

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

export default function AboutPage() {
  const refrigerant = GIZ_CLASSES.filter((name) => CLASS_HANDLING_GROUP[name] === "refrigerant");
  const electronics = GIZ_CLASSES.filter((name) => CLASS_HANDLING_GROUP[name] === "electronics");

  return (
    <main className="flex min-h-dvh flex-col">
      <nav className="border-b border-reloop-border px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-reloop-text">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-reloop-green">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-white"
                aria-hidden="true"
              >
                <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9m-9 9a9 9 0 0 1 9-9" />
              </svg>
            </div>
            <span className="text-sm font-semibold uppercase tracking-wider">ReLoop</span>
          </Link>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/scan" className="text-reloop-text-secondary transition-colors hover:text-reloop-text">
              Scan station
            </Link>
            <span className="text-reloop-text">About</span>
          </div>
        </div>
      </nav>

      <article className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 md:py-16">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-reloop-green-light">About this prototype</p>
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-reloop-text md:text-4xl">
          A worker decides. The lot is the record.
        </h1>
        <p className="mb-10 text-base leading-relaxed text-reloop-text-secondary">
          ReLoop is a station for electronic waste. A camera proposes one of seven classes. The person at the
          station confirms, corrects, or rejects that proposal. Confirmed items build into a lot. Closing the lot
          produces a count of refrigerant equipment and electronics, plus a CSV. A model label is not a record
          until a person accepts it.
        </p>

        <section className="mb-12">
          <h2 className="mb-4 text-xs uppercase tracking-widest text-reloop-text-muted">How a lot is built</h2>
          <ol className="space-y-3">
            {WORKFLOW_STEPS.map((step, index) => (
              <li key={step.key} className="flex gap-3">
                <span className="mt-0.5 w-5 shrink-0 font-mono text-xs text-reloop-text-muted">{index + 1}</span>
                <div>
                  <p className="text-sm font-medium text-reloop-text">{step.label}</p>
                  <p className="text-sm leading-relaxed text-reloop-text-secondary">{STEP_COPY[step.key]}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-xs uppercase tracking-widest text-reloop-text-muted">The data and the model</h2>
          <div className="space-y-3 text-sm leading-relaxed text-reloop-text-secondary">
            <p>
              The weights in this prototype were trained in a Kaggle notebook. Training used two datasets published
              on Hugging Face, and a further collection of more than 4,000 images. Those extra images were unlabeled
              when they were gathered.
            </p>
            <p>
              The model that ships here is a small YOLO detector. It can name seven classes and nothing else. Mixed
              scrap is not one of them. It draws a box and a score. It does not decide the record.
            </p>
            <p>
              No held-out accuracy, precision, or recall is published with this prototype. A score on screen is not
              a measured accuracy for the class.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-xs uppercase tracking-widest text-reloop-text-muted">Seven classes, two groups</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-reloop-cool/30 bg-reloop-cool-muted p-4">
              <p className="text-sm font-medium text-reloop-cool-light">{HANDLING_GROUPS.refrigerant.label}</p>
              <p className="mt-1 text-sm leading-relaxed text-reloop-text-secondary">
                {HANDLING_GROUPS.refrigerant.sortInstruction}
              </p>
              <ul className="mt-3 space-y-1">
                {refrigerant.map((name) => (
                  <li key={name} className="text-sm text-reloop-text">
                    {CLASS_LABELS[name]}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-reloop-green/30 bg-reloop-green-muted p-4">
              <p className="text-sm font-medium text-reloop-green-light">{HANDLING_GROUPS.electronics.label}</p>
              <p className="mt-1 text-sm leading-relaxed text-reloop-text-secondary">
                {HANDLING_GROUPS.electronics.sortInstruction}
              </p>
              <ul className="mt-3 space-y-1">
                {electronics.map((name) => (
                  <li key={name} className="text-sm text-reloop-text">
                    {CLASS_LABELS[name]}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-xs uppercase tracking-widest text-reloop-text-muted">What a score means</h2>
          <div className="space-y-3 text-sm leading-relaxed text-reloop-text-secondary">
            <p>
              The service returns a box only when the score is 50% or higher. A score under 70% is marked “check
              closely” so the worker looks again before confirming.
            </p>
            <p>
              The number is how much that region resembles one of the seven classes compared with the other six. It
              is not a probability that the photo contains e-waste. There is no background class, so a photo of a
              person, a room, or an empty frame can still receive a class and a high score. That is why “Not this”
              exists, and why a rejected box is never written into the lot.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-xs uppercase tracking-widest text-reloop-text-muted">What a photo cannot prove</h2>
          <p className="rounded-lg border border-reloop-warning/30 bg-reloop-warning-muted px-4 py-3 text-sm leading-relaxed text-reloop-text-secondary">
            {AI_LIMITATIONS_NOTE}
          </p>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-xs uppercase tracking-widest text-reloop-text-muted">The record</h2>
          <div className="mb-4 space-y-3 text-sm leading-relaxed text-reloop-text-secondary">
            <p>
              Only confirmed and corrected items enter the lot. An item the model missed can be added by choosing a
              class by hand. The open lot stays in this browser if the page is reloaded. Photos are not stored.
              Closed lots stay in a local history on this device, up to fifty. They are not a shared database across
              sites.
            </p>
            <p>Closing a lot downloads a CSV. Each row is one item.</p>
          </div>
          <dl className="divide-y divide-reloop-border overflow-hidden rounded-lg border border-reloop-border">
            {CSV_COLUMNS.map((column) => (
              <div key={column.name} className="grid gap-1 px-4 py-3 sm:grid-cols-[9rem_1fr] sm:gap-4">
                <dt className="font-mono text-xs text-reloop-green-light">{column.name}</dt>
                <dd className="text-sm text-reloop-text-secondary">{column.meaning}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-xs uppercase tracking-widest text-reloop-text-muted">What we observed</h2>
          <ul className="space-y-3 text-sm leading-relaxed text-reloop-text-secondary">
            <li>
              A fridge photo was proposed as an air conditioner at 57%. Correcting it to fridge put the item in the
              refrigerant group and showed the upright-handling note on that card.
            </li>
            <li>
              A photo of a person’s face was proposed as a compressor, once at about 61% and once at about 70%.
              “Not this” dropped it. Nothing was recorded.
            </li>
            <li>
              A blank frame was flagged as blurry before upload, returned no detection, and was recorded only after
              a class was chosen by hand.
            </li>
          </ul>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/scan?mode=camera"
            className="inline-flex items-center justify-center rounded-lg bg-reloop-green px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-reloop-green-light"
          >
            Open camera
          </Link>
          <Link
            href="/scan?mode=upload"
            className="inline-flex items-center justify-center rounded-lg border border-reloop-border bg-reloop-surface-elevated px-6 py-3 text-sm font-medium text-reloop-text transition-colors hover:bg-reloop-surface-hover"
          >
            Upload a photo
          </Link>
        </div>
      </article>

      <footer className="border-t border-reloop-border px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between text-xs text-reloop-text-muted">
          <span>ReLoop Phase 1</span>
          <span>Photos are not stored</span>
        </div>
      </footer>
    </main>
  );
}
