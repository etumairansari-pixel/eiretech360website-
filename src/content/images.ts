/**
 * The images content/site.json may name.
 *
 * Vite rewrites each import to the hashed URL the build emits, which is why
 * the content file stores a key rather than a path: a bare string in JSON
 * would bypass the asset pipeline and 404 in production.
 */
import svcAi from "@/assets/svc-ai.jpg";
import svcApp from "@/assets/svc-app.jpg";
import svcAtl from "@/assets/svc-atl.jpg";
import svcAutomation from "@/assets/svc-automation.jpg";
import svcBrand from "@/assets/svc-brand.jpg";
import svcDesign from "@/assets/svc-design.jpg";
import svcMarketing from "@/assets/svc-marketing.jpg";
import svcVideo from "@/assets/svc-video.jpg";
import svcWeb from "@/assets/svc-web.jpg";

export const images = {
  "svc-ai": svcAi,
  "svc-app": svcApp,
  "svc-atl": svcAtl,
  "svc-automation": svcAutomation,
  "svc-brand": svcBrand,
  "svc-design": svcDesign,
  "svc-marketing": svcMarketing,
  "svc-video": svcVideo,
  "svc-web": svcWeb,
} satisfies Record<string, string>;

export type ImageName = keyof typeof images;

/** The image keys the admin panel offers. */
export const imageNames = Object.keys(images) as ImageName[];

/** Resolves an image key to its built URL, or an empty string if unknown. */
export function imageFor(name: string): string {
  return images[name as ImageName] ?? "";
}
