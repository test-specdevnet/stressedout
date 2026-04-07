import { ArrowRight, ChevronDown, ChevronUp, Mail } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { GlassButton } from "./components/GlassButton";
import { AboutStage } from "./sections/AboutStage";
import { ContactStage } from "./sections/ContactStage";
import { DynamicVideosStage } from "./sections/DynamicVideosStage";
import { GalleryStage } from "./sections/GalleryStage";
import { HeroStage } from "./sections/HeroStage";
import { PricingStage } from "./sections/PricingStage";

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
  { id: "pricing", label: "Pricing", shortLabel: "Pricing", render: PricingStage },
];

const WHEEL_THRESHOLD = 72;
const WHEEL_RESET_MS = 180;
const DEFAULT_TRANSITION_MS = 920;
const REDUCED_TRANSITION_MS = 220;

function getIndexFromHash(hash: string) {
  const id = hash.replace(/^#/, "");
  const index = sections.findIndex((section) => section.id === id);
  return index >= 0 ? index : 0;
}

export default function App() {
  const [activeIndex, setActiveIndex] = useState(() => getIndexFromHash(window.location.hash));
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const activeIndexRef = useRef(activeIndex);
  const transitionTimerRef = useRef<number | null>(null);
  const wheelAccumulatorRef = useRef(0);
  const wheelResetRef = useRef<number | null>(null);
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    isTransitioningRef.current = isTransitioning;
  }, [isTransitioning]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setPrefersReducedMotion(media.matches);
    };

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      const nextIndex = getIndexFromHash(window.location.hash);
      if (nextIndex === activeIndexRef.current) {
        return;
      }

      if (transitionTimerRef.current) {
        window.clearTimeout(transitionTimerRef.current);
      }

      setPreviousIndex(null);
      setDirection(nextIndex > activeIndexRef.current ? "forward" : "backward");
      setActiveIndex(nextIndex);
      setIsTransitioning(false);
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 8) {
        return;
      }

      event.preventDefault();

      if (isTransitioningRef.current) {
        return;
      }

      if (wheelResetRef.current) {
        window.clearTimeout(wheelResetRef.current);
      }

      wheelAccumulatorRef.current += event.deltaY;
      wheelResetRef.current = window.setTimeout(() => {
        wheelAccumulatorRef.current = 0;
      }, WHEEL_RESET_MS);

      if (Math.abs(wheelAccumulatorRef.current) < WHEEL_THRESHOLD) {
        return;
      }

      const delta = wheelAccumulatorRef.current > 0 ? 1 : -1;
      wheelAccumulatorRef.current = 0;
      navigateTo(activeIndexRef.current + delta);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [prefersReducedMotion]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName ?? "";
      if (tagName === "INPUT" || tagName === "TEXTAREA" || target?.isContentEditable) {
        return;
      }

      if (
        event.key === "ArrowDown" ||
        event.key === "PageDown" ||
        event.key === "ArrowUp" ||
        event.key === "PageUp" ||
        event.key === "Home" ||
        event.key === "End"
      ) {
        event.preventDefault();
      }

      if (isTransitioningRef.current) {
        return;
      }

      if (event.key === "ArrowDown" || event.key === "PageDown") {
        navigateTo(activeIndexRef.current + 1);
      } else if (event.key === "ArrowUp" || event.key === "PageUp") {
        navigateTo(activeIndexRef.current - 1);
      } else if (event.key === "Home") {
        navigateTo(0);
      } else if (event.key === "End") {
        navigateTo(sections.length - 1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [prefersReducedMotion]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        window.clearTimeout(transitionTimerRef.current);
      }

      if (wheelResetRef.current) {
        window.clearTimeout(wheelResetRef.current);
      }
    };
  }, []);

  const transitionDuration = prefersReducedMotion ? REDUCED_TRANSITION_MS : DEFAULT_TRANSITION_MS;

  function navigateTo(index: number) {
    const nextIndex = Math.max(0, Math.min(sections.length - 1, index));
    const currentIndex = activeIndexRef.current;

    if (nextIndex === currentIndex) {
      return;
    }

    if (transitionTimerRef.current) {
      window.clearTimeout(transitionTimerRef.current);
    }

    setPreviousIndex(currentIndex);
    setDirection(nextIndex > currentIndex ? "forward" : "backward");
    setActiveIndex(nextIndex);
    setIsTransitioning(true);

    const nextId = sections[nextIndex]?.id;
    if (nextId && window.location.hash !== `#${nextId}`) {
      window.history.replaceState(null, "", `#${nextId}`);
    }

    transitionTimerRef.current = window.setTimeout(() => {
      setPreviousIndex(null);
      setIsTransitioning(false);
    }, transitionDuration);
  }

  function handleAnchorNavigation(id: string) {
    const index = sections.findIndex((section) => section.id === id);
    if (index >= 0) {
      navigateTo(index);
    }
  }

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
        </a>

        <nav className="header-links glass-nav" aria-label="Primary">
          {["about", "gallery", "pricing", "contact"].map((id) => {
            const section = sections.find((entry) => entry.id === id);
            if (!section) {
              return null;
            }

            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                aria-current={sections[activeIndex]?.id === section.id ? "page" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  handleAnchorNavigation(section.id);
                }}
              >
                {section.shortLabel}
              </a>
            );
          })}
        </nav>

        <GlassButton href="mailto:info@stressedoutadvertising.com" icon={Mail}>
          Email us
        </GlassButton>
      </header>

      <main
        className={`story-stage ${isTransitioning ? "is-transitioning" : ""} ${prefersReducedMotion ? "is-reduced-motion" : ""}`.trim()}
        data-direction={direction}
        aria-live="polite"
      >
        <div className="story-stage__progress glass-nav" aria-label="Story progress">
          <p className="story-stage__progress-label">
            {String(activeIndex + 1).padStart(2, "0")} / {String(sections.length).padStart(2, "0")}
          </p>
          <div className="story-stage__progress-list">
            {sections.map((section, index) => {
              const isCurrent = index === activeIndex;
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
            onClick={() => navigateTo(activeIndex - 1)}
            disabled={activeIndex === 0 || isTransitioning}
            aria-label="Go to previous section"
          >
            <ChevronUp size={22} strokeWidth={2.2} />
          </button>
          <button
            type="button"
            className="story-arrow glass-nav"
            onClick={() => navigateTo(activeIndex + 1)}
            disabled={activeIndex === sections.length - 1 || isTransitioning}
            aria-label="Go to next section"
          >
            <ChevronDown size={22} strokeWidth={2.2} />
          </button>
        </div>

        <div className="story-stage__viewport">
          {sections.map((section, index) => {
            const isActive = index === activeIndex;
            const isLeaving = previousIndex === index && isTransitioning;
            const isEntering = isActive && isTransitioning;
            const isVisible = isActive || isLeaving;
            const Stage = section.render;

            return (
              <section
                key={section.id}
                id={section.id}
                className={`story-panel ${isActive ? "is-active" : ""} ${isLeaving ? "is-leaving" : ""} ${isEntering ? "is-entering" : ""} ${isVisible ? "is-visible" : ""}`.trim()}
                aria-hidden={!isActive}
                data-panel-index={index}
                data-panel-label={section.label}
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
