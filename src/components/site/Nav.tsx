import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { MagneticLink, ThemeToggle } from "@/components/site/primitives";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/platforms", label: "Platforms" },
  { to: "/contact", label: "Contact" },
] as const;

export function Nav() {
  const [open, setOpen] = useState(false);
  // Slides out of view on scroll-down and back in on scroll-up.
  const [visible, setVisible] = useState(true);
  const [atTop, setAtTop] = useState(true);
  const lastY = useRef(0);

  useEffect(() => {
    let frame = 0;

    const read = () => {
      frame = 0;
      const y = window.scrollY;
      const top = y < 60;
      // Ignore sub-pixel jitter so the bar doesn't flicker.
      if (Math.abs(y - lastY.current) > 6) {
        setVisible(y < lastY.current || top);
        lastY.current = y;
      }
      setAtTop(top);
    };

    // Reading scrollY directly in the scroll handler forces a layout flush on
    // every event. Coalescing into a single rAF puts the read on a frame
    // boundary where layout is already clean — same behaviour, one update per
    // frame instead of one per event.
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Dark-glass only while sitting on the home video hero. Once scrolled past it,
  // the revealed bar switches to the theme-aware solid style so it stays readable
  // over page content.
  const overHero = pathname === "/" && atTop;
  const currentPath = pathname.replace(/\/$/, "") || "/";

  const headerClass = overHero
    ? "border-white/10 bg-slate-950/60 text-white backdrop-blur-md"
    : "border-brand-line bg-brand-bg/80 text-brand-text backdrop-blur-md";

  return (
    <>
      <nav
        className={`fixed top-0 z-40 w-full border-b transition-transform duration-300 ${visible ? "translate-y-0" : "-translate-y-full"} ${headerClass}`}
      >
        <div className="mx-auto grid h-20 max-w-7xl grid-cols-[1fr_auto] items-center gap-4 px-5 md:h-[92px] md:grid-cols-[1fr_auto_1fr] md:px-6">
          <Link
            to="/"
            className="justify-self-start transition hover:-translate-y-0.5"
            data-hover
            aria-label="Eire Tech home"
          >
            <Logo className="h-10 md:h-12" tone={overHero ? "light" : "auto"} />
          </Link>

          <div className="hidden items-center justify-self-center gap-9 text-sm font-semibold md:inline-flex">
            {links.map((l) => {
              const active = currentPath === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`group relative px-0.5 py-2 transition-colors ${
                    active
                      ? overHero
                        ? "text-white"
                        : "text-brand-primary-text"
                      : overHero
                        ? "text-white/72 hover:text-white"
                        : "text-brand-muted hover:text-brand-text"
                  }`}
                  data-hover
                >
                  {l.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-[2px] rounded-full brand-gradient-bg transition-all duration-300 ${
                      active ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          <div className="flex items-center justify-self-end gap-3">
            <ThemeToggle
              className={
                overHero
                  ? "!border-white/20 !bg-white/10 !text-white hover:!border-white/35 hover:!text-white"
                  : "shadow-sm shadow-slate-950/5"
              }
            />
            <MagneticLink
              to="/contact"
              className="hidden items-center gap-1.5 rounded-xl brand-gradient-bg px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-primary/15 transition-all hover:-translate-y-0.5 hover:brand-glow sm:inline-flex"
            >
              Start a Project
              <ArrowUpRight className="size-3.5" />
            </MagneticLink>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className={`grid size-10 place-items-center rounded-full border md:hidden ${
                overHero
                  ? "border-white/25 bg-white/10 text-white"
                  : "border-brand-line bg-brand-surface text-brand-text"
              }`}
              data-hover
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-brand-bg/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex h-20 items-center justify-between px-6">
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="inline-flex"
                aria-label="Eire Tech home"
              >
                <Logo className="h-10" />
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid size-10 place-items-center rounded-full border border-brand-line"
                data-hover
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex flex-col gap-2 px-6 pt-10">
              {links.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * i, duration: 0.4 }}
                >
                  <Link
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between border-b border-brand-line py-5 text-3xl font-extrabold tracking-tight"
                  >
                    {l.label}
                    <ArrowUpRight className="size-5 text-brand-primary" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
