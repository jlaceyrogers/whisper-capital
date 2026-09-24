import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import Eyebrow from '@/components/Eyebrow'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/* Animated mini line-chart for the Alpha Book card */
function AlphaChart({ onDraw }: { onDraw: (fn: () => void) => void }) {
  const ref = useRef<SVGSVGElement>(null)
  const draw = () => {
    const paths = ref.current?.querySelectorAll('path[data-draw]')
    paths?.forEach((p, i) => {
      gsap.fromTo(
        p,
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 1.4, delay: i * 0.15, ease: 'expo.out', overwrite: 'auto' },
      )
    })
  }
  useEffect(() => { onDraw(draw) }, [onDraw])
  return (
    <svg
      ref={ref}
      data-chart
      viewBox="0 0 400 120"
      className="mt-auto h-28 w-full"
      fill="none"
      aria-hidden
    >
      <path
        data-draw
        d="M0 100 C 60 92, 90 70, 140 66 S 240 40, 300 30 S 370 14, 400 10"
        stroke="#66cc66"
        strokeWidth="1.5"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1}
      />
      <path
        data-draw
        d="M0 90 C 60 96, 100 104, 150 106 S 260 116, 320 114 S 380 108, 400 106"
        stroke="#A8BFA9"
        strokeOpacity="0.6"
        strokeWidth="1.5"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1}
      />
      <text x="402" y="12" fill="#66cc66" fontSize="9" fontFamily="IBM Plex Mono, monospace" textAnchor="end">
        LONG
      </text>
      <text x="402" y="110" fill="#A8BFA9" fontSize="9" fontFamily="IBM Plex Mono, monospace" textAnchor="end" opacity="0.7">
        SHORT
      </text>
    </svg>
  )
}

/* Four-step process micro-diagram for the Activist card */
function ProcessDiagram({ onDraw }: { onDraw: (fn: () => void) => void }) {
  const ref = useRef<SVGSVGElement>(null)
  const steps = ['IDENTIFY', 'ACCUMULATE', 'ENGAGE', 'TRANSFORM']
  const draw = () => {
    const line = ref.current?.querySelector('path[data-draw]')
    const dots = ref.current?.querySelectorAll('circle')
    if (line)
      gsap.fromTo(line, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.4, ease: 'expo.out', overwrite: 'auto' })
    dots?.forEach((d, i) =>
      gsap.fromTo(d, { opacity: 0 }, { opacity: 1, duration: 0.4, delay: 0.2 + i * 0.3, overwrite: 'auto' }),
    )
  }
  useEffect(() => { onDraw(draw) }, [onDraw])
  return (
    <svg ref={ref} data-chart viewBox="0 0 400 80" className="mt-auto h-20 w-full" fill="none" aria-hidden>
      <path data-draw d="M20 40 H 380" stroke="rgba(102,204,102,0.4)" strokeWidth="1" pathLength={1} strokeDasharray={1} strokeDashoffset={1} />
      {steps.map((s, i) => {
        const x = 20 + i * (360 / 3)
        return (
          <g key={s}>
            <circle cx={x} cy={40} r={3} fill="#66cc66" />
            <text
              x={x}
              y={i % 2 === 0 ? 24 : 66}
              fill="#A8BFA9"
              fontSize="9"
              fontFamily="IBM Plex Mono, monospace"
              textAnchor="middle"
              letterSpacing="2"
            >
              {s}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

const CARDS = [
  {
    tag: 'FUNDAMENTAL LONG/SHORT',
    title: 'Alpha Book',
    body: 'Fundamental long/short in U.S. small- and mid-cap equities. $50M portfolio equity deployed at 3.0x gross — 22 longs, 15 shorts, nine sectors, one shared research process.',
    stats: [
      ['$100M / $50M', 'LONG / SHORT'],
      ['3.0x', 'GROSS'],
      ['$50M', 'NET LONG'],
    ],
    visual: 'alpha' as const,
  },
  {
    tag: 'CATALYST-DRIVEN ACTIVISM',
    title: 'Activist Division',
    body: 'Two single-name SPVs. We identify undervalued mid-cap brands that failed to modernize, accumulate 5–10% positions, and engage boards to transform them.',
    stats: [
      ['02', 'SPVs'],
      ['5–10%', 'TARGET STAKE'],
      ['$125–250M', 'PER VEHICLE'],
    ],
    visual: 'process' as const,
  },
]

export default function DualEngine() {
  const rootRef = useRef<HTMLElement>(null)
  const drawFns = useRef(new Map<string, () => void>())
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const el = rootRef.current
    if (!el || reduced) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-engine-card]').forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 64, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.1,
            delay: i * 0.15,
            ease: 'expo.out',
            scrollTrigger: { trigger: card, start: 'top 75%', once: true },
            onComplete: () => drawFns.current.get(card.dataset.engineCard ?? '')?.(),
          },
        )
      })
    }, el)
    return () => { ctx.revert() }
  }, [reduced])

  return (
    <section
      ref={rootRef}
      className="bg-gradient-to-b from-forest-950 to-forest-900 py-[88px] md:py-40"
      aria-label="The platform"
    >
      <div className="mx-auto max-w-container px-5 md:px-12">
        <Eyebrow index="01" label="THE PLATFORM" />

        <div className="mt-20 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {CARDS.map((c) => (
            <article
              key={c.title}
              data-engine-card={c.title}
              onMouseEnter={() => drawFns.current.get(c.title)?.()}
              className="group relative flex min-h-[560px] flex-col overflow-hidden rounded-[2px] border border-[rgba(102,204,102,0.14)] bg-forest-800 p-8 transition-all duration-500 ease-out-expo hover:-translate-y-2 hover:border-[rgba(102,204,102,0.45)] md:p-12"
            >
              {/* top-edge glow line on hover */}
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-mint-400 transition-transform duration-500 ease-out-expo group-hover:scale-x-100"
              />
              <span className="inline-flex w-fit rounded-full bg-[rgba(102,204,102,0.1)] px-[14px] py-[6px] font-mono text-[0.68rem] uppercase tracking-nav text-mint-200">
                {c.tag}
              </span>
              <h3 className="mt-8 font-serif text-h3 font-medium text-white">{c.title}</h3>
              <p className="mt-5 max-w-[52ch] text-[1rem] leading-[1.7] text-fog">{c.body}</p>
              <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
                {c.stats.map(([v, l]) => (
                  <div key={l}>
                    <span className="font-mono text-lg text-mint-200">{v}</span>
                    <p className="mt-1 font-mono text-[0.68rem] uppercase tracking-nav text-fog/70">{l}</p>
                  </div>
                ))}
              </div>
              {c.visual === 'alpha' ? (
                <AlphaChart onDraw={(fn) => drawFns.current.set(c.title, fn)} />
              ) : (
                <ProcessDiagram onDraw={(fn) => drawFns.current.set(c.title, fn)} />
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
