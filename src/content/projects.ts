/**
 * The case studies, resolved into the shape the service pages consume.
 *
 * Imported only by the service detail route, so no other bundle carries them.
 */
import raw from "../../content/projects.json";
import { imageFor } from "./images";
import type { Project as ProjectContent } from "./types";

export type Project = {
  title: string;
  category: string;
  service: string;
  point: string;
  url: string;
  /** The live-site button text. */
  linkLabel: string;
  img: string;
  summary: string;
  challenge: string;
  solution: string;
  outcome: string;
  facts: { value: string; label: string }[];
  business: string[];
  technical: string[];
  stack: string[];
  feedback: { quote: string; name: string; role: string } | null;
};

export const projects: Project[] = (raw as ProjectContent[]).map((project) => ({
  title: project.title,
  category: project.category,
  service: project.service,
  point: project.point ?? "",
  url: project.url,
  linkLabel:
    project.linkLabel?.trim() ||
    `Visit ${project.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}`,
  img: imageFor(project.image),
  summary: project.summary,
  challenge: project.challenge,
  solution: project.solution,
  outcome: project.outcome ?? project.summary,
  facts: (project.facts ?? [])
    .map((line) => {
      const at = line.indexOf("|");
      return at === -1
        ? { value: line.trim(), label: "" }
        : { value: line.slice(0, at).trim(), label: line.slice(at + 1).trim() };
    })
    .filter((fact) => fact.value),
  business: project.business ?? [],
  technical: project.technical ?? [],
  stack: project.stack ?? [],
  feedback: project.quote?.trim()
    ? {
        quote: project.quote.trim(),
        name: project.quoteName?.trim() ?? "",
        role: project.quoteRole?.trim() ?? "",
      }
    : null,
}));

export function projectsFor(serviceSlug: string): Project[] {
  return projects.filter((project) => project.service === serviceSlug);
}
