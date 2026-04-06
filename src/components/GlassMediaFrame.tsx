import type { PropsWithChildren } from "react";

type GlassMediaFrameProps = PropsWithChildren<{
  className?: string;
  caption?: string;
}>;

export function GlassMediaFrame({
  children,
  className = "",
  caption,
}: GlassMediaFrameProps) {
  return (
    <figure className={`glass-media-frame ${className}`.trim()}>
      <div className="glass-media-frame__inner">{children}</div>
      {caption ? <figcaption className="glass-media-frame__caption">{caption}</figcaption> : null}
    </figure>
  );
}
