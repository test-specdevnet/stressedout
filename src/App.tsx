import { ArrowRight, ChevronDown, ChevronUp, Instagram, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { GlassButton } from "./components/GlassButton";
import { useStoryScroll } from "./hooks/useStoryScroll";
import {
  getPanelWheelState,
  getRelativeWheelSlot,
  STORY_WHEEL_CONSTANTS,
} from "./lib/storyWheel";
import { AboutStage } from "./sections/AboutStage";
import { ContactStage } from "./sections/ContactStage";
import { DynamicVideosStage } from "./sections/DynamicVideosStage";
import { GalleryStage } from "./sections/GalleryStage";
import { HeroStage } from "./sections/HeroStage";
import { PricingStage } from "./sections/PricingStage";
import { TestimonialsStage } from "./sections/TestimonialsStage";

type StorySection = {
  id: string;
  label: string;
  shortLabel: string;
  render: () => JSX.Element;
};

const sections: StorySection[] = [
  { id: "hero", label: "Hero Section", shortLabel: "Hero", render: HeroStage },
  { id: "about", label: "About Us", shortLabel: "About", render: AboutStage },
  {
    id: "dynamic-videos",
    label: "Static Content to Dynamic Videos",
    shortLabel: "Dynamic",
    render: DynamicVideosStage,
  },
  { id: "gallery", label: "Ad Gallery", shortLabel: "Gallery", render: GalleryStage },
  { id: "contact", label: "Contact", shortLabel: "Contact", render: ContactStage },
  { id: "testimonials", label: "Testimonials", shortLabel: "Praise", render: TestimonialsStage },
  { id: "pricing", label: "Pricing", shortLabel: "Pricing", render: PricingStage },
];
const sectionIds = sections.map((section) => section.id);

const DEFAULT_TRANSITION_MS = 980;
const REDUCED_TRANSITION_MS = 220;
const WHEEL_THRESHOLD = 48;
const WHEEL_RESET_MS = 120;
const NAVIGATION_COOLDOWN_MS = 140;
const TOUCH_THRESHOLD = 54;

export default function App() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setPrefersReducedMotion(media.matches);
    };

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const transitionDuration = prefersReducedMotion ? REDUCED_TRANSITION_MS : DEFAULT_TRANSITION_MS;
  const {
    activeIndex,
    fromIndex,
    toIndex,
    direction,
    isTransitioning,
    stepProgress,
    navigateTo,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useStoryScroll({
    sectionIds,
    wheelThreshold: WHEEL_THRESHOLD,
    wheelResetMs: WHEEL_RESET_MS,
    navigationCooldownMs: NAVIGATION_COOLDOWN_MS,
    transitionDuration,
    touchThreshold: TOUCH_THRESHOLD,
  });

  function handleAnchorNavigation(id: string) {
    const index = sections.findIndex((section) => section.id === id);
    if (index >= 0) {
      navigateTo(index);
    }
  }

  const totalSections = sections.length;
  const displayIndex = isTransitioning && toIndex !== null ? toIndex : activeIndex;
  const pinwheelRotation =
    (direction === "forward" ? -1 : 1) * stepProgress * STORY_WHEEL_CONSTANTS.STEP_ANGLE_DEG;

  return (
    <div className="site-shell">
      <div className="site-backdrop" aria-hidden="true">
        <div className="aurora aurora-one" />
        <div className="aurora aurora-two" />
        <div className="aurora aurora-three" />
        <div className="grid-haze" />
      </div>

      <header className="site-header">
        <a
          className="brand-mark glass-nav"
          href="#hero"
          aria-label="Stressed Out home"
          onClick={(event) => {
            event.preventDefault();
            handleAnchorNavigation("hero");
          }}
        >
          <span className="brand-mark__eyebrow">Stressed Out</span>
          <span className="brand-mark__name">Advertising</span>
          <div className="brand-mark__logo-wrap">
            <img
              className="brand-mark__logo"
              src="/assets/stressed-out/images/logo.png"
              alt="Stressed Out logo"
            />
          </div>
        </a>

        <div className="floating-widget-stack" aria-label="Quick actions">
          <GlassButton
            className="floating-widget"
            href="mailto:info@stressedoutadvertising.com"
            icon={Mail}
            aria-label="Email us"
          >
            Email us
          </GlassButton>
          <GlassButton
            className="floating-widget"
            href="https://www.instagram.com/stressedoutadvertising?igsh=MzJxdXcybGRobTdt"
            target="_blank"
            rel="noreferrer"
            icon={Instagram}
            variant="secondary"
            aria-label="Follow us on Instagram"
          >
            Follow us
          </GlassButton>
        </div>
      </header>

      <main
        className={`story-stage ${isTransitioning ? "is-transitioning" : ""} ${prefersReducedMotion ? "is-reduced-motion" : ""}`.trim()}
        data-direction={direction}
        aria-live="polite"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="story-stage__progress glass-nav" aria-label="Story progress">
          <p className="story-stage__progress-label">
            {String(displayIndex + 1).padStart(2, "0")} / {String(sections.length).padStart(2, "0")}
          </p>
          <div className="story-stage__progress-list">
            {sections.map((section, index) => {
              const isCurrent = index === displayIndex;
              return (
                <button
                  key={section.id}
                  type="button"
                  className={`story-stage__progress-item ${isCurrent ? "is-current" : ""}`.trim()}
                  onClick={() => navigateTo(index)}
                  aria-label={`Go to ${section.label}`}
                  aria-current={isCurrent ? "page" : undefined}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span>{section.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="story-stage__controls" aria-label="Story navigation">
          <button
            type="button"
            className="story-arrow glass-nav"
            onClick={() => navigateTo(activeIndex - 1, { wrap: true, directionOverride: "backward" })}
            disabled={isTransitioning}
            aria-label="Go to previous section"
          >
            <ChevronUp size={22} strokeWidth={2.2} />
          </button>
          <button
            type="button"
            className="story-arrow glass-nav"
            onClick={() => navigateTo(activeIndex + 1, { wrap: true, directionOverride: "forward" })}
            disabled={isTransitioning}
            aria-label="Go to next section"
          >
            <ChevronDown size={22} strokeWidth={2.2} />
          </button>
        </div>

        <div className="story-stage__pinwheel" aria-hidden="true">
          <div className="story-stage__pinwheel-hub">
            <span className="story-stage__pinwheel-ring" />
            <span className="story-stage__pinwheel-core" />
          </div>
          <div
            className="story-stage__pinwheel-spokes"
            style={{ transform: `rotate(${pinwheelRotation}deg)` }}
          >
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="story-stage__viewport">
          {sections.map((section, index) => {
            const relativeSlot = getRelativeWheelSlot(
              index,
              activeIndex,
              totalSections,
              isTransitioning,
              fromIndex,
              stepProgress,
              direction,
            );
            const panelState = getPanelWheelState(relativeSlot);
            const isActive = !isTransitioning && index === activeIndex;
            const Stage = section.render;

            return (
              <section
                key={section.id}
                id={section.id}
                className={`story-panel ${panelState.isVisible ? "is-visible" : ""} ${panelState.isCenter ? "is-center" : ""}`.trim()}
                aria-hidden={!panelState.isCenter}
                data-panel-index={index}
                data-panel-label={section.label}
                data-slot={panelState.slotName}
                data-active={isActive ? "true" : "false"}
                data-transitioning={isTransitioning ? "true" : "false"}
                data-direction={direction}
                style={panelState.style}
              >
                <div className="story-panel__surface glass-panel">
                  <div className="story-panel__frame">
                    <div className="story-panel__meta">
                      <p className="story-panel__eyebrow">{section.label}</p>
                      <span className="story-panel__count">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <Stage />
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        <div className="story-stage__hint glass-nav" aria-hidden="true">
          <span>Wheel, keys, or arrows</span>
          <ArrowRight size={16} strokeWidth={2} />
        </div>
      </main>
    </div>
  );
}
