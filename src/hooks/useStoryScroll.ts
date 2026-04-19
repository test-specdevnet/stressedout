import type { TouchEvent } from "react";
import { useEffect, useRef, useState } from "react";

export type StoryDirection = "forward" | "backward";

type NavigateOptions = {
  wrap?: boolean;
  directionOverride?: StoryDirection;
};

type UseStoryScrollOptions = {
  sectionIds: string[];
  wheelThreshold: number;
  wheelResetMs: number;
  navigationCooldownMs: number;
  transitionDuration: number;
  touchThreshold: number;
};

function getIndexFromHash(hash: string, sectionIds: string[]) {
  const id = hash.replace(/^#/, "");
  const index = sectionIds.findIndex((sectionId) => sectionId === id);
  return index >= 0 ? index : 0;
}

function wrapIndex(index: number, total: number) {
  return ((index % total) + total) % total;
}

export function useStoryScroll({
  sectionIds,
  navigationCooldownMs,
  touchThreshold,
}: UseStoryScrollOptions) {
  const [activeIndex, setActiveIndex] = useState(() => getIndexFromHash(window.location.hash, sectionIds));
  const [direction, setDirection] = useState<StoryDirection>("forward");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const viewportRef = useRef<HTMLElement | null>(null);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const activeIndexRef = useRef(activeIndex);
  const lastNavigationRef = useRef(0);
  const touchStartYRef = useRef<number | null>(null);
  const touchLastYRef = useRef<number | null>(null);
  const transitionTimeoutRef = useRef<number | null>(null);
  const scrollFrameRef = useRef<number | null>(null);
  const mobileTouchModeRef = useRef(false);

  useEffect(() => {
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    const noHover = window.matchMedia("(hover: none)");
    const mobileWidth = window.matchMedia("(max-width: 768px)");

    const update = () => {
      mobileTouchModeRef.current =
        mobileWidth.matches || coarsePointer.matches || noHover.matches;
    };

    update();
    coarsePointer.addEventListener("change", update);
    noHover.addEventListener("change", update);
    mobileWidth.addEventListener("change", update);

    return () => {
      coarsePointer.removeEventListener("change", update);
      noHover.removeEventListener("change", update);
      mobileWidth.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    return () => {
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
      }
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    const sections = sectionRefs.current.filter(Boolean) as HTMLElement[];
    if (!viewport || sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const bestEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!bestEntry || bestEntry.intersectionRatio < 0.5) {
          return;
        }

        const nextIndex = Number((bestEntry.target as HTMLElement).dataset.panelIndex ?? "-1");
        if (Number.isNaN(nextIndex) || nextIndex < 0 || nextIndex === activeIndexRef.current) {
          return;
        }

        setDirection(nextIndex > activeIndexRef.current ? "forward" : "backward");
        setActiveIndex(nextIndex);
      },
      {
        root: viewport,
        threshold: [0.3, 0.5, 0.75],
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [sectionIds]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const initialIndex = getIndexFromHash(window.location.hash, sectionIds);
    const target = sectionRefs.current[initialIndex];
    if (!viewport || !target) {
      return;
    }

    viewport.scrollTo({
      top: target.offsetTop,
      behavior: "auto",
    });
  }, [sectionIds]);

  useEffect(() => {
    const onHashChange = () => {
      const nextIndex = getIndexFromHash(window.location.hash, sectionIds);
      if (nextIndex === activeIndexRef.current) {
        return;
      }
      navigateTo(nextIndex);
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [sectionIds]);

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
        event.stopPropagation();
      }

      if (window.performance.now() - lastNavigationRef.current < navigationCooldownMs) {
        return;
      }

      if (event.key === "ArrowDown" || event.key === "PageDown") {
        navigateTo(activeIndexRef.current + 1, { wrap: true, directionOverride: "forward" });
      } else if (event.key === "ArrowUp" || event.key === "PageUp") {
        navigateTo(activeIndexRef.current - 1, { wrap: true, directionOverride: "backward" });
      } else if (event.key === "Home") {
        navigateTo(0);
      } else if (event.key === "End") {
        navigateTo(sectionIds.length - 1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigationCooldownMs, sectionIds.length]);

  function setViewportRef(node: HTMLElement | null) {
    viewportRef.current = node;
  }

  function registerSection(index: number) {
    return (node: HTMLElement | null) => {
      sectionRefs.current[index] = node;
    };
  }

  function completeTransitionSoon() {
    if (mobileTouchModeRef.current) {
      setIsTransitioning(false);
      return;
    }

    if (transitionTimeoutRef.current !== null) {
      window.clearTimeout(transitionTimeoutRef.current);
    }

    setIsTransitioning(true);
    transitionTimeoutRef.current = window.setTimeout(() => {
      setIsTransitioning(false);
    }, Math.max(96, navigationCooldownMs + 24));
  }

  function navigateTo(index: number, options: NavigateOptions = {}) {
    const currentIndex = activeIndexRef.current;
    const nextIndex = options.wrap
      ? wrapIndex(index, sectionIds.length)
      : Math.max(0, Math.min(sectionIds.length - 1, index));

    if (nextIndex === currentIndex) {
      return;
    }

    const viewport = viewportRef.current;
    const target = sectionRefs.current[nextIndex];
    if (!viewport || !target) {
      return;
    }

    lastNavigationRef.current = window.performance.now();
    setDirection(options.directionOverride ?? (nextIndex > currentIndex ? "forward" : "backward"));
    setActiveIndex(nextIndex);
    activeIndexRef.current = nextIndex;
    completeTransitionSoon();

    const nextId = sectionIds[nextIndex];
    if (nextId && window.location.hash !== `#${nextId}`) {
      window.history.replaceState(null, "", `#${nextId}`);
    }

    if (scrollFrameRef.current !== null) {
      window.cancelAnimationFrame(scrollFrameRef.current);
      scrollFrameRef.current = null;
    }

    target.scrollIntoView({
      block: "start",
      behavior: mobileTouchModeRef.current ? "auto" : "smooth",
    });
  }

  function handleTouchStart(event: TouchEvent<HTMLElement>) {
    if (mobileTouchModeRef.current) {
      return;
    }

    if (event.touches.length !== 1) {
      return;
    }

    touchStartYRef.current = event.touches[0]?.clientY ?? null;
    touchLastYRef.current = touchStartYRef.current;
  }

  function handleTouchMove(event: TouchEvent<HTMLElement>) {
    if (mobileTouchModeRef.current) {
      return;
    }

    if (touchStartYRef.current === null || event.touches.length !== 1) {
      return;
    }

    touchLastYRef.current = event.touches[0]?.clientY ?? touchLastYRef.current;
  }

  function handleTouchEnd() {
    if (mobileTouchModeRef.current) {
      touchStartYRef.current = null;
      touchLastYRef.current = null;
      return;
    }

    if (touchStartYRef.current === null || touchLastYRef.current === null) {
      touchStartYRef.current = null;
      touchLastYRef.current = null;
      return;
    }

    const delta = touchStartYRef.current - touchLastYRef.current;
    if (Math.abs(delta) >= touchThreshold) {
      navigateTo(activeIndexRef.current + (delta > 0 ? 1 : -1), {
        wrap: true,
        directionOverride: delta > 0 ? "forward" : "backward",
      });
    }

    touchStartYRef.current = null;
    touchLastYRef.current = null;
  }

  return {
    activeIndex,
    fromIndex: activeIndex,
    toIndex: activeIndex,
    direction,
    isTransitioning,
    stepProgress: 1,
    navigateTo,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    setViewportRef,
    registerSection,
  };
}
