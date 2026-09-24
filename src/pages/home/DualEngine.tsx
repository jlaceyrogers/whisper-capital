import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import Eyebrow from '@/components/Eyebrow'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const CARDS = [
  {
    tag: 'FUNDAMENTAL LONG/SHORT',
    title: 'Alpha Book',
    body: 'Fundamental long/short in U.S. small- and mid-cap equities. A concentrated book of longs and shorts across multiple sectors, run through one shared research process.',
  },
  {
    tag: 'CATALYST-DRIVEN ENGAGEMENT',
    title: 'SPV Division',
    body: 'Catalyst-driven engagement spanning both private and public markets.',
  },
]

export default function DualEngine() {
  const rootRef = useRef<HTMLElement>(null)
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
              className="group relative flex min-h-[320px] flex-col overflow-hidden rounded-[2px] border border-[rgba(212,172,82,0.14)] bg-forest-800 p-8 transition-all duration-500 ease-out-expo hover:-translate-y-2 hover:border-[rgba(212,172,82,0.45)] md:p-12"
            >
              {/* top-edge glow line on hover */}
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-mint-400 transition-transform duration-500 ease-out-expo group-hover:scale-x-100"
              />
              <span className="inline-flex w-fit rounded-full bg-[rgba(212,172,82,0.1)] px-[14px] py-[6px] font-mono text-[0.68rem] uppercase tracking-nav text-mint-200">
                {c.tag}
              </span>
              <h3 className="mt-8 font-serif text-h3 font-medium text-white">{c.title}</h3>
              <p className="mt-5 max-w-[52ch] text-[1rem] leading-[1.7] text-fog">{c.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
