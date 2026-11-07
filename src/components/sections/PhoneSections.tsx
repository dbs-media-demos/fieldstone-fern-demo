import { projects, categories } from "@/content/projects";
import { team } from "@/content/misc";
import { QuoteForm } from "@/components/forms/QuoteForm";

const MAX_K = 100;
const rangeOf = (value: string) => {
  const m = value.match(/\$(\d+)k–\$(\d+)k/);
  return m ? { from: Number(m[1]), to: Number(m[2]) } : null;
};
const budgets = projects
  .flatMap((p) => {
    const range = rangeOf(p.facts.find((f) => f.label === "Investment")?.value ?? "");
    if (!range) return [];
    return [{ slug: p.slug, title: p.title, kind: categories.find((c) => c.id === p.category)?.label ?? "", weeks: p.facts.find((f) => f.label === "Timeline")?.value ?? "", ...range }];
  })
  .sort((a, b) => a.from - b.from);

/** Phones only, after "how it works": what the projects above actually cost, each drawn on one $0–100k scale. */
export function BudgetGuide() {
  return (
    <section className="theme-sand hidden py-6 phone:block" aria-labelledby="budget-title">
      <div className="wrap">
        <p className="t-eyebrow text-accent">Budget guide</p>
        <h2 id="budget-title" className="t-h2 mt-3">
          What a project <span className="t-italic">costs.</span>
        </h2>
        <ul className="mt-4 border-t border-line">
          {budgets.map((b) => (
            <li key={b.slug} className="border-b border-line py-2">
              <div className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 truncate text-[0.95rem] font-medium">{b.title}</span>
                <span className="shrink-0 text-sm tabular-nums">
                  ${b.from}k–${b.to}k
                </span>
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                <span className="w-[45%] shrink-0 truncate">
                  {b.kind} · {b.weeks}
                </span>
                <span aria-hidden className="relative h-1 flex-1 rounded-full bg-forest/10">
                  <span className="absolute inset-y-0 rounded-full bg-moss" style={{ left: `${(b.from / MAX_K) * 100}%`, width: `${((b.to - b.from) / MAX_K) * 100}%` }} />
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Phones only, after the statement: the leads you'll meet, swiped through. The concept site's people aren't a real business's. */
export function PhoneTeam() {
  return (
    <section className="theme-cream hidden pb-6 phone:block" aria-labelledby="crew-title">
      <div data-rise>
        <h2 id="crew-title" className="t-eyebrow wrap block text-accent">
          The people in your yard
        </h2>
        <ul className="phone-swipe mt-3 [--card:82vw]">
          {team.map((m) => (
            <li key={m.name} className="rounded-[1.25rem] border border-line p-4">
              <div className="flex items-center gap-3">
                <span aria-hidden className="font-display flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-fern text-cream">
                  {m.name
                    .split(" ")
                    .map((x) => x[0])
                    .join("")}
                </span>
                <span className="min-w-0">
                  <span className="block font-medium leading-tight">{m.name}</span>
                  <span className="mt-0.5 block text-xs leading-tight text-muted">{m.role}</span>
                </span>
              </div>
              <p className="mt-2.5 text-sm leading-snug text-muted">{m.note}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Phones only: the form closes the page, and the bar's "Get a quote" lands here. */
export function QuoteSection() {
  return (
    <section id="quote" className="theme-cream hidden py-6 phone:block" aria-labelledby="quote-title">
      <div className="wrap">
        <p className="t-eyebrow text-accent">Get a quote</p>
        <h2 id="quote-title" className="t-h2 mt-3">
          Tell us about <span className="t-italic">your</span> project.
        </h2>
        <QuoteForm />
      </div>
    </section>
  );
}
