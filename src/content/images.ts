/**
 * The images (and portfolio videos) content/site.json may name.
 *
 * Vite rewrites each import to the hashed URL the build emits, which is why
 * the content file stores a key rather than a path: a bare string in JSON
 * would bypass the asset pipeline and 404 in production.
 */
import designAttendMark from "@/assets/design-attend-mark.webp";
import designAttendLogo from "@/assets/design-attend-logo.webp";
import designAttendLogoReversed from "@/assets/design-attend-logo-reversed.webp";
import designE360Colour from "@/assets/design-e360-colour.webp";
import designE360Mono from "@/assets/design-e360-mono.webp";
import designStockieMark from "@/assets/design-stockie-mark.webp";
import designStockieLogo from "@/assets/design-stockie-logo.webp";
import designStockieLogoReversed from "@/assets/design-stockie-logo-reversed.webp";
import designCliffsOfPuff from "@/assets/design-cliffs-of-puff.webp";
import designCandyCiao from "@/assets/design-candy-ciao.webp";
import designLoomCandy from "@/assets/design-loom-candy.webp";
import designHalloween from "@/assets/design-halloween.webp";
import designCliffsHalloweenPost from "@/assets/design-cliffs-halloween-post.webp";
import videoLostMary from "@/assets/video-lost-mary.mp4";
import videoLostMaryPoster from "@/assets/video-lost-mary-poster.webp";
import videoPouches from "@/assets/video-pouches.mp4";
import videoPouchesPoster from "@/assets/video-pouches-poster.webp";
import videoElfliq from "@/assets/video-elfliq.mp4";
import videoElfliqPoster from "@/assets/video-elfliq-poster.webp";
import videoLostMaryBm6000 from "@/assets/video-lost-mary-bm6000.mp4";
import videoLostMaryBm6000Poster from "@/assets/video-lost-mary-bm6000-poster.webp";
import projectAttend from "@/assets/project-attend.jpg";
import projectCliffsOfPuff from "@/assets/project-cliffs-of-puff.jpg";
import projectE360 from "@/assets/project-e360.jpg";
import projectCandyCiao from "@/assets/project-candy-ciao.jpg";
import projectLoomCandy from "@/assets/project-loom-candy.jpg";
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
  "design-cliffs-halloween-post": designCliffsHalloweenPost,
  "video-lost-mary": videoLostMary,
  "video-lost-mary-poster": videoLostMaryPoster,
  "video-pouches": videoPouches,
  "video-pouches-poster": videoPouchesPoster,
  "video-elfliq": videoElfliq,
  "video-elfliq-poster": videoElfliqPoster,
  "video-lost-mary-bm6000": videoLostMaryBm6000,
  "video-lost-mary-bm6000-poster": videoLostMaryBm6000Poster,
  "design-attend-mark": designAttendMark,
  "design-attend-logo": designAttendLogo,
  "design-attend-logo-reversed": designAttendLogoReversed,
  "design-e360-colour": designE360Colour,
  "design-e360-mono": designE360Mono,
  "design-stockie-mark": designStockieMark,
  "design-stockie-logo": designStockieLogo,
  "design-stockie-logo-reversed": designStockieLogoReversed,
  "design-cliffs-of-puff": designCliffsOfPuff,
  "design-candy-ciao": designCandyCiao,
  "design-loom-candy": designLoomCandy,
  "design-halloween": designHalloween,
  "project-attend": projectAttend,
  "project-cliffs-of-puff": projectCliffsOfPuff,
  "project-e360": projectE360,
  "project-candy-ciao": projectCandyCiao,
  "project-loom-candy": projectLoomCandy,
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
