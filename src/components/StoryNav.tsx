import { useEffect, useState } from "react";

type StorySection = {
  id: string;
  label: string;
  shortLabel: string;
};

type StoryNavProps = {
  sections: StorySection[];
};

export function StoryNav({ sections }: StoryNavProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => Boolean(element));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        threshold: [0.3, 0.5, 0.75],
        rootMargin: "-15% 0px -20% 0px",
      },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [sections]);

  const activeIndex = Math.max(
    sections.findIndex((section) => section.id === activeId),
    0,
  );
  const progress = sections.length > 1 ? activeIndex / (sections.length - 1) : 0;

  const handleNavigate = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <nav className="story-nav story-nav--desktop glass-nav" aria-label="Story navigation">
        <div className="story-nav__wheel">
          <svg viewBox="0 0 120 120" className="story-nav__svg" aria-hidden="true">
            <circle className="story-nav__ring story-nav__ring--base" cx="60" cy="60" r="48" />
            <circle
              className="story-nav__ring story-nav__ring--progress"
              cx="60"
              cy="60"
              r="48"
              style={{
                strokeDasharray: `${2 * Math.PI * 48}`,
                strokeDashoffset: `${2 * Math.PI * 48 * (1 - progress)}`,
              }}
            />
          </svg>
          <div className="story-nav__core">
            <span className="story-nav__active-index">{String(activeIndex + 1).padStart(2, "0")}</span>
            <span className="story-nav__active-label">
              {sections.find((section) => section.id === activeId)?.label ?? sections[0]?.label}
            </span>
          </div>

          <div className="story-nav__stops" aria-hidden="true">
            {sections.map((section, index) => {
              const angle = (index / sections.length) * Math.PI * 2 - Math.PI / 2;
              const x = 60 + Math.cos(angle) * 48;
              const y = 60 + Math.sin(angle) * 48;
              const isActive = section.id === activeId;

              return (
                <span
                  key={section.id}
                  className={`story-nav__stop ${isActive ? "is-active" : ""}`}
                  style={{ left: `${x}px`, top: `${y}px` }}
                />
              );
            })}
          </div>
        </div>

        <div className="story-nav__list">
          {sections.map((section, index) => {
            const isActive = section.id === activeId;

            return (
              <button
                key={section.id}
                type="button"
                className={`story-nav__item ${isActive ? "is-active" : ""}`}
                onClick={() => handleNavigate(section.id)}
                aria-current={isActive ? "true" : undefined}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span>{section.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <nav className="story-nav story-nav--mobile glass-nav" aria-label="Story navigation compact">
        {sections.map((section) => {
          const isActive = section.id === activeId;

          return (
            <button
              key={section.id}
              type="button"
              className={`story-nav__mobile-item ${isActive ? "is-active" : ""}`}
              onClick={() => handleNavigate(section.id)}
              aria-current={isActive ? "true" : undefined}
            >
              {section.shortLabel}
            </button>
          );
        })}
      </nav>
    </>
  );
}
