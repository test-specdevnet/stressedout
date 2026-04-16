import { ArrowRight, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
  const visibleVideosRef = useRef<Set<HTMLVideoElement>>(new Set());
  const [startedVideos, setStartedVideos] = useState<Record<number, boolean>>({});

  const playVideo = (video: HTMLVideoElement, force = false) => {
    const videoIndex = videoRefs.current.findIndex((item) => item === video);
    if (videoIndex < 0 || !startedVideos[videoIndex]) {
      video.pause();
      if (Math.abs(video.currentTime) > 0.08) {
        video.currentTime = 0;
      }
      return;
    }

    if (!force && !visibleVideosRef.current.has(video)) {
      video.pause();
      if (Math.abs(video.currentTime) > 0.08) {
        video.currentTime = 0;
      }
      return;
    }

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

  const handleVideoStart = (videoIndex: number) => {
    const video = videoRefs.current[videoIndex];
    if (!video) return;

    setStartedVideos((current) => (current[videoIndex] ? current : { ...current, [videoIndex]: true }));
    video.currentTime = 0;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  };

  useEffect(() => {
    const videos = videoRefs.current.filter(Boolean);
    if (videos.length === 0) return;
    const scrollViewport = document.querySelector(".story-stage__viewport");

    const metadataHandlers = new Map<HTMLVideoElement, () => void>();
    const canPlayHandlers = new Map<HTMLVideoElement, () => void>();
    const endedHandlers = new Map<HTMLVideoElement, () => void>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const video = entry.target as HTMLVideoElement;
          if (entry.intersectionRatio >= 0.4) {
            visibleVideosRef.current.add(video);
            if (isActive) {
              if (Math.abs(video.currentTime) > 0.08) {
                video.currentTime = 0;
              }
              playVideo(video, true);
            }
          } else {
            visibleVideosRef.current.delete(video);
            video.pause();
            if (Math.abs(video.currentTime) > 0.08) {
              video.currentTime = 0;
            }
          }
        }
      },
      { threshold: [0, 0.4, 1], root: scrollViewport },
    );

    for (const video of videos) {
      video.load();
      const handleLoadedMetadata = () => playVideo(video, isActive);
      const handleCanPlay = () => playVideo(video, isActive);
      const handleEnded = () => {
        video.currentTime = 0;
        playVideo(video, isActive);
      };
      metadataHandlers.set(video, handleLoadedMetadata);
      canPlayHandlers.set(video, handleCanPlay);
      endedHandlers.set(video, handleEnded);
      video.addEventListener("loadedmetadata", handleLoadedMetadata, { passive: true });
      video.addEventListener("canplay", handleCanPlay, { passive: true });
      video.addEventListener("ended", handleEnded, { passive: true });
      observer.observe(video);
    }

    const onVisibilityChange = () => {
      if (!document.hidden) {
        for (const video of videos) playVideo(video, isActive);
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
      observer.disconnect();
      visibleVideosRef.current.clear();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [isActive, startedVideos]);

  useEffect(() => {
    const videos = videoRefs.current.filter(Boolean);
    if (videos.length === 0) return;

    if (!isActive) {
      for (const video of videos) {
        video.pause();
        if (Math.abs(video.currentTime) > 0.08) {
          video.currentTime = 0;
        }
      }
      return;
    }

    for (const video of videos) {
      if (Math.abs(video.currentTime) > 0.08) {
        video.currentTime = 0;
      }
      playVideo(video, true);
    }

    const firstVideo = videos[0];
    if (firstVideo) {
      const playPromise = firstVideo.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => undefined);
      }
    }
  }, [isActive, startedVideos]);

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
                  <div className="dynamic-variant-video-shell group">
                    <video
                      className={`dynamic-variant-video ${row.label === "Coffee" ? "dynamic-variant-video--coffee" : ""}`.trim()}
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      controls={false}
                      ref={(node) => {
                        if (node) {
                          videoRefs.current[variantVideoIndices[row.label][variant.label]] = node;
                        }
                      }}
                    >
                      <source src={variant.video.replace(".mp4", ".webm")} type="video/webm" />
                      <source src={variant.video} type="video/mp4" />
                    </video>
                    {!startedVideos[variantVideoIndices[row.label][variant.label]] ? (
                      <button
                        type="button"
                        className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/10 rounded-xl cursor-pointer"
                        onClick={() => handleVideoStart(variantVideoIndices[row.label][variant.label])}
                        aria-label={`Play ${variant.displayLabel}`}
                      >
                        <Play className="h-16 w-16 text-white transition-transform hover:scale-110" />
                      </button>
                    ) : null}
                  </div>
                </figure>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
