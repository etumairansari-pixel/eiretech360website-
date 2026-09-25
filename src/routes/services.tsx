import { createFileRoute } from "@tanstack/react-router";
import { Check, ArrowUpRight } from "lucide-react";
import { Shell, PageHero } from "@/components/site/Shell";
import { FinalCTA } from "@/components/site/FinalCTA";
import { Highlight } from "@/components/site/Highlight";
import { Reveal } from "@/components/site/primitives";
import { services } from "@/content/services";
import { headFor, pathFor } from "@/content";
import servicesPage from "../../content/pages/services.json";

export const Route = createFileRoute("/services")({
  head: () => headFor("services", servicesPage.seo),
  component: ServicesPage,
});

function ServicesPage() {
  const { hero, serviceLinkLabel, cta } = servicesPage;

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
                      alt=""
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
                    <h2 className="text-3xl font-extrabold tracking-tight"><Highlight text={s.title} /></h2>
                    <p className="mt-3 text-brand-muted"><Highlight text={s.desc} /></p>
                    <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                      {s.points.map((p) => (
                        <li key={p} className="flex gap-2 text-sm">
                          <Check className="mt-0.5 size-4 shrink-0 text-brand-accent-text" />
                          <Highlight text={p} />
                        </li>
                      ))}
                    </ul>
                    <a
                      href={pathFor("contact")}
                      className="mt-8 inline-flex items-center gap-2 font-bold text-brand-primary-text"
                    >
                      {serviceLinkLabel} <ArrowUpRight className="size-4" />
                    </a>
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
