import type { Metadata } from "next";
import { PageShell, PageHero, JsonLd, SectionHead } from "@/components/ui/Page";
import { Reveal } from "@/components/ui/Reveal";
import { ProjectCard } from "@/components/ui/Cards";
import { ProjectGallery } from "@/components/sections/ProjectGallery";
import { CtaBand } from "@/components/sections/Blocks";
import { projects } from "@/content/projects";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, graph, itemListSchema, webPageSchema } from "@/lib/schema";

const title = "Landscaping Projects: Patios, Lighting & Gardens";
const description =
  "Before-and-after landscaping projects across Southlake, Colleyville, Keller, Grapevine, Flower Mound and Fort Worth: flagstone patios, outdoor kitchens, xeriscapes, lighting and lawn renovations.";
const crumbs = [
  { name: "Home", path: "/" },
  { name: "Projects", path: "/projects" },
];

export const metadata: Metadata = buildMetadata({ title, description, path: "/projects", eyebrow: "Projects", image: "outdoor-kitchen-pool" });

export default function ProjectsPage() {
  return (
    <PageShell>
      <JsonLd
        data={graph(
          webPageSchema({ path: "/projects", name: title, description, type: "CollectionPage" }),
          breadcrumbSchema(crumbs),
          itemListSchema(projects.map((p) => ({ name: p.title, path: `/projects/${p.slug}` }))),
        )}
      />
      <PageHero
        eyebrow="Projects"
        title={
          <>
            Built in <span className="t-italic text-lantern">your</span> neighborhood.
          </>
        }
        lead="Patios in Timarron, pavilions in Ross Downs, a Keller xeriscape that cut the water bill by 61%. Filter by what you're planning, and tap any photo to see it big."
        image="outdoor-kitchen-pool"
        crumbs={crumbs}
      />

      <section className="theme-cream py-24 sm:py-32" aria-labelledby="cases-title">
        <div className="wrap">
          <SectionHead
            id="cases-title"
            eyebrow="Case studies"
            title={
              <>
                Six projects, <span className="t-italic">start</span> to finish.
              </>
            }
            aside="What the yard looked like, what we built, how long it took and roughly what it cost."
          />
          <Reveal stagger={0.08} className="mt-16 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.slug} p={p} />
            ))}
          </Reveal>
        </div>
      </section>

      <section className="theme-sand py-24 sm:py-32" aria-labelledby="gallery-title">
        <div className="wrap">
          <SectionHead
            id="gallery-title"
            eyebrow="Photo gallery"
            title={
              <>
                Browse by <span className="t-italic">what</span> you&rsquo;re dreaming about.
              </>
            }
          />
          <div className="mt-12">
            <ProjectGallery />
          </div>
        </div>
      </section>

      <CtaBand
        title={
          <>
            Your yard could be <span className="t-italic text-lantern">next.</span>
          </>
        }
        image="pool-sunset"
      />
    </PageShell>
  );
}
