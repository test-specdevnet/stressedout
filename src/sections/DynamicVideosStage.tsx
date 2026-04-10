import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { GlassMediaFrame } from "../components/GlassMediaFrame";

type TransformationRow = {
  label: "Coffee" | "Wine";
  staticImage: string;
  staticAlt: string;
  variants: {
    label: "Variant 1" | "Variant 2";
    video: string;
  }[];
};

const transformationRows: TransformationRow[] = [
  {
    label: "Coffee",
    staticImage: "/assets/stressed-out/gallery/images/coffee-static.png",
    staticAlt: "Static coffee source creative",
    variants: [
      {
        label: "Variant 1",
        video: "/assets/stressed-out/gallery/videos/coffee-variant-a.mp4",
      },
      {
        label: "Variant 2",
        video: "/assets/stressed-out/gallery/videos/coffee-variant-b.mp4",
      },
    ],
  },
  {
    label: "Wine",
    staticImage: "/assets/stressed-out/gallery/images/wine-static.png",
    staticAlt: "Static wine source creative",
    variants: [
      {
        label: "Variant 1",
        video: "/assets/stressed-out/gallery/videos/wine-variant-a.mp4",
      },
      {
        label: "Variant 2",
        video: "/assets/stressed-out/gallery/videos/wine-variant-b.mp4",
      },
    ],
  },
];

const variantVideoIndices = {
  Coffee: {
    "Variant 1": 0,
    "Variant 2": 1,
  },
  Wine: {
    "Variant 1": 2,
    "Variant 2": 3,
  },
} as const;

export function DynamicVideosStage() {
  const videoRefs = useRef<HTMLVideoElement[]>([]);

  useEffect(() => {
    const videos = videoRefs.current.filter(Boolean);
    if (videos.length === 0) return;
    const metadataHandlers = new Map<HTMLVideoElement, () => void>();

    const playVideo = (video: HTMLVideoElement) => {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            playVideo(video);
          } else {
            video.pause();
          }
        }
      },
      { threshold: 0.55 }
    );

    for (const video of videos) {
      observer.observe(video);
      const handleLoadedMetadata = () => playVideo(video);
      metadataHandlers.set(video, handleLoadedMetadata);
      video.addEventListener("loadedmetadata", handleLoadedMetadata, { passive: true });
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        for (const video of videos) video.pause();
      } else {
        for (const video of videos) playVideo(video);
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      observer.disconnect();
      for (const [video, handleLoadedMetadata] of metadataHandlers) {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      }
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <div className="stage-layout stage-layout--workflow dynamic-stage-layout">
      <div className="dynamic-stage-copy">
        <h2 className="stage-title dynamic-stage-title">Turn Static Images into Dynamic Videos</h2>
      </div>

      <div className="dynamic-variant-stack">
        {transformationRows.map((row) => (
          <section key={row.label} className="glass-panel dynamic-variant-row" aria-label={`${row.label} transformation`}>
            <div className="dynamic-variant-row__label">
              <span>{row.label}</span>
            </div>

            <GlassMediaFrame className="dynamic-media-frame" caption="Static image">
              <img
                className="dynamic-static-image"
                src={row.staticImage}
                alt={row.staticAlt}
                loading="lazy"
              />
            </GlassMediaFrame>

            <div className="dynamic-transition" aria-hidden="true">
              <ArrowRight size={20} strokeWidth={2.1} />
            </div>

            {row.variants.map((variant) => (
              <GlassMediaFrame key={variant.video} className="dynamic-media-frame" caption={variant.label}>
                <video
                  className="dynamic-variant-video"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  ref={(node) => {
                    if (node) {
                      videoRefs.current[variantVideoIndices[row.label][variant.label]] = node;
                    }
                  }}
                >
                  <source src={variant.video} type="video/mp4" />
                </video>
              </GlassMediaFrame>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
