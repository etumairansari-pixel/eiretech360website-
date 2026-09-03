import { createFileRoute } from "@tanstack/react-router";
import { Check, ArrowUpRight } from "lucide-react";
import { Shell, PageHero } from "@/components/site/Shell";
import { FinalCTA } from "@/components/site/FinalCTA";
import { Reveal } from "@/components/site/primitives";
import { services } from "@/components/site/data";

export const Route = createFileRoute("/services")({ component: ServicesPage });

function ServicesPage() {
  return (
    <Shell>
      <PageHero
        eyebrow="Our Services"
        title={
          <>
            Full-spectrum digital solutions,{" "}
            <span className="brand-gradient-text">under one roof.</span>
          </>
        }
        subtitle="Every service you need to grow, automate and scale your brand, delivered by one connected team."
      />
      <section className="pb-24">
        <div className="mx-auto max-w-7xl space-y-6 px-6">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.title}>
                <article className="group grid overflow-hidden rounded-3xl border border-brand-line bg-brand-surface lg:grid-cols-[.8fr_1.2fr]">
                  <div className="relative min-h-64 overflow-hidden">
                    <img
                      src={s.img}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-slate-950/45" />
                    <span className="absolute left-7 top-7 font-mono text-xs text-white/90">
                      {String(i + 1).padStart(2, "0")} / 09
                    </span>
                  </div>
                  <div className="p-8 md:p-12">
                    <div className="mb-6 grid size-12 place-items-center rounded-xl bg-brand-primary/10 text-brand-primary">
                      <Icon className="size-6" />
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight">{s.title}</h2>
                    <p className="mt-3 text-brand-muted">{s.desc}</p>
                    <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                      {s.points.map((p) => (
                        <li key={p} className="flex gap-2 text-sm">
                          <Check className="mt-0.5 size-4 shrink-0 text-brand-accent-text" />
                          {p}
                        </li>
                      ))}
                    </ul>
                    <a
                      href="/contact"
                      className="mt-8 inline-flex items-center gap-2 font-bold text-brand-primary-text"
                    >
                      Discuss this service <ArrowUpRight className="size-4" />
                    </a>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>
      <FinalCTA
        title="Not sure which service fits your business?"
        accentWord="fits"
        subtitle="Let’s talk it through together and build a plan that works for you."
        buttonLabel="Book a Free Consultation"
      />
    </Shell>
  );
}
