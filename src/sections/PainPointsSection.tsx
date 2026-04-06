import { Section } from "../components/Section";

const painPoints = [
  {
    title: "Internal ad design drag",
    body: "No more manually planning, designing, or launching ads without a sharper testing layer.",
    image: "/assets/stressed-out/images/pain-point-01.png",
  },
  {
    title: "High spend for too few variants",
    body: "Get more dynamic variants than most teams can produce internally at the same speed.",
    image: "/assets/stressed-out/images/pain-point-02.png",
  },
  {
    title: "Uncertain performance",
    body: "Launch with more confidence because the weak spots were found before budget scaled.",
    image: "/assets/stressed-out/images/pain-point-03.png",
  },
  {
    title: "Ad brainstorming overhead",
    body: "Use stress-tested creative as leverage so brand positioning gets more of your team’s attention.",
    image: "/assets/stressed-out/images/pain-point-04.png",
  },
];

export function PainPointsSection() {
  return (
    <Section
      id="pain-points"
      eyebrow="Pain points we solve"
      title="A cleaner proof section built from the real problems the service removes."
      description="These one-pagers anchor the educational layer without turning the page into a wall of text."
    >
      <div className="pain-grid">
        {painPoints.map((point) => (
          <article key={point.title} className="pain-card glass-panel">
            <img src={point.image} alt={point.title} loading="lazy" />
            <div>
              <h3>{point.title}</h3>
              <p>{point.body}</p>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
