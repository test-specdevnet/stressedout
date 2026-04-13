import { useLayoutEffect, useRef } from "react";
import { initHeroShader } from "../hero-shader";

type LoopShaderUniformOverrides = Partial<{
  uPulseStrength: number;
  uGlowStrength: number;
  uParallaxStrength: number;
  uGridDensity: number;
  uTileRoundness: number;
  uContrast: number;
  uTextSafeVignette: number;
  uQualityScale: number;
}>;

type LoopShaderCanvasProps = {
  className?: string;
  isActive?: boolean;
  reducedMotion?: boolean;
  uniforms?: LoopShaderUniformOverrides;
};

export function LoopShaderCanvas({
  className,
  isActive = true,
  reducedMotion = false,
  uniforms,
}: LoopShaderCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    return initHeroShader(canvas, {
      isActive,
      reducedMotion,
      uniforms,
    });
  }, [isActive, reducedMotion, uniforms]);

  return <canvas id="hero-canvas" ref={canvasRef} className={className} aria-hidden="true" />;
}
