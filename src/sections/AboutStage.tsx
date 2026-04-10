import { useEffect, useState } from "react";
import { Gift, Mail, Search, Video } from "lucide-react";

const processSteps = [
  {
    step: "01",
    title: "SEND YOUR CONTENT",
    body: "Static images, UGC, ad concepts, & underperforming creatives.",
    Icon: Mail,
  },
  {
    step: "02",
    title: "WE STRESS TEST IT",
    body: "Outlines what breaks conversion and what to test next.",
    Icon: Search,
  },
  {
    step: "03",
    title: "WE MAKE VIDEOS",
    body: "We create customized dynamic videos tailored to your brand.",
    Icon: Video,
  },
  {
    step: "04",
    title: "YOU GET ADS",
    body: "You get campaign-ready, stress-tested ad variants.",
    Icon: Gift,
  },
];

export function AboutStage() {
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setPrefersReducedMotion(media.matches);
    };

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <div className="stage-layout stage-layout--split about-stage-layout">
      <div className="stage-copy about-copy">
        <h2 className="stage-title about-title">Who We Are</h2>
        <p className="stage-description about-intro">
          We're a Canadian ad startup led by expert marketers with 10+ years of experience across
          design, content, sales, & PR.
        </p>

        <div className="about-editorial-stack">
          <h3 className="about-subtitle">What We Do</h3>
          <ul className="about-bullet-list">
            <li>
              Creative stress-testing means figuring out what works and what doesn't before your ad
              campaign goes live.
            </li>
            <li>
              Designing and testing multiple ad variations demands time and money, making blind
              launches too risky.
            </li>
            <li>
              Whether you have an ad concept, static UGC, or an existing ad, send it to us and
              we'll stress-test it and convert it into engaging, dynamic video ads.
            </li>
          </ul>
        </div>
      </div>

      <div className="stage-stack about-process-stack">
        <div className="about-process-header">
          <h3 className="about-process-title">Our Process</h3>
        </div>

        <div className="about-process-grid">
          {processSteps.map(({ step, title, body, Icon }, index) => (
            <button
              key={step}
              type="button"
              className={`glass-panel about-process-card ${activeCard === index ? "is-flipped" : ""}`.trim()}
              onClick={() => setActiveCard((current) => (current === index ? null : index))}
              aria-pressed={activeCard === index}
              aria-label={`${activeCard === index ? "Hide" : "Show"} step ${index + 1}: ${title}`}
            >
              <span className="about-process-card__inner">
                <span className="about-process-card__face about-process-card__face--front" aria-hidden={activeCard === index}>
                  <span className="about-process-card__front-number">{index + 1}</span>
                </span>

                <span className="about-process-card__face about-process-card__face--back" aria-hidden={activeCard !== index}>
                  <span className="about-process-card__topline">
                    <span className="about-process-card__step">{step}</span>
                    <span className="about-process-card__icon" aria-hidden="true">
                      <Icon size={18} strokeWidth={2} />
                    </span>
                  </span>
                  <span className="about-process-card__content">
                    <span className="about-process-card__title">{title}</span>
                    <span className="about-process-card__body">{body}</span>
                  </span>
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
