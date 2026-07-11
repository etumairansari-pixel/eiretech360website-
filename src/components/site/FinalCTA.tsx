import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { MagneticLink, Reveal } from "@/components/site/primitives";

export function FinalCTA({
  label = "Let's build",
  title,
  accentWord,
  subtitle,
  buttonLabel = "Connect With Us",
  buttonTo = "/contact",
}: {
  label?: string;
  title: string;
  accentWord: string;
  subtitle: string;
  buttonLabel?: string;
  buttonTo?: string;
}) {
  return (
    <section className="relative overflow-hidden py-28">
      <div className="grid-bg pointer-events-none absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_15%,transparent_70%)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary/12 blur-[130px]" />
      <div className="pointer-events-none absolute left-1/3 top-1/2 -z-10 size-[420px] -translate-y-1/2 rounded-full bg-brand-accent/10 blur-[120px]" />

      <motion.div
        aria-hidden
        animate={{ rotate: 360 }}
        transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[520px] -translate-x-1/2 -translate-y-1/2 opacity-[0.05]"
      >
        <LogoMark className="size-full" />
      </motion.div>

      <div className="mx-auto max-w-4xl px-6 text-center">
        <Reveal>
          <div className="mb-8 inline-grid place-items-center">
            <div className="relative grid size-16 place-items-center rounded-2xl border border-brand-line bg-brand-elevated accent-glow">
              <LogoMark className="size-11" />
              <span className="absolute -right-1 -top-1 size-3 animate-pulse rounded-full bg-brand-accent ring-2 ring-brand-bg" />
            </div>
          </div>
          <div className="mb-5 font-mono text-[10px] uppercase tracking-[0.3em] text-brand-accent">
            {label}
          </div>
          <h2 className="mx-auto max-w-3xl text-4xl font-extrabold leading-[1.02] tracking-tighter md:text-6xl">
            {title.split(accentWord)[0]}
            <span className="brand-gradient-text text-glow">{accentWord}</span>
            {title.split(accentWord)[1]}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-brand-muted">
            {subtitle}
          </p>
          <div className="mt-10 flex justify-center">
            <MagneticLink
              to={buttonTo}
              className="group inline-flex items-center gap-2 rounded-full brand-gradient-bg px-8 py-4 font-bold text-white transition-shadow hover:brand-glow"
            >
              {buttonLabel}
              <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" />
            </MagneticLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
