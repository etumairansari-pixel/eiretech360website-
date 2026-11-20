import { Link } from "@tanstack/react-router";
import {
  BriefcaseBusiness,
  CircleCheck,
  Compass,
  HeartHandshake,
  Lightbulb,
  Mail,
  MapPin,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { Shell } from "@/components/site/Shell";
import { Highlight } from "@/components/site/Highlight";
import { Reveal, SectionLabel, Spotlight } from "@/components/site/primitives";
import { contact, pathFor } from "@/content";

type OpportunityItem = {
  icon: string;
  title: string;
  text: string;
};

export type OpportunityContent = {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    tags: string[];
    actionLabel: string;
  };
  ireland: { label: string; title: string; body: string };
  introduction: { label: string; title: string; body: string; highlights: string[] };
  opportunities: { label: string; title: string; body: string; items: OpportunityItem[] };
  journey: { label: string; title: string; body: string; items: OpportunityItem[] };
  companion: { label: string; title: string; body: string; linkLabel: string; linkTo: string };
  cta: { label: string; title: string; body: string; buttonLabel: string };
  emailSubject: string;
};

const icons = {
  rocket: BriefcaseBusiness,
  compass: Compass,
  handshake: HeartHandshake,
  lightbulb: Lightbulb,
  sparkles: Sparkles,
  users: UsersRound,
} as const;

function itemIcon(name: string) {
  return icons[name as keyof typeof icons] ?? Sparkles;
}

/** Shared editorial layout for EireTech360's early-career and community pathways. */
export function OpportunityPage({ content }: { content: OpportunityContent }) {
  const mailto = `mailto:${contact.email}?subject=${encodeURIComponent(content.emailSubject)}`;

  return (
    <Shell>
      <section className="relative isolate overflow-hidden bg-[#061a35] pb-20 pt-36 text-white md:pb-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_5%,rgba(41,131,234,.54),transparent_29%),radial-gradient(circle_at_84%_82%,rgba(177,235,76,.18),transparent_30%)]" />
        <div className="pointer-events-none absolute -right-24 top-16 size-[34rem] rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-6 top-28 size-[23rem] rounded-full border border-[#c7ff43]/25" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(20rem,.75fr)] lg:items-end">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#d7ff5a]">
              <Sparkles className="size-3.5" aria-hidden />
              {content.hero.eyebrow}
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-extrabold leading-[1.02] tracking-tight md:text-6xl lg:text-7xl">
              <Highlight text={content.hero.title} />
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-blue-100/85 md:text-xl">
              <Highlight text={content.hero.subtitle} />
            </p>
            <div className="mt-7 flex flex-wrap gap-2" aria-label="Opportunity themes">
              {content.hero.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/15 bg-white/[.06] px-3 py-1.5 text-sm font-medium text-blue-50"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href={mailto}
                className="inline-flex items-center gap-2 rounded-full bg-[#d7ff5a] px-6 py-3.5 font-bold text-[#061a35] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d7ff5a]"
              >
                <Mail className="size-4" aria-hidden />
                {content.hero.actionLabel}
              </a>
              <Link
                to={pathFor(content.companion.linkTo)}
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3.5 font-bold text-white transition hover:border-[#d7ff5a] hover:text-[#d7ff5a]"
              >
                {content.companion.linkLabel}
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <aside className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/[.09] p-7 shadow-[0_24px_65px_rgba(0,0,0,.24)] backdrop-blur-sm md:p-8">
              <div className="absolute right-0 top-0 size-28 rounded-bl-[4rem] bg-[#d7ff5a]/10" />
              <MapPin className="relative size-7 text-[#d7ff5a]" aria-hidden />
              <p className="relative mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#d7ff5a]">
                {content.ireland.label}
              </p>
              <h2 className="relative mt-3 text-2xl font-bold leading-tight text-white">
                <Highlight text={content.ireland.title} />
              </h2>
              <p className="relative mt-4 leading-relaxed text-blue-100/85">
                <Highlight text={content.ireland.body} />
              </p>
            </aside>
          </Reveal>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,.8fr)] lg:items-start">
          <Reveal>
            <SectionLabel>{content.introduction.label}</SectionLabel>
            <h2 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
              <Highlight text={content.introduction.title} />
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-brand-muted">
              <Highlight text={content.introduction.body} />
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-brand-primary/20 bg-brand-primary/[.045] p-7 md:p-8">
              <p className="text-sm font-bold text-brand-text">What this can look like</p>
              <ul className="mt-5 space-y-4">
                {content.introduction.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-3 text-brand-muted">
                    <CircleCheck
                      className="mt-0.5 size-5 shrink-0 text-brand-accent-text"
                      aria-hidden
                    />
                    <span className="leading-relaxed">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-brand-surface py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <SectionLabel>{content.opportunities.label}</SectionLabel>
            <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,.7fr)] lg:items-end">
              <h2 className="text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
                <Highlight text={content.opportunities.title} />
              </h2>
              <p className="text-lg leading-relaxed text-brand-muted">
                <Highlight text={content.opportunities.body} />
              </p>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {content.opportunities.items.map((item, index) => {
              const Icon = itemIcon(item.icon);
              return (
                <Reveal key={item.title} delay={index * 0.06}>
                  <Spotlight className="h-full rounded-2xl border border-brand-line bg-brand-bg p-7 md:p-8">
                    <Icon className="size-7 text-brand-primary-text" aria-hidden />
                    <h3 className="mt-6 text-xl font-bold text-brand-text">{item.title}</h3>
                    <p className="mt-3 leading-relaxed text-brand-muted">{item.text}</p>
                  </Spotlight>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <SectionLabel>{content.journey.label}</SectionLabel>
            <h2 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
              <Highlight text={content.journey.title} />
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-muted">
              <Highlight text={content.journey.body} />
            </p>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {content.journey.items.map((item, index) => {
              const Icon = itemIcon(item.icon);
              return (
                <Reveal key={item.title} delay={index * 0.08}>
                  <article className="h-full rounded-2xl border border-brand-line p-7">
                    <Icon className="size-6 text-brand-accent-text" aria-hidden />
                    <h3 className="mt-6 text-xl font-bold text-brand-text">{item.title}</h3>
                    <p className="mt-3 leading-relaxed text-brand-muted">{item.text}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pb-20 md:pb-28">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <div className="grid gap-8 rounded-3xl border border-brand-primary/20 bg-brand-primary/[.045] p-7 md:p-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary-text">
                  {content.companion.label}
                </p>
                <h2 className="mt-3 max-w-3xl text-2xl font-extrabold leading-tight tracking-tight text-brand-text md:text-4xl">
                  <Highlight text={content.companion.title} />
                </h2>
                <p className="mt-4 max-w-2xl leading-relaxed text-brand-muted">
                  <Highlight text={content.companion.body} />
                </p>
              </div>
              <Link
                to={pathFor(content.companion.linkTo)}
                className="inline-flex w-fit items-center justify-center rounded-full border border-brand-primary/35 px-5 py-3 font-bold text-brand-primary-text transition hover:border-brand-primary-text hover:bg-brand-primary/10"
              >
                {content.companion.linkLabel}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#071d39] py-20 text-white md:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d7ff5a]">
              {content.cta.label}
            </p>
            <h2 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
              <Highlight text={content.cta.title} />
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-blue-100/85">
              <Highlight text={content.cta.body} />
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <a
              href={mailto}
              className="inline-flex items-center gap-2 rounded-full bg-[#d7ff5a] px-6 py-3.5 font-bold text-[#061a35] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d7ff5a]"
            >
              <Mail className="size-4" aria-hidden />
              {content.cta.buttonLabel}
            </a>
          </Reveal>
        </div>
      </section>
    </Shell>
  );
}
