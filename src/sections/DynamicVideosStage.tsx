import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";

type TransformationRow = {
  label: "Coffee" | "Wine";
  staticLabel: string;
  staticImage: string;
  staticAlt: string;
  variants: {
    label: "Variant 1" | "Variant 2";
    displayLabel: string;
    video: string;
  }[];
};

const transformationRows: TransformationRow[] = [
  {
    label: "Coffee",
    staticLabel: "Coffee Static Image",
    staticImage: "/assets/stressed-out/gallery/images/coffee-static.png",
    staticAlt: "Static coffee source creative",
    variants: [
      {
        label: "Variant 1",
        displayLabel: "Coffee Ad Variant 1",
        video: "/assets/stressed-out/gallery/videos/coffee-variant-a.mp4",
      },
      {
        label: "Variant 2",
        displayLabel: "Coffee Ad Variant 2",
        video: "/assets/stressed-out/gallery/videos/coffee-variant-b.mp4",
      },
    ],
  },
  {
    label: "Wine",
    staticLabel: "Wine Static Image",
    staticImage: "/assets/stressed-out/gallery/images/wine-static.png",
    staticAlt: "Static wine source creative",
    variants: [
      {
        label: "Variant 1",
        displayLabel: "Wine Ad Variant 1",
        video: "/assets/stressed-out/gallery/videos/wine-variant-a.mp4",
      },
      {
        label: "Variant 2",
        displayLabel: "Wine Ad Variant 2",
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

type DynamicVideosStageProps = {
  isActive?: boolean;
};

export function DynamicVideosStage(props?: DynamicVideosStageProps) {
  const isActive = props?.isActive ?? false;
  const videoRefs = useRef<HTMLVideoElement[]>([]);

  const playVideo = (video: HTMLVideoElement) => {
    video.muted = true;
    video.defaultMuted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("loop", "");
    video.setAttribute("playsinline", "");
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  };

  useEffect(() => {
    const videos = videoRefs.current.filter(Boolean);
    if (videos.length === 0) return;

    const metadataHandlers = new Map<HTMLVideoElement, () => void>();
    const canPlayHandlers = new Map<HTMLVideoElement, () => void>();
    const endedHandlers = new Map<HTMLVideoElement, () => void>();

    for (const video of videos) {
      const handleLoadedMetadata = () => playVideo(video);
      const handleCanPlay = () => playVideo(video);
      const handleEnded = () => {
        video.currentTime = 0;
        playVideo(video);
      };
      metadataHandlers.set(video, handleLoadedMetadata);
      canPlayHandlers.set(video, handleCanPlay);
      endedHandlers.set(video, handleEnded);
      video.addEventListener("loadedmetadata", handleLoadedMetadata, { passive: true });
      video.addEventListener("canplay", handleCanPlay, { passive: true });
      video.addEventListener("ended", handleEnded, { passive: true });
      playVideo(video);
    }

    const onVisibilityChange = () => {
      if (!document.hidden) {
        for (const video of videos) playVideo(video);
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      for (const [video, handler] of metadataHandlers) {
        video.removeEventListener("loadedmetadata", handler);
      }
      for (const [video, handler] of canPlayHandlers) {
        video.removeEventListener("canplay", handler);
      }
      for (const [video, handler] of endedHandlers) {
        video.removeEventListener("ended", handler);
      }
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!isActive) return;
    const videos = videoRefs.current.filter(Boolean);
    if (videos.length === 0) return;

    const replayTimers = [0, 180, 700, 1600].map((delay) =>
      window.setTimeout(() => {
        for (const video of videos) {
          playVideo(video);
        }
      }, delay),
    );

    return () => {
      for (const timer of replayTimers) {
        window.clearTimeout(timer);
      }
    };
  }, [isActive]);

  return (
    <div className="stage-layout stage-layout--workflow dynamic-stage-layout">
      <div className="dynamic-stage-copy">
        <h2 className="stage-title dynamic-stage-title">Turn Static Images into Dynamic Videos</h2>
      </div>

      <div className="dynamic-media-stack">
        {transformationRows.map((row) => (
          <section
            key={row.label}
            className={`dynamic-media-row ${row.label === "Wine" ? "dynamic-media-row--wine" : ""}`.trim()}
            aria-label={`${row.label} media row`}
          >
            <div className="dynamic-media-grid">
              <figure className="glass-panel dynamic-media-panel dynamic-media-panel--static">
                <figcaption className="dynamic-media-label">{row.staticLabel}</figcaption>
                <img
                  src={row.staticImage}
                  alt={row.staticAlt}
                  loading="lazy"
                  className="dynamic-static-image"
                />
              </figure>

              <div className="dynamic-media-arrows" aria-hidden="true">
                <span className="dynamic-media-arrow glass-nav">
                  <ArrowRight size={18} strokeWidth={2.4} />
                </span>
              </div>

              {row.variants.map((variant) => (
                <figure key={variant.video} className="glass-panel dynamic-media-panel">
                  <figcaption className="dynamic-media-label">{variant.displayLabel}</figcaption>
                  <video
                    className={`dynamic-variant-video ${row.label === "Coffee" ? "dynamic-variant-video--coffee" : ""}`.trim()}
                    autoPlay
                    muted
                    loop
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
                </figure>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
