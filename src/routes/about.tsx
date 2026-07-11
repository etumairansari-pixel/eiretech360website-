import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Bot, Layers3, Users } from "lucide-react";
import { Shell, PageHero } from "@/components/site/Shell";
import { FinalCTA } from "@/components/site/FinalCTA";
import { Reveal, SectionLabel, Spotlight } from "@/components/site/primitives";

export const Route = createFileRoute("/about")({ component: AboutPage });

const differences = [
  [Layers3, "One Team, Every Capability", "From SEO to app development to AI, everything you need lives under one roof."],
  [Bot, "Automation First", "We build systems that keep working long after the project ends."],
  [Users, "Partnership Over Projects", "Your growth is our benchmark, not a one-off deliverable."],
  [BarChart3, "Data-Backed Decisions", "Every strategy is measured, tested and refined for real results."],
] as const;

function AboutPage() {
  return <Shell>
    <PageHero eyebrow="About Eire Tech" title={<>We build digital <span className="brand-gradient-text">ecosystems</span>, not just projects.</>} subtitle="Eire Tech is a full-service digital solutions company helping businesses grow, automate and innovate in today’s fast-paced digital landscape." />
    <section className="py-24"><div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-2">
      <Reveal><SectionLabel>Our Story</SectionLabel><h2 className="text-4xl font-extrabold tracking-tight">One connected partner.</h2></Reveal>
      <Reveal delay={0.1} className="space-y-5 text-lg leading-relaxed text-brand-muted"><p>Eire Tech was built on one core belief: technology and creativity, when combined strategically, can transform any brand. What started as a vision to simplify digital growth has become a full-service partner for start-ups and established businesses alike.</p><p>We saw too many businesses juggling multiple agencies, tools and freelancers just to keep their digital presence running. So we built a single team that covers it all.</p></Reveal>
    </div></section>
    <section className="bg-brand-surface py-24"><div className="mx-auto max-w-7xl px-6"><SectionLabel>What Makes Us Different</SectionLabel><div className="mt-8 grid gap-4 md:grid-cols-2">{differences.map(([Icon,title,text], i)=><Reveal key={title} delay={i*.06}><Spotlight className="h-full rounded-2xl border border-brand-line bg-brand-bg p-8"><Icon className="mb-6 size-7 text-brand-primary"/><h3 className="text-xl font-bold">{title}</h3><p className="mt-3 text-brand-muted">{text}</p></Spotlight></Reveal>)}</div></div></section>
    <section className="py-24"><div className="mx-auto max-w-4xl px-6 text-center"><SectionLabel>Our Mission</SectionLabel><p className="text-3xl font-bold leading-tight md:text-5xl">Help businesses reduce manual effort, strengthen their brand and stay ahead through <span className="brand-gradient-text">smart strategy and intelligent automation.</span></p><p className="mx-auto mt-8 max-w-2xl text-brand-muted">A multidisciplinary team of marketers, developers, designers and AI specialists—all working under one vision: helping your brand do more with less effort.</p></div></section>
    <FinalCTA title="Ready to build something exceptional?" accentWord="exceptional" subtitle="Bring us your next challenge and let’s shape the right digital ecosystem together." buttonLabel="Get in Touch" />
  </Shell>;
}
