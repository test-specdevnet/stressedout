type HeroStageProps = {
  isActive?: boolean;
  reducedMotion?: boolean;
};

export function HeroStage(props?: HeroStageProps) {
  void props;

  return (
    <div className="hero-stage-shell">
      <div className="stage-layout stage-layout--hero">
        <div className="stage-copy hero-copy">
          <div className="hero-welcome-panel glass-panel">
            <p className="stage-kicker">Creative stress testing ad engine</p>
            <h1 className="stage-title hero-title">Stressed Out Advertising</h1>
            <p className="hero-subtitle">Creative Stress Testing Ad Engine</p>
            <p className="stage-description hero-description">
              Testing ad ideas and converting static UGC to dynamic videos.
            </p>
          </div>
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
    </div>
  );
}
