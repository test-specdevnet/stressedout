import { ArrowRight, Mail, Play } from "lucide-react";
import { GlassButton } from "../components/GlassButton";
import { GlassMediaFrame } from "../components/GlassMediaFrame";

export function HeroSection() {
  return (
    <section id="hero" className="hero-section story-section">
      <div className="hero-layout">
        <div className="hero-copy reveal-sequence">
          <p className="hero-kicker reveal-item">Six-stage storyscroll opener</p>
          <div className="hero-brand reveal-item">
            <span>Stressed</span>
            <span>Out</span>
          </div>
          <h1 className="hero-title reveal-item">
            A cinematic shell for the wheel-of-fortune navigation system.
          </h1>
          <p className="hero-description reveal-item">
            This opening panel stays intentionally lightweight: a strong headline
            zone, a visual anchor, and clear routes into the pricing and contact
            stages.
          </p>
          <div className="hero-actions reveal-item">
            <GlassButton href="#pricing" icon={ArrowRight}>
              View pricing
            </GlassButton>
            <GlassButton href="mailto:info@stressedoutadvertising.com" icon={Mail} variant="secondary">
              Start a stress test
            </GlassButton>
          </div>
        </div>

        <div className="hero-media reveal-item">
          <GlassMediaFrame
            className="hero-media-frame"
            caption="Placeholder-ready motion vessel for the first panel."
          >
            <video
              className="hero-video"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster="/assets/stressed-out/images/logo.png"
            >
              <source
                src="/assets/stressed-out/videos/grok_video_2026-01-28-18-56-36.mp4"
                type="video/mp4"
              />
            </video>
            <div className="hero-media-overlay" aria-hidden="true">
              <span className="hero-media-badge">
                <Play size={14} strokeWidth={2} />
                Opening sequence
              </span>
            </div>
          </GlassMediaFrame>
        </div>
      </div>
    </section>
  );
}
