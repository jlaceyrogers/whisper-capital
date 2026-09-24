import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { animateCounter } from '@/lib/counter'
import Eyebrow from '@/components/Eyebrow'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const TILES = [
  { value: 37, prefix: '', suffix: '', label: 'POSITIONS', sub: '22 LONG / 15 SHORT' },
  { value: 9, prefix: '', suffix: '', label: 'SECTORS', sub: 'PRIMARILY U.S.' },
  { value: 3.0, prefix: '', suffix: 'x', decimals: 1, label: 'GROSS EXPOSURE', sub: '$150M ON $50M EQUITY' },
  { value: 250, prefix: '~$', suffix: 'M', label: 'TARGETED RAISE', sub: 'LARGE FAMILY OFFICES' },
]

export default function ByTheNumbers() {
  const rootRef = useRef<HTMLElement>(null)
  const numRefs = useRef<(HTMLSpanElement | null)[]>([])
  const reduced = usePrefersReducedMotion()
  const [tip, setTip] = useState<string | null>(null)
  const tipX = useMotionValue(0)
  const tipY = useMotionValue(0)
  const stX = useSpring(tipX, { stiffness: 300, damping: 30 })
  const stY = useSpring(tipY, { stiffness: 300, damping: 30 })

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    if (reduced) {
      numRefs.current.forEach((n, i) => {
        if (n)
          n.textContent =
            TILES[i].prefix + TILES[i].value.toFixed(TILES[i].decimals ?? 0) + TILES[i].suffix
      })
      return
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-tile]',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.1,
          ease: 'expo.out',
          scrollTrigger: { trigger: '[data-tiles]', start: 'top 78%', once: true },
        },
      )
      ScrollTrigger.create({
        trigger: '[data-tiles]',
        start: 'top 78%',
        once: true,
        onEnter: () =>
          numRefs.current.forEach((n, i) => {
            if (!n) return
            animateCounter(n, TILES[i].value, {
              duration: 1.6,
              decimals: TILES[i].decimals ?? 0,
              prefix: TILES[i].prefix,
              suffix: TILES[i].suffix,
              delay: i * 0.1,
            })
          }),
      })
      // exposure bar
      gsap.fromTo(
        '[data-seg-long]',
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.3,
          ease: 'expo.out',
          scrollTrigger: { trigger: '[data-exposure]', start: 'top 80%', once: true },
        },
      )
      gsap.fromTo(
        '[data-seg-short]',
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.3,
          delay: 0.2,
          ease: 'expo.out',
          scrollTrigger: { trigger: '[data-exposure]', start: 'top 80%', once: true },
        },
      )
      gsap.fromTo(
        '[data-seg-label]',
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.6,
          delay: 0.9,
          stagger: 0.1,
          scrollTrigger: { trigger: '[data-exposure]', start: 'top 80%', once: true },
        },
      )
      gsap.fromTo(
        '[data-net-marker]',
        { opacity: 0, y: -8 },
        {
          opacity: 1,
          y: 4,
          duration: 0.5,
          delay: 1.3,
          ease: 'expo.out',
          scrollTrigger: { trigger: '[data-exposure]', start: 'top 80%', once: true },
        },
      )
    }, el)
    return () => { ctx.revert() }
  }, [reduced])

  const onSegMove = (e: React.MouseEvent, label: string) => {
    tipX.set(e.clientX)
    tipY.set(e.clientY)
    setTip(label)
  }

  return (
    <section ref={rootRef} className="bg-ivory py-[88px] text-ink md:py-40" aria-label="Exposure">
      <div className="mx-auto max-w-container px-5 md:px-12">
        <Eyebrow index="02" label="EXPOSURE" onDark={false} />
        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <p className="max-w-[62ch] font-sans text-lede text-ink-soft lg:col-span-6">
            Position count, sector mix, and gross and net exposure for the alpha book.
          </p>
        </div>

        {/* Row 1 — stat tiles */}
        <div data-tiles className="mt-20 grid grid-cols-2 border-t border-[rgba(0,51,0,0.12)] lg:grid-cols-4">
          {TILES.map((t, i) => (
            <div
              key={t.label}
              data-tile
              className="border-b border-r border-[rgba(0,51,0,0.12)] px-6 py-10 first:border-l lg:py-14"
            >
              <span
                ref={(r) => {
                  numRefs.current[i] = r
                }}
                className="font-mono text-stat text-ink"
              >
                {t.prefix}0{t.suffix}
              </span>
              <p className="mt-4 font-mono text-[0.68rem] uppercase tracking-nav text-ink-soft">{t.label}</p>
              <p className="mt-1 font-mono text-[0.68rem] uppercase tracking-nav text-ink-soft/60">{t.sub}</p>
            </div>
          ))}
        </div>

        {/* Row 2 — exposure anatomy bar */}
        <div data-exposure className="relative mt-24">
          <div className="flex font-mono text-[0.68rem] uppercase tracking-nav text-ink-soft">
            <span data-seg-label className="w-2/3">LONG — $100M</span>
            <span data-seg-label className="w-1/3 text-right">SHORT — $50M</span>
          </div>
          <div className="mt-3 flex h-16 overflow-hidden rounded-[2px]">
            <div
              data-seg-long
              onMouseMove={(e) => onSegMove(e, 'LONG $100M — 22 NAMES')}
              onMouseLeave={() => setTip(null)}
              className="w-2/3 origin-left bg-gradient-to-r from-green-500 to-mint-400 transition-[filter] duration-300 hover:brightness-110"
            />
            <div
              data-seg-short
              onMouseMove={(e) => onSegMove(e, 'SHORT $50M — 15 NAMES')}
              onMouseLeave={() => setTip(null)}
              className="w-1/3 origin-left border border-forest-700 transition-colors duration-300 hover:bg-[rgba(0,102,0,0.08)]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, rgba(0,102,0,0.25) 0 1px, transparent 1px 8px)',
              }}
            />
          </div>
          <div className="mt-3 flex font-mono text-[0.68rem] uppercase tracking-nav text-ink-soft">
            <span data-seg-label>66.6% OF GROSS</span>
            <span data-seg-label className="ml-auto">33.3% OF GROSS</span>
          </div>
          {/* net marker */}
          <div data-net-marker className="pointer-events-none absolute left-2/3 top-0 -translate-x-1/2">
            <div className="mx-auto h-[104px] w-px bg-forest-700/60" />
            <div className="mt-2 flex items-center justify-center gap-2 whitespace-nowrap font-mono text-[0.68rem] uppercase tracking-nav text-forest-700">
              <span className="inline-block h-1.5 w-1.5 rotate-45" style={{ background: '#009900' }} />
              NET +$50M LONG
            </div>
          </div>
        </div>
      </div>

      {/* hover tooltip */}
      {tip && (
        <motion.div
          className="pointer-events-none fixed z-50 rounded-[2px] border border-forest-700/30 bg-forest-1000 px-3 py-2 font-mono text-[0.68rem] uppercase tracking-nav text-mint-200"
          style={{ x: stX, y: stY, translateX: '-50%', translateY: '-160%' }}
        >
          {tip}
        </motion.div>
      )}
    </section>
  )
}
