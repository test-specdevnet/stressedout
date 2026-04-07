import { GlassMediaFrame } from "../components/GlassMediaFrame";

const videos = [
  "/assets/stressed-out/videos/grok_video_2026-01-28-18-39-51.mp4",
  "/assets/stressed-out/videos/grok_video_2026-01-28-18-40-03.mp4",
  "/assets/stressed-out/videos/grok_video_2026-01-28-18-41-11.mp4",
];

export function GalleryStage() {
  return (
    <div className="stage-layout stage-layout--gallery">
      <div className="stage-copy">
        <p className="stage-kicker">Ad Gallery / proof surface</p>
        <h2 className="stage-title">The gallery panel is staged like a reel wall instead of a card grid.</h2>
        <p className="stage-description">
          Motion does the talking here. These media wells are placeholders for the eventual proof
          set, but the composition is already tuned to guide the eye from feature frame to secondary
          variants.
        </p>
      </div>

      <div className="gallery-grid">
        {videos.map((video, index) => (
          <GlassMediaFrame
            key={video}
            caption={`Variant ${index + 1}`}
            className={index === 0 ? "gallery-grid__feature" : ""}
          >
            <video className="work-video" autoPlay loop muted playsInline preload="metadata">
              <source src={video} type="video/mp4" />
            </video>
          </GlassMediaFrame>
        ))}
      </div>
    </div>
  );
}
