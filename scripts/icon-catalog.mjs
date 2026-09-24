/**
 * The icons an editor may choose in the admin panel.
 *
 * Kept separate from the site bundle: this is a plain list of names, so the
 * admin can offer every option without the site having to import every glyph.
 * generate-icon-registry.mjs turns the ones actually in use into real imports.
 *
 * `component` is the lucide-react export name. Adding a row here makes the icon
 * selectable; the next build bundles it only if a page actually uses it.
 */
export const iconCatalog = [
  { name: "megaphone", component: "Megaphone", label: "Megaphone" },
  { name: "workflow", component: "Workflow", label: "Workflow" },
  { name: "sparkles", component: "Sparkles", label: "Sparkles" },
  { name: "radio", component: "Radio", label: "Radio" },
  { name: "globe", component: "Globe", label: "Globe" },
  { name: "smartphone", component: "Smartphone", label: "Smartphone" },
  { name: "brain-circuit", component: "BrainCircuit", label: "Brain circuit" },
  { name: "palette", component: "Palette", label: "Palette" },
  { name: "film", component: "Film", label: "Film" },
  { name: "shopping-bag", component: "ShoppingBag", label: "Shopping bag" },
  { name: "code-2", component: "Code2", label: "Code" },
  { name: "layers-3", component: "Layers3", label: "Layers" },
  { name: "bot", component: "Bot", label: "Bot" },
  { name: "users", component: "Users", label: "Users" },
  { name: "bar-chart-3", component: "BarChart3", label: "Bar chart" },
  { name: "compass", component: "Compass", label: "Compass" },
  { name: "route", component: "Route", label: "Route" },
  { name: "hammer", component: "Hammer", label: "Hammer" },
  { name: "trending-up", component: "TrendingUp", label: "Trending up" },
  { name: "shield-check", component: "ShieldCheck", label: "Shield check" },
  { name: "rocket", component: "Rocket", label: "Rocket" },
  { name: "target", component: "Target", label: "Target" },
  { name: "lightbulb", component: "Lightbulb", label: "Lightbulb" },
  { name: "handshake", component: "Handshake", label: "Handshake" },
  { name: "search", component: "Search", label: "Search" },
  { name: "zap", component: "Zap", label: "Zap" },
];

/** The fallback used when content names an icon that is not in the catalogue. */
export const fallbackIcon = { name: "sparkles", component: "Sparkles" };
