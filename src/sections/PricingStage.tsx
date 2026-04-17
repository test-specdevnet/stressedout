import { ChevronLeft, ChevronRight } from "lucide-react";
import { BorderBeam } from "border-beam";
import { useEffect, useMemo, useRef, useState } from "react";

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

export function PricingStage() {
  const [cardsPerPage, setCardsPerPage] = useState(3);
  const [activePage, setActivePage] = useState(0);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(max-width: 760px)");

    function syncCardsPerPage(event?: MediaQueryList | MediaQueryListEvent) {
      setCardsPerPage(event?.matches ?? mediaQuery.matches ? 1 : 3);
    }

    syncCardsPerPage(mediaQuery);

    const handleChange = (event: MediaQueryListEvent) => {
      syncCardsPerPage(event);
      setActivePage(0);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  const pages = useMemo(() => {
    if (cardsPerPage >= pricingCards.length) {
      return [pricingCards];
    }

    if (cardsPerPage === 1) {
      return pricingCards.map((card) => [card]);
    }

    const lastStartIndex = pricingCards.length - cardsPerPage;

    return Array.from({ length: lastStartIndex + 1 }, (_, pageIndex) =>
      pricingCards.slice(pageIndex, pageIndex + cardsPerPage),
    );
  }, [cardsPerPage]);

  const safeActivePage = activePage % pages.length;

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    viewport.scrollTo({
      left: 0,
      behavior: "auto",
    });
  }, [cardsPerPage]);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return undefined;
    }

    let animationFrame = 0;

    const handleScroll = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        const nextPage = Math.round(viewport.scrollLeft / Math.max(viewport.clientWidth, 1));
        setActivePage((currentPage) => (currentPage === nextPage ? currentPage : nextPage));
      });
    };

    viewport.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrame);
      viewport.removeEventListener("scroll", handleScroll);
    };
  }, [pages.length]);

  function goToPage(index: number) {
    const nextPage = (index + pages.length) % pages.length;
    const viewport = viewportRef.current;

    setActivePage(nextPage);

    if (viewport) {
      viewport.scrollTo({
        left: nextPage * viewport.clientWidth,
        behavior: "smooth",
      });
    }
  }

  function goToPreviousPage() {
    goToPage(safeActivePage - 1);
  }

  function goToNextPage() {
    goToPage(safeActivePage + 1);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToNextPage();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToPreviousPage();
    }
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
        aria-label={`Pricing carousel showing page ${safeActivePage + 1} of ${pages.length}`}
      >
        <BorderBeam
          className="beam-shell beam-shell--nav-control"
          size="md"
          colorVariant="colorful"
          duration={2.5}
          strength={1}
          brightness={1.4}
          borderRadius={24}
        >
          <button
            type="button"
            className="pricing-stage__arrow pricing-stage__arrow--prev gallery-carousel__arrow gallery-carousel__arrow--prev glass-nav"
            onClick={goToPreviousPage}
            aria-label="Show previous pricing cards"
          >
            <ChevronLeft size={22} strokeWidth={2.5} />
          </button>
        </BorderBeam>

        <div ref={viewportRef} className="pricing-stage__viewport">
          <div className="pricing-stage__track">
            {pages.map((pageCards, pageIndex) => (
              <div
                key={`pricing-page-${pageIndex}`}
                className={`pricing-stage__page ${pageIndex === safeActivePage ? "is-active" : ""}`.trim()}
                aria-hidden={pageIndex !== safeActivePage}
              >
                <div className="pricing-stage-grid">
                  {pageCards.map((card) => (
                    <article
                      key={`${pageIndex}-${card.title}`}
                      className={`pricing-stage-card glass-panel ${card.featured ? "is-featured" : ""}`.trim()}
                    >
                      <span className="pricing-stage-card__badge">{card.badge}</span>
                      <h3 className="pricing-stage-card__title">{card.title}</h3>
                      <p className="pricing-stage-card__price">{card.price}</p>
                      <p className="pricing-stage-card__description">{card.description}</p>

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

                      <p className="pricing-stage-card__note">{card.note}</p>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <BorderBeam
          className="beam-shell beam-shell--nav-control"
          size="md"
          colorVariant="colorful"
          duration={2.5}
          strength={1}
          brightness={1.4}
          borderRadius={24}
        >
          <button
            type="button"
            className="pricing-stage__arrow pricing-stage__arrow--next gallery-carousel__arrow gallery-carousel__arrow--next glass-nav"
            onClick={goToNextPage}
            aria-label="Show next pricing cards"
          >
            <ChevronRight size={22} strokeWidth={2.5} />
          </button>
        </BorderBeam>

        <div className="pricing-stage__dots" aria-hidden="true">
          {pages.map((_, pageIndex) => (
            <BorderBeam
              key={`pricing-dot-${pageIndex}`}
              className="beam-shell beam-shell--dot-control"
              size="md"
              colorVariant="colorful"
              duration={2.5}
              strength={1}
              brightness={1.4}
              borderRadius={999}
            >
              <button
                type="button"
                className={`pricing-stage__dot ${pageIndex === safeActivePage ? "is-active" : ""}`.trim()}
                onClick={() => goToPage(pageIndex)}
              >
                <span className="sr-only">Show pricing page {pageIndex + 1}</span>
              </button>
            </BorderBeam>
          ))}
        </div>
      </div>
    </div>
  );
}
