export type HeroShaderUniformOverrides = Partial<{
  uPulseStrength: number;
  uGlowStrength: number;
  uParallaxStrength: number;
  uGridDensity: number;
  uTileRoundness: number;
  uContrast: number;
  uTextSafeVignette: number;
  uQualityScale: number;
}>;

export function initHeroShader(
  target?: string | HTMLCanvasElement | null,
  options?: {
    isActive?: boolean;
    reducedMotion?: boolean;
    uniforms?: HeroShaderUniformOverrides;
  },
): () => void;
