# SKILL: Butter-Smooth Scroll Snap (Stressed Out Project)

Mandatory CSS on html/body or main scroller:

```css
html {
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
  overscroll-behavior: contain;
}

section {
  scroll-snap-align: start;
  scroll-snap-stop: always;
  height: 100dvh;
}
```

JS requirements:

Use a real vertical scroller with native CSS snap as the base behavior.
Use requestAnimationFrame + lightweight wheel/keydown handler for arrow-key navigation.
Add IntersectionObserver to detect active section and drive progress UI.
Throttle wheel input and add a short navigation cooldown so wheel/trackpad bursts only advance one panel at a time.
Never let default browser snap fight custom logic - one source of truth.

"Sticky" feeling is usually caused by missing scroll-snap-stop, conflicting margins, or heavy DOM during scroll. Eliminate all of it.
