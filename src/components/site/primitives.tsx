import {
  motion,
  useScroll,
  useSpring,
  useMotionValue,
  useInView,
  animate,
  useMotionTemplate,
} from "motion/react";
import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Link } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";

/* ---------------- Scroll progress ---------------- */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const sx = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX: sx, transformOrigin: "0%" }}
      className="brand-gradient-bg fixed inset-x-0 top-0 z-[80] h-[2px]"
    />
  );
}

/* ---------------- Magnetic hover ---------------- */
function useMagnet(strength = 0.25) {
  const ref = useRef<HTMLElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 20 });
  const sy = useSpring(y, { stiffness: 300, damping: 20 });

  const onMouseMove = (e: MouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const onMouseLeave = () => {
    x.set(0);
    y.set(0);
  };
  return { ref, sx, sy, onMouseMove, onMouseLeave };
}

/** Magnetic internal router link. */
export function MagneticLink({
  to,
  hash,
  children,
  className,
}: {
  to: string;
  hash?: string;
  children: ReactNode;
  className?: string;
}) {
  const { ref, sx, sy, onMouseMove, onMouseLeave } = useMagnet();
  const MotionLink = motion.create(Link);
  return (
    <MotionLink
      to={to}
      hash={hash}
      ref={ref as never}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ x: sx, y: sy }}
      className={className}
      data-hover
    >
      {children}
    </MotionLink>
  );
}

/** Magnetic plain anchor (external / mailto). */
export function MagneticAnchor({ children, className, ...rest }: ComponentPropsWithoutRef<"a">) {
  const { ref, sx, sy, onMouseMove, onMouseLeave } = useMagnet();
  return (
    <motion.a
      ref={ref as never}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ x: sx, y: sy }}
      className={className}
      data-hover
      {...(rest as never)}
    >
      {children}
    </motion.a>
  );
}

/* ---------------- Reveal on scroll ---------------- */
export function Reveal({
  children,
  delay = 0,
  y = 26,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- Animated counter ---------------- */
export function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.8,
      ease: [0.2, 0, 0, 1],
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [inView, to]);
  return (
    <span ref={ref}>
      {Math.round(val).toLocaleString()}
      {suffix}
    </span>
  );
}

/* ---------------- Spotlight card (cursor-tracking glow) ---------------- */
export function Spotlight({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(-300);
  const my = useMotionValue(-300);
  const background = useMotionTemplate`radial-gradient(420px circle at ${mx}px ${my}px, color-mix(in oklab, var(--brand-blue) 16%, transparent), transparent 60%)`;

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };

  return (
    <div ref={ref} onMouseMove={onMouseMove} className={`group relative ${className}`}>
      <motion.div
        aria-hidden
        style={{ background }}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      {children}
    </div>
  );
}

/* ---------------- Theme toggle ---------------- */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`relative grid size-10 place-items-center overflow-hidden rounded-full border border-brand-line bg-brand-surface text-brand-text transition-colors hover:border-brand-primary/50 hover:text-brand-primary ${className}`}
      data-hover
    >
      <motion.span
        key={isDark ? "moon" : "sun"}
        initial={{ y: 14, opacity: 0, rotate: -35 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="grid place-items-center"
      >
        {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
      </motion.span>
    </button>
  );
}

/* ---------------- Section heading ---------------- */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-brand-primary-text">
      <span className="inline-block size-1.5 rounded-full bg-brand-accent" />
      {children}
    </div>
  );
}
