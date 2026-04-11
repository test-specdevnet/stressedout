import { useEffect, useRef } from "react";

type LoopShaderCanvasProps = {
  className?: string;
  isActive?: boolean;
};

const VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SOURCE = `
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.58;

  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p = mat2(1.7, -1.2, 1.2, 1.7) * p;
    amplitude *= 0.54;
  }

  return value;
}

vec3 palette(float t) {
  vec3 deep = vec3(0.03, 0.08, 0.17);
  vec3 violet = vec3(0.40, 0.14, 0.82);
  vec3 magenta = vec3(0.91, 0.22, 0.84);
  vec3 aqua = vec3(0.55, 0.94, 1.0);

  vec3 gradient = mix(deep, violet, smoothstep(0.08, 0.48, t));
  gradient = mix(gradient, magenta, smoothstep(0.38, 0.82, t));
  gradient = mix(gradient, aqua, smoothstep(0.7, 1.02, t));
  return gradient;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 centered = uv - 0.5;
  centered.x *= u_resolution.x / max(u_resolution.y, 1.0);

  float loopDuration = 14.0;
  float phase = 6.28318530718 * (u_time / loopDuration);
  vec2 orbit = vec2(cos(phase), sin(phase));

  float fieldA = fbm(centered * 2.2 + orbit * 0.42 + vec2(0.0, phase * 0.08));
  float fieldB = fbm(centered * 3.0 - orbit.yx * 0.34 + vec2(phase * 0.05, -phase * 0.07));
  float ribbon = sin((centered.x * 4.7 - centered.y * 2.3) + phase + fieldA * 3.0);
  float halo = 1.0 - smoothstep(0.08, 0.84, length(centered - orbit * 0.09));

  float energy = fieldA * 0.78 + fieldB * 0.58 + ribbon * 0.14 + halo * 0.26;
  vec3 color = palette(energy + 0.2);

  float streaks = smoothstep(0.34, 0.98, sin(fieldB * 8.0 + phase * 1.25) * 0.5 + 0.5);
  color += vec3(0.12, 0.18, 0.26) * streaks * 0.34;

  vec2 glowOffset = centered + vec2(0.14 * sin(phase * 0.7), -0.09 * cos(phase));
  float glow = 1.0 - smoothstep(0.05, 0.62, length(glowOffset));
  color += vec3(0.16, 0.24, 0.34) * glow * 0.34;

  float vignette = smoothstep(1.08, 0.2, length(centered));
  color *= vignette;

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

export function LoopShaderCanvas({ className, isActive = true }: LoopShaderCanvasProps) {
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
    });

    if (!gl) {
      return;
    }

    const program = createProgram(gl);
    if (!program) {
      return;
    }

    const positionLocation = gl.getAttribLocation(program, "a_position");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const buffer = gl.createBuffer();

    if (!buffer || positionLocation < 0 || !resolutionLocation || !timeLocation) {
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

    let frameId = 0;
    let startTime = 0;
    let destroyed = false;
    let lastWidth = 0;
    let lastHeight = 0;

    const render = (timestamp: number) => {
      if (destroyed) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width * Math.min(window.devicePixelRatio || 1, 1.5)));
      const height = Math.max(1, Math.floor(rect.height * Math.min(window.devicePixelRatio || 1, 1.5)));

      if (width !== lastWidth || height !== lastHeight) {
        lastWidth = width;
        lastHeight = height;
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }

      if (!startTime) {
        startTime = timestamp;
      }

      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, ((timestamp - startTime) * 0.001) % 14.0);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (isActive) {
        frameId = window.requestAnimationFrame(render);
      }
    };

    frameId = window.requestAnimationFrame(render);

    return () => {
      destroyed = true;
      window.cancelAnimationFrame(frameId);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [isActive]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
