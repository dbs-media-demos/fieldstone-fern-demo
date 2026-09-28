import type { Metadata } from "next";
import Link from "next/link";
import { Photo } from "@/components/ui/Photo";
import { Mark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { services } from "@/content/services";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main id="main" className="theme-forest relative isolate flex min-h-[100svh] items-center overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-45">
        <Photo slug="fall-leaves-woods" sizes="100vw" preload decorative />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest via-forest/70 to-forest/40" />
      <div className="wrap py-32">
        <Mark className="anim-fade h-16 w-16 text-lantern" animate />
        <p className="t-eyebrow anim-fade mt-8 text-lantern">Error 404</p>
        <h1 className="t-mega anim-heading mt-4 max-w-[12ch]">
          This path is <span className="t-italic text-lantern">overgrown.</span>
        </h1>
        <p className="t-lead anim-fade mt-8 max-w-lg text-cream/80">
          The page you&rsquo;re looking for has been moved, pruned or never planted. Here&rsquo;s a way back through the garden.
        </p>
        <div className="anim-fade mt-10 flex flex-wrap gap-3">
          <Button href="/" variant="lantern">
            Back to home
          </Button>
          <Button href="/free-estimate" variant="ghost" className="text-cream">
            Free estimate
          </Button>
        </div>
        <ul className="anim-fade mt-14 flex flex-wrap gap-2">
          {services.map((s) => (
            <li key={s.slug}>
              <Link href={`/services/${s.slug}`} className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm text-cream/85 hover:bg-cream/10">
                {s.short}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
