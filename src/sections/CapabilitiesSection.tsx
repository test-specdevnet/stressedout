import { Section } from "../components/Section";

const capabilities = [
  "Creative stress-testing",
  "Dynamic video ad production",
  "Branded variant systems",
  "Paid social creative support",
  "Email, funnel, and landing page direction",
  "Conversion-focused messaging refinement",
];

export function CapabilitiesSection() {
  return (
    <Section
      id="capabilities"
      eyebrow="Capabilities"
      title="Built for fast commerce, creative iteration, and clearer positioning."
      description="Use Stressed Out when you need premium creative pressure-testing without inflating internal workload."
    >
      <div className="capability-cloud">
        {capabilities.map((capability) => (
          <div key={capability} className="capability-pill glass-panel">
            {capability}
          </div>
        ))}
      </div>
    </Section>
  );
}
