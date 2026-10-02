import Link from "next/link";
import clsx from "clsx";
import { Photo } from "@/components/ui/Photo";
import { Button } from "@/components/ui/Button";
import { Parallax, Reveal, SplitReveal } from "@/components/ui/Reveal";
import { reviews, type Review } from "@/content/misc";
import { site } from "@/content/site";
import { defaultBiz } from "@/lib/biz";
import { telOf, type Biz } from "@/lib/biz-core";

export function Stars({ n = 5, className }: { n?: number; className?: string }) {
  return (
    <span className={clsx("inline-flex gap-0.5", className)} aria-label={`${n} out of 5 stars`} role="img">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 20 20" className={clsx("h-4 w-4", i < n ? "fill-current" : "fill-current opacity-25")} aria-hidden>
          <path d="M10 1.8l2.5 5.3 5.8.7-4.3 4 1.1 5.7L10 14.7l-5.1 2.8 1.1-5.7-4.3-4 5.8-.7z" />
        </svg>
      ))}
    </span>
  );
}

export function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8z" />
      <path fill="#34A853" d="M12 23c3 0 5.5-1 7.2-2.7l-3.5-2.7c-1 .7-2.2 1-3.7 1-2.9 0-5.3-1.9-6.2-4.5H2.2v2.8A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.2a11 11 0 0 0 0 9.8z" />
      <path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.2 1.6l3.1-3.1A11 11 0 0 0 2.2 7.1l3.6 2.8C6.7 7.3 9.1 5.4 12 5.4z" />
    </svg>
  );
}

const fmtDate = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" });

export function ReviewCard({ r, className, area }: { r: Review; className?: string; area?: string }) {
  return (
    <figure className={clsx("flex h-full flex-col justify-between gap-6 rounded-[1.5rem] border border-line bg-bg p-6 sm:p-7", className)}>
      <div>
        <div className="flex items-center justify-between gap-4">
          <Stars n={r.rating} className="text-[#e3a008]" />
          <GoogleG className="h-5 w-5" />
        </div>
        <blockquote className="mt-4 text-[1.05rem] leading-relaxed">&ldquo;{r.text}&rdquo;</blockquote>
      </div>
      <figcaption className="flex items-center gap-3">
        <span aria-hidden className="font-display flex h-10 w-10 items-center justify-center rounded-full bg-fern text-cream">
          {r.name[0]}
        </span>
        <span className="text-sm leading-tight">
          <span className="block font-semibold">{r.name}</span>
          <span className="text-muted">
            {area ?? r.where} · {r.service} · {fmtDate(r.date)}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

/** Rating summary + two opposing marquees of review cards. */
export function ReviewsWall({ biz = defaultBiz }: { biz?: Biz }) {
  // Previews keep the sample reviews, placed in the business's area and labelled as samples
  const area = biz.preview ? biz.area : undefined;
  const a = reviews.slice(0, 6);
  const b = reviews.slice(6);
  return (
    <div>
      <div className="wrap grid gap-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <Reveal as="p" className="t-eyebrow text-accent">
            {biz.preview ? "Reviews · samples" : "Reviews"}
          </Reveal>
          <SplitReveal className="t-h2 mt-5 max-w-[16ch]">
            {biz.preview && !biz.rating ? "Neighbors," : `${(biz.rating ?? site.rating).count} neighbors,`} <span className="t-italic">one</span> recurring theme: the same crew.
          </SplitReveal>
        </div>
        {biz.rating && (
          <Reveal className="flex items-center gap-5 lg:col-span-5 lg:justify-end" delay={0.1}>
            <div className="flex items-center gap-4 rounded-[1.5rem] border border-line bg-bg px-6 py-5">
              <GoogleG className="h-9 w-9" />
              <div>
                <p className="font-display text-5xl leading-none tracking-[-0.04em]">{biz.rating.value}</p>
                <Stars className="mt-2 text-[#e3a008]" />
              </div>
              <p className="max-w-[9rem] text-sm text-muted">from {biz.rating.count} Google reviews</p>
            </div>
          </Reveal>
        )}
      </div>

      <div className="marquee-wrap mt-14 space-y-5 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
        {[a, b].map((row, ri) => (
          <div key={ri} className={clsx("marquee flex w-max gap-5", ri && "marquee-rev")} style={{ ["--speed" as string]: ri ? "75s" : "65s" }}>
            {[...row, ...row].map((r, i) => (
              <ReviewCard key={i} r={r} area={area} className="w-[min(86vw,26rem)] shrink-0" />
            ))}
          </div>
        ))}
      </div>
      <div className="wrap mt-10">
        <Link href="/reviews" className="inline-flex min-h-11 items-center gap-2 border-b border-current pb-1 font-medium">
          Read all reviews
        </Link>
      </div>
    </div>
  );
}

export function FaqList({ items, className }: { items: { q: string; a: string }[]; className?: string }) {
  return (
    <div className={clsx("border-t border-line", className)}>
      {items.map((f) => (
        <details key={f.q} className="faq group border-b border-line">
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-[1.15rem] font-medium tracking-[-0.01em] sm:text-xl [&::-webkit-details-marker]:hidden">
            {f.q}
            <span
              aria-hidden
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line transition-colors duration-300 group-open:bg-forest group-open:text-cream"
            >
              <span className="absolute h-px w-3.5 bg-current" />
              <span className="absolute h-3.5 w-px bg-current transition-transform duration-500 group-open:rotate-90" />
            </span>
          </summary>
          <div className="faq-body">
            <p className="max-w-3xl pb-6 text-muted">{f.a}</p>
          </div>
        </details>
      ))}
    </div>
  );
}

/** Closing call-to-action band with a big parallax photo. */
export function CtaBand({
  title = (
    <>
      Let&rsquo;s walk <span className="t-italic text-lantern">your</span> yard.
    </>
  ),
  text = "Free estimates, usually within the week. Twenty minutes, one designer, zero pressure.",
  image = "oak-bench",
  biz = defaultBiz,
}: {
  title?: React.ReactNode;
  text?: string;
  image?: string;
  biz?: Biz;
}) {
  return (
    <section className="theme-forest relative isolate overflow-hidden">
      <Parallax className="absolute inset-0 -z-10" amount={16} reveal="none">
        <div className="absolute inset-0">
          <Photo slug={image} sizes="100vw" decorative />
        </div>
      </Parallax>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-forest/90 via-forest/60 to-forest/20" />
      <div className="wrap flex min-h-[78svh] flex-col justify-center py-24">
        <SplitReveal className="t-h1 max-w-[12ch] text-cream">{title}</SplitReveal>
        <Reveal className="mt-8 max-w-md" delay={0.15}>
          <p className="t-lead text-cream/85">{text}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button href="/free-estimate" variant="lantern">
              Get a free estimate
            </Button>
            {biz.phone && (
              <Button href={telOf(biz)!} variant="ghost" icon="phone" className="text-cream">
                {biz.phoneDisplay}
              </Button>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Scrolling ticker of the cities we serve. */
export function CityMarquee() {
  const items = ["Southlake", "Keller", "Colleyville", "Grapevine", "Flower Mound", "Fort Worth", "Trophy Club", "Westlake"];
  return (
    <div aria-hidden className="marquee-wrap overflow-hidden border-y border-line py-6">
      <div className="marquee flex w-max items-center gap-10" style={{ ["--speed" as string]: "38s" }}>
        {[...items, ...items].map((c, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className="font-display text-[clamp(2rem,5vw,4.5rem)] leading-none tracking-[-0.035em]">{c}</span>
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-moss" fill="currentColor">
              <path d="M12 2c2 4 6 6 10 6-4 2-6 6-6 10-2-4-6-6-10-6 4-2 6-6 6-10Z" />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}
