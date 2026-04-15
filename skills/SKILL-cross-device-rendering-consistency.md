# SKILL: Cross-Device Rendering Consistency (Stressed Out Project)

Goal: Zero layout shifts or random whitespace on any monitor, laptop, or browser.

Rules:
- Always use `100dvh` instead of `100vh` for full-screen snap sections.
- The primary page scroller must own section height and snapping. Do not fake full-screen panels with layered absolute positioning.
- CSS reset must include: `* { box-sizing: border-box; margin: 0; padding: 0; }` + modern normalize.
- Typography: Use `font-size` in rem, line-height in unitless values, and `font-feature-settings: "kern"`.
- Apply `text-rendering: optimizeLegibility`, `-webkit-text-size-adjust: 100%`, and `text-size-adjust: 100%` at the root.
- Never use fixed px heights for sections. Prefer `aspect-ratio` + container queries when needed.
- Every snap section must set `scroll-snap-align: start`, `scroll-snap-stop: always`, and `scroll-margin-top: 0`.
- `html`, `body`, `#root`, and the app shell should all resolve cleanly to `100dvh` with no default margins or padding.
- Test on: 1080p, 1440p, 4K monitors, MacBook Retina, Windows scaling 125%/150%, Safari + Chrome.
- Whitespace bug = almost always caused by viewport units + address bar or scrollbars. Fix with `dvh` + `scroll-padding`.

Never ship a section that is not exactly 100dvh on every device.
