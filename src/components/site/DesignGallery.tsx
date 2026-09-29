import { useEffect, useRef, useState } from "react";
import { Maximize2, X } from "lucide-react";
import { SectionLabel } from "@/components/site/primitives";
import type { GalleryGroup, GalleryItem } from "@/content/services";

/** Artwork is shown on the background it was drawn for, in either theme. */
const tone = (item: GalleryItem) => (item.dark ? "bg-black" : "bg-[#f3f5f9]");

function Tile({
  item,
  hero,
  onOpen,
}: {
  item: GalleryItem;
  hero: boolean;
  onOpen: (item: GalleryItem) => void;
}) {
  return (
    <figure className={hero ? "col-span-2" : ""}>
      <button
        type="button"
        onClick={() => onOpen(item)}
        aria-label={`View ${item.brand} ${item.title.toLowerCase()} larger`}
        className={`group relative block w-full overflow-hidden rounded-2xl border border-brand-line ${tone(item)} ${
          hero ? "aspect-[16/9]" : "aspect-[4/3]"
        }`}
      >
        {/* Absolutely sized, so tall artwork shrinks to fit rather than being cropped. */}
        <img
          src={item.img}
          alt={`${item.brand} ${item.title.toLowerCase()}, designed by Eire Tech`}
          loading="lazy"
          decoding="async"
          className={`absolute h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.04] ${
            hero ? "inset-0 p-6 md:p-10" : "inset-0 p-5"
          }`}
        />
        <span className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <Maximize2 className="size-4" />
        </span>
      </button>
      <figcaption className="mt-2.5 text-sm text-brand-muted">{item.title}</figcaption>
    </figure>
  );
}

export function DesignGallery({ groups }: { groups: GalleryGroup[] }) {
  const [open, setOpen] = useState<GalleryItem | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  if (!groups.length) return null;
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <section id="portfolio" className="scroll-mt-28 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <SectionLabel>Design portfolio</SectionLabel>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="max-w-3xl text-3xl font-extrabold tracking-tight md:text-4xl">
            Logos and brand identities we've designed
          </h2>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-muted">
            {groups.length} brands · {total} designs
          </p>
        </div>
        <p className="mt-4 max-w-2xl text-lg text-brand-muted">
          From software products to retail brands, every identity is built to work at any size,
          on light and dark backgrounds, in print and on screen.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {groups.map((group) => (
            <article
              key={group.brand}
              className="rounded-3xl border border-brand-line bg-brand-surface p-5 md:p-7"
            >
              <header className="mb-5 flex items-baseline justify-between gap-3">
                <h3 className="text-xl font-extrabold tracking-tight">{group.brand}</h3>
                <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-brand-muted">
                  {group.items.length} {group.items.length === 1 ? "design" : "designs"}
                </span>
              </header>
              <div className="grid grid-cols-2 gap-4">
                {group.items.map((item, i) => (
                  <Tile key={item.img} item={item} hero={i === 0} onOpen={setOpen} />
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>

      <dialog
        ref={dialog}
        onClose={() => setOpen(null)}
        onClick={(event) => {
          // A click on the backdrop lands on the dialog itself.
          if (event.target === event.currentTarget) setOpen(null);
        }}
        aria-label={open ? `${open.brand}: ${open.title}` : undefined}
        className="m-auto w-[min(92vw,1100px)] max-w-none overflow-visible bg-transparent p-0 backdrop:bg-black/80 backdrop:backdrop-blur-sm"
      >
        {open ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Close"
              className="absolute -top-12 right-0 grid size-10 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
            >
              <X className="size-5" />
            </button>
            <div
              className={`grid max-h-[80vh] place-items-center overflow-hidden rounded-3xl p-8 md:p-14 ${tone(open)}`}
            >
              <img
                src={open.img}
                alt={`${open.brand} ${open.title.toLowerCase()}, designed by Eire Tech`}
                className="max-h-[70vh] max-w-full object-contain"
              />
            </div>
            <p className="mt-4 text-center text-sm text-white/85">
              <span className="font-bold text-white">{open.brand}</span> · {open.title}
            </p>
          </div>
        ) : null}
      </dialog>
    </section>
  );
}
