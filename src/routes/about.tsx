import { createFileRoute } from "@tanstack/react-router";
import { Shell, PageHero } from "@/components/site/Shell";
import { FinalCTA } from "@/components/site/FinalCTA";
import { Highlight } from "@/components/site/Highlight";
import { Reveal, SectionLabel, Spotlight } from "@/components/site/primitives";
import { headFor } from "@/content";
import aboutPage from "../../content/pages/about.json";
import { iconFor } from "@/content/icons";

export const Route = createFileRoute("/about")({
  head: () => headFor("about", aboutPage.seo),
  component: AboutPage,
});

function AboutPage() {
  const { hero, story, differences, mission, cta } = aboutPage;

  return (
    <Shell>
      <PageHero eyebrow={hero.eyebrow} title={<Highlight text={hero.title} />} subtitle={hero.subtitle} />
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
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
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
                    <h3 className="text-xl font-bold">{item.title}</h3>
                    <p className="mt-3 text-brand-muted">{item.text}</p>
                  </Spotlight>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <SectionLabel>{mission.label}</SectionLabel>
          <p className="text-3xl font-bold leading-tight md:text-5xl">
            <Highlight text={mission.title} />
          </p>
          <p className="mx-auto mt-8 max-w-2xl text-brand-muted">{mission.body}</p>
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
