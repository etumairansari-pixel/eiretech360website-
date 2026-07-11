import type { ReactNode } from "react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { LogoMark } from "@/components/Logo";
import { ScrollProgress } from "@/components/site/primitives";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-brand-bg text-brand-text">
      <ScrollProgress />
      <Nav />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

/** Standard page hero used by the inner pages. */
export function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
}) {
  return (
    <section className="relative overflow-hidden pb-20 pt-40">
      <div className="grid-bg pointer-events-none absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 size-[620px] -translate-x-1/2 rounded-full bg-brand-primary/15 blur-[130px]" />
      <LogoMark
        className="pointer-events-none absolute -right-16 top-20 -z-10 size-72 rotate-12 opacity-[0.035] md:right-10 md:size-[28rem]"
        title=""
      />

      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-primary/25 bg-brand-primary/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-brand-primary">
          <span className="inline-block size-1.5 rounded-full bg-brand-accent" />
          {eyebrow}
        </div>
        <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.02] tracking-tighter md:text-7xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-brand-muted">{subtitle}</p>
      </div>
    </section>
  );
}
