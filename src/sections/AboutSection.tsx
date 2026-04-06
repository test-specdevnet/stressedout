import { Section } from "../components/Section";

export function AboutSection() {
  return (
    <Section
      id="about"
      eyebrow="About / why trust the team"
      title="A Canadian startup led by marketers with 10+ years across design, content, sales, and PR."
      description="Stressed Out reduces internal ad spend and returns time to the part of the business that matters most: positioning the brand with clarity."
    >
      <div className="about-band glass-panel">
        <p>
          We brainstorm and design ads, deliver high-quality creatives faster than
          most in-house teams can at the same volume, and use stress-testing to keep
          campaigns from launching blind.
        </p>
      </div>
    </Section>
  );
}
