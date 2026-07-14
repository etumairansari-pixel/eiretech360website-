import { officeAddress, officeMapEmbedUrl } from "@/components/site/data";

/**
 * Lazy Google Maps embed for the public office location.
 * In dark mode the light Google tiles are inverted to sit with the surrounding UI.
 */
export function OfficeMap({
  className = "h-72",
  title = `Eire Tech office - ${officeAddress}`,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <iframe
      src={officeMapEmbedUrl}
      title={title}
      aria-label={title}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
      className={`w-full border-0 grayscale-[0.25] transition-[filter] duration-500 hover:grayscale-0 dark:opacity-90 dark:invert dark:hue-rotate-180 ${className}`}
    />
  );
}
