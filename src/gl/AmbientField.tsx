import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Vec2 } from "ogl";
import { deviceTier } from "@/lib/motion";
import { fieldState } from "@/gl/fieldState";

/**
 * The instrument.
 *
 * One persistent full-viewport canvas that lives behind the whole page. It
 * renders a turbulent field disturbed by the pointer and by scroll velocity.
 *
 * `uOrder` is the spine of the whole site: 0 at the top of the page, 1 at the
 * bottom. As it rises, turbulence decays, bands sharpen and grain drops — the
 * field literally resolves from chaos into order as you read. Every section
 * inherits it rather than inventing its own background.
 *
 * Nothing here goes through React state. Scroll handlers write straight into
 * `fieldState` and the render loop reads it, so it stays smooth at 120Hz.
 */


const VERT = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2  uResolution;
  uniform vec2  uMouse;
  uniform float uVelocity;
  uniform float uOrder;
  uniform float uIntensity;
  varying vec2  vUv;

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
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);

    // Chaos -> system. Everything downstream reads from this.
    float turbulence = mix(1.0, 0.16, uOrder);
    float t = uTime * mix(0.22, 0.06, uOrder);

    // The pointer is an input to the field, not a thing sitting on top of it.
    float d = distance(uv * aspect, uMouse * aspect);
    float pointer = exp(-d * 4.5) * 0.55;

    vec2 q = uv * mix(2.8, 1.35, uOrder);
    q += vec2(fbm(q + t), fbm(q - t * 0.8)) * turbulence * 0.55;
    q += pointer * turbulence;
    q.y += uVelocity * 0.14;

    float n = fbm(q + t * 0.5);
    // Ordered state resolves the mush into clean bands.
    n = mix(n, smoothstep(0.34, 0.78, n), uOrder);

    vec3 deep = vec3(0.039, 0.039, 0.039);
    vec3 teal = vec3(0.0, 0.706, 0.847);

    // Sections no longer carry their own background tints — the page is one
    // continuous field — so this has to stay dark enough to read type over.
    vec3 col = mix(deep, teal, pow(n, 2.6) * mix(0.30, 0.17, uOrder));
    col += teal * pointer * 0.16;
    col += teal * abs(uVelocity) * 0.04;

    // Grain lives here now, so the page doesn't need DOM noise overlays.
    float g = hash(uv * uResolution + fract(uTime));
    col += (g - 0.5) * mix(0.055, 0.02, uOrder);

    // Vignette keeps the middle of the page readable.
    float vig = length((uv - 0.5) * vec2(aspect.x, 1.0));
    col *= 1.0 - 0.62 * vig * vig;

    gl_FragColor = vec4(col * uIntensity, 1.0);
  }
`;

export default function AmbientField() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tier = deviceTier();
    if (tier === 0) return; // static fallback: the page's own background shows

    const host = hostRef.current;
    if (!host) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        alpha: false,
        antialias: false,
        dpr: Math.min(window.devicePixelRatio || 1, tier === 2 ? 1.75 : 1),
        powerPreference: "high-performance",
      });
    } catch {
      return; // context creation failed — leave the CSS background in place
    }

    const gl = renderer.gl;
    gl.clearColor(0.039, 0.039, 0.039, 1);
    host.appendChild(gl.canvas);
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.display = "block";

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new Vec2(1, 1) },
        uMouse: { value: new Vec2(0.5, 0.5) },
        uVelocity: { value: 0 },
        uOrder: { value: 0 },
        uIntensity: { value: 1 },
      },
    });

    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const resize = () => {
      renderer.setSize(host.clientWidth, host.clientHeight);
      program.uniforms.uResolution.value.set(gl.canvas.width, gl.canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    // Smoothed reads, so the field eases rather than snapping.
    let order = 0;
    let velocity = 0;
    let mx = 0.5;
    let my = 0.5;
    let intensity = 1;

    let raf = 0;
    let running = true;
    const start = performance.now();

    const frame = () => {
      if (!running) return;
      const now = performance.now();

      order += (fieldState.order - order) * 0.06;
      velocity += (fieldState.velocity - velocity) * 0.08;
      mx += (fieldState.mouse[0] - mx) * 0.06;
      my += (fieldState.mouse[1] - my) * 0.06;
      intensity += (fieldState.intensity - intensity) * 0.08;

      program.uniforms.uTime.value = (now - start) / 1000;
      program.uniforms.uOrder.value = order;
      program.uniforms.uVelocity.value = velocity;
      program.uniforms.uMouse.value.set(mx, 1 - my);
      program.uniforms.uIntensity.value = intensity;

      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    // Don't burn GPU on a hidden tab.
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onPointer = (e: PointerEvent) => {
      fieldState.mouse[0] = e.clientX / window.innerWidth;
      fieldState.mouse[1] = e.clientY / window.innerHeight;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      gl.canvas.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
}
