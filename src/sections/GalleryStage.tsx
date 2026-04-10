import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const galleryAds = [
  {
    id: "glasses",
    title: "Glasses Ad",
    format: "16:9 landscape",
    description: "Click or swipe to continue through the sequence.",
    video: "/assets/stressed-out/videos/glasses-ad.mp4",
  },
  {
    id: "sneaker",
    title: "Sneaker Ad",
    format: "16:9 landscape",
    description: "Optimized for smooth autoplay in a static deploy.",
    video: "/assets/stressed-out/videos/shoe-ad.mp4",
  },
  {
    id: "dog",
    title: "Dog Ad",
    format: "9:16 portrait",
    description: "Portrait format preserved without crop.",
    video: "/assets/stressed-out/videos/dog-ad.mp4",
    orientation: "portrait" as const,
  },
];

const supportPoints = [
  "Stressed Out reduces internal ad spend, making ad design and implementation more cost-effective.",
  "We brainstorm and design ads, delivering high-quality creatives faster and at a lower cost than your team executing the same volume in-house.",
  "When you use Stressed Out to stress-test your creatives, you gain more time to focus on brand positioning.",
];

type GalleryStageProps = {
  isActive?: boolean;
};

export function GalleryStage({ isActive = false }: GalleryStageProps = {}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState(0);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);

  const activeAd = galleryAds[activeIndex];
  const carouselLabel = useMemo(
    () => `Ad carousel showing ${activeAd.title}, slide ${activeIndex + 1} of ${galleryAds.length}`,
    [activeAd.title, activeIndex],
  );

  useEffect(() => {
    videoRefs.current.forEach((video) => {
      video?.load();
    });
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) {
        return;
      }

      if (index === activeIndex && isActive) {
        if (Math.abs(video.currentTime) > 0.08) {
          video.currentTime = 0;
        }
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => undefined);
        }
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [activeIndex, isActive]);

  function goToSlide(index: number) {
    setActiveIndex((index + galleryAds.length) % galleryAds.length);
  }

  function goToNextSlide() {
    goToSlide(activeIndex + 1);
  }

  function goToPreviousSlide() {
    goToSlide(activeIndex - 1);
  }

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    setTouchStartX(event.touches[0]?.clientX ?? null);
    setTouchDeltaX(0);
  }

  function handleTouchMove(event: React.TouchEvent<HTMLDivElement>) {
    if (touchStartX === null) {
      return;
    }

    setTouchDeltaX((event.touches[0]?.clientX ?? touchStartX) - touchStartX);
  }

  function handleTouchEnd() {
    if (Math.abs(touchDeltaX) > 54) {
      if (touchDeltaX < 0) {
        goToNextSlide();
      } else {
        goToPreviousSlide();
      }
    }

    setTouchStartX(null);
    setTouchDeltaX(0);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToNextSlide();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToPreviousSlide();
    }
  }

  return (
    <div className="stage-layout stage-layout--gallery-two-column">
      <div className="gallery-copy-panel">
        <h2 className="gallery-copy-panel__title">Why You Need Creative Ad Testing</h2>
        <ul className="gallery-copy-panel__list">
          {supportPoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>

      <div className="gallery-carousel-panel">
        <div className="gallery-carousel-panel__header">
          <p className="gallery-carousel-panel__meta">
            {String(activeIndex + 1).padStart(2, "0")} / {String(galleryAds.length).padStart(2, "0")}
          </p>
        </div>
        <p className="gallery-carousel-panel__subheader">Explore Our Ads</p>

        <div
          className="gallery-carousel"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          aria-roledescription="carousel"
          aria-label={carouselLabel}
        >
          <button
            type="button"
            className="gallery-carousel__arrow gallery-carousel__arrow--prev glass-nav"
            onClick={goToPreviousSlide}
            aria-label="Show previous ad"
          >
            <ChevronLeft size={20} strokeWidth={2.4} />
          </button>

          <div className="gallery-carousel__viewport">
            <div className="gallery-carousel__ambient-glow" aria-hidden="true" />
            <div className="gallery-carousel__track">
              {galleryAds.map((ad, index) => {
                const isCurrent = index === activeIndex;
                const offset = index - activeIndex;
                const normalizedOffset =
                  Math.abs(offset) > 1 ? (offset > 0 ? -1 : 1) * (galleryAds.length - Math.abs(offset)) : offset;

                return (
                  <article
                    key={ad.id}
                    className={`gallery-slide ${isCurrent ? "is-active" : ""} ${ad.orientation === "portrait" ? "is-portrait" : ""}`.trim()}
                    data-offset={normalizedOffset}
                    aria-hidden={!isCurrent}
                  >
                    <div className="gallery-slide__shell glass-media-frame">
                      <div className="gallery-slide__shell-inner">
                        <div className="gallery-slide__media-stage">
                          <video
                            ref={(node) => {
                              videoRefs.current[index] = node;
                            }}
                            className="gallery-slide__video"
                            muted
                            playsInline
                            preload="auto"
                            loop
                            controls={false}
                            aria-label={ad.title}
                          >
                            <source src={ad.video} type="video/mp4" />
                          </video>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            className="gallery-carousel__arrow gallery-carousel__arrow--next glass-nav"
            onClick={goToNextSlide}
            aria-label="Show next ad"
          >
            <ChevronRight size={20} strokeWidth={2.4} />
          </button>
        </div>

        <div className="gallery-carousel__footer">
          <div className="gallery-carousel__caption">
            <div className="gallery-carousel__caption-row">
              <span className="gallery-carousel__caption-title">{activeAd.title}</span>
              <span className="gallery-carousel__caption-format">{activeAd.format}</span>
            </div>
            <p className="gallery-carousel__caption-copy">{activeAd.description}</p>
          </div>

          <div className="gallery-carousel__dots" aria-label="Choose an ad">
            {galleryAds.map((ad, index) => (
              <button
                key={ad.id}
                type="button"
                className={`gallery-carousel__dot ${index === activeIndex ? "is-active" : ""}`.trim()}
                onClick={() => goToSlide(index)}
                aria-label={`Show ${ad.title}`}
                aria-pressed={index === activeIndex}
              >
                <span className="gallery-carousel__dot-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="gallery-carousel__dot-copy">
                  <Play size={12} strokeWidth={2.2} />
                  {ad.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
