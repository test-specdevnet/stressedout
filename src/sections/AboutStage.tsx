import type { CSSProperties } from "react";
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
  return (
    <div className="stage-layout stage-layout--split about-stage-layout">
      <div className="stage-copy about-copy">
        <p className="stage-kicker">About Us / trust frame</p>
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
          <p className="stage-kicker">Our Process</p>
          <h3 className="about-process-title">Our Process</h3>
        </div>

        <div className="about-process-grid">
          {processSteps.map(({ step, title, body, Icon }, index) => (
            <article
              key={step}
              className="glass-panel about-process-card"
              style={{ "--process-delay": `${index * 1.1}s` } as CSSProperties}
            >
              <div className="about-process-card__topline">
                <span className="about-process-card__step">{step}</span>
                <span className="about-process-card__icon" aria-hidden="true">
                  <Icon size={18} strokeWidth={2} />
                </span>
              </div>
              <h4>{title}</h4>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
