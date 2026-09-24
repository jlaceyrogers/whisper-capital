import { motion } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

/**
 * Section 4 — Compliance framing. forest-1000 band, centered, restrained.
 */
export default function ComplianceBand() {
  const reduced = usePrefersReducedMotion()
  return (
    <section className="bg-forest-1000 px-5 py-24 md:px-12" aria-label="Compliance disclosure">
      <motion.p
        initial={reduced ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-15% 0px' }}
        transition={{ duration: 0.9, ease: EASE }}
        className="mx-auto max-w-[760px] text-center font-sans text-[0.8rem] leading-[1.6] text-fog/70"
      >
        All communications are treated as private and confidential. This website and any materials
        shared following an inquiry are for discussion purposes only, do not constitute an offer to
        sell or a solicitation of an offer to buy any securities, and contain illustrative and
        hypothetical figures. Past performance is not indicative of future results. Investing
        involves substantial risk, including the possible loss of principal.
      </motion.p>
    </section>
  )
}
