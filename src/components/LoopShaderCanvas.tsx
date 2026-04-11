import { useEffect, useRef } from "react";

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
  uGlowStrength: 0.74,
  uParallaxStrength: 0.34,
  uGridDensity: 7.6,
  uTileRoundness: 0.24,
  uContrast: 1.08,
  uTextSafeVignette: 0.72,
  uQualityScale: 1.0,
};

const VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SOURCE = `
precision mediump float;

varying vec2 v_uv;

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

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float roundedBoxSdf(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float smoothPulse(float t, float start, float end) {
  float rise = smoothstep(start, mix(start, end, 0.48), t);
  float fall = 1.0 - smoothstep(mix(start, end, 0.54), end, t);
  return clamp(rise * fall, 0.0, 1.0);
}

void main() {
  vec2 uv = v_uv;
  vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
  float cycle = fract(uTime / 6.0);
  float driftWave = sin(cycle * 6.28318530718);
  float driftWaveB = sin(cycle * 6.28318530718 + 1.57079632679);
  float reducedMotionMix = 1.0 - 0.72 * uReducedMotion;

  vec2 sceneUv = uv - 0.5;
  sceneUv.x *= aspect.x;
  sceneUv += vec2(
    driftWave * 0.026 * uParallaxStrength,
    driftWaveB * 0.018 * uParallaxStrength
  ) * reducedMotionMix;

  vec2 iso = vec2(sceneUv.x + sceneUv.y * 0.58, sceneUv.y * 0.68);
  float gridScale = mix(6.2, 9.2, clamp((uGridDensity - 5.5) / 4.5, 0.0, 1.0));
  vec2 gridPos = iso * gridScale;
  vec2 cellId = floor(gridPos);
  vec2 cellUv = fract(gridPos) - 0.5;

  float tileSeed = hash21(cellId);
  float tileSeedB = hash21(cellId + vec2(19.7, 3.1));
  float isLargeTile = step(0.82, tileSeed);
  vec2 tileSize = mix(vec2(0.405, 0.405), vec2(0.465, 0.455), isLargeTile);
  float roundness = mix(0.1, 0.28, clamp(uTileRoundness, 0.0, 1.0));
  float tileSdf = roundedBoxSdf(cellUv, tileSize, roundness);

  float aa = fwidth(tileSdf) * 1.15 + 0.0025;
  float tileMask = 1.0 - smoothstep(-aa, aa, tileSdf);
  float tileEdge = 1.0 - smoothstep(0.0, aa * 4.0, abs(tileSdf));

  float topBand = smoothstep(-0.34, 0.2, cellUv.y);
  float leftLight = smoothstep(-0.52, 0.22, -cellUv.x + cellUv.y * 0.15);
  float bevel = mix(0.7, 1.18, topBand) * mix(0.9, 1.12, leftLight);
  bevel *= 0.92 + 0.08 * sin((cellUv.x - cellUv.y) * 12.0 + tileSeedB * 6.2831);

  float seamX = exp(-abs(cellUv.x) * 54.0);
  float seamY = exp(-abs(cellUv.y) * 54.0);
  float seamField = max(seamX * 0.88, seamY);

  float lanePhase = fract(cycle + tileSeed * 0.24);
  float seamTravel = sin((cellId.x + cellId.y) * 0.92 + cycle * 6.28318530718);
  float seamPulse = smoothPulse(lanePhase, 0.08, 0.82) * (0.5 + 0.5 * seamTravel);
  seamPulse *= uPulseStrength * reducedMotionMix;

  float activationSelector = step(0.68, tileSeedB);
  float activationWindowA = smoothPulse(fract(cycle + tileSeed * 0.23), 0.14, 0.56);
  float activationWindowB = smoothPulse(fract(cycle + tileSeed * 0.19 + 0.33), 0.42, 0.9);
  float activation = max(activationWindowA, activationWindowB) * activationSelector;
  activation *= (0.65 + 0.35 * isLargeTile) * uPulseStrength * reducedMotionMix;

  float contourFreq = mix(16.0, 24.0, isLargeTile);
  float contourOffset = fract((cellUv.y + 0.5) * contourFreq - cycle * 1.8 - tileSeed * 5.0);
  float contourBand = smoothstep(0.0, 0.16, contourOffset) * (1.0 - smoothstep(0.24, 0.42, contourOffset));
  float contourEnvelope = smoothstep(-0.02, 0.18, -tileSdf) * smoothstep(0.22, -0.16, tileSdf);
  float contourEcho = contourBand * contourEnvelope * activation;

  vec3 deep = vec3(0.025, 0.03, 0.09);
  vec3 violet = vec3(0.19, 0.12, 0.48);
  vec3 magenta = vec3(0.88, 0.13, 0.72);
  vec3 hot = vec3(0.98, 0.82, 1.0);
  vec3 blue = vec3(0.19, 0.35, 0.94);

  float backgroundLift = 0.18 + 0.16 * driftWaveB;
  vec3 color = mix(deep, violet, smoothstep(-0.58, 0.72, sceneUv.x + sceneUv.y * 0.36 + backgroundLift));
  color = mix(color, magenta, smoothstep(0.0, 0.9, 0.65 - sceneUv.y + sceneUv.x * 0.42));

  float seamGlow = seamField * (0.24 + seamPulse * 0.95);
  color += mix(violet, blue, 0.55) * seamGlow * 0.45;

  vec3 tileBase = mix(vec3(0.11, 0.08, 0.24), vec3(0.36, 0.29, 0.72), 0.24 + 0.42 * tileSeed);
  vec3 activeFace = mix(vec3(0.5, 0.26, 0.78), hot, activation * 0.78);
  vec3 tileColor = mix(tileBase, activeFace, activation * 0.72);
  tileColor *= bevel;
  tileColor += vec3(0.22, 0.14, 0.36) * tileEdge * 0.28;
  tileColor += hot * contourEcho * 0.7;

  float rim = exp(-abs(tileSdf) * 38.0) * tileMask;
  float underGlow = exp(-abs(tileSdf - 0.02) * 26.0) * activation;
  tileColor += mix(magenta, hot, 0.54) * rim * (0.32 + uGlowStrength * 0.38);
  tileColor += mix(blue, magenta, 0.64) * underGlow * (0.2 + uGlowStrength * 0.22);

  color = mix(color, tileColor, tileMask);
  color += hot * rim * seamPulse * 0.16;

  float copySafe = 1.0 - smoothstep(0.18, 0.74, distance(uv, vec2(0.28, 0.53)));
  float copySide = 1.0 - smoothstep(0.18, 0.72, uv.x);
  float textSafe = copySafe * copySide * uTextSafeVignette;
  color *= 1.0 - textSafe * 0.42;
  color = mix(color, color * 0.92 + deep * 0.08, textSafe * 0.28);

  float frameVignette = smoothstep(1.18, 0.28, length(vec2((uv.x - 0.5) * aspect.x, uv.y - 0.52)));
  color *= mix(0.88, 1.0, frameVignette);

  color = pow(max(color, 0.0), vec3(0.92));
  color = mix(vec3(0.5), color, uContrast);

  gl_FragColor = vec4(color, 1.0);
}
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) {
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(gl: WebGLRenderingContext) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);

  if (!vertexShader || !fragmentShader) {
    if (vertexShader) {
      gl.deleteShader(vertexShader);
    }
    if (fragmentShader) {
      gl.deleteShader(fragmentShader);
    }
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
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

export function LoopShaderCanvas({
  className,
  isActive = true,
  reducedMotion = false,
  uniforms,
}: LoopShaderCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
    });

    if (!gl) {
      return;
    }

    const program = createProgram(gl);
    if (!program) {
      return;
    }

    const positionLocation = gl.getAttribLocation(program, "a_position");
    const resolutionLocation = gl.getUniformLocation(program, "uResolution");
    const timeLocation = gl.getUniformLocation(program, "uTime");
    const pulseLocation = gl.getUniformLocation(program, "uPulseStrength");
    const glowLocation = gl.getUniformLocation(program, "uGlowStrength");
    const parallaxLocation = gl.getUniformLocation(program, "uParallaxStrength");
    const gridLocation = gl.getUniformLocation(program, "uGridDensity");
    const roundnessLocation = gl.getUniformLocation(program, "uTileRoundness");
    const contrastLocation = gl.getUniformLocation(program, "uContrast");
    const textSafeLocation = gl.getUniformLocation(program, "uTextSafeVignette");
    const qualityLocation = gl.getUniformLocation(program, "uQualityScale");
    const reducedMotionLocation = gl.getUniformLocation(program, "uReducedMotion");
    const buffer = gl.createBuffer();

    if (
      !buffer ||
      positionLocation < 0 ||
      !resolutionLocation ||
      !timeLocation ||
      !pulseLocation ||
      !glowLocation ||
      !parallaxLocation ||
      !gridLocation ||
      !roundnessLocation ||
      !contrastLocation ||
      !textSafeLocation ||
      !qualityLocation ||
      !reducedMotionLocation
    ) {
      if (buffer) {
        gl.deleteBuffer(buffer);
      }
      gl.deleteProgram(program);
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]),
      gl.STATIC_DRAW,
    );

    const resolvedUniforms = { ...DEFAULT_UNIFORMS, ...uniforms };
    let frameId = 0;
    let startTime = 0;
    let pausedAt = 0;
    let lastWidth = 0;
    let lastHeight = 0;
    let destroyed = false;
    let isDocumentVisible = document.visibilityState !== "hidden";

    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      const viewportArea = rect.width * rect.height;
      const adaptiveQuality =
        viewportArea > 900000 ? 0.82 : viewportArea > 520000 ? 0.9 : 1.0;
      const qualityScale = Math.max(
        0.72,
        Math.min(1.0, resolvedUniforms.uQualityScale * adaptiveQuality),
      );
      const dpr = Math.min(window.devicePixelRatio || 1, 1.6) * qualityScale;
      const width = Math.max(1, Math.floor(rect.width * dpr));
      const height = Math.max(1, Math.floor(rect.height * dpr));

      if (width !== lastWidth || height !== lastHeight) {
        lastWidth = width;
        lastHeight = height;
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    const draw = (timestamp: number) => {
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

      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, (timestamp - startTime) * 0.001);
      gl.uniform1f(pulseLocation, resolvedUniforms.uPulseStrength);
      gl.uniform1f(glowLocation, resolvedUniforms.uGlowStrength);
      gl.uniform1f(parallaxLocation, resolvedUniforms.uParallaxStrength);
      gl.uniform1f(gridLocation, resolvedUniforms.uGridDensity);
      gl.uniform1f(roundnessLocation, resolvedUniforms.uTileRoundness);
      gl.uniform1f(contrastLocation, resolvedUniforms.uContrast);
      gl.uniform1f(textSafeLocation, resolvedUniforms.uTextSafeVignette);
      gl.uniform1f(qualityLocation, resolvedUniforms.uQualityScale);
      gl.uniform1f(reducedMotionLocation, reducedMotion ? 1.0 : 0.0);
      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      frameId = window.requestAnimationFrame(draw);
    };

    const handleVisibilityChange = () => {
      isDocumentVisible = document.visibilityState !== "hidden";
      if (isDocumentVisible && isActive) {
        window.cancelAnimationFrame(frameId);
        frameId = window.requestAnimationFrame(draw);
      }
    };

    updateCanvasSize();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    frameId = window.requestAnimationFrame(draw);

    return () => {
      destroyed = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.cancelAnimationFrame(frameId);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [isActive, reducedMotion, uniforms]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
