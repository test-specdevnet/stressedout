export function HeroStage() {
  return (
    <div className="stage-layout stage-layout--hero">
      <div className="stage-copy hero-copy">
        <p className="stage-kicker">Creative stress testing ad engine</p>
        <h1 className="stage-title hero-title">Stressed Out Advertising</h1>
        <p className="hero-subtitle">Creative Stress Testing Ad Engine</p>
        <p className="stage-description hero-description">
          Testing ad ideas and converting static UGC to dynamic videos.
        </p>
      </div>

      <div className="hero-logo-column">
        <div className="glass-panel hero-logo-panel">
          <img
            className="hero-logo-image"
            src="/assets/stressed-out/images/logo-3.png"
            alt="Stressed Out logo"
          />
        </div>
      </div>
    </div>
  );
}
