/**
 * Shared waveform math for the "Voiceprint" hero — the JS mirror of the
 * fragment shader in Voiceprint.tsx. Used by the pure-code reduced-motion /
 * no-WebGL fallback (Canvas2D static frame + inline SVG polyline).
 *
 * All functions operate on normalized x (0..1 across the viewport) and
 * return y in pixels (positive = upward from the baseline).
 */

function hash1(n: number): number {
  const s = Math.sin(n) * 43758.5453123
  return s - Math.floor(s)
}

function vnoise(x: number): number {
  const i = Math.floor(x)
  const f = x - i
  const u = f * f * (3 - 2 * f)
  return (hash1(i) * (1 - u) + hash1(i + 1) * u) * 2 - 1
}

function smoothstep(e0: number, e1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

/** Base murmur — 3-octave value noise, ~90 cycles/screen, slow drift. */
export function murmur(x: number, t: number): number {
  const p = x * 90 - t * 1.8
  return (vnoise(p) + 0.5 * vnoise(p * 2.13 + 7.7) + 0.25 * vnoise(p * 4.31 + 3.1)) / 1.75
}

/** Activist pulse — 14s cycle: 8s dormant at 15%, 6s swell to full and back. */
export function activistPulse(t: number): number {
  const ph = ((t % 14) + 14) % 14
  if (ph < 8) return 0.15
  const s = (ph - 8) / 6
  return 0.15 + 0.85 * smoothstep(0, 0.4, s) * (1 - smoothstep(0.6, 1, s))
}

export interface WaveParams {
  /** normalized x of swell 1 (Alpha Book) */
  swell1: number
  /** normalized x of swell 2 (Activist Division) */
  swell2: number
  /** amplitude multiplier (0.6 on mobile) */
  ampScale: number
}

/** The full whisper trace y(x, t) in pixels. heightPx = viewport height. */
export function waveY(x: number, t: number, heightPx: number, p: WaveParams): number {
  const A0 = 0.006 * heightPx * p.ampScale
  const A1 = 0.045 * heightPx * p.ampScale
  const A2 = 0.11 * heightPx * p.ampScale
  const g1 = Math.exp(-(((x - p.swell1) / 0.085) ** 2))
  const g2 = Math.exp(-(((x - p.swell2) / 0.06) ** 2))
  return (
    A0 * murmur(x, t) +
    Math.sin(x * 140 - t * 1.1) * A1 * g1 +
    Math.sin(x * 46 - t * 0.5) * A2 * g2 * activistPulse(t)
  )
}

/**
 * X of the carrier crest nearest a swell center — the "marker" column that
 * gets the 2px accent tick dropped to the baseline.
 */
export function crestX(center: number, freq: number, speed: number, t: number): number {
  const k = Math.round((center * freq - t * speed - Math.PI / 2) / (2 * Math.PI))
  return (Math.PI / 2 + 2 * Math.PI * k + t * speed) / freq
}

/** Desktop vs mobile parameter sets (spec §2 / §7). */
export function waveParams(widthPx: number): WaveParams & { baseFracTop: number } {
  const desktop = widthPx >= 768
  return {
    baseFracTop: desktop ? 0.58 : 0.64,
    swell1: desktop ? 0.34 : 0.3,
    swell2: desktop ? 0.71 : 0.72,
    ampScale: desktop ? 1 : 0.6,
  }
}
