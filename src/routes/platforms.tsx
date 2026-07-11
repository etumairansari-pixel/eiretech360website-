import { createFileRoute } from "@tanstack/react-router";
import { BrainCircuit, Code2, Megaphone, Palette, ShoppingBag, Workflow } from "lucide-react";
import { Shell, PageHero } from "@/components/site/Shell";
import { FinalCTA } from "@/components/site/FinalCTA";
import { Reveal, Spotlight } from "@/components/site/primitives";

export const Route = createFileRoute("/platforms")({ component: PlatformsPage });
const groups = [
  [ShoppingBag,"Website & E-commerce",["WordPress","Shopify","Wix","Webflow"]],
  [Workflow,"CRM & Automation",["HubSpot","Salesforce","Zapier","Make","ActiveCampaign"]],
  [Palette,"Design & Creative",["Adobe Creative Suite","Figma","Canva"]],
  [Megaphone,"Marketing & Advertising",["Google Ads","Meta Business Suite","Google Analytics","SEMrush / Ahrefs"]],
  [Code2,"App Development",["React Native","Flutter","Firebase","AWS"]],
  [BrainCircuit,"AI & Automation",["OpenAI / Custom AI Models","Chatbot Platforms","Custom Automation Pipelines"]],
] as const;
function PlatformsPage(){return <Shell><PageHero eyebrow="Platforms & Tools" title={<>The technology behind <span className="brand-gradient-text">our work.</span></>} subtitle="We work with industry-leading platforms and tools to build, automate and scale your digital presence with confidence."/><section className="pb-24"><div className="mx-auto grid max-w-7xl gap-5 px-6 md:grid-cols-2 lg:grid-cols-3">{groups.map(([Icon,title,tools],i)=><Reveal key={title} delay={i*.05}><Spotlight className="h-full rounded-3xl border border-brand-line bg-brand-surface p-8"><Icon className="size-7 text-brand-primary"/><h2 className="mt-6 text-xl font-bold">{title}</h2><div className="mt-6 flex flex-wrap gap-2">{tools.map(t=><span key={t} className="rounded-full border border-brand-line bg-brand-bg px-3 py-1.5 text-sm text-brand-muted">{t}</span>)}</div></Spotlight></Reveal>)}</div><p className="mx-auto mt-14 max-w-3xl px-6 text-center text-lg text-brand-muted">Our team stays current with the latest platforms and technologies so you always get modern, future-proof solutions—not outdated approaches.</p></section><FinalCTA title="Which platform fits your business best?" accentWord="fits" subtitle="We’ll help you choose a stack built around your goals, team and growth plans." buttonLabel="Talk to Our Team"/></Shell>}
