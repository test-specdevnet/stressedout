import { Section } from "../components/Section";

const offerPoints = [
  "Send an ad concept, static UGC, or an existing ad.",
  "We stress-test the angle before launch.",
  "We turn what survives into dynamic video ads built for performance.",
];

export function OfferSection() {
  return (
    <Section
      id="offer"
      eyebrow="What Stressed Out does"
      title="We stress-test ideas, sharpen the hook, and deliver high-converting dynamic ads."
      description="The output is faster, leaner, and more cost-effective than asking your team to build the same creative volume in-house."
    >
      <div className="offer-flow">
        {offerPoints.map((point, index) => (
          <div key={point} className="offer-flow__item glass-panel">
            <span className="offer-flow__index">{String(index + 1).padStart(2, "0")}</span>
            <p>{point}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
