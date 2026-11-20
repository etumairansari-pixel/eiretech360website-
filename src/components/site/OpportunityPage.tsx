import { Link } from "@tanstack/react-router";
import {
  Code2,
  Compass,
  Handshake,
  Lightbulb,
  Mail,
  Megaphone,
  Palette,
  Sparkles,
  Target,
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
  introduction: { label: string; title: string; body: string; highlights: OpportunityItem[] };
  opportunities: { label: string; title: string; body: string; items: OpportunityItem[] };
  companion: { label: string; title: string; body: string; linkLabel: string; linkTo: string };
  cta: { label: string; title: string; body: string; buttonLabel: string };
  emailSubject: string;
};

const opportunityIcons = {
  "code-2": Code2,
  compass: Compass,
  handshake: Handshake,
  lightbulb: Lightbulb,
  megaphone: Megaphone,
  palette: Palette,
  sparkles: Sparkles,
  target: Target,
  users: UsersRound,
} as const;

function itemIcon(name: string) {
  return opportunityIcons[name as keyof typeof opportunityIcons] ?? Sparkles;
}

/** A concise, people-first page inspired by editorial careers-page layouts. */
export function OpportunityPage({ content }: { content: OpportunityContent }) {
  const mailto = `mailto:${content.email}?subject=${encodeURIComponent(content.emailSubject)}`;

  return (
    <Shell>
      <section className="relative isolate overflow-hidden bg-[#edf7f5] pb-16 pt-32 text-[#071d39] md:pb-20 md:pt-36">
        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,.72fr)] lg:items-center">
          <Reveal>
            <p className="inline-flex items-center gap-2 border-l-2 border-[#98be3e] pl-3 text-sm font-bold uppercase tracking-[0.16em] text-[#1b5b91]">
              <Sparkles className="size-4 text-[#8caf2f]" aria-hidden />
              {content.hero.eyebrow}
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.04] tracking-tight md:text-6xl lg:text-[4.25rem]">
              <Highlight text={content.hero.title} />
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#36516b] md:text-xl">
              <Highlight text={content.hero.subtitle} />
            </p>
            <div className="mt-7 flex flex-wrap gap-2" aria-label="Opportunity themes">
              {content.hero.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-[#0d3457]/15 bg-white/70 px-3.5 py-2 text-sm font-semibold text-[#183957]">
                  {tag}
                </span>
              ))}
            </div>
            <a
              href={mailto}
              className="mt-8 inline-flex items-center gap-2 rounded-md bg-[#a6cb46] px-6 py-3.5 font-bold text-[#061a35] transition hover:bg-[#8fb534] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0d3457]"
            >
              <Mail className="size-4" aria-hidden />
              {content.hero.actionLabel}
            </a>
            <p className="mt-4 text-base text-[#36516b]">
              Or email us directly: {" "}
              <a href={mailto} className="font-bold text-[#175c98] underline decoration-[#a6cb46] decoration-2 underline-offset-4 hover:text-[#071d39]">
                {content.email}
              </a>
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative mx-auto w-full max-w-[29rem] lg:ml-auto">
              <div className="relative overflow-hidden rounded-[2rem] border border-white bg-white p-2 shadow-[0_26px_70px_rgba(7,29,57,.18)]">
                <img
                  src={content.image.src}
                  alt={content.image.alt}
                  width="1122"
                  height="1400"
                  className="aspect-[4/5] w-full rounded-[1.55rem] object-cover"
                  loading="eager"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 max-w-[15rem] rounded-2xl border border-[#0d3457]/10 bg-[#071d39] px-5 py-4 text-white shadow-[0_16px_30px_rgba(7,29,57,.2)] md:-left-10">
                <p className="text-sm font-bold text-[#d9ff5e]">{content.ireland.label}</p>
                <p className="mt-1 text-sm leading-relaxed text-blue-100">{content.ireland.title}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <div className="max-w-3xl">
              <SectionLabel>{content.introduction.label}</SectionLabel>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-brand-text md:text-5xl">
                <Highlight text={content.introduction.title} />
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-brand-muted">
                <Highlight text={content.introduction.body} />
              </p>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-8 border-t border-brand-line pt-8 md:grid-cols-3">
            {content.introduction.highlights.map((highlight, index) => {
              const Icon = itemIcon(highlight.icon);
              return (
                <Reveal key={highlight.title} delay={index * 0.08}>
                  <article className="max-w-sm">
                    <div className="grid size-12 place-items-center rounded-xl bg-[#e7f1f5] text-[#1b6cad]">
                      <Icon className="size-6" aria-hidden />
                    </div>
                    <h3 className="mt-5 text-xl font-bold leading-snug text-brand-text">{highlight.title}</h3>
                    <p className="mt-2 leading-relaxed text-brand-muted">{highlight.text}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#e7f1f5] py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,.55fr)] lg:items-end">
              <div>
                <SectionLabel>{content.opportunities.label}</SectionLabel>
                <h2 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-brand-text md:text-5xl">
                  <Highlight text={content.opportunities.title} />
                </h2>
              </div>
              <p className="text-lg leading-relaxed text-brand-muted">
                <Highlight text={content.opportunities.body} />
              </p>
            </div>
          </Reveal>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {content.opportunities.items.map((item, index) => {
              const Icon = itemIcon(item.icon);
              return (
                <Reveal key={item.title} delay={index * 0.07}>
                  <Spotlight className="h-full rounded-2xl border border-[#0d3457]/10 bg-white p-6 shadow-[0_12px_28px_rgba(7,29,57,.05)]">
                    <Icon className="size-7 text-[#2578c8]" aria-hidden />
                    <h3 className="mt-5 text-xl font-bold text-brand-text">{item.title}</h3>
                    <p className="mt-3 leading-relaxed text-brand-muted">{item.text}</p>
                  </Spotlight>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#071d39] py-16 text-white md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,.55fr)] lg:items-center">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#d9ff5e]">{content.cta.label}</p>
            <h2 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
              <Highlight text={content.cta.title} />
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-blue-100/85">
              <Highlight text={content.cta.body} />
            </p>
            <a
              href={mailto}
              className="mt-7 inline-flex items-center gap-2 rounded-md bg-[#d9ff5e] px-6 py-3.5 font-bold text-[#061a35] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d9ff5e]"
            >
              <Mail className="size-4" aria-hidden />
              {content.cta.buttonLabel}
            </a>
            <a href={mailto} className="mt-4 block w-fit font-bold text-[#d9ff5e] underline decoration-white/30 decoration-2 underline-offset-4 hover:text-white">
              {content.email}
            </a>
          </Reveal>
          <Reveal delay={0.1}>
            <aside className="rounded-2xl border border-white/15 bg-white/[.07] p-6">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#d9ff5e]">{content.companion.label}</p>
              <h3 className="mt-3 text-2xl font-bold leading-tight text-white">
                <Highlight text={content.companion.title} />
              </h3>
              <p className="mt-3 leading-relaxed text-blue-100/80">
                <Highlight text={content.companion.body} />
              </p>
              <Link
                to={pathFor(content.companion.linkTo)}
                className="mt-5 inline-flex rounded-md border border-[#d9ff5e]/70 px-4 py-2.5 font-bold text-[#d9ff5e] transition hover:bg-[#d9ff5e] hover:text-[#071d39]"
              >
                {content.companion.linkLabel}
              </Link>
            </aside>
          </Reveal>
        </div>
      </section>
    </Shell>
  );
}
