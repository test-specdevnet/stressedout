import { Mail } from "lucide-react";
import { GlassButton } from "./components/GlassButton";
import { StoryNav } from "./components/StoryNav";
import { AboutSection } from "./sections/AboutSection";
import { CapabilitiesSection } from "./sections/CapabilitiesSection";
import { FinalCtaSection } from "./sections/FinalCtaSection";
import { HeroSection } from "./sections/HeroSection";
import { OfferSection } from "./sections/OfferSection";
import { PainPointsSection } from "./sections/PainPointsSection";
import { PricingSection } from "./sections/PricingSection";
import { ProblemSection } from "./sections/ProblemSection";
import { ProcessSection } from "./sections/ProcessSection";
import { WorkSection } from "./sections/WorkSection";

const sections = [
  { id: "hero", label: "Hero", shortLabel: "Start" },
  { id: "problem", label: "Problem", shortLabel: "Risk" },
  { id: "offer", label: "Offer", shortLabel: "Offer" },
  { id: "process", label: "Process", shortLabel: "Flow" },
  { id: "capabilities", label: "Capabilities", shortLabel: "Tools" },
  { id: "work", label: "Work", shortLabel: "Work" },
  { id: "pain-points", label: "Pain Points", shortLabel: "Proof" },
  { id: "about", label: "About", shortLabel: "Trust" },
  { id: "pricing", label: "Pricing", shortLabel: "Plans" },
  { id: "contact", label: "Contact", shortLabel: "Close" },
];

export default function App() {
  return (
    <div className="site-shell">
      <div className="site-backdrop" aria-hidden="true">
        <div className="aurora aurora-one" />
        <div className="aurora aurora-two" />
        <div className="aurora aurora-three" />
        <div className="grid-haze" />
      </div>

      <header className="site-header">
        <a className="brand-mark glass-nav" href="#hero" aria-label="Stressed Out home">
          <span className="brand-mark__eyebrow">Stressed Out</span>
          <span className="brand-mark__name">Advertising</span>
        </a>

        <nav className="header-links glass-nav" aria-label="Primary">
          <a href="#offer">What We Do</a>
          <a href="#work">Gallery</a>
          <a href="#pricing">Pricing</a>
          <a href="#contact">Contact</a>
        </nav>

        <GlassButton href="mailto:info@stressedoutadvertising.com" icon={Mail}>
          Email us
        </GlassButton>
      </header>

      <StoryNav sections={sections} />

      <main className="story-shell">
        <HeroSection />
        <ProblemSection />
        <OfferSection />
        <ProcessSection />
        <CapabilitiesSection />
        <WorkSection />
        <PainPointsSection />
        <AboutSection />
        <PricingSection />
        <FinalCtaSection />
      </main>
    </div>
  );
}
