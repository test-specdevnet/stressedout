import type { PropsWithChildren, ReactNode } from "react";

type SectionProps = PropsWithChildren<{
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  aside?: ReactNode;
}>;

export function Section({
  id,
  eyebrow,
  title,
  description,
  align = "left",
  className = "",
  aside,
  children,
}: SectionProps) {
  return (
    <section id={id} className={`story-section ${className}`.trim()}>
      <div className={`section-frame section-frame--${align}`}>
        <div className="section-copy">
          {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
          <h2 className="section-title">{title}</h2>
          {description ? <p className="section-description">{description}</p> : null}
        </div>
        {aside ? <div className="section-aside">{aside}</div> : null}
      </div>
      <div className="section-body">{children}</div>
    </section>
  );
}
