import { useEffect, useMemo, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'

/**
 * "Voiceprint" — the Decibel of Money WebGL visual (home-hero-v2.md §3).
 * One 2D fullscreen quad, custom fragment shader: a single 0.75px whisper
 * waveform on a ruled axis — dense micro-murmur, two engine swells (Alpha
 * Book carrier at 0.34, Activist pulse at 0.71), ruler ticks, crest marker
 * ticks, a mirrored echo, an entry "pen nib" draw (uEntry), scroll quieting
 * (uScrollFade) and a subtle pointer warp. O(1) per pixel; no meshes.
 *
 * Pauses via IntersectionObserver + document.hidden (frameloop toggle).
 * DPR capped at 1.75. Canvas aria-hidden; all copy is real HTML.
 */

export interface VoiceprintShared {
  /** 0→1 entry draw progress (nib x across the viewport) */
  entry: number
  /** 0→1 scroll-out quieting */
  scrollFade: number
}

const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2 uRes;        // drawing buffer px
  uniform vec2 uPointer;    // normalized x (offscreen when < -5)
  uniform float uEntry;     // 0..1 nib progress
  uniform float uScrollFade;// 0..1 quieting
  uniform float uBaseY;     // baseline fraction from bottom
  uniform vec2 uSwell;      // swell centers (normalized x)
  uniform float uAmpScale;

  const vec3 MINT = vec3(0.4, 0.8, 0.4);     // #66cc66
  const vec3 MINT100 = vec3(0.8, 1.0, 0.8);  // #ccffcc

  float hash1(float n) { return fract(sin(n) * 43758.5453123); }
  float vnoise(float x) {
    float i = floor(x);
    float f = fract(x);
    float u = f * f * (3.0 - 2.0 * f);
    return mix(hash1(i), hash1(i + 1.0), u) * 2.0 - 1.0;
  }
  float murmur(float x, float t) {
    float p = x * 90.0 - t * 1.8;
    return (vnoise(p) + 0.5 * vnoise(p * 2.13 + 7.7) + 0.25 * vnoise(p * 4.31 + 3.1)) / 1.75;
  }
  float activistPulse(float t) {
    float ph = mod(t, 14.0);
    if (ph < 8.0) return 0.15;
    float s = (ph - 8.0) / 6.0;
    return 0.15 + 0.85 * smoothstep(0.0, 0.4, s) * (1.0 - smoothstep(0.6, 1.0, s));
  }
  // each swell blooms over 0.6s (0.27 of the 2.2s entry) as the nib passes
  float bloom(float center) {
    return smoothstep(center, center + 0.27, uEntry);
  }
  float waveY(float x, float t, out float g1, out float g2) {
    float H = uRes.y;
    g1 = exp(-pow((x - uSwell.x) / 0.085, 2.0));
    g2 = exp(-pow((x - uSwell.y) / 0.06, 2.0));
    float fade = 1.0 - uScrollFade * 0.85;
    float gw = exp(-pow((x - uPointer.x) / 0.08, 2.0));
    float y = 0.006 * H * uAmpScale * murmur(x, t) * (1.0 + 1.2 * gw);
    y += sin(x * 140.0 - t * 1.1) * 0.045 * H * uAmpScale * g1 * bloom(uSwell.x);
    y += sin(x * 46.0 - t * 0.5) * 0.11 * H * uAmpScale * g2 * bloom(uSwell.y) * activistPulse(t);
    return y * fade;
  }
  void over(inout vec4 dst, vec3 c, float a) {
    a = clamp(a, 0.0, 1.0);
    dst.rgb = mix(dst.rgb, c, a);
    dst.a = max(dst.a, a);
  }
  // 2px accent tick from the carrier crest nearest the swell center to the baseline
  float crestTick(float center, float freq, float speed, float env, vec2 px, float baseY, float t) {
    float k = floor((center * freq - t * speed - 1.5707963) / 6.2831853 + 0.5);
    float mx = (1.5707963 + 6.2831853 * k + t * speed) / freq;
    float d1;
    float d2;
    float my = waveY(mx, t, d1, d2);
    float hi = baseY + my;
    float lo = min(hi, baseY);
    float top = max(hi, baseY);
    float inX = 1.0 - smoothstep(0.5, 1.0, abs(px.x - mx * uRes.x));
    float inY = step(lo - 0.5, px.y) * (1.0 - step(top + 0.5, px.y));
    return inX * inY * env;
  }
  void main() {
    vec2 px = gl_FragCoord.xy;
    float x = px.x / uRes.x;
    float baseY = uBaseY * uRes.y;
    float t = uTime;

    // entry reveal — nib at uEntry across the width, 2px soft leading edge
    float nibX = uEntry * uRes.x;
    float reveal = 1.0 - smoothstep(-2.0, 0.0, px.x - nibX);

    vec4 acc = vec4(0.0);

    // axis ruler ticks — 1px every 64px, 6px tall; 14px at swell centers
    float tick = (1.0 - step(1.0, mod(px.x, 64.0))) * step(baseY, px.y) * (1.0 - step(baseY + 6.0, px.y));
    float tall1 = (1.0 - smoothstep(0.5, 1.0, abs(px.x - uSwell.x * uRes.x))) * step(baseY, px.y) * (1.0 - step(baseY + 14.0, px.y));
    float tall2 = (1.0 - smoothstep(0.5, 1.0, abs(px.x - uSwell.y * uRes.x))) * step(baseY, px.y) * (1.0 - step(baseY + 14.0, px.y));
    over(acc, MINT, tick * 0.18 * reveal);
    over(acc, MINT, max(tall1, tall2) * 0.3 * reveal);

    float g1;
    float g2;
    float y = waveY(x, t, g1, g2);
    float envMax = clamp(max(g1, g2) * 0.8, 0.0, 1.0);
    vec3 traceCol = mix(MINT, MINT100, envMax);

    // echo — mirrored, compressed x0.35, 12% opacity, decaying over 96px
    float ey = baseY - y * 0.35;
    float dEcho = abs(px.y - ey);
    float echoA = (1.0 - smoothstep(0.4, 1.5, dEcho))
      * 0.12 * clamp(1.0 - (baseY - px.y) / 96.0, 0.0, 1.0) * reveal;
    over(acc, traceCol, echoA);

    // main trace — 0.75px anti-aliased band
    float d = abs(px.y - (baseY + y));
    float lineA = (1.0 - smoothstep(0.375, 1.5, d)) * reveal;
    float gw = exp(-pow((x - uPointer.x) / 0.08, 2.0));
    over(acc, traceCol * (1.0 + 0.25 * gw), lineA * 0.55);

    // crest markers
    over(acc, MINT, crestTick(uSwell.x, 140.0, 1.1, g1 * bloom(uSwell.x), px, baseY, t) * 0.9 * reveal);
    over(acc, MINT, crestTick(uSwell.y, 46.0, 0.5, g2 * bloom(uSwell.y) * activistPulse(t), px, baseY, t) * 0.9 * reveal);

    // pen nib — 3px #ccffcc dot riding the leading point
    float n1;
    float n2;
    float ny = waveY(clamp(uEntry, 0.0, 1.0), t, n1, n2);
    float dn = length(px - vec2(nibX, baseY + ny));
    float nibA = (1.0 - smoothstep(1.5, 3.0, dn))
      * (1.0 - smoothstep(0.985, 1.0, uEntry)) * step(0.001, uEntry);
    over(acc, MINT100, nibA);

    // the whisper quiets as you leave
    acc.a *= 1.0 - uScrollFade * 0.7;

    gl_FragColor = acc;
  }
`

function Trace({ shared }: { shared: MutableRefObject<VoiceprintShared> }) {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const sizeRef = useRef(new THREE.Vector2(1, 1))
  const pointer = useRef({ x: -10, initialized: false })
  const target = useRef(-10)
  const coarse = useRef(false)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uPointer: { value: new THREE.Vector2(-10, 0) },
      uEntry: { value: 0 },
      uScrollFade: { value: 0 },
      uBaseY: { value: 0.42 },
      uSwell: { value: new THREE.Vector2(0.34, 0.71) },
      uAmpScale: { value: 1 },
    }),
    [],
  )

  useEffect(() => {
    coarse.current = window.matchMedia('(pointer: coarse)').matches
    // desktop / mobile parameter sets, mirroring the DOM axis position
    const mq = window.matchMedia('(min-width: 768px)')
    const apply = () => {
      const d = mq.matches
      uniforms.uBaseY.value = d ? 0.42 : 0.36
      uniforms.uSwell.value.set(d ? 0.34 : 0.3, d ? 0.71 : 0.72)
      uniforms.uAmpScale.value = d ? 1 : 0.6
    }
    apply()
    mq.addEventListener('change', apply)
    // window-level pointer tracking (content zones overlay the canvas)
    const onMove = (e: PointerEvent) => {
      if (coarse.current) return
      target.current = e.clientX / Math.max(window.innerWidth, 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      mq.removeEventListener('change', apply)
      window.removeEventListener('pointermove', onMove)
    }
  }, [uniforms])

  useFrame((state) => {
    const mat = matRef.current
    if (!mat) return
    state.gl.getDrawingBufferSize(sizeRef.current)
    mat.uniforms.uRes.value.copy(sizeRef.current)
    mat.uniforms.uTime.value = state.clock.elapsedTime
    mat.uniforms.uEntry.value = shared.current.entry
    mat.uniforms.uScrollFade.value = shared.current.scrollFade
    if (!coarse.current) {
      if (!pointer.current.initialized && target.current > -5) {
        pointer.current.x = target.current
        pointer.current.initialized = true
      }
      pointer.current.x += (target.current - pointer.current.x) * 0.05
    }
    mat.uniforms.uPointer.value.x = pointer.current.x
  })

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  )
}

export default function Voiceprint({ shared }: { shared: MutableRefObject<VoiceprintShared> }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(true)

  /* Pause rendering off-viewport and when the tab is hidden */
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting && !document.hidden),
      { threshold: 0 },
    )
    io.observe(el)
    const onVis = () => setActive(!document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return (
    <div ref={wrapRef} className="absolute inset-0" aria-hidden>
      <Canvas
        frameloop={active ? 'always' : 'never'}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <Trace shared={shared} />
      </Canvas>
    </div>
  )
}
