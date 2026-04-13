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
  uPulseStrength: 0.78,
  uGlowStrength: 0.76,
  uParallaxStrength: 0.22,
  uGridDensity: 6.8,
  uTileRoundness: 0.24,
  uContrast: 1.08,
  uTextSafeVignette: 0.82,
  uQualityScale: 1.0,
};

const VERTEX_SHADER_SOURCE = `
attribute vec2 aPosition;
varying vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SOURCE = `
precision highp float;

varying vec2 vUv;

uniform vec2 uResolution;
uniform float uTime;
uniform float uPulseStrength;
uniform float uGlowStrength;
uniform float uParallaxStrength;
uniform float uGridDensity;
uniform float uTileRoundness;
uniform float uContrast;
uniform float uTextSafeVignette;
uniform float uQualityScale;
uniform float uReducedMotion;

const float PI = 3.141592653589793;

float saturate(float x) {
  return clamp(x, 0.0, 1.0);
}

mat2 rotate2d(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

float roundedBoxSdf(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + vec2(r);
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float loopSin(float t) {
  return sin(t * PI * 2.0);
}

float loopCos(float t) {
  return cos(t * PI * 2.0);
}

float pulseWindow(float t, float start, float peak, float end) {
  float rise = smoothstep(start, peak, t);
  float fall = 1.0 - smoothstep(peak, end, t);
  return saturate(rise * fall);
}

float contourBand(vec2 p, float thickness, float speed, float phase) {
  float band = abs(sin((p.y + phase) * speed * 18.0));
  return smoothstep(1.0 - thickness, 1.0, band);
}

void main() {
  vec2 resolution = max(uResolution, vec2(1.0));
  float motionScale = mix(1.0, 0.18, uReducedMotion);
  float loop = fract(uTime / 6.0);
  float loopA = 0.5 + 0.5 * loopSin(loop);
  float loopB = 0.5 + 0.5 * loopSin(loop + 0.17);
  float loopC = 0.5 + 0.5 * loopCos(loop + 0.13);

  vec2 uv = vUv;
  vec2 centered = uv - 0.5;
  centered.x *= resolution.x / resolution.y;

  vec2 drift = vec2(
    loopSin(loop + 0.04),
    loopCos(loop + 0.15)
  ) * (0.018 + 0.008 * loopB) * uParallaxStrength * motionScale;

  vec2 iso = centered;
  iso += drift;
  iso = rotate2d(-0.075) * iso;
  iso.y *= 1.18;
  iso.x += iso.y * 0.42;

  float density = clamp(uGridDensity, 5.4, 8.4);
  vec2 gridScale = vec2(density * 1.16, density * 0.86);
  vec2 grid = iso * gridScale;
  vec2 cell = floor(grid);
  vec2 cellUv = fract(grid) - 0.5;

  float rnd = hash12(cell + 7.13);
  float major = step(0.83, rnd);
  float bright = step(0.72, hash12(cell * 1.37 + 9.2));
  float stacked = step(0.88, hash12(cell * 1.91 + 1.7));
  float neighborPulse = hash12(cell.yx * 0.71 + 4.6);

  vec2 local = cellUv;
  local.x += (fract(cell.y * 0.5) - 0.5) * 0.08;

  float majorScale = mix(1.0, 1.22, major);
  vec2 tileSize = vec2(0.355, 0.235) * majorScale;
  float roundness = mix(0.08, 0.19, clamp(uTileRoundness, 0.0, 1.0));
  float lift = mix(0.12, 0.22, 0.45 * major + 0.55 * bright);
  float aa = max(fwidth(local.x), fwidth(local.y)) * 1.45 + 0.0015;
  float topSdf = roundedBoxSdf(local, tileSize, roundness);
  float bottomSdf = roundedBoxSdf(local - vec2(0.0, lift), tileSize, roundness);
  float topMask = 1.0 - smoothstep(0.0, aa, topSdf);
  float bottomMask = 1.0 - smoothstep(0.0, aa, bottomSdf);
  float sideMask = max(bottomMask - topMask, 0.0);
  float innerMask = 1.0 - smoothstep(0.0, aa * 1.2, topSdf + 0.022);
  float innerInsetMask = 1.0 - smoothstep(0.0, aa * 1.3, topSdf + 0.055);
  float outerRim = smoothstep(aa * 0.75, -aa * 1.25, topSdf) * (1.0 - innerMask);
  float floorTile = 1.0 - smoothstep(0.0, aa * 1.4, bottomSdf + 0.03);
  float seam = exp(-18.0 * abs(max(abs(cellUv.x), abs(cellUv.y)) - 0.5)) * (1.0 - floorTile * 0.86);

  float sweepA = pulseWindow(fract(loop + rnd * 0.16), 0.08, 0.28, 0.74);
  float sweepB = pulseWindow(fract(loop + neighborPulse * 0.2 + 0.22), 0.18, 0.48, 0.9);
  float activation = max(sweepA, sweepB) * uPulseStrength;
  activation *= mix(0.26, 1.0, bright);

  float bandBase = contourBand(local, 0.065, 0.75, loop * 0.7 + rnd * 2.0);
  float bandSecondary = contourBand(local + vec2(0.0, 0.09), 0.035, 1.05, loop * 0.6 + rnd);
  float contour = (bandBase * 0.75 + bandSecondary * 0.45) * activation * stacked;
  contour *= innerInsetMask;
  float sideBands = contourBand(local - vec2(0.0, lift * 0.52), 0.05, 1.2, loop * 0.6 + rnd * 0.7);
  sideBands *= sideMask * (0.18 + 0.82 * activation);

  vec3 baseA = vec3(0.055, 0.028, 0.142);
  vec3 baseB = vec3(0.118, 0.045, 0.264);
  vec3 baseC = vec3(0.236, 0.062, 0.388);
  vec3 magenta = vec3(0.972, 0.356, 0.812);
  vec3 highlight = vec3(1.0, 0.925, 0.985);

  float bgGrad = saturate(uv.y * 0.92 + uv.x * 0.32);
  vec3 color = mix(baseA, baseB, bgGrad);
  color = mix(color, baseC, smoothstep(0.35, 1.0, bgGrad));

  float leftAura = exp(-5.5 * distance(uv, vec2(0.12, 0.2)));
  float rightAura = exp(-5.2 * distance(uv, vec2(0.86, 0.76)));
  color += vec3(0.16, 0.06, 0.3) * leftAura;
  color += vec3(0.24, 0.05, 0.22) * rightAura;

  float tileDepth = smoothstep(0.34, -0.22, local.y + local.x * 0.2);
  float bevelHigh = smoothstep(-0.02, -0.16, topSdf);
  float bevelLow = smoothstep(0.08, -0.02, topSdf + 0.06);
  float faceShade = mix(0.62, 1.16, bevelHigh) * mix(0.82, 1.0, tileDepth);
  float sideShade = mix(0.28, 0.78, smoothstep(-0.5, 0.4, local.x + local.y * 0.28));

  vec3 tileBase = mix(vec3(0.155, 0.082, 0.34), vec3(0.46, 0.18, 0.67), bright * 0.65 + activation * 0.24);
  vec3 tileTop = mix(tileBase, highlight, 0.12 + 0.16 * bright);
  vec3 tileColor = mix(tileBase, tileTop, smoothstep(-0.24, 0.12, local.y - local.x * 0.1));
  tileColor *= faceShade;
  vec3 sideColor = mix(vec3(0.05, 0.03, 0.15), vec3(0.4, 0.16, 0.58), bright * 0.4 + activation * 0.22);
  sideColor *= sideShade;

  float spec = pow(saturate(1.0 - length((local - vec2(-0.06, -0.11)) / vec2(0.72, 0.36))), 4.5);
  float cornerSpec = pow(saturate(1.0 - length((local - vec2(0.18, 0.1)) / vec2(0.22, 0.18))), 5.0);
  float seamPulse = (0.18 + 0.82 * activation) * (0.55 + 0.45 * bright);
  float rim = outerRim * (0.28 + 0.72 * uGlowStrength) * (0.7 + 0.5 * bright);
  float seamLight = seam * seamPulse * (0.06 + 0.2 * uGlowStrength);
  float floorSpec = pow(saturate(1.0 - length((local - vec2(0.0, lift + 0.12)) / vec2(0.88, 0.42))), 3.4);

  color = mix(color, mix(color, sideColor, 0.88), sideMask);
  color = mix(color, tileColor, topMask);
  color += magenta * rim;
  color += highlight * (spec * 0.22 + cornerSpec * 0.14) * topMask;
  color += magenta * contour * (0.7 + 0.6 * uGlowStrength);
  color += vec3(0.95, 0.58, 0.96) * sideBands * (0.36 + 0.44 * uGlowStrength);
  color += vec3(0.88, 0.36, 0.92) * seamLight;
  color += vec3(0.86, 0.42, 0.98) * bevelLow * topMask * 0.05;
  color += vec3(0.76, 0.28, 0.92) * floorSpec * floorTile * 0.08;

  float energyLineA = exp(-180.0 * abs((uv.y - 0.58) - (uv.x - 0.32) * 0.48 - 0.045 * loopSin(loop + 0.1)));
  float energyLineB = exp(-220.0 * abs((uv.y - 0.42) - (uv.x - 0.18) * 0.52 + 0.04 * loopCos(loop + 0.21)));
  float energyMix = (energyLineA * (0.16 + 0.26 * loopB) + energyLineB * (0.09 + 0.22 * loopC)) * motionScale;
  color += vec3(0.88, 0.36, 0.86) * energyMix * 0.4;

  float copySafe = exp(-8.2 * distance(uv, vec2(0.29, 0.48)));
  color = mix(color, color * (1.0 - 0.5 * uTextSafeVignette), copySafe * 0.9);

  float edgeVignette = smoothstep(0.52, 1.08, length(centered * vec2(0.92, 1.08)));
  color *= 1.0 - edgeVignette * 0.42;

  color = pow(max(color, 0.0), vec3(0.92));
  color = mix(vec3(0.04), color, uContrast);

  gl_FragColor = vec4(color, 1.0);
}
`;

type UniformHandles = {
  uResolution: WebGLUniformLocation | null;
  uTime: WebGLUniformLocation | null;
  uPulseStrength: WebGLUniformLocation | null;
  uGlowStrength: WebGLUniformLocation | null;
  uParallaxStrength: WebGLUniformLocation | null;
  uGridDensity: WebGLUniformLocation | null;
  uTileRoundness: WebGLUniformLocation | null;
  uContrast: WebGLUniformLocation | null;
  uTextSafeVignette: WebGLUniformLocation | null;
  uQualityScale: WebGLUniformLocation | null;
  uReducedMotion: WebGLUniformLocation | null;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) {
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(info ?? "Shader compilation failed.");
  }

  return shader;
}

function createProgram(gl: WebGLRenderingContext) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);

  if (!vertexShader || !fragmentShader) {
    return null;
  }

  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(info ?? "Program linking failed.");
  }

  return program;
}

function drawFallback(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  resolvedUniforms: typeof DEFAULT_UNIFORMS,
) {
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    return;
  }

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#10061d");
  gradient.addColorStop(0.45, "#2c0b54");
  gradient.addColorStop(0.8, "#57106f");
  gradient.addColorStop(1, "#8a186f");
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const textSafe = ctx.createRadialGradient(width * 0.28, height * 0.48, 0, width * 0.28, height * 0.48, width * 0.28);
  textSafe.addColorStop(0, `rgba(7, 6, 18, ${0.52 * resolvedUniforms.uTextSafeVignette})`);
  textSafe.addColorStop(1, "rgba(7, 6, 18, 0)");
  ctx.fillStyle = textSafe;
  ctx.fillRect(0, 0, width, height);
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

    const resolvedUniforms = { ...DEFAULT_UNIFORMS, ...uniforms };
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
    });

    let frameId = 0;
    let startTime = 0;
    let pausedAt = 0;
    let destroyed = false;
    let isDocumentVisible = document.visibilityState !== "hidden";
    let resizeObserver: ResizeObserver | null = null;
    let program: WebGLProgram | null = null;
    let buffer: WebGLBuffer | null = null;
    let fallbackMode = false;
    let width = 1;
    let height = 1;

    const syncCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      const area = rect.width * rect.height;
      const adaptiveQuality = area > 1_050_000 ? 0.72 : area > 700_000 ? 0.82 : area > 420_000 ? 0.92 : 1.0;
      const qualityScale = clamp(resolvedUniforms.uQualityScale * adaptiveQuality, 0.68, 1.0);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * qualityScale;
      const nextWidth = Math.max(1, Math.floor(rect.width * dpr));
      const nextHeight = Math.max(1, Math.floor(rect.height * dpr));

      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
      }

      width = nextWidth;
      height = nextHeight;

      if (gl) {
        gl.viewport(0, 0, width, height);
      } else {
        drawFallback(canvas, width, height, resolvedUniforms);
      }
    };

    if (!gl) {
      fallbackMode = true;
      syncCanvasSize();
      return () => {
        drawFallback(canvas, width, height, resolvedUniforms);
      };
    }

    try {
      program = createProgram(gl);
    } catch (error) {
      console.error("LoopShaderCanvas: failed to initialize WebGL program", error);
      fallbackMode = true;
    }

    if (!program) {
      fallbackMode = true;
      syncCanvasSize();
      return () => {
        drawFallback(canvas, width, height, resolvedUniforms);
      };
    }

    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, "aPosition");
    buffer = gl.createBuffer();
    if (!buffer || positionLocation < 0) {
      fallbackMode = true;
      syncCanvasSize();
      return () => {
        if (buffer) {
          gl.deleteBuffer(buffer);
        }
        if (program) {
          gl.deleteProgram(program);
        }
        drawFallback(canvas, width, height, resolvedUniforms);
      };
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const uniformHandles: UniformHandles = {
      uResolution: gl.getUniformLocation(program, "uResolution"),
      uTime: gl.getUniformLocation(program, "uTime"),
      uPulseStrength: gl.getUniformLocation(program, "uPulseStrength"),
      uGlowStrength: gl.getUniformLocation(program, "uGlowStrength"),
      uParallaxStrength: gl.getUniformLocation(program, "uParallaxStrength"),
      uGridDensity: gl.getUniformLocation(program, "uGridDensity"),
      uTileRoundness: gl.getUniformLocation(program, "uTileRoundness"),
      uContrast: gl.getUniformLocation(program, "uContrast"),
      uTextSafeVignette: gl.getUniformLocation(program, "uTextSafeVignette"),
      uQualityScale: gl.getUniformLocation(program, "uQualityScale"),
      uReducedMotion: gl.getUniformLocation(program, "uReducedMotion"),
    };

    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0, 0);

    const drawFrame = (timestamp: number) => {
      if (destroyed || fallbackMode) {
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

      syncCanvasSize();

      const time = (timestamp - startTime) * 0.001;

      gl.useProgram(program);
      gl.uniform2f(uniformHandles.uResolution, width, height);
      gl.uniform1f(uniformHandles.uTime, time);
      gl.uniform1f(uniformHandles.uPulseStrength, resolvedUniforms.uPulseStrength);
      gl.uniform1f(uniformHandles.uGlowStrength, resolvedUniforms.uGlowStrength);
      gl.uniform1f(uniformHandles.uParallaxStrength, resolvedUniforms.uParallaxStrength);
      gl.uniform1f(uniformHandles.uGridDensity, resolvedUniforms.uGridDensity);
      gl.uniform1f(uniformHandles.uTileRoundness, resolvedUniforms.uTileRoundness);
      gl.uniform1f(uniformHandles.uContrast, resolvedUniforms.uContrast);
      gl.uniform1f(uniformHandles.uTextSafeVignette, resolvedUniforms.uTextSafeVignette);
      gl.uniform1f(uniformHandles.uQualityScale, resolvedUniforms.uQualityScale);
      gl.uniform1f(uniformHandles.uReducedMotion, reducedMotion ? 1 : 0);

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      frameId = window.requestAnimationFrame(drawFrame);
    };

    const handleVisibilityChange = () => {
      isDocumentVisible = document.visibilityState !== "hidden";
      if (isDocumentVisible && isActive && !fallbackMode) {
        window.cancelAnimationFrame(frameId);
        drawFrame(performance.now());
      }
    };

    syncCanvasSize();
    resizeObserver = new ResizeObserver(syncCanvasSize);
    resizeObserver.observe(canvas);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    frameId = window.requestAnimationFrame(drawFrame);

    return () => {
      destroyed = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      resizeObserver?.disconnect();
      window.cancelAnimationFrame(frameId);
      if (buffer) {
        gl.deleteBuffer(buffer);
      }
      if (program) {
        gl.deleteProgram(program);
      }
      const loseContext = gl.getExtension("WEBGL_lose_context");
      loseContext?.loseContext();
    };
  }, [isActive, reducedMotion, uniforms]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
