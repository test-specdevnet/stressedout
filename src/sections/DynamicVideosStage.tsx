const workflow = [
  "Static input arrives as concepts, stills, or UGC fragments.",
  "Hooks, structure, and pacing are pressure-tested before the build.",
  "Dynamic outputs leave the panel as motion-ready ad directions.",
];

export function DynamicVideosStage() {
  return (
    <div className="stage-layout stage-layout--workflow">
      <div className="stage-copy">
        <p className="stage-kicker">Static Content to Dynamic Videos</p>
        <h2 className="stage-title">A process panel built like a transformation corridor.</h2>
        <p className="stage-description">
          This section is intentionally more diagrammatic. It gives the eventual story a place to
          explain conversion from static source material into dynamic output without collapsing into
          generic cards.
        </p>
      </div>

      <div className="workflow-strip">
        {workflow.map((item, index) => (
          <article key={item} className="glass-panel workflow-step">
            <span className="workflow-step__count">{String(index + 1).padStart(2, "0")}</span>
            <p>{item}</p>
          </article>
        ))}
      </div>

      <div className="glass-panel workflow-bridge" aria-hidden="true">
        <span className="workflow-bridge__label">Static</span>
        <div className="workflow-bridge__line" />
        <span className="workflow-bridge__label">Dynamic</span>
      </div>
    </div>
  );
}
