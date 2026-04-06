import { GlassButton } from "../components/GlassButton";
import { Section } from "../components/Section";

const pricing = [
  {
    label: "Getting Started",
    title: "Stress Test Report",
    price: "$149",
    description: "We stress test your static and dynamic ads.",
    items: [
      "You send us the ads you want analyzed (up to 3 creatives)",
      "We stress-test your ads with extensive behavioral analysis",
      "You receive a written stress test report for each ad",
      "No variants delivered",
    ],
    cta: "Get the Stress Test",
    href: "https://buy.stripe.com/cNi9AN5Es74P5kqaFjfjG03",
    note: "Each report outlines what to fix or test next.",
  },
  {
    label: "Most Popular",
    title: "Growth Pack",
    price: "$349",
    description: "We convert ad ideas into dynamic videos.",
    items: [
      "You send us ad concepts, static images, or UGC (up to 3 creatives)",
      "We stress test your content and create dynamic video ads",
      "You receive 2 branded variants per creative for a total of 6 ad variants",
      "1 minor revision or variant",
    ],
    cta: "Choose Growth Pack",
    href: "https://buy.stripe.com/aFafZbd6U2OzeV03cRfjG02",
    note: "Cheaper than designing and implementing internally.",
    featured: true,
  },
  {
    label: "Add-On",
    title: "Ad Booster",
    price: "+$399",
    description: "Boost up to 3 existing video ads.",
    items: [
      "You send us 3 video ads",
      "We stress test your video ads and iterate on them with adjusted hooks, pacing, structural fixes, captions, and CTAs for higher conversions",
      "You receive 2 boosted variants per creative for a total of 6 ad variants",
      "1 revision round and existing assets only",
    ],
    cta: "Add Ad Booster",
    href: "https://buy.stripe.com/eVq14h0k8exhaEKfZDfjG01",
    note: "Select this add-on only if you already have video ads.",
  },
  {
    label: "Best Value",
    title: "Stress Free Monthly",
    price: "$599/month",
    description: "Subscription tier.",
    items: [
      "You send us ad concepts, static images, or UGC (up to 3 creatives)",
      "We stress test your content and create dynamic video ads",
      "You receive 5 branded variants per creative for a total of 15 ad variants per month",
      "1 minor revision or variant",
    ],
    cta: "Start Monthly",
    href: "https://buy.stripe.com/9B68wJ7MAfBlbIO7t7fjG04",
    note: "Consistent testing results across ad variants.",
  },
];

export function PricingSection() {
  return (
    <Section
      id="pricing"
      eyebrow="Offerings & Pricing"
      title="Packages from the live site"
      description="The commercial structure stays intact. The presentation gets cleaner, sharper, and easier to scan."
    >
      <div className="pricing-grid">
        {pricing.map((plan) => (
          <article
            key={plan.title}
            className={`pricing-card glass-panel ${plan.featured ? "is-featured" : ""}`.trim()}
          >
            <p className="pricing-card__label">{plan.label}</p>
            <h3>{plan.title}</h3>
            <p className="pricing-card__price">{plan.price}</p>
            <p className="pricing-card__description">{plan.description}</p>
            <ul>
              {plan.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <GlassButton href={plan.href} target="_blank" rel="noreferrer">
              {plan.cta}
            </GlassButton>
            <p className="pricing-card__note">{plan.note}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
