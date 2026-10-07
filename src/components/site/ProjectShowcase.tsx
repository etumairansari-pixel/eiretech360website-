import { useId, useState } from "react";
import { ArrowUpRight, Briefcase, Check, Code2, Quote } from "lucide-react";
import { Highlight } from "@/components/site/Highlight";
import { SectionLabel } from "@/components/site/primitives";
import { slugify } from "@/content/services";
import type { Project } from "@/content/projects";

/** The element id of a project's case study, so other sections can link to it. */
export function projectAnchor(project: Project) {
  return `work-${slugify(project.title)}`;
}

type View = "business" | "technical";

/** Facts fill the row whatever their number, so no empty cells show through. */
const factColumns: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
};

function ProjectCase({ project }: { project: Project }) {
  const [view, setView] = useState<View>("business");
  const baseId = useId();
  const tabs: { key: View; label: string; icon: typeof Briefcase }[] = [
    { key: "business", label: "Business overview", icon: Briefcase },
    { key: "technical", label: "Technical overview", icon: Code2 },
  ];

  return (
    <article
      id={projectAnchor(project)}
      className="scroll-mt-28 overflow-hidden rounded-3xl border border-brand-line bg-brand-surface"
    >
      <a
        href={project.url}
        target="_blank"
        rel="noopener"
        className="group relative block aspect-[16/8] overflow-hidden border-b border-brand-line"
      >
        <img
          src={project.img}
          alt={`${project.title}: ${project.category} project by Eire Tech`}
          width={1600}
          height={800}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]"
        />
      </a>

      <div className="p-5 sm:p-7 md:p-12">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-brand-primary-text">
              {project.category}
            </p>
            <h3 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
              {project.title}
            </h3>
            <p className="mt-4 text-lg leading-relaxed text-brand-muted">
              <Highlight text={project.summary} />
            </p>
          </div>
          <a
            href={project.url}
            target="_blank"
            rel="noopener"
            className="group inline-flex shrink-0 items-center gap-2 rounded-full brand-gradient-bg px-6 py-3 font-bold text-white transition-shadow hover:brand-glow"
          >
            {project.linkLabel}
            <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" />
          </a>
        </div>

        {project.facts.length ? (
          <dl
            className={`mt-10 gap-px overflow-hidden rounded-2xl border border-brand-line bg-brand-line ${
              project.facts.length === 1 ? "inline-grid" : "grid"
            } ${factColumns[Math.min(project.facts.length, 4)]}`}
          >
            {project.facts.map((fact) => (
              <div key={fact.value + fact.label} className="bg-brand-bg p-5 pr-10">
                <dt className="sr-only">{fact.label}</dt>
                <dd className="text-2xl font-extrabold tracking-tight text-brand-primary-text">
                  {fact.value}
                </dd>
                <dd className="mt-1 text-sm text-brand-muted">{fact.label}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-brand-line bg-brand-bg p-6">
            <h4 className="font-mono text-[11px] uppercase tracking-[0.25em] text-brand-muted">
              The challenge
            </h4>
            <p className="mt-3 leading-relaxed">
              <Highlight text={project.challenge} />
            </p>
          </div>
          <div className="rounded-2xl border border-brand-line bg-brand-bg p-6">
            <h4 className="font-mono text-[11px] uppercase tracking-[0.25em] text-brand-muted">
              Our solution
            </h4>
            <p className="mt-3 leading-relaxed">
              <Highlight text={project.solution} />
            </p>
          </div>
        </div>

        <div className="mt-6 border-l-2 border-brand-accent bg-brand-accent/5 p-6">
          <h4 className="text-sm font-semibold text-brand-text">Delivered outcome</h4>
          <p className="mt-3 leading-relaxed text-brand-muted">{project.outcome}</p>
        </div>

        {/* Both panels stay in the markup, so crawlers and no-JS readers get both. */}
        <div className="mt-10">
          <div
            role="tablist"
            aria-label={`${project.title} overview`}
            className="grid grid-cols-2 gap-1 rounded-full border border-brand-line bg-brand-bg p-1 sm:inline-grid"
          >
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const active = view === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  id={`${baseId}-${tab.key}-tab`}
                  aria-selected={active}
                  aria-controls={`${baseId}-${tab.key}`}
                  onClick={() => setView(tab.key)}
                  className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-colors sm:px-5 ${
                    active
                      ? "brand-gradient-bg text-white"
                      : "text-brand-muted hover:text-brand-text"
                  }`}
                >
                  <TabIcon className="size-4" />
                  <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {tabs.map((tab) => {
            const items = tab.key === "business" ? project.business : project.technical;
            return (
              <div
                key={tab.key}
                id={`${baseId}-${tab.key}`}
                role="tabpanel"
                aria-labelledby={`${baseId}-${tab.key}-tab`}
                hidden={view !== tab.key}
                className="mt-6"
              >
                <p className="text-sm text-brand-muted">
                  {tab.key === "business"
                    ? "What it does for the business, in plain terms."
                    : "How it is built, for developers and technical teams."}
                </p>
                <ul className="mt-5 grid gap-x-8 gap-y-3.5 md:grid-cols-2">
                  {items.map((item) => (
                    <li key={item} className="flex gap-3 text-[15px] leading-relaxed">
                      <Check className="mt-1 size-4 shrink-0 text-brand-accent-text" />
                      <span>
                        <Highlight text={item} />
                      </span>
                    </li>
                  ))}
                </ul>
                {tab.key === "technical" && project.stack.length ? (
                  <ul className="mt-7 flex flex-wrap gap-2" aria-label="Technology stack">
                    {project.stack.map((tech) => (
                      <li
                        key={tech}
                        className="rounded-full border border-brand-primary/25 bg-brand-primary/5 px-3.5 py-1.5 font-mono text-xs text-brand-primary-text"
                      >
                        {tech}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </div>

        {project.feedback ? (
          <figure className="mt-10 rounded-2xl border border-brand-primary/25 bg-brand-primary/5 p-7 md:p-9">
            <Quote className="size-7 text-brand-primary-text" aria-hidden />
            <blockquote className="mt-4 text-lg font-medium leading-relaxed md:text-xl">
              <Highlight text={project.feedback.quote} />
            </blockquote>
            {project.feedback.name ? (
              <figcaption className="mt-5 text-sm">
                <span className="font-bold">{project.feedback.name}</span>
                {project.feedback.role ? (
                  <span className="text-brand-muted"> Â· {project.feedback.role}</span>
                ) : null}
              </figcaption>
            ) : null}
          </figure>
        ) : null}
      </div>
    </article>
  );
}

export function ProjectShowcase({
  projects,
  serviceTitle,
}: {
  projects: Project[];
  serviceTitle: string;
}) {
  if (!projects.length) return null;

  return (
    <section id="work" className="scroll-mt-28 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <SectionLabel>Featured work</SectionLabel>
        <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          {serviceTitle} projects we've delivered
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-brand-muted">
          Live products built by our team. Switch between the business and technical overview to see
          each one from the angle that matters to you.
        </p>
        <div className="mt-10 space-y-8">
          {projects.map((project) => (
            <ProjectCase key={project.title} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
