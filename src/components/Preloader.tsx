import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const WORDMARK = 'WHISPER CAPITAL'

/**
 * Home preloader (design.md §7.7 / home.md §0) — mono counter 000→100,
 * hairline fill, wordmark stagger, twin-curtain reveal. Skipped on repeat
 * visits within the session. Total duration ≤ 2.8s.
 */
export default function Preloader({ onDone }: { onDone: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    if (reduced) {
      // Instant reveal (deferred to avoid sync setState in effect)
      const id = requestAnimationFrame(() => {
        setGone(true)
        onDone()
      })
      return () => cancelAnimationFrame(id)
    }
    const ctx = gsap.context(() => {
      const counter = { v: 0 }
      const tl = gsap.timeline({
        defaults: { ease: 'expo.out' },
        onComplete: () => {
          setGone(true)
          onDone()
        },
      })
      tl.to(counter, {
        v: 100,
        duration: 1.4,
        onUpdate: () => {
          if (counterRef.current)
            counterRef.current.textContent = String(Math.round(counter.v)).padStart(3, '0')
          if (fillRef.current) fillRef.current.style.transform = `scaleX(${counter.v / 100})`
        },
      })
        .fromTo(
          '[data-letter]',
          { y: 8, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.03 },
          1.1,
        )
        .to('[data-curtain-top]', { scaleY: 0, duration: 1.0, ease: 'quart.inOut' }, 1.8)
        .to('[data-curtain-bottom]', { scaleY: 0, duration: 1.0, ease: 'quart.inOut' }, 1.8)
        .to('[data-preloader-ui]', { opacity: 0, duration: 0.4 }, 1.8)
    }, el)
    return () => { ctx.revert() }
  }, [reduced, onDone])

  if (gone) return null

  return (
    <div ref={rootRef} className="fixed inset-0 z-[200]" aria-hidden>
      {/* curtains */}
      <div data-curtain-top className="absolute inset-x-0 top-0 h-1/2 origin-top bg-forest-1000" />
      <div data-curtain-bottom className="absolute inset-x-0 bottom-0 h-1/2 origin-bottom bg-forest-1000" />
      {/* UI */}
      <div data-preloader-ui className="absolute inset-0 flex flex-col items-center justify-center gap-8">
        <div className="flex overflow-hidden font-sans text-[0.8rem] font-bold uppercase tracking-wordmark text-fog">
          {WORDMARK.split('').map((c, i) => (
            <span key={i} data-letter className="inline-block opacity-0">
              {c === ' ' ? ' ' : c}
            </span>
          ))}
        </div>
        <span ref={counterRef} className="font-mono text-[4rem] font-medium leading-none text-mint-400">
          000
        </span>
        <div className="h-px w-[160px] bg-[rgba(212,172,82,0.15)]">
          <div ref={fillRef} className="h-full w-full origin-left scale-x-0 bg-mint-400" />
        </div>
      </div>
    </div>
  )
}
