import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Menu, X, ArrowUpRight, Mail, Phone } from "lucide-react";
import { Logo } from "@/components/Logo";
import { office } from "@/components/site/data";
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
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    if (!desktop.matches) return;
    const update = () => {
      const next = window.scrollY > 24;
      setScrolled((current) => (current === next ? current : next));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? "border-b border-brand-line bg-brand-bg/70 backdrop-blur-xl"
            : "border-b border-brand-line/60 bg-brand-bg/95 md:border-transparent md:bg-transparent"
        }`}
      >
        {/* Utility bar: direct contact above the fold, collapsed once the user
            scrolls so the nav stays compact. Desktop only — mobile has the menu. */}
        <div
          className={`hidden overflow-hidden border-b border-brand-line/60 bg-brand-surface/50 transition-all duration-300 md:block ${
            scrolled ? "max-h-0 opacity-0" : "max-h-12 opacity-100"
          }`}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-xs">
            <span className="font-mono uppercase tracking-[0.25em] text-brand-muted">
              Digital Growth &amp; Automation Partner
            </span>
            <div className="flex items-center gap-6">
              <a
                href={office.phoneHref}
                className="inline-flex items-center gap-2 text-brand-muted transition-colors hover:text-brand-primary"
                data-hover
              >
                <Phone className="size-3.5 text-brand-primary" />
                {office.phone}
              </a>
              <a
                href={`mailto:${office.email}`}
                className="inline-flex items-center gap-2 text-brand-muted transition-colors hover:text-brand-primary"
                data-hover
              >
                <Mail className="size-3.5 text-brand-primary" />
                {office.email}
              </a>
            </div>
          </div>
        </div>

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link
            to="/"
            className="shrink-0 rounded-2xl border border-brand-line/80 bg-brand-surface/75 px-3 py-2 shadow-sm backdrop-blur-xl transition hover:border-brand-primary/40"
            data-hover
            aria-label="Eire Tech home"
          >
            <Logo markClassName="size-10" textClassName="text-lg" />
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium md:flex">
            {links.map((l) => {
              const active = pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`group relative transition-colors ${
                    active ? "text-brand-primary" : "text-brand-muted hover:text-brand-text"
                  }`}
                  data-hover
                >
                  {l.label}
                  <span
                    className={`absolute -bottom-1.5 left-0 h-px bg-brand-primary transition-all duration-300 ${
                      active ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
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
              className="grid size-10 place-items-center rounded-full border border-brand-line text-brand-text md:hidden"
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
              <Logo markClassName="size-9" textClassName="text-lg" />
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
