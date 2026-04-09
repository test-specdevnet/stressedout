import { ArrowRight, Mail, Play } from "lucide-react";
import { GlassButton } from "../components/GlassButton";
import { GlassMediaFrame } from "../components/GlassMediaFrame";

export function HeroStage() {
  return (
    <div className="stage-layout stage-layout--hero">
      <div className="stage-copy">
        <p className="stage-kicker">Wheel-of-fortune storyscroll / opening frame</p>
        <div className="hero-brand">
          <span>Stressed</span>
          <span>Out</span>
        </div>
        <h1 className="stage-title">Creative direction built to rotate the whole experience with intent.</h1>
        <p className="stage-description">
          Placeholder shell for the future hero message. The priority here is the scan path,
          screen framing, and how the media plane balances the headline block.
        </p>
        <div className="hero-actions">
          <GlassButton href="#pricing" icon={ArrowRight}>
            View pricing
          </GlassButton>
          <GlassButton href="mailto:info@stressedoutadvertising.com" icon={Mail} variant="secondary">
            Start a stress test
          </GlassButton>
        </div>
      </div>

      <div className="stage-media-column">
        <GlassMediaFrame
          className="hero-media-frame"
          caption="Dynamic creative preview staged inside a glass media plane."
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
              Motion-led first impression
            </span>
          </div>
        </GlassMediaFrame>

        <div className="hero-facts">
          <article className="glass-panel hero-fact-card">
            <span>Full-screen stages</span>
            <strong>07</strong>
          </article>
          <article className="glass-panel hero-fact-card">
            <span>Navigation model</span>
            <strong>Snap + arc</strong>
          </article>
        </div>
      </div>
    </div>
  );
}
