import { useLayoutEffect, useRef } from "react";

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

const DEFAULT_UNIFORMS = {
  uPulseStrength: 0.72,
  uGlowStrength: 0.72,
  uParallaxStrength: 0.24,
  uGridDensity: 7.2,
  uTileRoundness: 0.22,
  uContrast: 1.06,
  uTextSafeVignette: 0.74,
  uQualityScale: 1.0,
};

type TileDefinition = {
  x: number;
  y: number;
  w: number;
  h: number;
  height: number;
  phase: number;
  contour: boolean;
  bright: boolean;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width * 0.5, height * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function createTiles(width: number, height: number): TileDefinition[] {
  const shortSide = Math.min(width, height);
  const tileWidth = shortSide * 0.18;
  const tileHeight = tileWidth * 0.72;
  const columnStep = tileWidth * 0.88;
  const rowStep = tileHeight * 0.9;
  const skew = tileWidth * 0.22;
  const tiles: TileDefinition[] = [];

  for (let row = -1; row < 6; row += 1) {
    for (let col = -1; col < 8; col += 1) {
      const seed = (row * 17 + col * 29 + 101) % 13;
      const contour = seed % 4 === 0 || (row === 2 && col === 4) || (row === 3 && col === 2);
      const bright = seed % 5 === 0 || (row === 2 && col === 2);
      const scale = contour ? 1.16 : bright ? 0.94 : 1;
      const raised = contour ? 0.18 : bright ? 0.1 : 0.13;

      tiles.push({
        x: col * columnStep + row * skew + width * 0.04,
        y: row * rowStep + height * 0.12,
        w: tileWidth * scale,
        h: tileHeight * scale,
        height: raised,
        phase: seed * 0.17 + row * 0.11 + col * 0.07,
        contour,
        bright,
      });
    }
  }

  return tiles;
}

function drawTile(
  ctx: CanvasRenderingContext2D,
  tile: TileDefinition,
  height: number,
  cycle: number,
  driftX: number,
  driftY: number,
  uniforms: typeof DEFAULT_UNIFORMS,
  reducedMotion: boolean,
) {
  const pulseBase = 0.5 + 0.5 * Math.sin(cycle * Math.PI * 2 + tile.phase * Math.PI * 2);
  const pulse = smoothstep(0.22, 0.96, pulseBase) * uniforms.uPulseStrength;
  const motionScale = reducedMotion ? 0.26 : 1;
  const x = tile.x + driftX * (0.38 + tile.phase * 0.18) * motionScale;
  const y = tile.y + driftY * (0.3 + tile.phase * 0.14) * motionScale;
  const depth = Math.max(10, tile.h * tile.height * height * 0.0012);
  const radius = tile.h * (0.19 + uniforms.uTileRoundness * 0.16);

  const glowAlpha = (0.1 + pulse * 0.34) * uniforms.uGlowStrength;
  const seamAlpha = 0.14 + pulse * 0.4;

  const underGlow = ctx.createRadialGradient(
    x + tile.w * 0.54,
    y + tile.h + depth * 0.8,
    0,
    x + tile.w * 0.54,
    y + tile.h + depth * 0.8,
    tile.w * 0.92,
  );
  underGlow.addColorStop(0, `rgba(255, 104, 238, ${glowAlpha})`);
  underGlow.addColorStop(0.52, `rgba(97, 65, 255, ${glowAlpha * 0.46})`);
  underGlow.addColorStop(1, "rgba(97, 65, 255, 0)");
  ctx.fillStyle = underGlow;
  ctx.fillRect(x - tile.w * 0.45, y + tile.h * 0.45, tile.w * 1.8, tile.h * 1.5);

  const sideGradient = ctx.createLinearGradient(x, y + depth, x + tile.w, y + tile.h + depth);
  sideGradient.addColorStop(0, "rgba(16, 10, 44, 0.7)");
  sideGradient.addColorStop(0.45, `rgba(54, 24, 120, ${0.5 + pulse * 0.14})`);
  sideGradient.addColorStop(1, `rgba(255, 78, 210, ${0.24 + pulse * 0.24})`);

  roundedRectPath(ctx, x, y + depth, tile.w, tile.h, radius);
  ctx.fillStyle = sideGradient;
  ctx.fill();

  if (tile.contour) {
    ctx.save();
    roundedRectPath(ctx, x, y + depth, tile.w, tile.h, radius);
    ctx.clip();
    ctx.strokeStyle = `rgba(255, 210, 255, ${0.14 + pulse * 0.38})`;
    ctx.lineWidth = Math.max(1, tile.h * 0.022);
    const lineCount = 16;
    for (let i = 0; i < lineCount; i += 1) {
      const ly = y + depth + tile.h * (0.18 + i * 0.048);
      ctx.beginPath();
      ctx.moveTo(x + tile.w * 0.08, ly);
      ctx.lineTo(x + tile.w * 0.92, ly);
      ctx.stroke();
    }
    ctx.restore();
  }

  const faceGradient = ctx.createLinearGradient(x, y, x + tile.w, y + tile.h);
  faceGradient.addColorStop(0, tile.bright ? "rgba(241, 225, 255, 0.98)" : "rgba(184, 142, 255, 0.94)");
  faceGradient.addColorStop(0.45, tile.bright ? "rgba(214, 173, 255, 0.94)" : "rgba(132, 62, 222, 0.92)");
  faceGradient.addColorStop(1, tile.bright ? "rgba(204, 86, 224, 0.9)" : "rgba(83, 28, 148, 0.94)");

  roundedRectPath(ctx, x, y, tile.w, tile.h, radius);
  ctx.fillStyle = faceGradient;
  ctx.fill();

  const specular = ctx.createRadialGradient(
    x + tile.w * 0.24,
    y + tile.h * 0.16,
    0,
    x + tile.w * 0.24,
    y + tile.h * 0.16,
    tile.w * 0.88,
  );
  specular.addColorStop(0, "rgba(255, 255, 255, 0.34)");
  specular.addColorStop(0.42, "rgba(255, 255, 255, 0.08)");
  specular.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = specular;
  roundedRectPath(ctx, x, y, tile.w, tile.h, radius);
  ctx.fill();

  ctx.strokeStyle = `rgba(255, 228, 255, ${0.34 + pulse * 0.34})`;
  ctx.lineWidth = Math.max(1.1, tile.h * 0.024);
  roundedRectPath(ctx, x, y, tile.w, tile.h, radius);
  ctx.stroke();

  const seamGlow = ctx.createLinearGradient(x, y + tile.h, x + tile.w, y + tile.h + depth);
  seamGlow.addColorStop(0, `rgba(141, 99, 255, ${seamAlpha * 0.28})`);
  seamGlow.addColorStop(0.5, `rgba(255, 164, 255, ${seamAlpha})`);
  seamGlow.addColorStop(1, `rgba(102, 132, 255, ${seamAlpha * 0.32})`);
  ctx.strokeStyle = seamGlow;
  ctx.lineWidth = Math.max(1, tile.h * 0.02);
  roundedRectPath(ctx, x, y + depth, tile.w, tile.h, radius);
  ctx.stroke();
}

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

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) {
      return;
    }

    const resolvedUniforms = { ...DEFAULT_UNIFORMS, ...uniforms };
    let frameId = 0;
    let startTime = 0;
    let pausedAt = 0;
    let lastWidth = 0;
    let lastHeight = 0;
    let destroyed = false;
    let isDocumentVisible = document.visibilityState !== "hidden";
    let tiles: TileDefinition[] = [];

    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      const viewportArea = rect.width * rect.height;
      const adaptiveQuality = viewportArea > 900000 ? 0.82 : viewportArea > 520000 ? 0.92 : 1.0;
      const qualityScale = Math.max(0.74, Math.min(1.0, resolvedUniforms.uQualityScale * adaptiveQuality));
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * qualityScale;
      const width = Math.max(1, Math.floor(rect.width * dpr));
      const height = Math.max(1, Math.floor(rect.height * dpr));

      if (width !== lastWidth || height !== lastHeight) {
        lastWidth = width;
        lastHeight = height;
        canvas.width = width;
        canvas.height = height;
        tiles = createTiles(width, height);
      }
    };

    const drawFrame = (timestamp: number) => {
      if (destroyed) {
        return;
      }

      if (!isActive || !isDocumentVisible) {
        pausedAt = timestamp;
        return;
      }

      if (!startTime) {
        startTime = timestamp;
      } else if (pausedAt > 0) {
        startTime += timestamp - pausedAt;
        pausedAt = 0;
      }

      updateCanvasSize();

      const width = canvas.width;
      const height = canvas.height;
      const time = (timestamp - startTime) * 0.001;
      const cycle = (time % 6) / 6;
      const motionScale = reducedMotion ? 0.26 : 1.0;
      const driftX = Math.sin(cycle * Math.PI * 2) * width * 0.014 * resolvedUniforms.uParallaxStrength * motionScale;
      const driftY = Math.cos(cycle * Math.PI * 2 + 0.4) * height * 0.01 * resolvedUniforms.uParallaxStrength * motionScale;

      ctx.clearRect(0, 0, width, height);

      const bg = ctx.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, "#150723");
      bg.addColorStop(0.36, "#32105b");
      bg.addColorStop(0.76, "#5c146c");
      bg.addColorStop(1, "#a7197f");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      const leftGlow = ctx.createRadialGradient(width * 0.1, height * 0.2, 0, width * 0.1, height * 0.2, width * 0.42);
      leftGlow.addColorStop(0, "rgba(193, 67, 255, 0.42)");
      leftGlow.addColorStop(0.34, "rgba(126, 47, 255, 0.16)");
      leftGlow.addColorStop(1, "rgba(126, 47, 255, 0)");
      ctx.fillStyle = leftGlow;
      ctx.fillRect(0, 0, width, height);

      const rightGlow = ctx.createRadialGradient(width * 0.82, height * 0.78, 0, width * 0.82, height * 0.78, width * 0.44);
      rightGlow.addColorStop(0, "rgba(255, 46, 187, 0.44)");
      rightGlow.addColorStop(0.36, "rgba(255, 46, 187, 0.16)");
      rightGlow.addColorStop(1, "rgba(255, 46, 187, 0)");
      ctx.fillStyle = rightGlow;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(255, 190, 255, 0.42)";
      ctx.lineWidth = Math.max(1, width * 0.0016);
      for (let i = 0; i < tiles.length; i += 1) {
        const tile = tiles[i];
        const x = tile.x + driftX * 0.22;
        const y = tile.y + driftY * 0.18;
        ctx.strokeRect(x + tile.w * 0.03, y + tile.h * 0.65, tile.w * 0.96, tile.h * 0.7);
      }

      for (const tile of tiles) {
        drawTile(ctx, tile, height, cycle, driftX, driftY, resolvedUniforms, reducedMotion);
      }

      const textSafe = ctx.createRadialGradient(width * 0.28, height * 0.46, 0, width * 0.28, height * 0.46, width * 0.28);
      textSafe.addColorStop(0, `rgba(9, 8, 22, ${0.54 * resolvedUniforms.uTextSafeVignette})`);
      textSafe.addColorStop(1, "rgba(9, 8, 22, 0)");
      ctx.fillStyle = textSafe;
      ctx.fillRect(0, 0, width, height);

      const vignette = ctx.createRadialGradient(width * 0.5, height * 0.48, width * 0.2, width * 0.5, height * 0.48, width * 0.74);
      vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
      vignette.addColorStop(1, "rgba(4, 6, 18, 0.44)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      frameId = window.requestAnimationFrame(drawFrame);
    };

    const handleVisibilityChange = () => {
      isDocumentVisible = document.visibilityState !== "hidden";
      if (isDocumentVisible && isActive) {
        window.cancelAnimationFrame(frameId);
        drawFrame(performance.now());
      }
    };

    updateCanvasSize();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    drawFrame(performance.now());

    return () => {
      destroyed = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.cancelAnimationFrame(frameId);
    };
  }, [isActive, reducedMotion, uniforms]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
