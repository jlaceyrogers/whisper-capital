import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

/**
 * Section 1 — Page hero. 50dvh, forest-950, centered.
 * Contour texture (30%) + soft radial mint glow center-bottom.
 * Line-mask headline reveal; parallax fade on scroll.
 */
export default function ContactHero() {
  const ref = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const fade = useTransform(scrollYProgress, [0, 1], [1, 0])
  const drift = useTransform(scrollYProgress, [0, 1], [0, 72])

  return (
    <section
      ref={ref}
      className="relative flex min-h-[50dvh] items-center justify-center overflow-hidden bg-forest-950 px-5 py-24"
      aria-label="Contact"
    >
      {/* contour texture, 30% */}
      <img
        src="/texture-contour.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30"
      />
      {/* soft radial mint glow (5%) center-bottom */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[65%]"
        style={{
          background:
            'radial-gradient(ellipse 55% 60% at 50% 100%, rgba(212,172,82,0.05) 0%, transparent 70%)',
        }}
      />
      {/* gentle vignette so the texture melts into forest-950 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 95% 85% at 50% 40%, transparent 45%, rgba(12,23,39,0.6) 100%)',
        }}
      />

      <motion.div
        style={reduced ? undefined : { opacity: fade, y: drift }}
        className="relative mx-auto w-full max-w-[780px] text-center"
      >
        {/* eyebrow — hairline draws from center */}
        <div className="flex items-center justify-center gap-4">
          <motion.span
            aria-hidden
            initial={reduced ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
            className="h-px w-10 origin-center bg-mint-400"
          />
          <motion.span
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
            className="font-mono text-[0.72rem] font-medium uppercase tracking-eyebrow text-mint-400"
          >
            [ 01 — CONTACT ]
          </motion.span>
          <motion.span
            aria-hidden
            initial={reduced ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
            className="h-px w-10 origin-center bg-mint-400"
          />
        </div>

        {/* display L — line-mask reveal */}
        <h1 className="mt-10 font-serif text-display-l font-light text-white">
          <span className="block overflow-hidden pb-2">
            <motion.span
              initial={reduced ? false : { y: '110%' }}
              animate={{ y: 0 }}
              transition={{ duration: 1.1, ease: EASE, delay: 0.25 }}
              className="block will-change-transform"
            >
              Contact<em className="italic text-mint-200">.</em>
            </motion.span>
          </span>
        </h1>

        <motion.p
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.55 }}
          className="mx-auto mt-8 max-w-[48ch] font-sans text-lede text-fog"
        >
          Tell us who you are; we respond personally.
        </motion.p>

        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.75 }}
          className="mt-10 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-fog/60"
        >
          [ Private &amp; Confidential — Information shared here is never distributed ]
        </motion.p>
      </motion.div>
    </section>
  )
}
