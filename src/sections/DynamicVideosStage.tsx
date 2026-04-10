import { useEffect, useRef } from "react";

type TransformationRow = {
  label: "Coffee" | "Wine";
  staticImage: string;
  staticAlt: string;
  variants: {
    label: "Variant 1" | "Variant 2";
    title: string;
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
        title: "Coffee - Variant 1",
        video: "/assets/stressed-out/gallery/videos/coffee-variant-a.mp4",
      },
      {
        label: "Variant 2",
        title: "Coffee - Variant 2",
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
        title: "Wine - Variant 1",
        video: "/assets/stressed-out/gallery/videos/wine-variant-a.mp4",
      },
      {
        label: "Variant 2",
        title: "Wine - Variant 2",
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
      video.playsInline = true;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    };

    const metadataHandlers = new Map<HTMLVideoElement, () => void>();
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
      { threshold: 0.35 }
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
      for (const [video, handler] of metadataHandlers) {
        video.removeEventListener("loadedmetadata", handler);
      }
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <div className="stage-layout stage-layout--workflow dynamic-stage-layout">
      <div className="dynamic-stage-copy">
        <h2 className="stage-title dynamic-stage-title">Turn Static Images into Dynamic Videos</h2>
      </div>

      <div className="dynamic-gallery-stack">
        {transformationRows.map((row) => (
          <section key={row.label} className="glass-panel dynamic-gallery-section" aria-label={`${row.label} gallery row`}>
            <div className="dynamic-gallery-section__head">
              <div>
                <h3>{row.label}</h3>
              </div>
            </div>

            <div className="dynamic-gallery-grid">
              <article className="dynamic-gallery-card">
                <div className="dynamic-gallery-card__label">
                  <div>
                    <strong>Original Static Image</strong>
                    <span>{row.label}</span>
                  </div>
                  <span className="dynamic-gallery-pill">Image</span>
                </div>
                <div className="dynamic-gallery-media">
                  <img src={row.staticImage} alt={row.staticAlt} loading="lazy" className="dynamic-static-image" />
                </div>
              </article>

              {row.variants.map((variant) => (
                <article key={variant.video} className="dynamic-gallery-card">
                  <div className="dynamic-gallery-card__label">
                    <div>
                      <strong>{variant.title}</strong>
                      <span>{variant.label}</span>
                    </div>
                    <span className="dynamic-gallery-pill">Video</span>
                  </div>
                  <div className="dynamic-gallery-media dynamic-gallery-media--video">
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
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
