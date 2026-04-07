const aboutSignals = [
  "Designed as a composed narrative stage, not a stacked brochure block.",
  "Spacing and framing tuned to give the copy room to breathe.",
  "Surface treatment stays consistent with the repo's glass aesthetic.",
];

export function AboutStage() {
  return (
    <div className="stage-layout stage-layout--split">
      <div className="stage-copy">
        <p className="stage-kicker">About Us / trust frame</p>
        <h2 className="stage-title">A slower editorial panel that lets the story settle before the next turn.</h2>
        <p className="stage-description">
          This shell stands in for the eventual team and positioning narrative. The layout is
          built to support a confident paragraph stack, a supporting note rail, and a quiet
          transition into the next motion-heavy stage.
        </p>
      </div>

      <div className="stage-stack">
        <article className="glass-panel stage-note-card">
          <p>
            Placeholder content keeps the hierarchy honest: title, support copy, and a secondary
            region that can later hold proof, credentials, or a concise founder statement.
          </p>
        </article>

        <div className="stage-signal-grid">
          {aboutSignals.map((signal) => (
            <article key={signal} className="glass-panel stage-signal-card">
              <p>{signal}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
