import { motion } from "motion/react";
import realMark from "@/assets/eiretech-mark-real.png";
import logoLight from "@/assets/eiretech-logo-light.png";
import logoDark from "@/assets/eiretech-logo-dark.png";

/** Official Eire Tech emblem extracted from the supplied master artwork. */
export function LogoMark({
  className = "",
  title = "Eire Tech",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <img
      src={realMark}
      alt={title}
      width={850}
      height={850}
      className={`object-contain ${className}`}
    />
  );
}

/**
 * Official Eire Tech lockup images (icon + wordmark + 360°), transparent, no
 * container. Two artworks: the light-mode file has black wordmark text, the
 * dark-mode file has white text — swapped by the `.dark` theme class.
 *
 * `tone="light"` forces the white-text artwork regardless of theme, for use
 * over the dark video hero (which is dark in both themes). Height comes from
 * `className` (e.g. "h-9"); width scales automatically.
 */
export function Logo({
  className = "h-9",
  tone = "auto",
}: {
  className?: string;
  tone?: "auto" | "light";
}) {
  const imgBase = `w-auto object-contain transition-transform duration-500 group-hover/logo:scale-[1.02] ${className}`;
  if (tone === "light") {
    return <img src={logoDark} alt="Eire Tech 360" width={4238} height={919} draggable={false} className={imgBase} />;
  }
  return (
    <span className="group/logo inline-flex">
      <img src={logoLight} alt="Eire Tech 360" width={4238} height={919} draggable={false} className={`${imgBase} block dark:hidden`} />
      <img src={logoDark} alt="" width={4238} height={919} aria-hidden draggable={false} className={`${imgBase} hidden dark:block`} />
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
