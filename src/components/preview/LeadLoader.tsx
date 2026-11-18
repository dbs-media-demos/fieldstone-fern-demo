import { LeadLogo } from "@/components/brand/LeadLogo";
import { loaderSvg } from "@/lib/lead-logo";
import { loaderScript } from "@/lib/loader";

/** How long the exit takes in globals.css (the forest lifting off under an arched hem) */
const EXIT_MS = 900;

/**
 * A preview's first view in a tab opens on the business's own logo, on the hero's deep forest: the mark's
 * outlines draw themselves (the logo fiddlehead's unfurl), their fills come in, the name grows up out of
 * the ground line, and the forest lifts off the page with an arched hem (the hero's arch window) as the
 * hero comes in. ~2.5 s; a click or key skips it; reduced motion shows the finished logo for 0.6 s, then
 * fades. It's in the server HTML, so it's the first paint; the inline script before it skips it on a
 * reload in the same tab and times it (lib/loader.ts). The CSS hides it at 3 s whatever happens.
 */
export function LeadLoader({ token, svg }: { token: string; svg: string }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: loaderScript(token, EXIT_MS) }} />
      <div className="lead-loader theme-forest" aria-hidden>
        <div className="lead-loader__sun" />
        <LeadLogo svg={loaderSvg(svg)} className="lead-loader__logo" />
      </div>
    </>
  );
}
