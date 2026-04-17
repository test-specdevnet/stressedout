import { ArrowRight, Pause, Play } from "lucide-react";
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
  const [playingVideos, setPlayingVideos] = useState<Record<number, boolean>>({});

  const pauseVideo = (videoIndex: number, reset = false) => {
    const video = videoRefs.current[videoIndex];
    if (!video) return;

    video.pause();
    if (reset) {
      video.currentTime = 0;
    }
    setPlayingVideos((current) => ({ ...current, [videoIndex]: false }));
  };

  const playVideo = (videoIndex: number) => {
    const video = videoRefs.current[videoIndex];
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    const playPromise = video.play();
    setPlayingVideos((current) => ({ ...current, [videoIndex]: true }));
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        setPlayingVideos((current) => ({ ...current, [videoIndex]: false }));
      });
    }
  };

  const handleVideoToggle = (videoIndex: number) => {
    if (playingVideos[videoIndex]) {
      pauseVideo(videoIndex, false);
      return;
    }

    playVideo(videoIndex);
  };

  useEffect(() => {
    const videos = videoRefs.current.filter(Boolean);
    if (videos.length === 0) return;
    const playHandlers = new Map<HTMLVideoElement, () => void>();
    const pauseHandlers = new Map<HTMLVideoElement, () => void>();

    for (const [videoIndex, video] of videos.entries()) {
      const handlePlay = () => {
        setPlayingVideos((current) => ({ ...current, [videoIndex]: true }));
      };
      const handlePause = () => {
        setPlayingVideos((current) => ({ ...current, [videoIndex]: false }));
      };
      playHandlers.set(video, handlePlay);
      pauseHandlers.set(video, handlePause);
      video.addEventListener("play", handlePlay, { passive: true });
      video.addEventListener("pause", handlePause, { passive: true });
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        for (const [videoIndex] of videos.entries()) {
          pauseVideo(videoIndex, false);
        }
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      for (const [video, handler] of playHandlers) {
        video.removeEventListener("play", handler);
      }
      for (const [video, handler] of pauseHandlers) {
        video.removeEventListener("pause", handler);
      }
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const videos = videoRefs.current.filter(Boolean);
    if (videos.length === 0) return;

    if (!isActive) {
      for (const [videoIndex] of videos.entries()) {
        pauseVideo(videoIndex, true);
      }
    }
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

              {row.variants.map((variant) => {
                const videoIndex = variantVideoIndices[row.label][variant.label];
                const isPlaying = !!playingVideos[videoIndex];

                return (
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
                            videoRefs.current[videoIndex] = node;
                          }
                        }}
                      >
                        <source src={variant.video.replace(".mp4", ".webm")} type="video/webm" />
                        <source src={variant.video} type="video/mp4" />
                      </video>
                      <button
                        type="button"
                        className={`dynamic-video-play-button ${isPlaying ? "is-active" : ""}`.trim()}
                        onClick={() => handleVideoToggle(videoIndex)}
                        aria-label={`${isPlaying ? "Pause" : "Play"} ${variant.displayLabel}`}
                        aria-pressed={isPlaying}
                      >
                        {isPlaying ? (
                          <Pause className="dynamic-video-play-icon" />
                        ) : (
                          <Play className="dynamic-video-play-icon" />
                        )}
                        <span className="dynamic-video-play-text">{isPlaying ? "Pause" : "Play"}</span>
                      </button>
                    </div>
                  </figure>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <style>{`
        /* LAYOUT FIX v3 — Fixed header overlap + bottom wine cropping (applied to current AFTER version) */
        /* NEW FIXES — header overlap + bottom cropping */
        .stage-layout--workflow,
        .dynamic-stage-layout,
        .dynamic-stage-copy {
          height: auto;
          max-height: none;
          overflow: visible;
          padding-bottom: 1rem;
        }

        .dynamic-media-stack {
          display: flex;
          flex-direction: column;
          gap: 3.5rem;
          width: 100%;
          max-width: 100%;
          height: auto;
          overflow: visible;
          padding-top: 2rem;
          padding-bottom: 3rem;
          margin-top: 0;
        }

        .dynamic-media-row {
          width: 100%;
          height: auto;
          box-sizing: border-box;
        }

        .glass-panel,
        .dynamic-media-panel {
          height: auto;
          max-height: none;
          overflow: visible;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }

        .dynamic-media-grid {
          display: grid;
          grid-template-columns: 1fr 48px 1fr 1fr;
          gap: 1.5rem;
          align-items: start;
          width: 100%;
          max-width: 100%;
        }

        .dynamic-static-image,
        .dynamic-variant-video {
          width: 100%;
          height: auto;
          aspect-ratio: 16 / 9;
          object-fit: cover;
          border-radius: inherit;
          display: block;
        }

        .dynamic-variant-video-shell {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          border-radius: inherit;
        }

        .dynamic-media-label {
          margin-bottom: 0.5rem !important;
          padding-bottom: 0;
        }
      `}</style>
    </div>
  );
}
