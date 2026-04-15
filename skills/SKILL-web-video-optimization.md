# SKILL: Zero-Lag Video on Scroll-Snap Sites (Stressed Out Project)

Every `<video>` MUST have:
- `muted playsinline loop`
- `preload="metadata"` (never "auto" on landing pages)
- Two sources: WebM (first) + MP4 fallback
- `poster` image
- JS play/pause via IntersectionObserver (only play when >=70% in viewport)
- `controls={false}` unless the UX explicitly requires controls
- `object-fit: cover` inside an aspect-ratio-safe media frame so video loading never shifts layout

Background videos -> strong preference for Lottie or optimized WebP sequences if <8 seconds.
Compress videos aggressively (HandBrake or FFmpeg with CRF 23-28, H.264/H.265).
Never let a video be >5 MB unless it's critical hero content.
If tooling is unavailable, wire the component for WebM + MP4 immediately and treat asset conversion as a required follow-up before launch.

This eliminates lag and high CPU on scroll-snap pages.
