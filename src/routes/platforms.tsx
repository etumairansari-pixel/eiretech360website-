import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Shell, PageHero } from "@/components/site/Shell";
import { FinalCTA } from "@/components/site/FinalCTA";
import { Highlight } from "@/components/site/Highlight";
import { Reveal, SectionLabel, Spotlight } from "@/components/site/primitives";
import { headFor, type PlatformsContent } from "@/content";
import platformsPage from "../../content/pages/platforms.json";
import platforms from "../../content/platforms.json";
import { iconFor } from "@/content/icons";

export const Route = createFileRoute("/platforms")({
  head: () => headFor("platforms", platformsPage.seo),
  component: PlatformsPage,
});

/** A group's related service, from its "Label | slug" line. */
function serviceLink(line?: string) {
  const [label = "", slug = ""] = (line ?? "").split("|").map((part) => part.trim());
  return label && slug ? { label, slug } : null;
}

function PlatformsPage() {
  const { hero, outro, cta } = platformsPage;
  const approach = (platformsPage as PlatformsContent).approach;
  const principles = (approach?.points ?? [])
    .map((line) => line.split("|").map((part) => part.trim()))
    .filter(([title, text]) => title && text);

  return (
    <Shell>
      <PageHero
        eyebrow={hero.eyebrow}
        title={<Highlight text={hero.title} />}
        subtitle={<Highlight text={hero.subtitle} />}
      />
      <section className="pb-24">
        <div className="mx-auto grid max-w-7xl gap-5 px-6 md:grid-cols-2 lg:grid-cols-3">
          {platforms.map((group, i) => {
            const Icon = iconFor(group.icon);
            return (
              <Reveal key={group.title} delay={i * 0.05}>
                <Spotlight className="h-full rounded-3xl border border-brand-line bg-brand-surface p-8">
                  <Icon className="size-7 text-brand-primary" />
                  <h2 className="mt-6 text-xl font-bold"><Highlight text={group.title} /></h2>
                  {group.desc ? (
                    <p className="mt-3 text-sm leading-relaxed text-brand-muted">
                      <Highlight text={group.desc} />
                    </p>
                  ) : null}
                  <div className="mt-6 flex flex-wrap gap-2">
                    {group.tools.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-brand-line bg-brand-bg px-3 py-1.5 text-sm text-brand-muted"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  {serviceLink(group.service) ? (
                    <Link
                      to="/services/$slug"
                      params={{ slug: serviceLink(group.service)!.slug }}
                      className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-brand-primary-text hover:underline"
                    >
                      Explore {serviceLink(group.service)!.label}
                      <ArrowUpRight className="size-4" />
                    </Link>
                  ) : null}
                </Spotlight>
              </Reveal>
            );
          })}
        </div>
        <p className="mx-auto mt-14 max-w-3xl px-6 text-center text-lg text-brand-muted"><Highlight text={outro} /></p>
      </section>
      {approach && principles.length ? (
        <section className="bg-brand-surface py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-end">
              <Reveal>
                <SectionLabel>{approach.label}</SectionLabel>
                <h2 className="text-4xl font-extrabold tracking-tight">
                  <Highlight text={approach.title} />
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="text-lg leading-relaxed text-brand-muted">
                  <Highlight text={approach.intro} />
                </p>
              </Reveal>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {principles.map(([title, text], i) => (
                <Reveal key={title} delay={i * 0.05}>
                  <div className="h-full rounded-2xl border border-brand-line bg-brand-bg p-7">
                    <span className="font-mono text-xs text-brand-primary-text">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-3 text-lg font-bold">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                      <Highlight text={text} />
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}
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
