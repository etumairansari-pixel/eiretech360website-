import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import {
  ArrowUpRight,
  Check,
  Compass,
  Route as RouteIcon,
  Hammer,
  TrendingUp,
  Quote,
  Star,
  ShieldCheck,
} from "lucide-react";
import heroBg from "@/assets/hero.jpg";
import circuitImg from "@/assets/circuit.jpg";
import officeHero from "@/assets/agency-team-photoreal.jpg";

import { Shell } from "@/components/site/Shell";
import { LogoMark } from "@/components/Logo";
import { FinalCTA } from "@/components/site/FinalCTA";
import { services } from "@/components/site/data";
import {
  Counter,
  MagneticLink,
  Reveal,
  SectionLabel,
  Spotlight,
} from "@/components/site/primitives";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Eire Tech — Digital Growth & Automation Partner" },
      {
        name: "description",
        content:
          "Grow. Automate. Innovate. Eire Tech is your full-service digital partner — blending strategy, creativity, and AI to transform how your brand shows up, scales, and runs.",
      },
    ],
    // Let the browser start the LCP background image with the HTML, instead of
    // waiting for the JS bundle to render the <img>.
    links: [{ rel: "preload", as: "image", href: heroBg, fetchPriority: "high" }],
  }),
  component: Home,
});

/* ---------------- Hero ---------------- */
const HEADLINE = ["Grow.", "Automate.", "Innovate."];

function Hero() {
  return (
    <section className="relative overflow-hidden pb-24 pt-40">
      <div className="absolute inset-0 -z-10 opacity-50">
        <img
          src={heroBg}
          alt=""
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-bg/60 via-brand-bg/85 to-brand-bg" />
      </div>

      <div className="grid-bg pointer-events-none absolute inset-0 -z-10 opacity-50 [mask-image:radial-gradient(ellipse_at_top,black_25%,transparent_70%)]" />
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[500px] w-full max-w-5xl -translate-x-1/2 rounded-full bg-brand-primary/15 blur-[130px]" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-primary/25 bg-brand-primary/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-brand-primary"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-brand-primary" />
              </span>
              Digital Growth &amp; Automation Partner
            </motion.div>

            <h1 className="mb-8 text-5xl font-extrabold leading-[0.92] tracking-tighter md:text-8xl">
              {HEADLINE.map((w, i) => (
                <span key={w} className="mr-3 inline-block overflow-hidden align-top md:mr-4">
                  <motion.span
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.65, delay: 0.1 + i * 0.08, ease: [0.2, 0, 0, 1] }}
                    className={"inline-block " + (i === 1 ? "brand-gradient-text text-glow" : "")}
                  >
                    {w}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.35 }}
              className="mb-10 max-w-xl text-lg leading-relaxed text-brand-muted"
            >
              Eire Tech is your full-service digital partner — blending strategy, creativity and AI
              to transform how your brand shows up, scales and runs.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.45 }}
              className="flex flex-wrap gap-4"
            >
              <MagneticLink
                to="/contact"
                className="group inline-flex items-center gap-2 rounded-full brand-gradient-bg px-8 py-4 font-bold text-white transition-shadow hover:brand-glow"
              >
                Book a Free Consultation
                <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" />
              </MagneticLink>
              <MagneticLink
                to="/services"
                className="inline-flex items-center rounded-full border border-brand-line px-8 py-4 font-bold transition-colors hover:border-brand-primary/60 hover:text-brand-primary"
              >
                Explore Our Services
              </MagneticLink>
            </motion.div>
          </div>

          {/* Office image card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.2, 0, 0, 1] }}
            className="relative hidden lg:block"
          >
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-primary/20 via-brand-accent/10 to-brand-secondary/20 blur-2xl" />
            <div className="relative aspect-[5/6] overflow-hidden rounded-3xl border border-brand-line shadow-2xl">
              <img
                src={officeHero}
                alt="Eire Tech studio — one team building digital ecosystems"
                loading="lazy"
                fetchPriority="low"
                decoding="async"
                className="h-full w-full object-cover"
              />
              {/* Fixed dark scrim, not brand-bg: the caption below is white, and
                  brand-bg is white in light mode — it made the text disappear. */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />
              <div className="pointer-events-none absolute inset-4">
                <div className="absolute left-0 top-0 size-6 border-l-2 border-t-2 border-brand-primary" />
                <div className="absolute right-0 top-0 size-6 border-r-2 border-t-2 border-brand-primary" />
                <div className="absolute bottom-0 left-0 size-6 border-b-2 border-l-2 border-brand-accent" />
                <div className="absolute bottom-0 right-0 size-6 border-b-2 border-r-2 border-brand-accent" />
              </div>
              <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-accent">
                    Studio · Live
                  </div>
                  <div className="mt-1 text-lg font-bold leading-tight text-white">
                    One team. Every capability.
                  </div>
                </div>
                <div className="relative grid size-12 shrink-0 place-items-center rounded-xl bg-white accent-glow">
                  <LogoMark className="size-9" />
                </div>
              </div>
            </div>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="glass absolute -left-6 top-10 hidden rounded-xl p-3 xl:block"
            >
              <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-brand-accent">
                Automation-first
              </div>
              <div className="mt-1 text-xs font-bold">Systems, not sprints</div>
            </motion.div>
          </motion.div>
        </div>

        <div className="mt-20 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-brand-line pt-8 md:grid-cols-4">
          {[
            { n: 140, s: "%", l: "avg. growth", accent: true },
            { n: 500, s: "K+", l: "leads generated" },
            { n: 2500, s: "", l: "workflows automated", accent: true },
            { n: 80, s: "%", l: "manual effort cut" },
          ].map((it) => (
            <div key={it.l}>
              <div
                className={
                  "text-3xl font-extrabold tracking-tight md:text-5xl " +
                  (it.accent ? "brand-gradient-text" : "")
                }
              >
                <Counter to={it.n} suffix={it.s} />
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-brand-muted">
                {it.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Marquee ---------------- */
function Marquee() {
  const items = ["Results-Driven", "AI-Native", "Brand-First", "Always-On", "Future-Proof"];
  return (
    <section className="mask-fade-x overflow-hidden border-y border-brand-line bg-brand-surface py-7">
      <div className="animate-marquee flex w-max gap-10 whitespace-nowrap font-mono text-xl uppercase tracking-tight md:text-2xl">
        {[...items, ...items, ...items, ...items].map((t, i) => (
          <span key={i} className="flex items-center gap-10 text-brand-muted">
            {t}
            <span className="inline-flex size-7 items-center justify-center rounded-md bg-white ring-1 ring-brand-accent/40">
              <LogoMark className="size-5" />
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Mission ---------------- */
function Mission() {
  return (
    <section className="py-28">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <Reveal>
          <SectionLabel>
            <span className="mx-auto">Our Mission</span>
          </SectionLabel>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-5xl">
            Technology and creativity, <span className="brand-gradient-text">working as one.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-brand-muted">
            When strategy meets creativity, brands don't just grow — they transform. Eire Tech is a
            full-service digital solutions company built to support every stage of your brand's
            journey, from first impression to full-scale automation. We don't hand off projects and
            disappear. We build long-term partnerships focused on one thing:{" "}
            <span className="font-semibold text-brand-text">measurable, real-world results.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Services expanding panels ---------------- */
function ServicePanel({
  s,
  i,
  active,
  onActivate,
}: {
  s: (typeof services)[number];
  i: number;
  active: boolean;
  onActivate: () => void;
}) {
  const Icon = s.icon;
  return (
    <motion.div
      onMouseEnter={onActivate}
      onClick={onActivate}
      style={{
        flexGrow: active ? 16 : 1,
        flexBasis: 0,
        transition: "flex-grow 700ms cubic-bezier(0.22,1,0.36,1)",
      }}
      className="group relative h-[540px] min-w-[68px] shrink-0 cursor-pointer overflow-hidden border-r border-brand-line last:border-r-0"
      data-hover
    >
      <motion.img
        src={s.img}
        alt={s.title}
        loading="lazy"
        animate={{ scale: active ? 1.03 : 1.18, opacity: active ? 1 : 0.62 }}
        transition={{ duration: 1, ease: [0.2, 0, 0, 1] }}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <motion.div
        aria-hidden
        animate={{ opacity: active ? 0 : 0.58 }}
        className="absolute inset-0 bg-slate-950"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />
      <motion.div
        animate={{ opacity: active ? 1 : 0, scaleX: active ? 1 : 0 }}
        transition={{ duration: 0.6, delay: active ? 0.1 : 0 }}
        style={{ transformOrigin: "left" }}
        className="brand-gradient-bg absolute inset-x-0 top-0 h-px"
      />

      {/* collapsed */}
      <motion.div
        animate={{ opacity: active ? 0 : 1 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 flex flex-col items-center justify-between py-7"
      >
        <span className="font-mono text-[10px] tracking-widest text-brand-primary">
          {String(i + 1).padStart(2, "0")}
        </span>
        <span
          className="font-mono text-[11px] uppercase tracking-[0.4em] text-brand-text/90"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {s.title}
        </span>
        <div className="grid size-9 place-items-center rounded-md border border-brand-line bg-brand-elevated/60 text-brand-primary transition-colors group-hover:border-brand-primary/50">
          <Icon className="size-4" />
        </div>
      </motion.div>

      {/* expanded */}
      <motion.div
        animate={{ opacity: active ? 1 : 0, x: active ? 0 : -20 }}
        transition={{ duration: 0.5, delay: active ? 0.2 : 0, ease: [0.2, 0, 0, 1] }}
        className="pointer-events-none relative flex h-full flex-col justify-between p-8 md:p-10"
      >
        <div className="flex items-start justify-between gap-6">
          <div className="grid size-14 place-items-center rounded-2xl border border-brand-primary/40 bg-brand-primary/10 text-brand-primary backdrop-blur brand-glow">
            <Icon className="size-6" />
          </div>
          <div className="text-right font-mono text-[10px] uppercase tracking-[0.25em] text-brand-primary">
            / {s.tag}
            <div className="mt-1 text-brand-muted">{String(i + 1).padStart(2, "0")} — 09</div>
          </div>
        </div>
        <div className="max-w-[520px]">
          <h3 className="mb-4 text-3xl font-extrabold leading-[0.95] tracking-tighter text-white md:text-5xl">
            {s.title}
          </h3>
          <p className="mb-6 max-w-md text-[15px] leading-relaxed text-white/80">{s.desc}</p>
          <div className="flex flex-wrap gap-2">
            {s.points.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-white/90 backdrop-blur"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ServiceMobileCard({
  s,
  i,
  active,
  onToggle,
}: {
  s: (typeof services)[number];
  i: number;
  active: boolean;
  onToggle: () => void;
}) {
  const Icon = s.icon;
  return (
    <motion.div
      layout
      onClick={onToggle}
      animate={{ height: active ? 480 : 96 }}
      className={`relative w-full cursor-pointer overflow-hidden rounded-2xl border text-white ${
        active ? "border-brand-primary/50" : "border-brand-line"
      }`}
      data-hover
    >
      <motion.img
        src={s.img}
        alt={s.title}
        loading="lazy"
        animate={{ opacity: active ? 0.9 : 0.55, scale: active ? 1.02 : 1.12 }}
        transition={{ duration: 0.7 }}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/25" />
      <div className="relative flex items-center gap-4 p-5">
        <div className="grid size-12 shrink-0 place-items-center rounded-xl border border-brand-primary/40 bg-brand-primary/10 text-brand-primary backdrop-blur">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] uppercase tracking-widest text-brand-primary">
            {String(i + 1).padStart(2, "0")} / {s.tag}
          </div>
          <h3 className="truncate text-lg font-extrabold tracking-tight text-white">{s.title}</h3>
        </div>
        <motion.div
          animate={{ rotate: active ? 45 : 0 }}
          className="grid size-8 shrink-0 place-items-center rounded-full border border-brand-line text-brand-muted"
        >
          +
        </motion.div>
      </div>
      <motion.div
        animate={{ opacity: active ? 1 : 0, y: active ? 0 : 10 }}
        transition={{ duration: 0.4, delay: active ? 0.15 : 0 }}
        className="pointer-events-none relative px-6 pb-6"
      >
        <p className="mb-4 text-sm leading-relaxed text-white/90">{s.desc}</p>
        <ul className="space-y-2">
          {s.points.map((p) => (
            <li key={p} className="flex items-center gap-2 text-xs text-white/80">
              <Check className="size-3.5 shrink-0 text-brand-accent" />
              {p}
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
}

function ServicesOverview() {
  const [active, setActive] = useState(0);
  return (
    <section className="relative overflow-hidden bg-brand-surface py-28">
      <div className="dot-bg pointer-events-none absolute inset-0 -z-10 opacity-50" />
      <div className="pointer-events-none absolute -left-40 top-1/3 -z-10 size-[500px] rounded-full bg-brand-primary/10 blur-[140px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 -z-10 size-[500px] rounded-full bg-brand-secondary/10 blur-[140px]" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <SectionLabel>Everything Under One Roof</SectionLabel>
            <h2 className="max-w-2xl text-4xl font-extrabold tracking-tighter md:text-6xl">
              Nine disciplines.
              <br />
              <span className="brand-gradient-text">One integrated ecosystem.</span>
            </h2>
            <div className="brand-gradient-bg mt-5 h-1 w-20" />
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-brand-muted">
            From visibility to efficiency, we cover the full spectrum of digital growth — every
            layer of your presence, engineered to work as one system. Hover any panel to expand.
          </p>
        </div>

        <div className="hidden overflow-hidden rounded-3xl border border-brand-line bg-brand-bg shadow-2xl lg:flex">
          {services.map((s, i) => (
            <ServicePanel
              key={s.title}
              s={s}
              i={i}
              active={active === i}
              onActivate={() => setActive(i)}
            />
          ))}
        </div>

        <div className="flex flex-col gap-4 lg:hidden">
          {services.map((s, i) => (
            <ServiceMobileCard
              key={s.title}
              s={s}
              i={i}
              active={active === i}
              onToggle={() => setActive(active === i ? -1 : i)}
            />
          ))}
        </div>

        <Reveal delay={0.1} className="mt-12 flex justify-center">
          <MagneticLink
            to="/services"
            className="group inline-flex items-center gap-2 rounded-full border border-brand-primary/40 bg-brand-primary/5 px-7 py-3.5 font-bold text-brand-primary transition-colors hover:bg-brand-primary/10"
          >
            See How We Can Help
            <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" />
          </MagneticLink>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Why Eire Tech ---------------- */
function WhyEireTech() {
  const reasons = [
    [
      "01",
      "One partner, every capability",
      "No juggling five agencies. Marketing, automation, design, dev and AI in one place.",
    ],
    ["02", "Built for long-term growth", "We're invested in outcomes, not one-off invoices."],
    [
      "03",
      "Automation-first thinking",
      "Everything we build is designed to reduce manual work and free up your time.",
    ],
    ["04", "Results you can measure", "Strategy backed by data, not guesswork."],
  ];
  return (
    <section className="py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 md:grid-cols-2">
        <div>
          <SectionLabel>Why Eire Tech</SectionLabel>
          <h2 className="mb-6 text-4xl font-extrabold tracking-tighter md:text-5xl">
            We build <span className="brand-gradient-text">ecosystems</span>, not just deliverables.
          </h2>
          <p className="mb-8 leading-relaxed text-brand-muted">
            Whether you're just establishing your presence or ready to scale through automation and
            AI, our team works closely with you — as an extension of your own — to deliver outcomes
            that matter.
          </p>
          <ul>
            {reasons.map(([n, t, d], idx) => (
              <Reveal key={n} delay={idx * 0.06}>
                <div
                  className="group flex items-start gap-5 border-b border-brand-line py-5"
                  data-hover
                >
                  <span className="font-mono text-sm text-brand-accent">{n}</span>
                  <div className="flex-1">
                    <div className="font-bold transition-transform group-hover:translate-x-1">
                      {t}
                    </div>
                    <p className="mt-1 text-sm text-brand-muted">{d}</p>
                  </div>
                  <ArrowUpRight className="mt-1 size-4 text-brand-muted transition-all group-hover:rotate-45 group-hover:text-brand-primary" />
                </div>
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal delay={0.1}>
          <div className="relative">
            <div className="animate-pulse-slow absolute inset-0 rounded-3xl bg-brand-primary/25 blur-[90px]" />
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-brand-line shadow-2xl">
              <img
                src={circuitImg}
                alt="Glowing circuit board"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 to-transparent" />
              <div className="absolute left-4 top-4 size-6 border-l-2 border-t-2 border-brand-primary/60" />
              <div className="absolute right-4 top-4 size-6 border-r-2 border-t-2 border-brand-primary/60" />
              <div className="absolute bottom-4 left-4 size-6 border-b-2 border-l-2 border-brand-primary/60" />
              <div className="absolute bottom-4 right-4 size-6 border-b-2 border-r-2 border-brand-primary/60" />
              <div className="absolute inset-x-6 bottom-6 flex items-end justify-between">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-brand-primary">
                    AI · Automation · Intelligence
                  </div>
                  <div className="mt-2 text-2xl font-bold text-white">Intelligence by design.</div>
                </div>
                <div className="relative grid size-14 shrink-0 place-items-center rounded-full bg-white accent-glow">
                  <LogoMark className="size-10" />
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Process ---------------- */
function Process() {
  const steps = [
    { icon: Compass, k: "Discover", v: "We learn your business, goals and challenges." },
    {
      icon: RouteIcon,
      k: "Strategize",
      v: "We design a roadmap across marketing, brand and tech.",
    },
    {
      icon: Hammer,
      k: "Build",
      v: "We execute across websites, apps, automations, campaigns and content.",
    },
    { icon: TrendingUp, k: "Optimize", v: "We track, refine and scale what works." },
  ];
  return (
    <section className="bg-brand-surface py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16">
          <SectionLabel>How We Work Together</SectionLabel>
          <h2 className="text-4xl font-extrabold tracking-tighter md:text-5xl">
            A <span className="brand-gradient-text">system</span>, not a sprint.
          </h2>
        </div>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-brand-line bg-brand-line md:grid-cols-4">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.k} delay={i * 0.08}>
                <div
                  className="group relative h-full overflow-hidden bg-brand-bg p-8 transition-colors hover:bg-brand-elevated"
                  data-hover
                >
                  <div className="absolute -right-4 -top-6 text-[110px] font-extrabold leading-none text-brand-text/[0.04] transition-colors group-hover:text-brand-primary/10">
                    {i + 1}
                  </div>
                  <div className="relative">
                    <div className="mb-8 grid size-12 place-items-center rounded-xl border border-brand-line bg-brand-surface text-brand-primary">
                      <Icon className="size-5" />
                    </div>
                    <div className="mb-3 text-xl font-bold">{s.k}</div>
                    <p className="text-sm leading-relaxed text-brand-muted">{s.v}</p>
                    <div className="mt-6 h-px w-10 bg-gradient-to-r from-brand-accent to-transparent transition-all group-hover:w-24" />
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Who We Serve ---------------- */
function WhoWeServe() {
  return (
    <section className="py-28">
      <div className="mx-auto max-w-5xl px-6">
        <Spotlight className="overflow-hidden rounded-3xl border border-brand-line bg-brand-surface p-10 md:p-16">
          <SectionLabel>Who We Serve</SectionLabel>
          <h2 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tighter md:text-5xl">
            For <span className="brand-gradient-text">start-ups</span> and{" "}
            <span className="brand-gradient-text">scaling businesses</span> alike.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-brand-muted">
            Whether you're just establishing your presence or ready to scale through automation and
            AI, our team works closely with you, as an extension of your own, to deliver outcomes
            that matter.
          </p>
        </Spotlight>
      </div>
    </section>
  );
}

const testimonials = [
  {
    initials: "AM",
    name: "Amina M.",
    role: "Founder · Consumer services",
    quote:
      "The biggest difference was having strategy, creative and automation handled as one system. Our team finally had a clear plan—and far less manual follow-up.",
  },
  {
    initials: "DO",
    name: "Daniel O.",
    role: "Operations lead · B2B company",
    quote:
      "They translated a messy internal process into something simple our team could actually use. Communication was clear, thoughtful and refreshingly practical.",
  },
  {
    initials: "SK",
    name: "Sarah K.",
    role: "Marketing director · Growing brand",
    quote:
      "The work felt genuinely collaborative. Every recommendation connected back to a measurable goal, and the finished experience feels distinctly like our brand.",
  },
] as const;

function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-brand-surface py-28">
      <LogoMark
        className="pointer-events-none absolute -left-28 top-1/2 size-[34rem] -translate-y-1/2 opacity-[0.025]"
        title=""
      />
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <SectionLabel>Client Feedback</SectionLabel>
            <h2 className="max-w-2xl text-4xl font-extrabold tracking-tighter md:text-6xl">
              Built to feel like an{" "}
              <span className="brand-gradient-text">extension of your team.</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-brand-line bg-brand-bg px-4 py-2 text-xs text-brand-muted">
            <ShieldCheck className="size-4 text-brand-accent" /> Testimonials
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <Spotlight className="relative h-full overflow-hidden rounded-3xl border border-brand-line bg-brand-bg p-8 shadow-xl shadow-brand-primary/[0.03]">
                <Quote className="absolute right-7 top-7 size-10 text-brand-primary/10" />
                <div className="mb-7 flex gap-1" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, n) => (
                    <Star key={n} className="size-4 fill-brand-accent text-brand-accent" />
                  ))}
                </div>
                <blockquote className="text-lg font-medium leading-relaxed">“{t.quote}”</blockquote>
                <div className="mt-8 flex items-center gap-4 border-t border-brand-line pt-6">
                  <div className="grid size-12 place-items-center rounded-full brand-gradient-bg font-bold text-white shadow-lg">
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-bold">{t.name}</div>
                    <div className="mt-0.5 text-xs text-brand-muted">{t.role}</div>
                  </div>
                </div>
              </Spotlight>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Home() {
  return (
    <Shell>
      <Hero />
      <Marquee />
      <Mission />
      <ServicesOverview />
      <WhyEireTech />
      <Process />
      <WhoWeServe />
      <Testimonials />
      <FinalCTA
        title="Let's build something exceptional together"
        accentWord="exceptional"
        subtitle="Ready to power your next phase of growth? Connect with Eire Tech and let's talk about what's possible."
        buttonLabel="Connect With Us"
      />
    </Shell>
  );
}
