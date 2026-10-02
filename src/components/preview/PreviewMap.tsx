import { SectionHead } from "@/components/ui/Page";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { OpenBadge } from "@/components/ui/OpenBadge";
import { DAY_NAMES, dayRange, weekFromMonday, type Biz } from "@/lib/biz-core";

/** A preview's "where we are": the business's real address on a Google map, hours and directions. */
export function PreviewMap({ biz }: { biz: Biz }) {
  const query = [biz.name, biz.address.full].filter(Boolean).join(", ");
  const embed = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=13&output=embed`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
  return (
    <section className="theme-sand py-24 sm:py-32" aria-labelledby="area-title">
      <div className="wrap">
        <SectionHead
          id="area-title"
          eyebrow="Service area"
          title={
            <>
              {biz.area}, <span className="t-italic">daily</span> routes.
            </>
          }
          aside={biz.address.full ? `Find us at ${biz.address.full}. Crews are on route every weekday.` : "Crews are on route every weekday."}
        />
        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:items-start">
          <Reveal className="lg:col-span-4">
            <OpenBadge />
            {biz.hours && (
              <dl className="mt-6 space-y-1.5 text-muted">
                {weekFromMonday(biz.hours).map((h) => (
                  <div key={h.day} className="flex justify-between gap-6">
                    <dt>{DAY_NAMES.en[h.day]}</dt>
                    <dd className="text-fg">{dayRange(h, "en")}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div className="mt-8">
              <Button href={directions}>Get directions</Button>
            </div>
          </Reveal>
          <Reveal className="lg:col-span-8">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-line sm:aspect-[16/10]">
              <iframe src={embed} title={`Map: ${query}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="absolute inset-0 h-full w-full border-0" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
