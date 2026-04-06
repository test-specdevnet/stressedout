import { Section } from "../components/Section";

export function ProblemSection() {
  return (
    <Section
      id="problem"
      eyebrow="Why blind launches fail"
      title="Testing multiple ad directions manually is expensive, slow, and risky."
      description="Creative stress-testing shows what works and what breaks conversion before your campaign goes live."
    >
      <div className="split-essay">
        <p>
          Designing and testing many ad variations eats time, budget, and internal
          focus. Blind launches leave too much performance to luck.
        </p>
        <p>
          Stressed Out is built for teams that need sharper answers before spend
          climbs, not after creative fatigue has already cost the campaign.
        </p>
      </div>
    </Section>
  );
}
