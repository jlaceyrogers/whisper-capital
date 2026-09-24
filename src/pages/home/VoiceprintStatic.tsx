import { useEffect, useMemo, useRef, useState } from 'react'
import { activistPulse, crestX, waveParams, waveY } from './voiceprintMath'

/**
 * Pure-code reduced-motion / no-WebGL fallback for the Voiceprint hero
 * (home-hero-v2.md §3). Renders ONE static frame of the exact same waveform
 * composition at t = 7.3s (a handsome Activist mid-swell) with Canvas2D
 * strokes: base trace + two swells + echo + ruler ticks + crest markers,
 * identical colors. If Canvas2D is unavailable, an inline SVG polyline
 * (240 points, same function) ships in the markup instead.
 * No image assets. aria-hidden — all copy is real HTML in Hero.tsx.
 */

const T = 7.3

export default function VoiceprintStatic() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvasOk, setCanvasOk] = useState(true)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    let ctx: CanvasRenderingContext2D | null = null
    try {
      ctx = canvas.getContext('2d')
    } catch {
      ctx = null
    }
    if (!ctx) {
      setCanvasOk(false)
      return
    }
    const c = ctx

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
      const w = wrap.clientWidth
      const h = wrap.clientHeight
      if (!w || !h) return
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      c.setTransform(dpr, 0, 0, dpr, 0, 0)
      c.clearRect(0, 0, w, h)

      const p = waveParams(w)
      const baseY = h * p.baseFracTop
      const yAt = (x: number) => waveY(x, T, h, p)

      // ruler ticks — every 64px, 6px above the baseline
      c.strokeStyle = 'rgba(102,204,102,0.18)'
      c.lineWidth = 1
      c.beginPath()
      for (let tx = 0; tx <= w; tx += 64) {
        c.moveTo(tx + 0.5, baseY)
        c.lineTo(tx + 0.5, baseY - 6)
      }
      c.stroke()
      // taller 14px ticks at the swell centers
      c.strokeStyle = 'rgba(102,204,102,0.3)'
      c.beginPath()
      for (const sx of [p.swell1, p.swell2]) {
        c.moveTo(sx * w + 0.5, baseY)
        c.lineTo(sx * w + 0.5, baseY - 14)
      }
      c.stroke()

      // echo — mirrored, compressed x0.35, fading over 96px below the baseline
      const grad = c.createLinearGradient(0, baseY, 0, baseY + 96)
      grad.addColorStop(0, 'rgba(102,204,102,0.12)')
      grad.addColorStop(1, 'rgba(102,204,102,0)')
      c.strokeStyle = grad
      c.beginPath()
      for (let i = 0; i <= 480; i++) {
        const x = i / 480
        const ey = baseY + yAt(x) * 0.35
        if (i === 0) c.moveTo(0, ey)
        else c.lineTo(x * w, ey)
      }
      c.stroke()

      // main trace — per-segment stroke, lerping toward #ccffcc in the swells
      const N = 480
      c.lineWidth = 1
      for (let i = 0; i < N; i++) {
        const x0 = i / N
        const x1 = (i + 1) / N
        const xm = (x0 + x1) / 2
        const g1 = Math.exp(-(((xm - p.swell1) / 0.085) ** 2))
        const g2 = Math.exp(-(((xm - p.swell2) / 0.06) ** 2))
        const m = Math.min(1, Math.max(g1, g2) * 0.8)
        const r = Math.round(102 + (204 - 102) * m)
        const g = Math.round(204 + (255 - 204) * m)
        const b = Math.round(102 + (255 - 102) * m)
        c.strokeStyle = `rgba(${r},${g},${b},0.55)`
        c.beginPath()
        c.moveTo(x0 * w, baseY - yAt(x0))
        c.lineTo(x1 * w, baseY - yAt(x1))
        c.stroke()
      }

      // crest markers — 2px #66cc66 ticks from crest to baseline
      c.strokeStyle = '#66cc66'
      c.lineWidth = 2
      const markers: Array<[number, number]> = [
        [crestX(p.swell1, 140, 1.1, T), 1],
        [crestX(p.swell2, 46, 0.5, T), activistPulse(T)],
      ]
      for (const [mx, strength] of markers) {
        if (mx < -0.05 || mx > 1.05) continue
        c.globalAlpha = strength
        c.beginPath()
        c.moveTo(mx * w, baseY - yAt(mx))
        c.lineTo(mx * w, baseY)
        c.stroke()
        c.globalAlpha = 1
      }
    }

    draw()
    let raf = 0
    const onResize = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(draw)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(raf)
    }
  }, [])

  /* Last-resort inline SVG (Canvas2D unavailable) — same function, 240 pts */
  const svg = useMemo(() => {
    if (canvasOk) return null
    const W = 1200
    const H = 675
    const p = waveParams(W)
    const baseY = H * p.baseFracTop
    let trace = ''
    let echo = ''
    for (let i = 0; i <= 240; i++) {
      const x = i / 240
      const y = waveY(x, T, H, p)
      trace += `${i === 0 ? 'M' : 'L'}${(x * W).toFixed(1)} ${(baseY - y).toFixed(1)} `
      echo += `${i === 0 ? 'M' : 'L'}${(x * W).toFixed(1)} ${(baseY + y * 0.35).toFixed(1)} `
    }
    let ticks = ''
    for (let tx = 0; tx <= W; tx += 64) ticks += `M${tx} ${baseY} v-6 `
    ticks += `M${p.swell1 * W} ${baseY} v-14 M${p.swell2 * W} ${baseY} v-14 `
    return { trace, echo, ticks, baseY }
  }, [canvasOk])

  return (
    <div ref={wrapRef} className="absolute inset-0" aria-hidden>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: canvasOk ? 'block' : 'none',
        }}
      />
      {!canvasOk && svg && (
        <svg
          viewBox="0 0 1200 675"
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        >
          <path d={svg.ticks} stroke="rgba(102,204,102,0.18)" strokeWidth="1" fill="none" />
          <path d={svg.echo} stroke="rgba(102,204,102,0.12)" strokeWidth="1" fill="none" />
          <path d={svg.trace} stroke="rgba(102,204,102,0.55)" strokeWidth="1" fill="none" />
        </svg>
      )}
    </div>
  )
}
