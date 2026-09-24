import { createFileRoute } from "@tanstack/react-router";
import { Shell, PageHero } from "@/components/site/Shell";
import { FinalCTA } from "@/components/site/FinalCTA";
import { Highlight } from "@/components/site/Highlight";
import { Reveal, Spotlight } from "@/components/site/primitives";
import { headFor } from "@/content";
import platformsPage from "../../content/pages/platforms.json";
import platforms from "../../content/platforms.json";
import { iconFor } from "@/content/icons";

export const Route = createFileRoute("/platforms")({
  head: () => headFor("platforms", platformsPage.seo),
  component: PlatformsPage,
});

function PlatformsPage() {
  const { hero, outro, cta } = platformsPage;

  return (
    <Shell>
      <PageHero
        eyebrow={hero.eyebrow}
        title={<Highlight text={hero.title} />}
        subtitle={hero.subtitle}
      />
      <section className="pb-24">
        <div className="mx-auto grid max-w-7xl gap-5 px-6 md:grid-cols-2 lg:grid-cols-3">
          {platforms.map((group, i) => {
            const Icon = iconFor(group.icon);
            return (
              <Reveal key={group.title} delay={i * 0.05}>
                <Spotlight className="h-full rounded-3xl border border-brand-line bg-brand-surface p-8">
                  <Icon className="size-7 text-brand-primary" />
                  <h2 className="mt-6 text-xl font-bold">{group.title}</h2>
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
                </Spotlight>
              </Reveal>
            );
          })}
        </div>
        <p className="mx-auto mt-14 max-w-3xl px-6 text-center text-lg text-brand-muted">{outro}</p>
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
