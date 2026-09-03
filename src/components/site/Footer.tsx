import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import { Logo } from "@/components/Logo";
import { office, social } from "@/components/site/data";

// Lucide v1 dropped brand marks, so the two glyphs are inlined.
function LinkedInIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13Zm1.78 13.02H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

function FacebookIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.1 24 12.07Z" />
    </svg>
  );
}

const pages = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/services", label: "Services" },
  { to: "/platforms", label: "Platforms & Tools" },
  { to: "/contact", label: "Contact Us" },
] as const;

// Capability columns, mirroring how enterprise sites let visitors scan what a
// firm actually does straight from the footer.
const capabilities = [
  "Digital Marketing",
  "Automation",
  "Website Development",
  "App Development",
  "AI Development",
  "Brand Management",
] as const;

const socialIcons = { LinkedIn: LinkedInIcon, Facebook: FacebookIcon } as const;

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-brand-line bg-brand-surface">
      <div className="pointer-events-none absolute -bottom-32 left-1/2 size-[520px] -translate-x-1/2 rounded-full bg-brand-primary/10 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-12 -right-8 select-none text-[12rem] font-black leading-none tracking-[-0.08em] text-brand-text/[0.025] md:text-[20rem]">
        e
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          <div>
            <Logo className="h-12" />

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-brand-muted">
              Eire Tech: Digital Growth &amp; Automation Partner. Blending strategy, creativity and
              AI to transform how your brand shows up, scales and runs.
            </p>

            <div className="mt-7 flex items-center gap-3">
              {social.map((s) => {
                const Icon = socialIcons[s.label];
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    className="grid size-10 place-items-center rounded-full border border-brand-line bg-brand-bg/70 text-brand-muted transition-colors hover:border-brand-primary/50 hover:text-brand-primary-text"
                    data-hover
                  >
                    <Icon className="size-4" />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-5 font-mono text-[10px] uppercase tracking-[0.3em] text-brand-primary-text">
              Pages
            </div>
            <ul className="space-y-3 text-sm">
              {pages.map((p) => (
                <li key={p.to}>
                  <Link
                    to={p.to}
                    className="text-brand-muted transition-colors hover:text-brand-primary-text"
                    data-hover
                  >
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-5 font-mono text-[10px] uppercase tracking-[0.3em] text-brand-primary-text">
              Capabilities
            </div>
            <ul className="space-y-3 text-sm">
              {capabilities.map((c) => (
                <li key={c}>
                  <Link
                    to="/services"
                    className="text-brand-muted transition-colors hover:text-brand-primary-text"
                    data-hover
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-5 font-mono text-[10px] uppercase tracking-[0.3em] text-brand-primary-text">
              Contact
            </div>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-brand-primary-text" />
                <a
                  href={office.phoneHref}
                  className="font-semibold text-brand-text transition-colors hover:text-brand-primary-text"
                  data-hover
                >
                  {office.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-brand-primary-text" />
                <a
                  href={`mailto:${office.email}`}
                  className="break-all text-brand-muted transition-colors hover:text-brand-primary-text"
                  data-hover
                >
                  {office.email}
                </a>
              </li>
            </ul>

            <Link
              to="/contact"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-primary/30 bg-brand-primary/5 px-5 py-2.5 text-sm font-bold text-brand-primary-text transition-colors hover:bg-brand-primary/10"
              data-hover
            >
              Talk to an Expert <ArrowUpRight className="size-4" />
            </Link>

            <div className="mt-6 text-sm leading-relaxed text-brand-muted">
              <p className="font-semibold text-brand-text">Visit Us</p>
              <p className="mt-1">Our Washington office.</p>
              <address className="mt-2 not-italic">
                1717 N Street NW
                <br />
                Ste 1<br />
                Washington, DC 20036
              </address>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-brand-line pt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-brand-muted md:flex-row">
          <span>© {new Date().getFullYear()} Eire Tech. All rights reserved.</span>
          <span className="flex items-center gap-2">
            <span className="inline-block size-1.5 animate-pulse rounded-full bg-brand-accent" />
            Digital Growth &amp; Automation Partner
          </span>
        </div>
      </div>
    </footer>
  );
}
