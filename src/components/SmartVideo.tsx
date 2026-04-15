import { useEffect, useRef, useState } from "react";

type SmartVideoProps = {
  active?: boolean;
  className?: string;
  mp4Src: string;
  webmSrc?: string;
  poster: string;
  ariaLabel: string;
};

export function SmartVideo({
  active = false,
  className = "",
  mp4Src,
  webmSrc,
  poster,
  ariaLabel,
}: SmartVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry?.intersectionRatio >= 0.7);
      },
      {
        threshold: [0.3, 0.7, 0.95],
      },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (active && isVisible) {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => undefined);
      }
      return;
    }

    video.pause();
  }, [active, isVisible]);

  return (
    <video
      ref={videoRef}
      className={className}
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
      controls={false}
      aria-label={ariaLabel}
    >
      {webmSrc ? <source src={webmSrc} type="video/webm" /> : null}
      <source src={mp4Src} type="video/mp4" />
    </video>
  );
}
