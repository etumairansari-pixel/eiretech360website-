/**
 * The icons the content currently uses.
 *
 * Generated from content/ by scripts/generate-icon-registry.mjs — do not edit
 * by hand. The full set an editor can choose from lives in
 * scripts/icon-catalog.mjs; only the ones in use are imported here, so a page
 * never downloads a glyph it does not draw.
 */
import {
  Megaphone,
  Workflow,
  Sparkles,
  Radio,
  Globe,
  Smartphone,
  BrainCircuit,
  Palette,
  Film,
  ShoppingBag,
  Code2,
  Layers3,
  Bot,
  Users,
  BarChart3,
  Compass,
  Route as RouteIcon,
  Hammer,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export const icons = {
  megaphone: Megaphone,
  workflow: Workflow,
  sparkles: Sparkles,
  radio: Radio,
  globe: Globe,
  smartphone: Smartphone,
  "brain-circuit": BrainCircuit,
  palette: Palette,
  film: Film,
  "shopping-bag": ShoppingBag,
  "code-2": Code2,
  "layers-3": Layers3,
  bot: Bot,
  users: Users,
  "bar-chart-3": BarChart3,
  compass: Compass,
  route: RouteIcon,
  hammer: Hammer,
  "trending-up": TrendingUp,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;

/**
 * Resolves an icon name from the content files.
 *
 * An unknown name falls back to Sparkles rather than crashing: a stale
 * registry should cost a wrong glyph, not the whole route.
 */
export function iconFor(name: string): LucideIcon {
  return icons[name as IconName] ?? Sparkles;
}
