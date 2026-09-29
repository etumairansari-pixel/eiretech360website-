import { useEffect } from "react";
import { createFileRoute, Link, notFound, useLocation } from "@tanstack/react-router";
import { ArrowUpRight, Check, ChevronDown, ChevronRight } from "lucide-react";
import { Shell } from "@/components/site/Shell";
import { FinalCTA } from "@/components/site/FinalCTA";
import { Highlight } from "@/components/site/Highlight";
import { Reveal, SectionLabel } from "@/components/site/primitives";
import { LogoMark } from "@/components/Logo";
import { DesignGallery } from "@/components/site/DesignGallery";
import { ProjectShowcase, projectAnchor } from "@/components/site/ProjectShowcase";
import { serviceBySlug, services, type Service } from "@/content/services";
import { projectsFor } from "@/content/projects";
import { headFor, pathFor, route, site } from "@/content";
import servicesPage from "../../content/pages/services.json";

const SITE_URL = site.url.replace(/\/$/, "");

export const Route = createFileRoute("/services_/$slug")({
  loader: ({ params }) => {
    if (!serviceBySlug(params.slug)) throw notFound();
  },
  head: ({ params }) => {
    const service = serviceBySlug(params.slug);
    if (!service) return {};
    return headFor("services", { ...service.seo, canonical: `${SITE_URL}${service.path}` });
  },
  component: ServiceDetailPage,
});

/** Service, FAQ and breadcrumb structured data for rich results. */
function structuredData(service: Service) {
  const url = `${SITE_URL}${service.path}`;
  const graph: Record<string, unknown>[] = [
    {
      "@type": "Service",
      name: service.title,
      serviceType: service.title,
      description: service.seo.description,
      url,
      provider: { "@type": "Organization", name: site.name, url: SITE_URL },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: service.title,
        itemListElement: service.sections.map((section) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: section.title, url: `${url}#${section.anchor}` },
        })),
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: route("home").navLabel, item: `${SITE_URL}/` },
        {
          "@type": "ListItem",
          position: 2,
          name: route("services").navLabel,
          item: `${SITE_URL}${pathFor("services")}`,
        },
        { "@type": "ListItem", position: 3, name: service.title, item: url },
      ],
    },
  ];

  if (service.faqs.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: service.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    });
  }

  // "<" is escaped so no string in the content can close the script element.
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(
    /</g,
    "\\u003c",
  );
}

/**
 * Scrolls to the section named in the URL hash once React has rendered it.
 *
 * On a fresh load the browser jumps inside the prerendered overlay, which is
 * removed as soon as React paints, so the jump has to be repeated on the real
 * page. The lookup is scoped to #root because the overlay holds the same ids
 * until it goes.
 */
function useScrollToHash() {
  const hash = useLocation({ select: (location) => location.hash });

  useEffect(() => {
    if (!hash) return;
    const target = document
      .getElementById("root")
      ?.querySelector<HTMLElement>(`[id="${CSS.escape(hash)}"]`);
    if (!target) return;

    // Web fonts and images land after the first jump and reflow the text above
    // the section — on a phone by hundreds of pixels — so keep re-aligning
    // while the layout settles, and stop as soon as the visitor scrolls.
    let settled = false;
    const jump = () => {
      if (!settled) target.scrollIntoView({ block: "start" });
    };
    const stop = () => {
      settled = true;
    };
    const events = ["wheel", "touchstart", "keydown"] as const;
    for (const name of events) window.addEventListener(name, stop, { passive: true });
    const observer = new ResizeObserver(jump);
    observer.observe(document.body);
    const start = window.setTimeout(jump, 150);
    const end = window.setTimeout(stop, 3000);

    return () => {
      stop();
      observer.disconnect();
      window.clearTimeout(start);
      window.clearTimeout(end);
      for (const name of events) window.removeEventListener(name, stop);
    };
  }, [hash]);
}

function ServiceDetailPage() {
  const { slug } = Route.useParams();
  const service = serviceBySlug(slug)!;
  const Icon = service.icon;
  const { cta } = servicesPage;
  const others = services.filter((s) => s.slug !== service.slug);
  const work = projectsFor(service.slug);

  useScrollToHash();

  return (
    <Shell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData(service) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden pb-16 pt-36">
        <div className="grid-bg pointer-events-none absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
        <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 size-[620px] -translate-x-1/2 rounded-full bg-brand-primary/15 blur-[130px]" />
        <LogoMark
          className="pointer-events-none absolute -right-16 top-20 -z-10 size-72 rotate-12 opacity-[0.035] md:right-10 md:size-[28rem]"
          title=""
        />

        <div className="mx-auto max-w-7xl px-6">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-brand-muted">
              <li>
                <Link to="/" className="hover:text-brand-primary-text">
                  {route("home").navLabel}
                </Link>
              </li>
              <ChevronRight className="size-3.5" aria-hidden />
              <li>
                <Link to="/services" className="hover:text-brand-primary-text">
                  {route("services").navLabel}
                </Link>
              </li>
              <ChevronRight className="size-3.5" aria-hidden />
              <li aria-current="page" className="font-semibold text-brand-text">
                {service.title}
              </li>
            </ol>
          </nav>

          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_.85fr]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-primary/25 bg-brand-primary/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-brand-primary-text">
                <span className="inline-block size-1.5 rounded-full bg-brand-accent" />
                {service.tag}
              </div>
              <h1 className="text-4xl font-extrabold leading-[1.04] tracking-tighter md:text-6xl">
                <Highlight text={service.title} />
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-brand-muted">
                <Highlight text={service.desc} />
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={pathFor("contact")}
                  className="group inline-flex items-center gap-2 rounded-full brand-gradient-bg px-7 py-3.5 font-bold text-white transition-shadow hover:brand-glow"
                >
                  {servicesPage.serviceLinkLabel}
                  <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" />
                </a>
                <Link
                  to="/services"
                  className="inline-flex items-center rounded-full border border-brand-line px-7 py-3.5 font-bold transition-colors hover:border-brand-primary/50 hover:text-brand-primary-text"
                >
                  All services
                </Link>
              </div>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-brand-line">
              <img
                src={service.img}
                alt={`${service.title} services by ${site.name}`}
                width={1200}
                height={900}
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 grid size-12 place-items-center rounded-xl bg-white/15 text-white backdrop-blur">
                <Icon className="size-6" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's included: each point jumps to its own section below. */}
      <section className="pb-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-3xl border border-brand-line bg-brand-surface p-8 md:p-10">
            <SectionLabel>What's included</SectionLabel>
            <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
              What's included in {service.title}
            </h2>
            <ol className="mt-6 grid gap-3 sm:grid-cols-2">
              {service.sections.map((section, i) => (
                <li key={section.anchor}>
                  <a
                    href={`#${section.anchor}`}
                    className="group flex items-center gap-3 rounded-2xl border border-brand-line bg-brand-bg px-4 py-3.5 text-sm font-semibold transition-colors hover:border-brand-primary/50 hover:text-brand-primary-text"
                  >
                    <span className="font-mono text-xs text-brand-primary-text">
                      [{String(i + 1).padStart(2, "0")}]
                    </span>
                    <Highlight text={section.title} />
                    <ArrowUpRight className="ml-auto size-4 shrink-0 rotate-90 opacity-50 transition-opacity group-hover:opacity-100" />
                  </a>
                </li>
              ))}
            </ol>
            {work.length || service.gallery.length ? (
              <p className="mt-6 flex flex-wrap items-center gap-2 text-sm">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand-muted">
                  Featured work
                </span>
                {work.map((project) => (
                  <a
                    key={project.title}
                    href={`#${projectAnchor(project)}`}
                    className="rounded-full border border-brand-primary/25 bg-brand-primary/5 px-3 py-1 font-semibold text-brand-primary-text transition-colors hover:border-brand-primary/60"
                  >
                    {project.title}
                  </a>
                ))}
                {service.gallery.length ? (
                  <a
                    href="#portfolio"
                    className="rounded-full border border-brand-primary/25 bg-brand-primary/5 px-3 py-1 font-semibold text-brand-primary-text transition-colors hover:border-brand-primary/60"
                  >
                    Design portfolio
                  </a>
                ) : null}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {/* Overview */}
      {service.intro.length ? (
        <section className="py-16">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <SectionLabel>Overview</SectionLabel>
              <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                {service.title} services, built around your goals
              </h2>
            </div>
            <div className="space-y-5 text-lg leading-relaxed text-brand-muted">
              {service.intro.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>
                  <Highlight text={paragraph} />
                </p>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* One section per bullet point */}
      <section className="pb-16">
        <div className="mx-auto max-w-7xl space-y-5 px-6">
          {service.sections.map((section, i) => (
            <article
              key={section.anchor}
              id={section.anchor}
              className="scroll-mt-28 rounded-3xl border border-brand-line bg-brand-surface p-8 target:border-brand-primary/60 md:p-12"
            >
              <div className="grid gap-6 md:grid-cols-[auto_1fr] md:gap-10">
                <span className="font-mono text-4xl font-bold text-brand-primary-text/80 md:text-5xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
                    <Highlight text={section.title} />
                  </h2>
                  {section.body ? (
                    <p className="mt-4 max-w-3xl leading-relaxed text-brand-muted">
                      <Highlight text={section.body} />
                    </p>
                  ) : null}
                  {work
                    .filter((project) => project.point === section.title)
                    .map((project) => (
                      <a
                        key={project.title}
                        href={`#${projectAnchor(project)}`}
                        className="mr-2 mt-5 inline-flex items-center gap-2 rounded-full border border-brand-primary/25 bg-brand-primary/5 px-4 py-2 text-sm font-bold text-brand-primary-text transition-colors hover:border-brand-primary/60"
                      >
                        See it in action: {project.title}
                        <ArrowUpRight className="size-4 rotate-90" />
                      </a>
                    ))}
                  {service.gallery.length && section.title === service.galleryPoint ? (
                    <a
                      href="#portfolio"
                      className="mr-2 mt-5 inline-flex items-center gap-2 rounded-full border border-brand-primary/25 bg-brand-primary/5 px-4 py-2 text-sm font-bold text-brand-primary-text transition-colors hover:border-brand-primary/60"
                    >
                      See our design portfolio
                      <ArrowUpRight className="size-4 rotate-90" />
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <ProjectShowcase projects={work} serviceTitle={service.title} />
      <DesignGallery groups={service.gallery} />

      {/* Why choose us */}
      {service.benefits.length ? (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-6">
            <Reveal>
              <div className="rounded-3xl border border-brand-line bg-brand-surface p-8 md:p-12">
                <SectionLabel>Why {site.name}</SectionLabel>
                <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                  Why choose {site.name} for {service.title}?
                </h2>
                <ul className="mt-8 grid gap-4 md:grid-cols-2">
                  {service.benefits.map((benefit) => (
                    <li key={benefit} className="flex gap-3">
                      <Check className="mt-1 size-5 shrink-0 text-brand-accent-text" />
                      <span className="leading-relaxed">
                        <Highlight text={benefit} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* FAQs */}
      {service.faqs.length ? (
        <section className="py-16">
          <div className="mx-auto max-w-4xl px-6">
            <SectionLabel>FAQs</SectionLabel>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              {service.title}: frequently asked questions
            </h2>
            <div className="mt-8 space-y-3">
              {service.faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-2xl border border-brand-line bg-brand-surface px-6 py-5 open:border-brand-primary/40"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold [&::-webkit-details-marker]:hidden">
                    <h3 className="text-base md:text-lg">{faq.question}</h3>
                    <ChevronDown className="size-5 shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 leading-relaxed text-brand-muted">
                    <Highlight text={faq.answer} />
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Other services */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <SectionLabel>Explore more</SectionLabel>
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">Other services</h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((other) => {
              const OtherIcon = other.icon;
              return (
                <li key={other.slug}>
                  <Link
                    to="/services/$slug"
                    params={{ slug: other.slug }}
                    className="group flex h-full items-center gap-3 rounded-2xl border border-brand-line bg-brand-surface p-4 font-semibold transition-colors hover:border-brand-primary/50 hover:text-brand-primary-text"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-primary/10 text-brand-primary">
                      <OtherIcon className="size-5" />
                    </span>
                    {other.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <FinalCTA
        label={cta.label}
        title={cta.title}
        subtitle={cta.subtitle}
        buttonLabel={cta.buttonLabel}
        buttonTo={cta.buttonTo}
      />
    </Shell>
  );
}
