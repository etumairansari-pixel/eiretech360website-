import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ArrowUpRight } from "lucide-react";
import { Shell, PageHero } from "@/components/site/Shell";
import { FinalCTA } from "@/components/site/FinalCTA";
import { Highlight } from "@/components/site/Highlight";
import { Reveal } from "@/components/site/primitives";
import { services, slugify } from "@/content/services";
import { projectsFor } from "@/content/projects";
import { projectAnchor } from "@/components/site/ProjectShowcase";
import { headFor, pathFor } from "@/content";
import servicesPage from "../../content/pages/services.json";

export const Route = createFileRoute("/services")({
  head: () => headFor("services", servicesPage.seo),
  component: ServicesPage,
});

function ServicesPage() {
  const { hero, serviceLinkLabel, detailLinkLabel, cta } = servicesPage;

  return (
    <Shell>
      <PageHero
        eyebrow={hero.eyebrow}
        title={<Highlight text={hero.title} />}
        subtitle={<Highlight text={hero.subtitle} />}
      />
      <section className="pb-24">
        <div className="mx-auto max-w-7xl space-y-6 px-6">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.title}>
                <article className="group grid overflow-hidden rounded-3xl border border-brand-line bg-brand-surface lg:grid-cols-[.8fr_1.2fr]">
                  <div className="relative min-h-64 overflow-hidden">
                    <img
                      src={s.img}
                      alt={`${s.title} services`}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-slate-950/45" />
                    <span className="absolute left-7 top-7 font-mono text-xs text-white/90">
                      {String(i + 1).padStart(2, "0")} / {String(services.length).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="p-8 md:p-12">
                    <div className="mb-6 grid size-12 place-items-center rounded-xl bg-brand-primary/10 text-brand-primary">
                      <Icon className="size-6" />
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight">
                      <Link
                        to="/services/$slug"
                        params={{ slug: s.slug }}
                        className="transition-colors hover:text-brand-primary-text"
                      >
                        <Highlight text={s.title} />
                      </Link>
                    </h2>
                    <p className="mt-3 text-brand-muted"><Highlight text={s.desc} /></p>
                    <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                      {s.points.map((p) => (
                        <li key={p}>
                          <Link
                            to="/services/$slug"
                            params={{ slug: s.slug }}
                            hash={slugify(p)}
                            className="flex gap-2 text-sm underline-offset-4 transition-colors hover:text-brand-primary-text hover:underline"
                          >
                            <Check className="mt-0.5 size-4 shrink-0 text-brand-accent-text" />
                            <Highlight text={p} />
                          </Link>
                        </li>
                      ))}
                    </ul>
                    {projectsFor(s.slug).length || s.gallery.length || s.videos.length ? (
                      <p className="mt-6 flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand-muted">
                          Featured work
                        </span>
                        {projectsFor(s.slug).map((project) => (
                          <Link
                            key={project.title}
                            to="/services/$slug"
                            params={{ slug: s.slug }}
                            hash={projectAnchor(project)}
                            className="rounded-full border border-brand-primary/25 bg-brand-primary/5 px-3 py-1 font-semibold text-brand-primary-text transition-colors hover:border-brand-primary/60"
                          >
                            {project.title}
                          </Link>
                        ))}
                        {s.gallery.length ? (
                          <Link
                            to="/services/$slug"
                            params={{ slug: s.slug }}
                            hash="portfolio"
                            className="rounded-full border border-brand-primary/25 bg-brand-primary/5 px-3 py-1 font-semibold text-brand-primary-text transition-colors hover:border-brand-primary/60"
                          >
                            Design portfolio
                          </Link>
                        ) : null}
                        {s.videos.length ? (
                          <Link
                            to="/services/$slug"
                            params={{ slug: s.slug }}
                            hash="reels"
                            className="rounded-full border border-brand-primary/25 bg-brand-primary/5 px-3 py-1 font-semibold text-brand-primary-text transition-colors hover:border-brand-primary/60"
                          >
                            Video reels
                          </Link>
                        ) : null}
                      </p>
                    ) : null}
                    <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
                      <Link
                        to="/services/$slug"
                        params={{ slug: s.slug }}
                        className="inline-flex items-center gap-2 rounded-full brand-gradient-bg px-6 py-3 font-bold text-white transition-shadow hover:brand-glow"
                      >
                        {detailLinkLabel} <ArrowUpRight className="size-4" />
                      </Link>
                      <a
                        href={pathFor("contact")}
                        className="inline-flex items-center gap-2 font-bold text-brand-primary-text"
                      >
                        {serviceLinkLabel} <ArrowUpRight className="size-4" />
                      </a>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>
      <FinalCTA
        label={cta.label}
        title={cta.title}
        subtitle={cta.subtitle}
        buttonLabel={cta.buttonLabel}
        buttonTo={cta.buttonTo}
      />
    </Shell>
  );
}
