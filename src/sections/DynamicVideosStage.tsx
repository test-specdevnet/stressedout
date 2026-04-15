import { ArrowRight } from "lucide-react";
import { SmartVideo } from "../components/SmartVideo";

type TransformationRow = {
  label: "Coffee" | "Wine";
  staticLabel: string;
  staticImage: string;
  staticAlt: string;
  variants: {
    label: "Variant 1" | "Variant 2";
    displayLabel: string;
    video: string;
    poster: string;
  }[];
};

const transformationRows: TransformationRow[] = [
  {
    label: "Coffee",
    staticLabel: "Coffee Static Image",
    staticImage: "/assets/stressed-out/gallery/images/coffee-static.png",
    staticAlt: "Static coffee source creative",
    variants: [
      {
        label: "Variant 1",
        displayLabel: "Coffee Ad Variant 1",
        video: "/assets/stressed-out/gallery/videos/coffee-variant-a.mp4",
        poster: "/assets/stressed-out/gallery/images/coffee-static.png",
      },
      {
        label: "Variant 2",
        displayLabel: "Coffee Ad Variant 2",
        video: "/assets/stressed-out/gallery/videos/coffee-variant-b.mp4",
        poster: "/assets/stressed-out/gallery/images/coffee-static.png",
      },
    ],
  },
  {
    label: "Wine",
    staticLabel: "Wine Static Image",
    staticImage: "/assets/stressed-out/gallery/images/wine-static.png",
    staticAlt: "Static wine source creative",
    variants: [
      {
        label: "Variant 1",
        displayLabel: "Wine Ad Variant 1",
        video: "/assets/stressed-out/gallery/videos/wine-variant-a.mp4",
        poster: "/assets/stressed-out/gallery/images/wine-static.png",
      },
      {
        label: "Variant 2",
        displayLabel: "Wine Ad Variant 2",
        video: "/assets/stressed-out/gallery/videos/wine-variant-b.mp4",
        poster: "/assets/stressed-out/gallery/images/wine-static.png",
      },
    ],
  },
];

type DynamicVideosStageProps = {
  isActive?: boolean;
};

export function DynamicVideosStage(props?: DynamicVideosStageProps) {
  const isActive = props?.isActive ?? false;

  return (
    <div className="stage-layout stage-layout--workflow dynamic-stage-layout">
      <div className="dynamic-stage-copy">
        <h2 className="stage-title dynamic-stage-title">Turn Static Images into Dynamic Videos</h2>
      </div>

      <div className="dynamic-media-stack">
        {transformationRows.map((row) => (
          <section
            key={row.label}
            className={`dynamic-media-row ${row.label === "Wine" ? "dynamic-media-row--wine" : ""}`.trim()}
            aria-label={`${row.label} media row`}
          >
            <div className="dynamic-media-grid">
              <figure className="glass-panel dynamic-media-panel dynamic-media-panel--static">
                <figcaption className="dynamic-media-label">{row.staticLabel}</figcaption>
                <img
                  src={row.staticImage}
                  alt={row.staticAlt}
                  loading="lazy"
                  decoding="async"
                  className="dynamic-static-image"
                />
              </figure>

              <div className="dynamic-media-arrows" aria-hidden="true">
                <span className="dynamic-media-arrow glass-nav">
                  <ArrowRight size={18} strokeWidth={2.4} />
                </span>
              </div>

              {row.variants.map((variant) => (
                <figure key={variant.video} className="glass-panel dynamic-media-panel">
                  <figcaption className="dynamic-media-label">{variant.displayLabel}</figcaption>
                  <SmartVideo
                    className={`dynamic-variant-video ${row.label === "Coffee" ? "dynamic-variant-video--coffee" : ""}`.trim()}
                    active={isActive}
                    mp4Src={variant.video}
                    poster={variant.poster}
                    ariaLabel={variant.displayLabel}
                  />
                </figure>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
