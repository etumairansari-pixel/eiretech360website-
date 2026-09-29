import { createFileRoute } from "@tanstack/react-router";
import { Shell, PageHero } from "@/components/site/Shell";
import { FinalCTA } from "@/components/site/FinalCTA";
import { Highlight } from "@/components/site/Highlight";
import { Reveal, SectionLabel, Spotlight } from "@/components/site/primitives";
import { headFor, offices } from "@/content";
import aboutPage from "../../content/pages/about.json";
import { iconFor } from "@/content/icons";
import { Globe2, MapPin } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => headFor("about", aboutPage.seo),
  component: AboutPage,
});

function AboutPage() {
  const { hero, story, differences, mission, cta } = aboutPage;
  const global = (aboutPage as { global?: { label: string; title: string; body: string } }).global;

  return (
    <Shell>
      <PageHero
        eyebrow={hero.eyebrow}
        title={<Highlight text={hero.title} />}
        subtitle={<Highlight text={hero.subtitle} />}
      />
      <section className="py-24">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-2">
          <Reveal>
            <SectionLabel>{story.label}</SectionLabel>
            <h2 className="text-4xl font-extrabold tracking-tight">
              <Highlight text={story.title} />
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="space-y-5 text-lg leading-relaxed text-brand-muted">
            {story.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}><Highlight text={paragraph} /></p>
            ))}
          </Reveal>
        </div>
      </section>
      <section className="bg-brand-surface py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionLabel>{differences.label}</SectionLabel>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {differences.items.map((item, i) => {
              const Icon = iconFor(item.icon);
              return (
                <Reveal key={item.title} delay={i * 0.06}>
                  <Spotlight className="h-full rounded-2xl border border-brand-line bg-brand-bg p-8">
                    <Icon className="mb-6 size-7 text-brand-primary" />
                    <h3 className="text-xl font-bold"><Highlight text={item.title} /></h3>
                    <p className="mt-3 text-brand-muted"><Highlight text={item.text} /></p>
                  </Spotlight>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
      {global && offices.length ? (
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-end">
              <Reveal>
                <SectionLabel>{global.label}</SectionLabel>
                <h2 className="text-4xl font-extrabold tracking-tight">
                  <Highlight text={global.title} />
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="text-lg leading-relaxed text-brand-muted">
                  <Highlight text={global.body} />
                </p>
              </Reveal>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {offices.map((o, i) => (
                <Reveal key={o.label} delay={i * 0.06}>
                  <Spotlight className="h-full rounded-2xl border border-brand-line bg-brand-surface p-8">
                    {i === 0 ? (
                      <MapPin className="mb-6 size-7 text-brand-primary" />
                    ) : (
                      <Globe2 className="mb-6 size-7 text-brand-primary" />
                    )}
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand-primary-text">
                      {o.label}
                    </p>
                    <h3 className="mt-2 text-xl font-bold">{o.place}</h3>
                    {o.zone ? <p className="mt-2 text-sm text-brand-muted">{o.zone}</p> : null}
                  </Spotlight>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <section className="bg-brand-surface py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <SectionLabel>{mission.label}</SectionLabel>
          <p className="text-3xl font-bold leading-tight md:text-5xl">
            <Highlight text={mission.title} />
          </p>
          <p className="mx-auto mt-8 max-w-2xl text-brand-muted"><Highlight text={mission.body} /></p>
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
