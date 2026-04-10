import { ArrowRight } from "lucide-react";
import { GlassMediaFrame } from "../components/GlassMediaFrame";

const transformationRows = [
  {
    label: "Coffee",
    staticImage: "/assets/stressed-out/gallery/images/coffee-static.png",
    staticAlt: "Static coffee source creative",
    variants: [
      {
        label: "Variant 1",
        video: "/assets/stressed-out/gallery/videos/coffee-variant-a.mp4",
      },
      {
        label: "Variant 2",
        video: "/assets/stressed-out/gallery/videos/coffee-variant-b.mp4",
      },
    ],
  },
  {
    label: "Wine",
    staticImage: "/assets/stressed-out/gallery/images/wine-static.png",
    staticAlt: "Static wine source creative",
    variants: [
      {
        label: "Variant 1",
        video: "/assets/stressed-out/gallery/videos/wine-variant-a.mp4",
      },
      {
        label: "Variant 2",
        video: "/assets/stressed-out/gallery/videos/wine-variant-b.mp4",
      },
    ],
  },
];

export function DynamicVideosStage() {
  return (
    <div className="stage-layout stage-layout--workflow">
      <div className="stage-copy dynamic-stage-copy">
        <h2 className="stage-title dynamic-stage-title">Turn Static Images into Dynamic Videos</h2>
      </div>

      <div className="dynamic-variant-stack">
        {transformationRows.map((row) => (
          <section key={row.label} className="glass-panel dynamic-variant-row" aria-label={`${row.label} transformation`}>
            <div className="dynamic-variant-row__label">
              <span>{row.label}</span>
            </div>

            <GlassMediaFrame className="dynamic-media-frame" caption="Static image">
              <img
                className="dynamic-static-image"
                src={row.staticImage}
                alt={row.staticAlt}
                loading="lazy"
              />
            </GlassMediaFrame>

            <div className="dynamic-transition" aria-hidden="true">
              <ArrowRight size={20} strokeWidth={2.1} />
            </div>

            {row.variants.map((variant) => (
              <GlassMediaFrame key={variant.video} className="dynamic-media-frame" caption={variant.label}>
                <video
                  className="dynamic-variant-video"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                >
                  <source src={variant.video} type="video/mp4" />
                </video>
              </GlassMediaFrame>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
