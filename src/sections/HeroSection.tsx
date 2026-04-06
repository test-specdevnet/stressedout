import { ArrowRight, Mail, Play } from "lucide-react";
import { GlassButton } from "../components/GlassButton";
import { GlassMediaFrame } from "../components/GlassMediaFrame";

export function HeroSection() {
  return (
    <section id="hero" className="hero-section story-section">
      <div className="hero-layout">
        <div className="hero-copy reveal-sequence">
          <p className="hero-kicker reveal-item">Canadian creative stress-testing ad engine</p>
          <div className="hero-brand reveal-item">
            <span>Stressed</span>
            <span>Out</span>
          </div>
          <h1 className="hero-title reveal-item">
            Stress-test the idea before you pay to scale it.
          </h1>
          <p className="hero-description reveal-item">
            Stressed Out turns concepts, static UGC, and underperforming ads into
            dynamic video creatives built to convert faster and cost less than doing
            the same volume in-house.
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
            caption="Stress-tested variants presented inside a resin-finished visual plane."
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
                Dynamic creative preview
              </span>
            </div>
          </GlassMediaFrame>
        </div>
      </div>
    </section>
  );
}
