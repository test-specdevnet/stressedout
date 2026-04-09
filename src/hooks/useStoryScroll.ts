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
  wheelThreshold,
  wheelResetMs,
  navigationCooldownMs,
  transitionDuration,
  touchThreshold,
}: UseStoryScrollOptions) {
  const [activeIndex, setActiveIndex] = useState(() => getIndexFromHash(window.location.hash, sectionIds));
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<StoryDirection>("forward");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const activeIndexRef = useRef(activeIndex);
  const isTransitioningRef = useRef(isTransitioning);
  const transitionTimerRef = useRef<number | null>(null);
  const wheelAccumulatorRef = useRef(0);
  const wheelResetRef = useRef<number | null>(null);
  const lastNavigationRef = useRef(0);
  const touchStartYRef = useRef<number | null>(null);
  const touchLastYRef = useRef<number | null>(null);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    isTransitioningRef.current = isTransitioning;
  }, [isTransitioning]);

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
      const nextIndex = getIndexFromHash(window.location.hash, sectionIds);
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
  }, [sectionIds]);

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 8) {
        return;
      }

      event.preventDefault();

      if (isTransitioningRef.current) {
        return;
      }

      const now = window.performance.now();
      if (now - lastNavigationRef.current < navigationCooldownMs) {
        return;
      }

      if (wheelResetRef.current) {
        window.clearTimeout(wheelResetRef.current);
      }

      wheelAccumulatorRef.current += event.deltaY;
      wheelResetRef.current = window.setTimeout(() => {
        wheelAccumulatorRef.current = 0;
      }, wheelResetMs);

      if (Math.abs(wheelAccumulatorRef.current) < wheelThreshold) {
        return;
      }

      const delta = wheelAccumulatorRef.current > 0 ? 1 : -1;
      wheelAccumulatorRef.current = 0;
      navigateTo(activeIndexRef.current + delta, {
        wrap: true,
        directionOverride: delta > 0 ? "forward" : "backward",
      });
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [navigationCooldownMs, wheelResetMs, wheelThreshold]);

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
  }, [sectionIds.length]);

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

  function navigateTo(index: number, options: NavigateOptions = {}) {
    const nextIndex = options.wrap
      ? wrapIndex(index, sectionIds.length)
      : Math.max(0, Math.min(sectionIds.length - 1, index));
    const currentIndex = activeIndexRef.current;

    if (nextIndex === currentIndex) {
      return;
    }

    if (transitionTimerRef.current) {
      window.clearTimeout(transitionTimerRef.current);
    }

    lastNavigationRef.current = window.performance.now();
    setPreviousIndex(currentIndex);
    setDirection(options.directionOverride ?? (nextIndex > currentIndex ? "forward" : "backward"));
    setActiveIndex(nextIndex);
    setIsTransitioning(true);

    const nextId = sectionIds[nextIndex];
    if (nextId && window.location.hash !== `#${nextId}`) {
      window.history.replaceState(null, "", `#${nextId}`);
    }

    transitionTimerRef.current = window.setTimeout(() => {
      setPreviousIndex(null);
      setIsTransitioning(false);
    }, transitionDuration);
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
    previousIndex,
    direction,
    isTransitioning,
    navigateTo,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
