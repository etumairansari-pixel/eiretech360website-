import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
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
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const handleScroll = () => {
      const now = window.scrollY;
      setVisible(now < lastScrollY || now < 60);
      setLastScrollY(now);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // The nav reveals on scroll-up and hides on scroll-down.
  // Home has the dark video hero, so the nav goes dark-glass there; every other
  // page gets the theme-aware solid treatment.
  const overHero = pathname === "/";
  const currentPath = pathname.replace(/\/$/, "") || "/";

  const headerClass = overHero
    ? "border-white/10 bg-slate-950/60 text-white backdrop-blur-md"
    : "border-brand-line bg-brand-bg/80 text-brand-text backdrop-blur-md";

  const linkShellClass = overHero
    ? "border-white/15 bg-white/10 shadow-[0_16px_45px_rgb(0_0_0/0.22)]"
    : "border-brand-line bg-brand-surface/80 shadow-[0_14px_34px_rgb(8_16_26/0.07)] dark:border-white/10 dark:bg-white/10";

  return (
    <>
      <nav
        className={`absolute top-0 z-40 w-full border-b transition-all duration-300 ${!visible ? "-translate-y-full" : "translate-y-0"} ${headerClass}`}
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

          <div
            className={`hidden justify-self-center rounded-full border p-1.5 text-sm font-semibold md:inline-flex ${linkShellClass}`}
          >
            {links.map((l) => {
              const active = currentPath === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`rounded-full px-5 py-2.5 transition-all ${
                    active
                      ? overHero
                        ? "bg-white text-slate-950 shadow-sm"
                        : "bg-brand-bg text-brand-primary shadow-sm dark:bg-white dark:text-slate-950"
                      : overHero
                        ? "text-white/80 hover:bg-white/10 hover:text-white"
                        : "text-brand-muted hover:bg-brand-bg/70 hover:text-brand-text dark:hover:bg-white/10"
                  }`}
                  data-hover
                >
                  {l.label}
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
              className="hidden items-center gap-1.5 rounded-full brand-gradient-bg px-5 py-2.5 text-sm font-bold text-white transition-shadow hover:brand-glow sm:inline-flex"
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
