import { ArrowRight, Mail } from "lucide-react";
import { GlassButton } from "../components/GlassButton";

export function ContactStage() {
  return (
    <div className="stage-layout stage-layout--contact">
      <div className="stage-copy">
        <p className="stage-kicker">Contact / conversion stage</p>
        <h2 className="stage-title">A restrained contact panel with real endpoints and room for stronger copy later.</h2>
        <p className="stage-description">
          The content stays intentionally light, so the structure carries the stage: contact
          options, a clear CTA lane, and a quieter support rail for future sales messaging.
        </p>
      </div>

      <div className="contact-grid">
        <article className="glass-panel contact-card">
          <span className="contact-card__label">Primary email</span>
          <a href="mailto:info@stressedoutadvertising.com">info@stressedoutadvertising.com</a>
        </article>
        <article className="glass-panel contact-card">
          <span className="contact-card__label">Studio inbox</span>
          <a href="mailto:stressedoutadvertising@gmail.com">stressedoutadvertising@gmail.com</a>
        </article>
        <article className="glass-panel contact-actions">
          <GlassButton href="mailto:info@stressedoutadvertising.com" icon={Mail}>
            Email the team
          </GlassButton>
          <GlassButton
            href="https://www.instagram.com/stressedoutadvertising?igsh=MzJxdXcybGRobTdt"
            target="_blank"
            rel="noreferrer"
            variant="secondary"
          >
            Instagram
          </GlassButton>
          <GlassButton href="#pricing" icon={ArrowRight} variant="secondary">
            Continue to pricing
          </GlassButton>
        </article>
      </div>
    </div>
  );
}
