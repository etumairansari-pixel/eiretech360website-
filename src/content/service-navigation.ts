import raw from "../../content/services.json";

const entries = raw.map((service) => ({
  slug: service.slug,
  label: service.title,
  parent: "parent" in service ? service.parent : "",
  points: service.points,
}));

export const serviceNavigation = entries
  .filter((service) => !service.parent)
  .map((service) => ({
    slug: service.slug,
    label: service.label,
    children: entries.some((child) => child.parent === service.slug)
      ? entries
          .filter((child) => child.parent === service.slug)
          .map((child) => ({
            slug: child.slug,
            label: child.label,
            section: "",
          }))
      : service.points.map((label) => ({
          slug: service.slug,
          label,
          section: label
            .toLowerCase()
            .replace(/&/g, " and ")
            .replace(/\[\/?(gg|g|b)\]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, ""),
        })),
  }));
