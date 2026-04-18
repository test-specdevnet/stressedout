import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, TouchEvent } from "react";

import { GlassButton } from "../components/GlassButton";

type PricingCard = {
  badge: string;
  title: string;
  price: string;
  description: string;
  bullets: string[];
  ctaText: string;
  href: string;
  note: string;
  featured?: boolean;
};

const pricingCards: PricingCard[] = [
  {
    badge: "Getting Started",
    title: "Stress Test Report",
    price: "$149",
    description: "We stress test your static and dynamic ads.",
    bullets: [
      "You send us the ads you want analyzed (up to 3 creatives)",
      "We stress-test your ads with extensive behavioral analysis",
      "You receive a written stress test report for each ad",
      "No variants delivered",
    ],
    ctaText: "Get the Stress Test",
    href: "https://buy.stripe.com/cNi9AN5Es74P5kqaFjfjG03",
    note: "Each report outlines what to fix or test next.",
  },
  {
    badge: "Most Popular",
    title: "Growth Pack",
    price: "$349",
    description: "We convert ad ideas into dynamic videos.",
    bullets: [
      "You send us ad concepts, static images, or UGC (up to 3 creatives)",
      "We stress test your content and create dynamic video ads",
      "You receive 2 branded variants per creative for a total of 6 ad variants",
      "1 minor revision or variant",
    ],
    ctaText: "Choose Growth Pack",
    href: "https://buy.stripe.com/aFafZbd6U2OzeV03cRfjG02",
    note: "Cheaper than designing and implementing internally.",
    featured: true,
  },
  {
    badge: "Add-On",
    title: "Ad Booster",
    price: "+$399",
    description: "Boost up to 3 existing video ads.",
    bullets: [
      "You send us 3 video ads",
      "We stress test your video ads and iterate on them with adjusted hooks, pacing, structural fixes, captions, and CTAs for higher conversions",
      "You receive 2 boosted variants per creative for a total of 6 ad variants",
      "1 revision round and existing assets only",
    ],
    ctaText: "Add Ad Booster",
    href: "https://buy.stripe.com/eVq14h0k8exhaEKfZDfjG01",
    note: "Select this add-on only if you already have video ads.",
  },
  {
    badge: "Best Value",
    title: "Stress Free Monthly",
    price: "$599/month",
    description: "Subscription tier.",
    bullets: [
      "You send us ad concepts, static images, or UGC (up to 3 creatives)",
      "We stress test your content and create dynamic video ads",
      "You receive 5 branded variants per creative for a total of 15 ad variants per month",
      "1 minor revision or variant",
    ],
    ctaText: "Start Monthly",
    href: "https://buy.stripe.com/9B68wJ7MAfBlbIO7t7fjG04",
    note: "Consistent testing results across ad variants.",
    featured: true,
  },
];

const SWIPE_THRESHOLD_PX = 48;

export function PricingStage() {
  const [activeIndex, setActiveIndex] = useState(1);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);
  const touchStartXRef = useRef<number | null>(null);
  const touchDeltaXRef = useRef(0);

  const slides = useMemo(
    () => [pricingCards[pricingCards.length - 1], ...pricingCards, pricingCards[0]],
    [],
  );

  const actualIndex = ((activeIndex - 1 + pricingCards.length) % pricingCards.length) + 1;

  useEffect(() => {
    if (isTransitionEnabled) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setIsTransitionEnabled(true);
    }, 40);

    return () => window.clearTimeout(timeoutId);
  }, [isTransitionEnabled]);

  function goToIndex(index: number) {
    setIsTransitionEnabled(true);
    setActiveIndex(index);
  }

  function goToPreviousSlide() {
    goToIndex(activeIndex - 1);
  }

  function goToNextSlide() {
    goToIndex(activeIndex + 1);
  }

  function goToDot(index: number) {
    goToIndex(index + 1);
  }

  function handleTransitionEnd() {
    if (activeIndex === 0) {
      setIsTransitionEnabled(false);
      setActiveIndex(pricingCards.length);
      return;
    }

    if (activeIndex === slides.length - 1) {
      setIsTransitionEnabled(false);
      setActiveIndex(1);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToNextSlide();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToPreviousSlide();
    }
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
    touchDeltaXRef.current = 0;
  }

  function handleTouchMove(event: TouchEvent<HTMLDivElement>) {
    if (touchStartXRef.current === null) {
      return;
    }

    touchDeltaXRef.current = (event.touches[0]?.clientX ?? 0) - touchStartXRef.current;
  }

  function handleTouchEnd() {
    if (Math.abs(touchDeltaXRef.current) >= SWIPE_THRESHOLD_PX) {
      if (touchDeltaXRef.current < 0) {
        goToNextSlide();
      } else {
        goToPreviousSlide();
      }
    }

    touchStartXRef.current = null;
    touchDeltaXRef.current = 0;
  }

  return (
    <div className="stage-layout stage-layout--pricing pricing-stage">
      <div className="pricing-stage__header">
        <h2 className="pricing-stage__heading">Pricing and Offerings</h2>
      </div>

      <div
        className="pricing-stage__carousel"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-roledescription="carousel"
        aria-label={`Pricing carousel showing card ${actualIndex} of ${pricingCards.length}`}
      >
        <button
          type="button"
          className="pricing-stage__arrow pricing-stage__arrow--prev gallery-carousel__arrow gallery-carousel__arrow--prev glass-nav"
          onClick={goToPreviousSlide}
          aria-label="Show previous pricing card"
        >
          <ChevronLeft size={22} strokeWidth={2.5} />
        </button>

        <div
          className="pricing-stage__viewport"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className={`pricing-stage__track ${isTransitionEnabled ? "is-animated" : "is-snapping"}`.trim()}
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            onTransitionEnd={handleTransitionEnd}
          >
            {slides.map((card, slideIndex) => {
              const isActive = slideIndex === activeIndex;

              return (
                <div
                  key={`${slideIndex}-${card.title}`}
                  className="pricing-stage__slide"
                  aria-hidden={!isActive}
                >
                  <article
                    className={`pricing-stage-card glass-panel ${card.featured ? "is-featured" : ""}`.trim()}
                  >
                    <div className="pricing-stage-card__summary">
                      <span className="pricing-stage-card__badge">{card.badge}</span>
                      <h3
                        className={`pricing-stage-card__title ${card.title === "Stress Test Report" || card.title === "Stress Free Monthly" ? "pricing-stage-card__title--single-line" : ""}`.trim()}
                      >
                        {card.title}
                      </h3>
                      <p className="pricing-stage-card__price">{card.price}</p>
                      <p className="pricing-stage-card__description">{card.description}</p>

                      <p className="pricing-stage-card__note">{card.note}</p>
                    </div>

                    <ul className="pricing-stage-card__bullets" aria-label={`${card.title} included features`}>
                      {card.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>

                    <GlassButton
                      className="pricing-stage-card__cta"
                      href={card.href}
                      target="_blank"
                      rel="noreferrer"
                      variant="secondary"
                    >
                      {card.ctaText}
                    </GlassButton>
                  </article>
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className="pricing-stage__arrow pricing-stage__arrow--next gallery-carousel__arrow gallery-carousel__arrow--next glass-nav"
          onClick={goToNextSlide}
          aria-label="Show next pricing card"
        >
          <ChevronRight size={22} strokeWidth={2.5} />
        </button>

        <div className="pricing-stage__dots">
          {pricingCards.map((card, pageIndex) => (
            <button
              key={`pricing-dot-${card.title}`}
              type="button"
              className={`pricing-stage__dot ${pageIndex + 1 === actualIndex ? "is-active" : ""}`.trim()}
              onClick={() => goToDot(pageIndex)}
              aria-label={`Show ${card.title}`}
              aria-pressed={pageIndex + 1 === actualIndex}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
