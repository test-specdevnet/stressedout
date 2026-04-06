import { GlassMediaFrame } from "../components/GlassMediaFrame";
import { Section } from "../components/Section";

const videos = [
  "/assets/stressed-out/videos/grok_video_2026-01-28-18-39-51.mp4",
  "/assets/stressed-out/videos/grok_video_2026-01-28-18-40-03.mp4",
  "/assets/stressed-out/videos/grok_video_2026-01-28-18-41-11.mp4",
];

export function WorkSection() {
  return (
    <Section
      id="work"
      eyebrow="Work / creative gallery"
      title="Real motion-led proof belongs in the page, not hidden behind claims."
      description="The media plane does the heavy lifting here: dynamic variants, atmosphere, and brand movement framed in clear resin."
    >
      <div className="media-grid">
        {videos.map((video, index) => (
          <GlassMediaFrame
            key={video}
            caption={`Variant ${index + 1}`}
            className={index === 0 ? "media-grid__feature" : ""}
          >
            <video className="work-video" autoPlay loop muted playsInline preload="metadata">
              <source src={video} type="video/mp4" />
            </video>
          </GlassMediaFrame>
        ))}
      </div>
    </Section>
  );
}
