import { LoopShaderCanvas } from "../components/LoopShaderCanvas";

type HeroStageProps = {
  isActive?: boolean;
  reducedMotion?: boolean;
};

export function HeroStage(props?: HeroStageProps) {
  const isActive = props?.isActive ?? false;
  const reducedMotion = props?.reducedMotion ?? false;

  return (
    <div className="hero-stage-shell">
      <div className="hero-stage-shell__background" aria-hidden="true">
        <div className="hero-stage-shell__fallback-grid" />
        <LoopShaderCanvas
          className="hero-stage-shell__shader"
          isActive={isActive}
          reducedMotion={reducedMotion}
        />
        <div className="hero-stage-shell__overlay hero-stage-shell__overlay--ambient" />
        <div className="hero-stage-shell__overlay hero-stage-shell__overlay--copy-safe" />
      </div>

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
