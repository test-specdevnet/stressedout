import { ArrowRight, Mail } from "lucide-react";
import { GlassButton } from "../components/GlassButton";
import { Section } from "../components/Section";

export function FinalCtaSection() {
  return (
    <Section
      id="contact"
      eyebrow="Connect with our team"
      title="Use Stressed Out to buy back time, sharpen positioning, and launch with more confidence."
      description="Email us directly to discuss a stress test, growth pack, ad booster, or monthly plan."
    >
      <div className="final-cta glass-panel">
        <div className="final-cta__copy">
          <p className="final-cta__tag">Stress-tested ads tailored exactly to your brand.</p>
          <a className="final-cta__email" href="mailto:stressedoutadvertising@gmail.com">
            stressedoutadvertising@gmail.com
          </a>
          <a className="final-cta__email" href="mailto:info@stressedoutadvertising.com">
            info@stressedoutadvertising.com
          </a>
        </div>
        <div className="final-cta__actions">
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
          <GlassButton href="#hero" icon={ArrowRight} variant="secondary">
            Back to top
          </GlassButton>
        </div>
      </div>
      <footer className="site-footer">
        <img
          src="/assets/stressed-out/images/logo.png"
          alt="Stressed Out logo"
          className="site-footer__logo"
        />
        <p>All rights reserved. Stressed Out Advertising 2026.</p>
      </footer>
    </Section>
  );
}
