import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { SmartVideo } from "../components/SmartVideo";

const galleryAds = [
  {
    id: "glasses",
    title: "Glasses Ad",
    format: "16:9 landscape",
    description: "Click or swipe to continue through the sequence.",
    video: "/assets/stressed-out/videos/glasses-ad.mp4",
    poster: "/assets/stressed-out/images/logo-3.png",
  },
  {
    id: "sneaker",
    title: "Sneaker Ad",
    format: "16:9 landscape",
    description: "Optimized for smooth autoplay in a static deploy.",
    video: "/assets/stressed-out/videos/shoe-ad.mp4",
    poster: "/assets/stressed-out/images/logo-3.png",
  },
  {
    id: "dog",
    title: "Dog Ad",
    format: "9:16 portrait",
    description: "Portrait format preserved without crop.",
    video: "/assets/stressed-out/videos/dog-ad.mp4",
    poster: "/assets/stressed-out/images/logo-3.png",
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

  const activeAd = galleryAds[activeIndex];
  const carouselLabel = useMemo(
    () => `Ad carousel showing ${activeAd.title}, slide ${activeIndex + 1} of ${galleryAds.length}`,
    [activeAd.title, activeIndex],
  );

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
          className={`gallery-carousel ${activeAd.orientation === "portrait" ? "is-portrait-active" : ""}`.trim()}
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

          <div
            className={`gallery-carousel__viewport ${activeAd.orientation === "portrait" ? "is-portrait-active" : ""}`.trim()}
          >
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
                          <SmartVideo
                            className="gallery-slide__video"
                            active={isActive && isCurrent}
                            mp4Src={ad.video}
                            poster={ad.poster}
                            ariaLabel={ad.title}
                          />
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
      </div>
    </div>
  );
}
