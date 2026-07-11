import { motion } from "motion/react";
import realMark from "@/assets/eiretech-mark-real.png";

/** Official Eire Tech emblem extracted from the supplied master artwork. */
export function LogoMark({
  className = "",
  title = "Eire Tech",
}: {
  className?: string;
  title?: string;
}) {
  return <img src={realMark} alt={title} className={`object-contain ${className}`} />;
}

/** Responsive official mark + rebuilt wordmark lockup for both color themes. */
export function Logo({
  className = "",
  markClassName = "size-10",
  textClassName = "text-lg",
  showSuffix = true,
}: {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  showSuffix?: boolean;
}) {
  return (
    <span className={`group/logo inline-flex items-center gap-2.5 ${className}`}>
      <span className="relative grid shrink-0 place-items-center">
        <span className="absolute inset-0 rounded-[40%] bg-brand-primary/25 opacity-0 blur-lg transition-opacity duration-300 group-hover/logo:opacity-100" />
        <LogoMark
          className={`relative transition-transform duration-500 group-hover/logo:-rotate-3 group-hover/logo:scale-105 ${markClassName}`}
        />
      </span>
      <span
        className={`whitespace-nowrap font-extrabold lowercase leading-none tracking-[-0.055em] ${textClassName}`}
      >
        <span className="text-brand-text">eire</span>
        <span className="mx-[0.1em] inline-block size-[0.28em] translate-y-[-0.8em] rounded-full bg-brand-accent shadow-[0_0_8px_var(--brand-green)]" />
        <span className="text-brand-text">tech</span>
        {showSuffix && (
          <sup className="ml-0.5 align-super text-[0.42em] font-bold text-brand-primary">360°</sup>
        )}
      </span>
    </span>
  );
}

export function LogoOrbit({ className = "size-28" }: { className?: string }) {
  return (
    <div className="relative inline-grid place-items-center">
      <LogoMark className={className} />
      <motion.div
        aria-hidden
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute inset-0 -m-[14%]"
      >
        <span className="absolute left-1/2 top-0 size-2 -translate-x-1/2 rounded-full bg-brand-accent shadow-[0_0_14px_var(--brand-green)]" />
        <span className="absolute bottom-0 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-brand-primary" />
      </motion.div>
    </div>
  );
}
