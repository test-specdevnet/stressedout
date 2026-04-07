import { Section } from "../components/Section";

export function AboutSection() {
  return (
    <Section
      id="about"
      eyebrow="About / shell one"
      title="A contained stage for context, credibility, and pacing."
      description="The composition stays open on purpose so the storyscroll can own the movement while this panel holds the brand tone."
    >
      <div
        className="about-band glass-panel"
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        <p>
          A future mounting point for team, method, and proof. For now, it stays
          reduced to a clean narrative block with enough structure to feel designed.
        </p>
        <p>
          The content is intentionally placeholder-ready, making room for later
          copy without changing the rhythm of the six-stage navigation system.
        </p>
      </div>
    </Section>
  );
}
