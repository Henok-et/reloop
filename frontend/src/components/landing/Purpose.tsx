const ITEMS = [
  {
    number: "01",
    title: "Built on real yard conditions",
    body:
      "Trained in a Kaggle notebook on two public Hugging Face datasets, plus more than 4,000 images that had no labels when they were gathered. The model names seven classes. Mixed scrap is not one of them.",
  },
  {
    number: "02",
    title: "The output is a handover count",
    body: "Closing a lot gives counts by class and by handling group, with a CSV.",
  },
];

export default function Purpose() {
  return (
    <section id="purpose" className="scroll-mt-16 border-t border-landing-border px-6 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="font-plex-mono text-[11px] uppercase tracking-[0.2em] text-landing-faint">Why it works this way</p>
        <ol className="mt-8 grid gap-10 md:grid-cols-2 md:gap-8">
          {ITEMS.map((item) => (
            <li key={item.number}>
              <span className="font-plex-mono text-sm text-landing-green">{item.number}</span>
              <h2 className="mt-2 font-display text-xl font-medium leading-snug text-landing-text">{item.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-landing-dim">{item.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
