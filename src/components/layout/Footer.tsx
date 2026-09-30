import Link from "next/link";
import { Mark } from "@/components/brand/Logo";
import { OpenBadge } from "@/components/ui/OpenBadge";
import { site, telHref, mailHref, agencyName, agencyUrl } from "@/content/site";
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

export function Footer() {
  return (
    <footer className="theme-forest relative overflow-hidden pb-28 pt-20 lg:pb-10">
      <div className="wrap">
        <div className="grid gap-12 border-b border-line pb-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="t-eyebrow text-accent">Southlake · Fort Worth, Texas</p>
            <p className="font-display mt-5 max-w-sm text-[1.9rem] leading-[1.1] tracking-[-0.02em]">
              Same crew. Same day. <span className="t-italic text-accent">Every week.</span>
            </p>
            <div className="mt-8 space-y-2 text-lg">
              <a href={telHref} className="block w-fit underline-offset-4 hover:underline">
                {site.phoneDisplay}
              </a>
              <a href={mailHref} className="block w-fit text-muted underline-offset-4 hover:underline">
                {site.email}
              </a>
            </div>
            <OpenBadge className="mt-6" />
          </div>

          <nav aria-label="Services" className="lg:col-span-3">
            <h2 className="t-eyebrow text-faint">Services</h2>
            <ul className="mt-5 space-y-1">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`} className="inline-flex min-h-10 items-center text-muted transition-colors hover:text-fg">
                    {s.short}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company" className="lg:col-span-2">
            <h2 className="t-eyebrow text-faint">Company</h2>
            <ul className="mt-5 space-y-1">
              {company.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-flex min-h-10 items-center text-muted transition-colors hover:text-fg">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className="t-eyebrow text-faint">Service areas</h2>
            <ul className="mt-5 space-y-1">
              {cities.map((c) => (
                <li key={c.slug}>
                  <Link href={`/service-areas/${c.slug}`} className="inline-flex min-h-10 items-center text-muted transition-colors hover:text-fg">
                    {c.name}, TX
                  </Link>
                </li>
              ))}
            </ul>
            <h2 className="t-eyebrow mt-8 text-faint">Hours</h2>
            <dl className="mt-4 space-y-1.5 text-muted">
              {site.hoursDisplay.map((h) => (
                <div key={h.label} className="flex justify-between gap-6">
                  <dt>{h.label}</dt>
                  <dd className="text-fg">{h.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <ul className="flex flex-wrap gap-x-8 gap-y-3 border-b border-line py-8 text-sm text-muted">
          {site.credentials.map((c) => (
            <li key={c} className="flex items-center gap-2">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-lantern" />
              {c}
            </li>
          ))}
        </ul>

        <div aria-hidden className="relative select-none py-10">
          <div className="font-display flex items-center gap-[2vw] whitespace-nowrap text-[clamp(3rem,11.6vw,12.5rem)] leading-[0.9] tracking-[-0.045em] text-cream/95">
            <Mark className="h-[0.8em] w-[0.8em] shrink-0 text-lantern" />
            Fieldstone <span className="t-italic text-lantern">&amp;</span> Fern
          </div>
        </div>

        <div className="flex flex-col gap-4 text-sm text-faint md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {site.legalName} · {site.address.street}, {site.address.city}, {site.address.region} {site.address.zip}
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/privacy" className="inline-flex min-h-10 items-center hover:text-fg">
              Privacy
            </Link>
            <a href={agencyUrl} className="inline-flex min-h-10 items-center hover:text-fg">
              Design &amp; development: {agencyName}
            </a>
          </div>
        </div>
        <p className="mt-4 text-xs text-faint">
          Concept website: Fieldstone &amp; Fern is a fictional business created by {agencyName} to demonstrate a landscaping website. Reviews, projects and people are illustrative.
        </p>
      </div>
    </footer>
  );
}
