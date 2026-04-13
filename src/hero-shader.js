const DEFAULT_UNIFORMS = {
  uPulseStrength: 0.82,
  uGlowStrength: 0.72,
  uParallaxStrength: 0.18,
  uGridDensity: 6.2,
  uTileRoundness: 0.18,
  uContrast: 1.04,
  uTextSafeVignette: 1.0,
  uQualityScale: 1.0,
};

const VS_SOURCE = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FS_SOURCE = `
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform float uPulseStrength;
uniform float uGlowStrength;
uniform float uParallaxStrength;
uniform float uGridDensity;
uniform float uTileRoundness;
uniform float uContrast;
uniform float uTextSafeVignette;
uniform float uQualityScale;
uniform float uReducedMotion;
#define PI 3.14159265359
#define LOOP_TIME 6.0

float roundedBox(vec2 p, vec2 size, float r) {
  vec2 q = abs(p) - size + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

float hash(vec2 p) {
  p = fract(p * vec2(0.3183, 0.367));
  p = p * p + p.yx * 37.0;
  return fract(p.x * p.y * 42.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
  float t = mod(uTime, LOOP_TIME);
  float motionScale = mix(1.0, 0.18, uReducedMotion);
  vec2 drift = vec2(
    sin((t / LOOP_TIME) * PI * 2.0) * 0.018,
    -cos((t / LOOP_TIME) * PI * 2.0 + 0.45) * 0.012
  ) * uParallaxStrength * motionScale;

  vec2 p = (uv * aspect * uGridDensity) + drift;
  p.x += p.y * 0.2;

  vec2 cell = floor(p);
  vec2 f = fract(p) - 0.5;

  float tileScale = (hash(cell * 1.3) > 0.92) ? 1.8 : 1.0;
  vec2 tileSize = vec2(0.42 * tileScale, 0.42 * tileScale);
  float tile = roundedBox(f, tileSize, uTileRoundness);

  float active = step(0.85, hash(cell * 7.1 + 0.3));
  float band = 9999.0;
  if (active > 0.5) {
    float phase = sin(2.0 * PI * (t / LOOP_TIME) + hash(cell) * PI * 2.0) * 0.5 + 0.5;
    for (int i = 1; i <= 4; i++) {
      float offset = float(i) * 0.065;
      float inner = roundedBox(f * (1.0 + phase * 0.3), tileSize - offset, uTileRoundness * 0.6);
      band = min(band, inner);
    }
  }

  vec2 seam = abs(fract(p) - 0.5);
  float seamDist = min(seam.x, seam.y);
  float bevel = clamp(1.0 - tile * 12.0, 0.0, 1.0);
  float rim = pow(max(0.0, 1.0 - abs(tile) * 4.0), 3.0) * uGlowStrength;
  float seamPulse = sin(t * 1.8 + cell.x * 0.8 + cell.y * 1.2) * 0.5 + 0.5;
  float seamLight = (1.0 - smoothstep(0.0, 0.12, seamDist)) * seamPulse * 1.8;

  vec3 base = mix(vec3(0.09, 0.01, 0.22), vec3(0.55, 0.08, 0.85), uv.y * 0.6);
  vec3 highlight = vec3(1.0, 0.45, 0.95);
  float mask = 1.0 - smoothstep(0.0, 0.02, tile);
  vec3 color = base * (1.0 + bevel * 1.4);
  color = mix(base, color, mask);
  color = mix(color, highlight, rim * 0.9);
  color += seamLight * highlight * 1.2;

  if (active > 0.5) {
    float bandGlow = (1.0 - smoothstep(0.0, 0.045, band)) * uPulseStrength * 1.6;
    color += bandGlow * highlight * (0.8 + sin(t * 8.0) * 0.2) * mask;
  }

  color = pow(color * uContrast, vec3(0.95));
  color += pow(max(0.0, rim + seamLight * 0.3), 2.0) * uGlowStrength * highlight;

  vec2 centeredUv = uv - 0.5;
  centeredUv.x *= uResolution.x / uResolution.y;
  float vignette = 1.0 - smoothstep(0.3, 1.2, length(centeredUv) * uTextSafeVignette);
  float textSafe = 1.0 - smoothstep(0.0, 0.52, distance(uv, vec2(0.3, 0.5)));
  color *= (0.82 + vignette * 0.18);
  color *= mix(1.0, 0.78, textSafe);

  gl_FragColor = vec4(color, 1.0);
}
`;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(info || "Shader compilation failed");
  }
  return shader;
}

function createProgram(gl) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, VS_SOURCE);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FS_SOURCE);
  if (!vertexShader || !fragmentShader) return null;

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
    throw new Error(info || "Program linking failed");
  }

  return program;
}

function applyFallback(canvas) {
  canvas.style.background = "linear-gradient(135deg, #1a0033, #4b0082)";
}

export function initHeroShader(target = "hero-canvas", options = {}) {
  const canvas =
    typeof target === "string"
      ? document.getElementById(target)
      : target;

  if (!(canvas instanceof HTMLCanvasElement)) return () => {};

  const reducedMotion =
    options.reducedMotion ??
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ??
    false;
  const isActive = options.isActive ?? true;
  const uniforms = { ...DEFAULT_UNIFORMS, ...(options.uniforms || {}) };

  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: false,
    depth: false,
    stencil: false,
    powerPreference: "high-performance",
  });

  if (!gl) {
    console.warn("WebGL not supported – falling back to static gradient");
    applyFallback(canvas);
    return () => {};
  }

  let program;
  try {
    program = createProgram(gl);
  } catch (error) {
    console.warn("Hero shader failed to initialize – falling back to static gradient", error);
    applyFallback(canvas);
    return () => {};
  }

  if (!program) {
    applyFallback(canvas);
    return () => {};
  }

  gl.useProgram(program);

  const positionLocation = gl.getAttribLocation(program, "aPosition");
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const locations = {
    uTime: gl.getUniformLocation(program, "uTime"),
    uResolution: gl.getUniformLocation(program, "uResolution"),
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

  let frameId = 0;
  let startTime = 0;
  let pausedAt = 0;
  let visible = document.visibilityState !== "hidden";
  let active = isActive;
  let destroyed = false;
  let width = 1;
  let height = 1;

  const syncSize = () => {
    const rect = canvas.getBoundingClientRect();
    const area = rect.width * rect.height;
    const adaptiveQuality = area > 1050000 ? 0.72 : area > 700000 ? 0.82 : area > 420000 ? 0.92 : 1.0;
    const qualityScale = clamp(uniforms.uQualityScale * adaptiveQuality, 0.68, 1.0);
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * qualityScale;
    width = Math.max(1, Math.floor(rect.width * dpr));
    height = Math.max(1, Math.floor(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, width, height);
  };

  const render = (timestamp) => {
    if (destroyed) return;
    if (!active || !visible) {
      pausedAt = timestamp;
      return;
    }

    if (!startTime) {
      startTime = timestamp;
    } else if (pausedAt > 0) {
      startTime += timestamp - pausedAt;
      pausedAt = 0;
    }

    syncSize();

    const time = (timestamp - startTime) * 0.001;
    gl.useProgram(program);
    gl.uniform1f(locations.uTime, time);
    gl.uniform2f(locations.uResolution, width, height);
    gl.uniform1f(locations.uPulseStrength, uniforms.uPulseStrength);
    gl.uniform1f(locations.uGlowStrength, uniforms.uGlowStrength);
    gl.uniform1f(locations.uParallaxStrength, uniforms.uParallaxStrength);
    gl.uniform1f(locations.uGridDensity, uniforms.uGridDensity);
    gl.uniform1f(locations.uTileRoundness, uniforms.uTileRoundness);
    gl.uniform1f(locations.uContrast, uniforms.uContrast);
    gl.uniform1f(locations.uTextSafeVignette, uniforms.uTextSafeVignette);
    gl.uniform1f(locations.uQualityScale, uniforms.uQualityScale);
    gl.uniform1f(locations.uReducedMotion, reducedMotion ? 1 : 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    frameId = window.requestAnimationFrame(render);
  };

  const resizeObserver = new ResizeObserver(syncSize);
  resizeObserver.observe(canvas);

  const handleVisibilityChange = () => {
    visible = document.visibilityState !== "hidden";
    if (visible && active) {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(render);
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  syncSize();
  frameId = window.requestAnimationFrame(render);

  return () => {
    destroyed = true;
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    resizeObserver.disconnect();
    window.cancelAnimationFrame(frameId);
    if (buffer) gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
    const loseContext = gl.getExtension("WEBGL_lose_context");
    if (loseContext) loseContext.loseContext();
  };
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("hero-canvas");
    if (canvas) {
      window.heroShaderCleanup = initHeroShader(canvas);
    }
  });
}
