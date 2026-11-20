import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  CircleCheck,
  Compass,
  HeartHandshake,
  Lightbulb,
  Mail,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { Shell } from "@/components/site/Shell";
import { Highlight } from "@/components/site/Highlight";
import { Reveal, SectionLabel, Spotlight } from "@/components/site/primitives";
import { pathFor } from "@/content";

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
  image: { src: string; alt: string };
  email: string;
  ireland: { label: string; title: string; body: string };
  introduction: { label: string; title: string; body: string; highlights: string[] };
  opportunities: { label: string; title: string; body: string; items: OpportunityItem[] };
  companion: { label: string; title: string; body: string; linkLabel: string; linkTo: string };
  cta: { label: string; title: string; body: string; buttonLabel: string };
  emailSubject: string;
};

const icons = {
  compass: Compass,
  handshake: HeartHandshake,
  lightbulb: Lightbulb,
  sparkles: Sparkles,
  users: UsersRound,
} as const;

function itemIcon(name: string) {
  return icons[name as keyof typeof icons] ?? Sparkles;
}

/** Compact, editorial landing layout for EireTech360's people pathways. */
export function OpportunityPage({ content }: { content: OpportunityContent }) {
  const mailto = `mailto:${content.email}?subject=${encodeURIComponent(content.emailSubject)}`;

  return (
    <Shell>
      <section className="relative isolate overflow-hidden bg-[#061a35] pb-14 pt-32 text-white md:pb-16 md:pt-36">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_9%_8%,rgba(41,131,234,.53),transparent_29%),radial-gradient(circle_at_88%_82%,rgba(177,235,76,.16),transparent_31%)]" />
        <div className="pointer-events-none absolute -right-28 top-8 size-[28rem] rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-10 top-20 size-[19rem] rounded-full border border-[#d7ff5a]/25" />

        <div className="relative mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(19rem,.65fr)] lg:items-end">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#d7ff5a]">
              <Sparkles className="size-3.5" aria-hidden />
              {content.hero.eyebrow}
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.02] tracking-tight md:text-6xl">
              <Highlight text={content.hero.title} />
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-blue-100/85 md:text-xl">
              <Highlight text={content.hero.subtitle} />
            </p>
            <div className="mt-6 flex flex-wrap gap-2" aria-label="Opportunity themes">
              {content.hero.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/15 bg-white/[.06] px-3 py-1.5 text-sm font-medium text-blue-50"
                >
                  {tag}
                </span>
              ))}
            </div>
            <a
              href={mailto}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#d7ff5a] px-6 py-3.5 font-bold text-[#061a35] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d7ff5a]"
            >
              <Mail className="size-4" aria-hidden />
              {content.hero.actionLabel}
            </a>
          </Reveal>

          <Reveal delay={0.1}>
            <aside className="rounded-3xl border border-white/15 bg-white/[.09] p-6 shadow-[0_24px_65px_rgba(0,0,0,.24)] backdrop-blur-sm md:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d7ff5a]">
                {content.ireland.label}
              </p>
              <h2 className="mt-3 text-2xl font-bold leading-tight text-white">
                <Highlight text={content.ireland.title} />
              </h2>
              <p className="mt-4 leading-relaxed text-blue-100/85">
                <Highlight text={content.ireland.body} />
              </p>
            </aside>
          </Reveal>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-9 px-6 lg:grid-cols-[minmax(21rem,.95fr)_minmax(0,1fr)] lg:items-center">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-brand-line bg-brand-surface shadow-[0_22px_50px_rgba(5,24,49,.12)]">
              <img
                src={content.image.src}
                alt={content.image.alt}
                width="1600"
                height="1000"
                className="aspect-[16/10] w-full object-cover"
                loading="eager"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#071d39]/25 via-transparent to-transparent" />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <SectionLabel>{content.introduction.label}</SectionLabel>
            <h2 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
              <Highlight text={content.introduction.title} />
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-muted">
              <Highlight text={content.introduction.body} />
            </p>
            <ul className="mt-6 grid gap-3">
              {content.introduction.highlights.map((highlight) => (
                <li key={highlight} className="flex gap-3 text-brand-muted">
                  <CircleCheck className="mt-0.5 size-5 shrink-0 text-brand-accent-text" aria-hidden />
                  <span className="leading-relaxed">{highlight}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="bg-brand-surface py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <SectionLabel>{content.opportunities.label}</SectionLabel>
            <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,.64fr)] lg:items-end">
              <h2 className="text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
                <Highlight text={content.opportunities.title} />
              </h2>
              <p className="text-lg leading-relaxed text-brand-muted">
                <Highlight text={content.opportunities.body} />
              </p>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {content.opportunities.items.map((item, index) => {
              const Icon = itemIcon(item.icon);
              return (
                <Reveal key={item.title} delay={index * 0.07}>
                  <Spotlight className="h-full rounded-2xl border border-brand-line bg-brand-bg p-6">
                    <Icon className="size-6 text-brand-primary-text" aria-hidden />
                    <h3 className="mt-5 text-xl font-bold text-brand-text">{item.title}</h3>
                    <p className="mt-3 leading-relaxed text-brand-muted">{item.text}</p>
                  </Spotlight>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#071d39] py-14 text-white md:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d7ff5a]">{content.cta.label}</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
              <Highlight text={content.cta.title} />
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-blue-100/85">
              <Highlight text={content.cta.body} />
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
              <a
                href={mailto}
                className="inline-flex items-center gap-2 rounded-full bg-[#d7ff5a] px-6 py-3.5 font-bold text-[#061a35] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d7ff5a]"
              >
                <Mail className="size-4" aria-hidden />
                {content.cta.buttonLabel}
              </a>
              <Link
                to={pathFor(content.companion.linkTo)}
                className="inline-flex items-center gap-2 font-bold text-white transition hover:text-[#d7ff5a]"
              >
                {content.companion.linkLabel}
                <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="max-w-sm rounded-2xl border border-white/15 bg-white/[.07] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d7ff5a]">{content.companion.label}</p>
              <h3 className="mt-3 text-xl font-bold leading-tight text-white">
                <Highlight text={content.companion.title} />
              </h3>
              <p className="mt-3 leading-relaxed text-blue-100/80">
                <Highlight text={content.companion.body} />
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </Shell>
  );
}
