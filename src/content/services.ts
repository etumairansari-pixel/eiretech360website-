/**
 * The services list, resolved into the shape the components consume.
 *
 * Imported by the homepage and the services page only — the two places that
 * render it — so the About and Platforms bundles never carry it.
 */
import type { LucideIcon } from "lucide-react";
import raw from "../../content/services.json";
import { iconFor } from "./icons";
import { imageFor } from "./images";
import type { Service as ServiceContent } from "./types";

export type Service = {
  icon: LucideIcon;
  title: string;
  tag: string;
  img: string;
  desc: string;
  points: string[];
};

export const services: Service[] = (raw as ServiceContent[]).map((service) => ({
  icon: iconFor(service.icon),
  title: service.title,
  tag: service.tag,
  img: imageFor(service.image),
  desc: service.desc,
  points: service.points,
}));
