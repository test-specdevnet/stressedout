import { useEffect, useRef } from "react";

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

    const metadataHandlers = new Map<HTMLVideoElement, () => void>();
    const canPlayHandlers = new Map<HTMLVideoElement, () => void>();

    for (const video of videos) {
      const handleLoadedMetadata = () => playVideo(video);
      const handleCanPlay = () => playVideo(video);
      metadataHandlers.set(video, handleLoadedMetadata);
      canPlayHandlers.set(video, handleCanPlay);
      video.addEventListener("loadedmetadata", handleLoadedMetadata, { passive: true });
      video.addEventListener("canplay", handleCanPlay, { passive: true });
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
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <div className="stage-layout stage-layout--workflow dynamic-stage-layout">
      <div className="dynamic-stage-copy">
        <h2 className="stage-title dynamic-stage-title">Turn Static Images into Dynamic Videos</h2>
      </div>

      <div className="dynamic-media-stack">
        {transformationRows.map((row) => (
          <section key={row.label} className="dynamic-media-row" aria-label={`${row.label} media row`}>
            <div className="dynamic-media-row__label">{row.label}</div>

            <div className="dynamic-media-grid">
              <figure className="glass-panel dynamic-media-panel">
                <img
                  src={row.staticImage}
                  alt={row.staticAlt}
                  loading="lazy"
                  className="dynamic-static-image"
                />
              </figure>

              {row.variants.map((variant) => (
                <figure key={variant.video} className="glass-panel dynamic-media-panel">
                  <video
                    className="dynamic-variant-video"
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
