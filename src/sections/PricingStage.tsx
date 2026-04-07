import { GlassButton } from "../components/GlassButton";

const pricing = [
  {
    label: "Getting Started",
    title: "Stress Test Report",
    price: "$149",
    href: "https://buy.stripe.com/cNi9AN5Es74P5kqaFjfjG03",
    note: "Analysis-first entry point.",
  },
  {
    label: "Most Popular",
    title: "Growth Pack",
    price: "$349",
    href: "https://buy.stripe.com/aFafZbd6U2OzeV03cRfjG02",
    note: "Live creative buildout.",
    featured: true,
  },
  {
    label: "Add-On",
    title: "Ad Booster",
    price: "+$399",
    href: "https://buy.stripe.com/eVq14h0k8exhaEKfZDfjG01",
    note: "Upgrade existing video assets.",
  },
  {
    label: "Best Value",
    title: "Stress Free Monthly",
    price: "$599/month",
    href: "https://buy.stripe.com/9B68wJ7MAfBlbIO7t7fjG04",
    note: "Recurring creative pipeline.",
  },
];

export function PricingStage() {
  return (
    <div className="stage-layout stage-layout--pricing">
      <div className="stage-copy">
        <p className="stage-kicker">Pricing / final stage</p>
        <h2 className="stage-title">Commercial choices stay live while the pricing composition becomes easier to scan.</h2>
        <p className="stage-description">
          The panel is intentionally concise for now. It demonstrates offer grouping, featured
          emphasis, and a clean CTA lane without trying to finish final marketing copy in the same pass.
        </p>
      </div>

      <div className="pricing-stage-grid">
        {pricing.map((plan) => (
          <article
            key={plan.title}
            className={`pricing-stage-card glass-panel ${plan.featured ? "is-featured" : ""}`.trim()}
          >
            <span className="pricing-stage-card__label">{plan.label}</span>
            <h3>{plan.title}</h3>
            <p className="pricing-stage-card__price">{plan.price}</p>
            <p className="pricing-stage-card__note">{plan.note}</p>
            <GlassButton href={plan.href} target="_blank" rel="noreferrer">
              Open package
            </GlassButton>
          </article>
        ))}
      </div>
    </div>
  );
}
