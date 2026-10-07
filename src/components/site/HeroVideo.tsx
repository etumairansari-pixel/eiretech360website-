import { useEffect, useState } from "react";
import desktopVideo from "@/assets/hero-desktop-01.mp4";
import mobileVideo from "@/assets/hero-mobile-01.mp4";
import desktopPoster from "@/assets/hero-desktop-01-poster.webp";
import mobilePoster from "@/assets/hero-mobile-01-poster.webp";

/** Paint a responsive poster first; only load motion when the user permits it. */
export function HeroVideo() {
  const [video, setVideo] = useState("");
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reducedData = window.matchMedia("(prefers-reduced-data: reduce)");
    const mobile = window.matchMedia("(max-width: 767px)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection;
    let timer: ReturnType<typeof setTimeout>;
    const update = () => {
      clearTimeout(timer);
      setVideo("");
      if (!reducedMotion.matches && !reducedData.matches && !connection?.saveData) {
        timer = setTimeout(() => setVideo(mobile.matches ? mobileVideo : desktopVideo), 1200);
      }
    };
    update();
    [reducedMotion, reducedData, mobile].forEach((query) =>
      query.addEventListener("change", update),
    );
    return () => {
      clearTimeout(timer);
      [reducedMotion, reducedData, mobile].forEach((query) =>
        query.removeEventListener("change", update),
      );
    };
  }, []);
  return (
    <div className="dm-cinematic-media" aria-hidden="true">
      <picture>
        <source media="(max-width: 767px)" srcSet={mobilePoster} />
        <img
          src={desktopPoster}
          alt=""
          width={1920}
          height={1080}
          fetchPriority="high"
          decoding="async"
        />
      </picture>
      {video && (
        <video
          key={video}
          src={video}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          tabIndex={-1}
          onError={() => setVideo("")}
        />
      )}
      <div className="dm-cinematic-shade" />
    </div>
  );
}
