import Link from "next/link";
import { Mark } from "@/components/brand/Logo";
import { OpenBadge } from "@/components/ui/OpenBadge";
import { site, mailHref, agencyName, agencyUrl } from "@/content/site";
import { defaultBiz } from "@/lib/biz";
import { DAY_NAMES, dayRange, telOf, weekFromMonday, type Biz } from "@/lib/biz-core";
import { services } from "@/content/services";
import { cities } from "@/content/cities";

const company = [
  { href: "/about", label: "About us" },
  { href: "/projects", label: "Projects" },
  { href: "/lawn-plans", label: "Lawn plans & pricing" },
  { href: "/reviews", label: "Reviews" },
  { href: "/faq", label: "FAQ" },
  { href: "/free-estimate", label: "Free estimate" },
  { href: "/contact", label: "Contact" },
];

export function Footer({ biz = defaultBiz }: { biz?: Biz }) {
  return (
    <footer className="theme-forest relative overflow-hidden pb-28 pt-20 lg:pb-10 phone:!pb-1 phone:!pt-6">
      <div className="wrap">
        <div className="grid gap-12 border-b border-line pb-14 lg:grid-cols-12 phone:!grid-cols-2 phone:!gap-x-4 phone:!gap-y-3 phone:!pb-3">
          <div className="lg:col-span-4 phone:col-span-2">
            <p className="t-eyebrow text-accent">{biz.preview ? biz.area : "Southlake · Fort Worth, Texas"}</p>
            <p className="font-display mt-5 max-w-sm text-[1.9rem] leading-[1.1] tracking-[-0.02em] phone:!mt-2 phone:!text-[1.35rem]">
              Same crew. Same day. <span className="t-italic text-accent">Every week.</span>
            </p>
            <div className="mt-8 space-y-2 text-lg phone:!mt-1 phone:flex phone:flex-wrap phone:gap-x-4 phone:!space-y-0 phone:!text-[0.9rem]">
              <a href={telOf(biz)} className="block w-fit underline-offset-4 hover:underline">
                {biz.phoneDisplay}
              </a>
              {!biz.preview && (
                <a href={mailHref} className="block w-fit text-muted underline-offset-4 hover:underline">
                  {site.email}
                </a>
              )}
            </div>
            <OpenBadge className="mt-6 phone:!mt-2" />
          </div>

          <nav aria-label="Services" className="lg:col-span-3 phone:col-span-1">
            <h2 className="t-eyebrow text-faint">Services</h2>
            <ul className="mt-5 space-y-1 phone:!mt-1 phone:!space-y-0">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`} className="inline-flex min-h-10 items-center text-muted transition-colors hover:text-fg phone:!min-h-[1.7rem] phone:!text-[0.86rem]">
                    {s.short}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company" className="lg:col-span-2 phone:col-span-1">
            <h2 className="t-eyebrow text-faint">Company</h2>
            <ul className="mt-5 space-y-1 phone:!mt-1 phone:!space-y-0">
              {company.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-flex min-h-10 items-center text-muted transition-colors hover:text-fg phone:!min-h-[1.7rem] phone:!text-[0.86rem]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3 phone:col-span-2 phone:space-y-3">
            <div>
            <h2 className="t-eyebrow text-faint">Service areas</h2>
            <ul className="mt-5 space-y-1 phone:!mt-0 phone:flex phone:flex-wrap phone:gap-x-3 phone:!space-y-0">
              {(biz.preview ? [{ slug: "", label: biz.area }] : cities.map((c) => ({ slug: c.slug, label: `${c.name}, TX` }))).map((c) => (
                <li key={c.slug}>
                  <Link href={`/service-areas/${c.slug}`} className="inline-flex min-h-10 items-center text-muted transition-colors hover:text-fg phone:!min-h-[1.7rem] phone:!text-[0.86rem]">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
            </div>
            <div>
            <h2 className="t-eyebrow mt-8 text-faint phone:!mt-0">Hours</h2>
            <dl className="mt-4 space-y-1.5 text-muted phone:!mt-1 phone:flex phone:flex-wrap phone:gap-x-4 phone:gap-y-0.5 phone:!space-y-0 phone:!text-[0.8rem] phone:!leading-tight">
              {(biz.preview
                ? weekFromMonday(biz.hours ?? []).map((h) => ({ label: DAY_NAMES.en[h.day], value: dayRange(h, "en") }))
                : site.hoursDisplay
              ).map((h) => (
                <div key={h.label} className="flex justify-between gap-6 phone:!gap-1.5">
                  <dt>{h.label}</dt>
                  <dd className="text-fg">{h.value}</dd>
                </div>
              ))}
            </dl>
            </div>
          </div>
        </div>

        <ul className="flex flex-wrap gap-x-8 gap-y-3 border-b border-line py-8 text-sm text-muted phone:!gap-x-3 phone:!gap-y-1 phone:!py-3 phone:!text-xs">
          {(biz.preview ? site.credentials.filter((c) => !/Arborist|TCEQ|\$2M/.test(c)) : site.credentials).map((c) => (
            <li key={c} className="flex items-center gap-2">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-lantern" />
              {c}
            </li>
          ))}
        </ul>

        <div aria-hidden className="relative select-none py-10 phone:hidden">
          {biz.preview ? (
            <div className="font-display flex items-center gap-[2vw] text-[clamp(2.4rem,7vw,7.5rem)] leading-[0.95] tracking-[-0.045em] text-cream/95">
              <Mark className="h-[0.8em] w-[0.8em] shrink-0 text-lantern" />
              <span className="min-w-0 [overflow-wrap:anywhere]">{biz.shortName}</span>
            </div>
          ) : (
            <div className="font-display flex items-center gap-[2vw] whitespace-nowrap text-[clamp(3rem,11.6vw,12.5rem)] leading-[0.9] tracking-[-0.045em] text-cream/95">
              <Mark className="h-[0.8em] w-[0.8em] shrink-0 text-lantern" />
              Fieldstone <span className="t-italic text-lantern">&amp;</span> Fern
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 text-sm text-faint md:flex-row md:items-center md:justify-between phone:!mt-2 phone:!gap-0 phone:!text-xs">
          <p>
            © {new Date().getFullYear()} {biz.name} · {biz.address.full}
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/privacy" className="inline-flex min-h-10 items-center hover:text-fg phone:!min-h-7">
              Privacy
            </Link>
            <a href={agencyUrl} className="inline-flex min-h-10 items-center hover:text-fg phone:!min-h-7">
              Design &amp; development: {agencyName}
            </a>
          </div>
        </div>
        <p className="mt-4 text-xs text-faint phone:!mt-1">
          {biz.preview
            ? `A preview homepage made for ${biz.name} by ${agencyName}. Sample reviews and projects are illustrative.`
            : `Concept website: Fieldstone & Fern is a fictional business created by ${agencyName} to demonstrate a landscaping website. Reviews, projects and people are illustrative.`}
        </p>
      </div>
    </footer>
  );
}
