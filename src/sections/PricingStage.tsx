import { GlassButton } from "../components/GlassButton";

type PricingCard = {
  badge: string;
  title: string;
  price: string;
  description: string;
  bullets: string[];
  ctaText: string;
  href: string;
  note: string;
  featured?: boolean;
};

const pricingCards: PricingCard[] = [
  {
    badge: "Getting Started",
    title: "Stress Test Report",
    price: "$149",
    description: "We stress test your static and dynamic ads.",
    bullets: [
      "You send us the ads you want analyzed (up to 3 creatives)",
      "We stress-test your ads with extensive behavioral analysis",
      "You receive a written stress test report for each ad",
      "No variants delivered",
    ],
    ctaText: "Get the Stress Test",
    href: "https://buy.stripe.com/cNi9AN5Es74P5kqaFjfjG03",
    note: "Each report outlines what to fix or test next.",
  },
  {
    badge: "Most Popular",
    title: "Growth Pack",
    price: "$349",
    description: "We convert ad ideas into dynamic videos.",
    bullets: [
      "You send us ad concepts, static images, or UGC (up to 3 creatives)",
      "We stress test your content and create dynamic video ads",
      "You receive 2 branded variants per creative for a total of 6 ad variants",
      "1 minor revision or variant",
    ],
    ctaText: "Choose Growth Pack",
    href: "https://buy.stripe.com/aFafZbd6U2OzeV03cRfjG02",
    note: "Cheaper than designing and implementing internally.",
    featured: true,
  },
  {
    badge: "Add-On",
    title: "Ad Booster",
    price: "+$399",
    description: "Boost up to 3 existing video ads.",
    bullets: [
      "You send us 3 video ads",
      "We stress test your video ads and iterate on them with adjusted hooks, pacing, structural fixes, captions, and CTAs for higher conversions",
      "You receive 2 boosted variants per creative for a total of 6 ad variants",
      "1 revision round and existing assets only",
    ],
    ctaText: "Add Ad Booster",
    href: "https://buy.stripe.com/eVq14h0k8exhaEKfZDfjG01",
    note: "Select this add-on only if you already have video ads.",
  },
  {
    badge: "Best Value",
    title: "Stress Free Monthly",
    price: "$599/month",
    description: "Subscription tier.",
    bullets: [
      "You send us ad concepts, static images, or UGC (up to 3 creatives)",
      "We stress test your content and create dynamic video ads",
      "You receive 5 branded variants per creative for a total of 15 ad variants per month",
      "1 minor revision or variant",
    ],
    ctaText: "Start Monthly",
    href: "https://buy.stripe.com/9B68wJ7MAfBlbIO7t7fjG04",
    note: "Consistent testing results across ad variants.",
    featured: true,
  },
];

export function PricingStage() {
  return (
    <div className="stage-layout stage-layout--pricing pricing-stage">
      <div className="pricing-stage__header">
        <h2 className="pricing-stage__heading">Pricing and Offerings</h2>
      </div>

      <div className="pricing-stage-grid">
        {pricingCards.map((card) => (
          <article
            key={card.title}
            className={`pricing-stage-card glass-panel ${card.featured ? "is-featured" : ""}`.trim()}
          >
            <span className="pricing-stage-card__badge">{card.badge}</span>
            <h3 className="pricing-stage-card__title">{card.title}</h3>
            <p className="pricing-stage-card__price">{card.price}</p>
            <p className="pricing-stage-card__description">{card.description}</p>

            <ul className="pricing-stage-card__bullets" aria-label={`${card.title} included features`}>
              {card.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>

            <GlassButton
              className="pricing-stage-card__cta"
              href={card.href}
              target="_blank"
              rel="noreferrer"
              variant="secondary"
            >
              {card.ctaText}
            </GlassButton>

            <p className="pricing-stage-card__note">{card.note}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
