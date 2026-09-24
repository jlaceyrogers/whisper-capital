import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import { scrollToTarget } from '@/lib/lenis'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import VoiceprintStatic from '@/pages/home/VoiceprintStatic'
import type { VoiceprintShared } from '@/pages/home/Voiceprint'
import Wordmark from '@/components/Wordmark'

const Voiceprint = lazy(() => import('@/pages/home/Voiceprint'))

/**
 * Home Hero v2 — "The Decibel of Money" (home-hero-v2.md).
 * One whisper-waveform hairline on a ruled axis at 58vh, a factual
 * subhead on the right, and swell labels pinned to the two
 * engines. No particle field, no glow, no slogans.
 * Respects the preloader `revealed` hand-off: choreography is synced to
 * the curtain opening (t=0 = curtain start) so the signature line is
 * ~60% drawn as the curtains clear.
 */

function supportsWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")"

const SUBHEAD_LINES = [
  'Whisper Capital Management is a fundamental',
  'long/short hedge fund focused on small- and',
  'mid-capitalization US equities. Our research is',
  'bottom-up and company-by-company, concentrated',
  'in the part of the market where coverage is thin',
  'and mispricings persist.',
]

export default function Hero({ revealed }: { revealed: boolean }) {
  const rootRef = useRef<HTMLElement>(null)
  const shared = useRef<VoiceprintShared>({ entry: 0, scrollFade: 0 })
  const ctxRef = useRef<ReturnType<typeof gsap.context> | null>(null)
  const scrollCtxRef = useRef<ReturnType<typeof gsap.context> | null>(null)
  const startedRef = useRef(false)
  const reduced = usePrefersReducedMotion()
  const [webgl] = useState(() => !reduced && supportsWebGL())

  const showGL = webgl && !reduced

  /* Scroll-out — the whisper quiets as you leave (scrub 0.8, first 100vh).
     Created ONLY after the entry choreography completes: building these
     scrubbed tweens at mount lets a stray ScrollTrigger.refresh() snap the
     entry targets back to their hidden start states (blank hero). */
  const startScrollOut = () => {
    if (reduced || scrollCtxRef.current) return
    const el = rootRef.current
    if (!el) return
    scrollCtxRef.current = gsap.context(() => {
      // zones C/E: parallax up at 0.5×, fade out — kicker first, subhead last
      const zones: Array<[string, number]> = [
        ['[data-zone="c"]', 0.1],
        ['[data-zone="e"]', 0.2],
      ]
      zones.forEach(([sel, offset]) => {
        const zt = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: () => `+=${window.innerHeight}`,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        })
        zt.fromTo(sel, { y: 0 }, { y: () => -window.innerHeight * 0.5, ease: 'none', duration: 1 }, 0).fromTo(
          sel,
          { opacity: 1 },
          { opacity: 0, ease: 'none', duration: 0.6 },
          offset,
        )
      })
      // waveform flattens and dims
      gsap.fromTo(
        shared.current,
        { scrollFade: 0 },
        {
          scrollFade: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: () => `+=${window.innerHeight}`,
            scrub: 0.8,
          },
        },
      )
      // the ruled baseline persists, then fades over its last ~12vh
      gsap.to('[data-axis-wrap]', {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: () => `top+=${window.innerHeight * 0.46} top`,
          end: () => `top+=${window.innerHeight * 0.58} top`,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      })
    }, el)
  }

  /* Entry choreography — begins as the preloader curtains start opening */
  useEffect(() => {
    if (startedRef.current) return
    const el = rootRef.current
    if (!el) return

    const begin = () => {
      if (startedRef.current) return
      startedRef.current = true
      if (reduced) {
        // instant, readable state — static waveform, all copy visible
        shared.current.entry = 1
        el.querySelectorAll('[data-kicker], [data-instrument], [data-scroll-cue]').forEach((n) =>
          n.classList.remove('opacity-0'),
        )
        el.querySelectorAll('[data-axis], [data-kicker-line]').forEach((n) => n.classList.remove('scale-x-0'))
        el.querySelectorAll('[data-sub] > span > span').forEach((n) => n.classList.remove('translate-y-full'))
        return
      }
      ctxRef.current = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
        // t=0 — the signature: waveform + baseline draw left→right over 2.2s
        tl.to(shared.current, { entry: 1, duration: 2.2 }, 0)
          .fromTo('[data-axis]', { scaleX: 0 }, { scaleX: 1, duration: 2.2 }, 0)
          .fromTo('[data-kicker-line]', { scaleX: 0 }, { scaleX: 1, duration: 0.8 }, 0.2)
          .fromTo('[data-kicker]', { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.2)
          .fromTo('[data-sub] > span > span', { y: '110%' }, { y: 0, duration: 1.1, stagger: 0.09 }, 2.5)
          .fromTo(
            '[data-instrument]',
            { y: 12, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.08 },
            2.8,
          )
          .fromTo('[data-scroll-cue]', { opacity: 0 }, { opacity: 1, duration: 0.8 }, 3.0)
          // t=3.9 — entry complete; only now arm the scroll-out triggers
          .call(startScrollOut, [], 3.9)
      }, el)
    }

    if (revealed) {
      begin()
      return
    }
    if (reduced) return // reduced preloader hands off within a frame
    // Preloader active — sync t=0 to the curtain opening (1.8s after mount).
    // If the hand-off arrives earlier, begin() runs then instead.
    const id = window.setTimeout(begin, 1800)
    return () => window.clearTimeout(id)
  }, [revealed, reduced])

  useEffect(
    () => () => {
      ctxRef.current?.revert()
      scrollCtxRef.current?.revert()
    },
    [],
  )

  return (
    <section
      ref={rootRef}
      data-cursor="LISTEN"
      className="relative -mt-20 flex flex-col overflow-hidden bg-forest-950"
      style={{ minHeight: 'max(680px, 100dvh)' }}
      aria-label="Introduction"
    >
      {/* Voiceprint — WebGL shader, or the pure-code static frame */}
      {showGL ? (
        <Suspense fallback={null}>
          <Voiceprint shared={shared} />
        </Suspense>
      ) : (
        <VoiceprintStatic />
      )}

      {/* The Baseline — system hairline at 58vh (64vh on mobile) */}
      <div data-axis-wrap className="absolute inset-x-0 top-[64%] md:top-[58%]" aria-hidden>
        <div data-axis className="h-px w-full origin-left scale-x-0 bg-[rgba(212,172,82,0.14)]" />
      </div>

      {/* B. Axis labels — engine names pinned to the swell centers */}
      <div className="absolute left-[30vw] top-[calc(64%+10px)] z-10 -translate-x-1/2 md:left-[34vw] md:top-[calc(58%+10px)]">
        <span data-instrument className="flex items-center gap-2 opacity-0">
          <span aria-hidden className="h-[6px] w-px bg-mint-400" />
          <span className="font-mono text-[0.6rem] uppercase tracking-nav text-fog md:text-[0.68rem]">
            01 — The Alpha Book
          </span>
        </span>
      </div>
      <div className="absolute left-[72vw] top-[calc(64%+10px)] z-10 -translate-x-1/2 max-[360px]:top-[calc(64%+24px)] md:left-[71vw] md:top-[calc(58%+10px)]">
        <span data-instrument className="flex items-center gap-2 opacity-0">
          <span aria-hidden className="h-[6px] w-px bg-mint-400" />
          <span className="font-mono text-[0.6rem] uppercase tracking-nav text-fog md:text-[0.68rem]">
            02 — The Engagement Division
          </span>
        </span>
      </div>

      {/* Content zones */}
      <div className="relative z-10 mx-auto w-full max-w-container flex-1 px-5 pb-24 pt-[120px] md:px-12 lg:absolute lg:inset-0 lg:pb-0 lg:pt-0">
        {/* C. Wordmark context block */}
        <div data-zone="c" className="lg:absolute lg:left-12 lg:top-[120px] lg:max-w-md">
          <div data-kicker className="mb-10 opacity-0">
            <Wordmark size="lg" />
          </div>
          <div className="flex items-center gap-4">
            <span data-kicker-line className="h-px w-10 origin-left scale-x-0 bg-mint-400" />
            <span className="font-mono text-[0.72rem] font-medium uppercase tracking-eyebrow text-mint-400">
              <span data-kicker className="opacity-0">[ A Dual-Engine Investment Firm ]</span>
            </span>
          </div>
          <p data-kicker className="mt-4 font-sans text-[0.8rem] font-bold uppercase tracking-wordmark text-fog opacity-0">
            Whisper Capital Management — Miami
          </p>
        </div>

        {/* E — right column locked to the axis on desktop */}
        <div className="relative mt-14 flex flex-col lg:absolute lg:right-12 lg:top-[58%] lg:mt-0 lg:w-1/2 lg:items-end lg:text-right">
          {/* E. Subhead */}
          <p data-zone="e" data-sub className="mt-8 max-w-full font-sans text-lede text-fog lg:max-w-[40ch]">
            {SUBHEAD_LINES.map((line) => (
              <span key={line} className="block overflow-hidden">
                <span className="block translate-y-full">{line}</span>
              </span>
            ))}
          </p>
        </div>

      </div>

      {/* H. Scroll cue */}
      <button
        type="button"
        data-scroll-cue
        onClick={() => scrollToTarget(window.innerHeight)}
        className="absolute bottom-12 right-5 z-10 flex flex-col items-center gap-3 opacity-0 md:right-12"
        aria-label="Scroll to next section"
      >
        <span className="font-mono text-[0.68rem] uppercase tracking-nav text-fog [writing-mode:vertical-rl]">
          Scroll
        </span>
        <span className="relative h-12 w-px bg-[rgba(212,172,82,0.2)]">
          <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 animate-scroll-dot rounded-full bg-mint-400" />
        </span>
      </button>

      {/* film grain — retained from v1, top layer */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />
    </section>
  )
}
