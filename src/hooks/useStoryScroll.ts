import type { TouchEvent } from "react";
import { useEffect, useRef, useState } from "react";

export type StoryDirection = "forward" | "backward";

type NavigateOptions = {
  wrap?: boolean;
  directionOverride?: StoryDirection;
};

type UseStoryScrollOptions = {
  sectionIds: string[];
  navigationCooldownMs: number;
  touchThreshold: number;
  wheelThreshold: number;
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
  wheelThreshold,
}: UseStoryScrollOptions) {
  const [activeIndex, setActiveIndex] = useState(() => getIndexFromHash(window.location.hash, sectionIds));
  const [direction, setDirection] = useState<StoryDirection>("forward");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const containerRef = useRef<HTMLElement | null>(null);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const activeIndexRef = useRef(activeIndex);
  const isTransitioningRef = useRef(isTransitioning);
  const cooldownTimerRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchLastYRef = useRef<number | null>(null);
  const wheelDeltaRef = useRef(0);
  const wheelFrameRef = useRef<number | null>(null);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    isTransitioningRef.current = isTransitioning;
  }, [isTransitioning]);

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current !== null) {
        window.clearTimeout(cooldownTimerRef.current);
      }
      if (wheelFrameRef.current !== null) {
        window.cancelAnimationFrame(wheelFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const root = containerRef.current;
    const sections = sectionRefs.current.filter(Boolean) as HTMLElement[];
    if (!root || sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        let bestEntry: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (!bestEntry || entry.intersectionRatio > bestEntry.intersectionRatio) {
            bestEntry = entry;
          }
        }

        if (!bestEntry || bestEntry.intersectionRatio < 0.68) {
          return;
        }

        const nextIndex = Number((bestEntry.target as HTMLElement).dataset.panelIndex ?? "-1");
        if (Number.isNaN(nextIndex) || nextIndex < 0) {
          return;
        }

        setActiveIndex((currentIndex) => (currentIndex === nextIndex ? currentIndex : nextIndex));
      },
      {
        root,
        threshold: [0.4, 0.68, 0.9],
      },
    );

    for (const section of sections) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, [sectionIds]);

  useEffect(() => {
    const initialIndex = getIndexFromHash(window.location.hash, sectionIds);
    const targetSection = sectionRefs.current[initialIndex];
    const root = containerRef.current;

    if (targetSection && root) {
      root.scrollTo({
        top: targetSection.offsetTop,
        behavior: "auto",
      });
    }
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

      if (event.key === "ArrowDown" || event.key === "PageDown") {
        event.preventDefault();
        navigateTo(activeIndexRef.current + 1, { wrap: true, directionOverride: "forward" });
      } else if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        navigateTo(activeIndexRef.current - 1, { wrap: true, directionOverride: "backward" });
      } else if (event.key === "Home") {
        event.preventDefault();
        navigateTo(0);
      } else if (event.key === "End") {
        event.preventDefault();
        navigateTo(sectionIds.length - 1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sectionIds.length]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) {
      return;
    }

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 2) {
        return;
      }

      event.preventDefault();
      wheelDeltaRef.current += event.deltaY;

      if (wheelFrameRef.current !== null) {
        return;
      }

      wheelFrameRef.current = window.requestAnimationFrame(() => {
        const accumulatedDelta = wheelDeltaRef.current;
        wheelDeltaRef.current = 0;
        wheelFrameRef.current = null;

        if (Math.abs(accumulatedDelta) < wheelThreshold) {
          return;
        }

        navigateTo(activeIndexRef.current + (accumulatedDelta > 0 ? 1 : -1), {
          wrap: true,
          directionOverride: accumulatedDelta > 0 ? "forward" : "backward",
        });
      });
    };

    root.addEventListener("wheel", onWheel, { passive: false });
    return () => root.removeEventListener("wheel", onWheel);
  }, [wheelThreshold]);

  function setContainerRef(node: HTMLElement | null) {
    containerRef.current = node;
  }

  function registerSection(index: number) {
    return (node: HTMLElement | null) => {
      sectionRefs.current[index] = node;
    };
  }

  function unlockNavigationAfterDelay() {
    if (cooldownTimerRef.current !== null) {
      window.clearTimeout(cooldownTimerRef.current);
    }

    cooldownTimerRef.current = window.setTimeout(() => {
      setIsTransitioning(false);
    }, navigationCooldownMs);
  }

  function navigateTo(index: number, options: NavigateOptions = {}) {
    const currentIndex = activeIndexRef.current;
    const nextIndex = options.wrap
      ? wrapIndex(index, sectionIds.length)
      : Math.max(0, Math.min(sectionIds.length - 1, index));

    if (nextIndex === currentIndex || isTransitioningRef.current) {
      return;
    }

    const root = containerRef.current;
    const nextSection = sectionRefs.current[nextIndex];
    if (!root || !nextSection) {
      return;
    }

    setDirection(options.directionOverride ?? (nextIndex > currentIndex ? "forward" : "backward"));
    setIsTransitioning(true);
    setActiveIndex(nextIndex);
    activeIndexRef.current = nextIndex;

    root.scrollTo({
      top: nextSection.offsetTop,
      behavior: "smooth",
    });

    const nextId = sectionIds[nextIndex];
    if (nextId && window.location.hash !== `#${nextId}`) {
      window.history.replaceState(null, "", `#${nextId}`);
    }

    unlockNavigationAfterDelay();
  }

  function handleTouchStart(event: TouchEvent<HTMLElement>) {
    if (event.touches.length !== 1) {
      return;
    }

    touchStartYRef.current = event.touches[0]?.clientY ?? null;
    touchLastYRef.current = touchStartYRef.current;
  }

  function handleTouchMove(event: TouchEvent<HTMLElement>) {
    if (touchStartYRef.current === null || event.touches.length !== 1) {
      return;
    }

    touchLastYRef.current = event.touches[0]?.clientY ?? touchLastYRef.current;
  }

  function handleTouchEnd() {
    if (
      touchStartYRef.current === null ||
      touchLastYRef.current === null ||
      isTransitioningRef.current
    ) {
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
    direction,
    isTransitioning,
    navigateTo,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    setContainerRef,
    registerSection,
  };
}
