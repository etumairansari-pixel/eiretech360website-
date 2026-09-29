import { useState } from "react";
import { Play } from "lucide-react";
import { SectionLabel } from "@/components/site/primitives";
import type { Reel } from "@/content/services";

/**
 * Portfolio reels. Only the posters load with the page; a video element is
 * created when a visitor presses play, so no video bytes are fetched until
 * then, and starting one reel swaps the previous one back to its poster.
 */
export function ReelGallery({ reels }: { reels: Reel[] }) {
  const [playing, setPlaying] = useState<string | null>(null);

  if (!reels.length) return null;

  return (
    <section id="reels" className="scroll-mt-28 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <SectionLabel>Video portfolio</SectionLabel>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="max-w-3xl text-3xl font-extrabold tracking-tight md:text-4xl">
            Social media reels we've produced
          </h2>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-muted">
            {reels.length} reels · tap to play
          </p>
        </div>
        <p className="mt-4 max-w-2xl text-lg text-brand-muted">
          Short, scroll-stopping vertical videos made for Instagram Reels, TikTok and YouTube
          Shorts, with strong hooks, fast pacing and on-brand motion graphics.
        </p>

        <ul className="mt-10 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {reels.map((reel) => {
            const active = playing === reel.src;
            return (
              <li key={reel.src}>
                <figure>
                  <div className="relative aspect-[9/16] overflow-hidden rounded-2xl border border-brand-line bg-black">
                    {active ? (
                      <video
                        src={reel.src}
                        poster={reel.poster}
                        controls
                        autoPlay
                        playsInline
                        preload="auto"
                        onEnded={() => setPlaying(null)}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPlaying(reel.src)}
                        aria-label={`Play ${reel.brand} reel: ${reel.title}`}
                        className="group absolute inset-0 block"
                      >
                        <img
                          src={reel.poster}
                          alt={`${reel.brand} reel: ${reel.title}`}
                          loading="lazy"
                          decoding="async"
                          width={480}
                          height={853}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                        <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                        <span className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-900 shadow-lg transition-transform group-hover:scale-110 md:size-16">
                          <Play className="ml-0.5 size-6 fill-current md:size-7" />
                        </span>
                      </button>
                    )}
                  </div>
                  <figcaption className="mt-3">
                    <span className="block text-sm font-semibold leading-snug">{reel.title}</span>
                    <span className="text-xs text-brand-muted">{reel.brand}</span>
                  </figcaption>
                </figure>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
