import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

/**
 * Section eyebrow — `[ 01 — SECTION NAME ]` with a 40px hairline that
 * draws (scaleX 0→1) when the element scrolls into view.
 */
export default function Eyebrow({
  index,
  label,
  onDark = true,
  centered = false,
  className,
}: {
  index?: string
  label: string
  onDark?: boolean
  centered?: boolean
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelector('[data-line]'),
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.2,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        },
      )
      gsap.fromTo(
        el.querySelector('[data-text]'),
        { opacity: 0, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        },
      )
    }, el)
    return () => { ctx.revert() }
  }, [reduced])

  return (
    <div
      ref={ref}
      className={cn('flex items-center gap-4', centered && 'justify-center', className)}
    >
      <span
        data-line
        className={cn(
          'h-px w-10 origin-left',
          onDark ? 'bg-mint-400' : 'bg-forest-700',
          reduced && 'scale-x-100',
        )}
      />
      <span
        data-text
        className={cn(
          'font-mono text-[0.72rem] font-medium uppercase tracking-eyebrow',
          onDark ? 'text-mint-400' : 'text-forest-700',
        )}
      >
        {index ? `[ ${index} — ${label} ]` : `[ ${label} ]`}
      </span>
    </div>
  )
}
