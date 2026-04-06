import { Section } from "../components/Section";

const steps = [
  {
    title: "Send your content",
    body: "Static images, UGC, ad concepts, or underperforming creatives.",
  },
  {
    title: "We stress test it",
    body: "We identify what weakens conversion and what deserves to be tested next.",
  },
  {
    title: "We return dynamic ads",
    body: "You receive campaign-ready branded variants built for sharper launches.",
  },
];

export function ProcessSection() {
  return (
    <Section
      id="process"
      eyebrow="How it works"
      title="A clear three-step flow built for speed, not drag."
      description="One pass to pressure-test the message, another to turn the best angle into dynamic media."
    >
      <ol className="process-track" aria-label="Three step process">
        {steps.map((step, index) => (
          <li key={step.title} className="process-track__item">
            <span className="process-track__count">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
