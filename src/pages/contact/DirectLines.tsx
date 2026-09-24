import { motion } from 'framer-motion'
import Eyebrow from '@/components/Eyebrow'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

const REGIONS = ['APAC', 'MIDDLE EAST', 'EUROPE']

/** Divider — vertical draw on desktop, horizontal draw on mobile. */
function Divider() {
  const reduced = usePrefersReducedMotion()
  return (
    <>
      <motion.span
        aria-hidden
        initial={reduced ? false : { scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, margin: '-22% 0px' }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
        className="hidden w-px origin-top self-stretch bg-[rgba(102,204,102,0.14)] lg:block"
      />
      <motion.span
        aria-hidden
        initial={reduced ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.8, ease: EASE }}
        className="block h-px w-full origin-left bg-[rgba(102,204,102,0.14)] lg:hidden"
      />
    </>
  )
}

function Column({
  index,
  children,
  className,
}: {
  index: number
  children: React.ReactNode
  className?: string
}) {
  const reduced = usePrefersReducedMotion()
  return (
    <motion.div
      initial={reduced ? false : { y: 40, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-22% 0px' }}
      transition={{ duration: 0.9, ease: EASE, delay: 0.12 * index }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const colLabel = 'font-mono text-[0.68rem] uppercase tracking-eyebrow text-fog/70'
const colSub = 'mt-5 font-mono text-[0.68rem] uppercase tracking-nav text-fog/60'

/**
 * Section 3 — Direct lines. forest-900, three hairline-separated columns.
 */
export default function DirectLines() {
  return (
    <section className="bg-forest-900 px-5 py-[88px] md:px-12 md:py-[120px]" aria-label="Direct lines">
      <div className="mx-auto max-w-container">
        <Eyebrow index="02" label="DIRECT" />

        <div className="mt-16 flex flex-col gap-12 lg:flex-row lg:items-stretch lg:gap-0">
          <Column index={0} className="flex-1 lg:pr-12">
            <p className={colLabel}>Investor Relations</p>
            <a
              href="mailto:ir@whispercapital.example"
              data-cursor="WRITE"
              className="group relative mt-6 inline-block font-serif text-[1.4rem] font-medium text-mint-200"
            >
              ir@whispercapital.example
              <span
                aria-hidden
                className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-mint-400 transition-transform duration-500 ease-out-expo group-hover:scale-x-100"
              />
            </a>
            <p className={colSub}>Response within 2 business days</p>
          </Column>

          <Divider />

          <Column index={1} className="flex-1 lg:px-12">
            <p className={colLabel}>Regions</p>
            <ul className="mt-6 space-y-3">
              {REGIONS.map((r) => (
                <li
                  key={r}
                  className="font-mono text-[0.78rem] uppercase tracking-nav text-mint-200"
                >
                  {r}
                </li>
              ))}
            </ul>
            <p className={colSub}>Introductory calls in your timezone</p>
          </Column>

          <Divider />

          <Column index={2} className="flex-1 lg:pl-12">
            <p className={colLabel}>Headquarters</p>
            <p className="mt-6 font-serif text-[1.4rem] font-medium text-white">New York</p>
            <p className={colSub}>Meetings by appointment only</p>
          </Column>
        </div>
      </div>
    </section>
  )
}
