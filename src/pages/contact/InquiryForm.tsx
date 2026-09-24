import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  type Variants,
} from 'framer-motion'

type AnimationControls = ReturnType<typeof useAnimationControls>
import { Magnetic, TextLink } from '@/components/Buttons'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

const REGIONS = ['USA', 'APAC', 'MIDDLE EAST', 'EUROPE'] as const
type Region = (typeof REGIONS)[number]

const INVESTOR_TYPES = [
  { id: 'QUALIFIED INDIVIDUAL', sub: 'Accredited investor' },
  { id: 'INSTITUTION', sub: 'Allocator / advisor' },
] as const
type InvestorType = (typeof INVESTOR_TYPES)[number]['id']

interface FormState {
  name: string
  org: string
  email: string
  phone: string
  region: Region | ''
  investorType: InvestorType | ''
  message: string
  ack: boolean
}

type ErrorKey = 'name' | 'org' | 'email' | 'region' | 'investorType' | 'message' | 'ack'
type Errors = Partial<Record<ErrorKey, string>>

const INITIAL: FormState = {
  name: '',
  org: '',
  email: '',
  phone: '',
  region: '',
  investorType: '',
  message: '',
  ack: false,
}

/* ------------------------------------------------------------------ */
/* Error caption — mono microcopy beneath an invalid control           */
/* ------------------------------------------------------------------ */
function ErrorCaption({ error }: { error?: string }) {
  return (
    <AnimatePresence initial={false}>
      {error && (
        <motion.p
          role="alert"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          transition={{ duration: 0.3, ease: EASE }}
          className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-forest-700"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  )
}

/* ------------------------------------------------------------------ */
/* Field — floating label, bottom hairline, focus accent (2px green)   */
/* ------------------------------------------------------------------ */
function Field({
  id,
  label,
  value,
  onChange,
  error,
  controls,
  optional = false,
  textarea = false,
  type = 'text',
  autoComplete,
  placeholder,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  controls: AnimationControls
  optional?: boolean
  textarea?: boolean
  type?: string
  autoComplete?: string
  placeholder?: string
}) {
  const [focused, setFocused] = useState(false)
  const floated = focused || value.length > 0

  const shared = {
    id,
    name: id,
    value,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    'aria-invalid': !!error,
    className: cn(
      'w-full bg-transparent px-[4px] pb-[14px] pt-[2px] font-sans text-base text-ink',
      'placeholder:text-transparent focus:outline-none focus:placeholder:text-ink-soft/50',
      textarea && 'min-h-[140px] resize-none',
    ),
  }

  return (
    <motion.div variants={fieldV}>
      <motion.div animate={error ? controls : undefined} className="relative pt-6">
        <label
          htmlFor={id}
          className={cn(
            'pointer-events-none absolute left-[4px] top-0 font-mono uppercase tracking-[0.14em] transition-all duration-300 ease-out-expo',
            floated
              ? 'translate-y-0 text-[0.62rem] text-forest-700'
              : 'translate-y-[26px] text-[0.72rem] text-ink-soft',
          )}
        >
          {label}
          {optional && (
            <span className="normal-case tracking-normal text-ink-soft/50"> (optional)</span>
          )}
        </label>

        {textarea ? (
          <textarea
            {...shared}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <input
            {...shared}
            type={type}
            autoComplete={autoComplete}
            onChange={(e) => onChange(e.target.value)}
          />
        )}

        {/* base hairline */}
        <span
          aria-hidden
          className={cn(
            'absolute bottom-0 left-0 h-px w-full transition-colors duration-300',
            error ? 'bg-forest-700' : 'bg-[rgba(16,28,46,0.2)]',
          )}
        />
        {/* focus accent — 2px, scaleY from center */}
        <span
          aria-hidden
          className={cn(
            'absolute bottom-0 left-0 h-[2px] w-full origin-center bg-green-500 transition-transform duration-300 ease-out-expo',
            focused ? 'scale-y-100' : 'scale-y-0',
          )}
        />
      </motion.div>
      <ErrorCaption error={error} />
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* Variants                                                            */
/* ------------------------------------------------------------------ */
const cardV: Variants = {
  hidden: { y: 64, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 1.1, ease: EASE } },
}
const groupV: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.55 } },
}
const fieldV: Variants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.8, ease: EASE } },
}
const successGroupV: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
}
const successItemV: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

/* ------------------------------------------------------------------ */
/* Section 2 — Contact form                                            */
/* ------------------------------------------------------------------ */
export default function InquiryForm() {
  const reduced = usePrefersReducedMotion()
  const [form, setForm] = useState<FormState>(INITIAL)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle')
  const [reference, setReference] = useState('')
  const controls = useAnimationControls()
  const timer = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    },
    [],
  )

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const validate = (): Errors => {
    const e: Errors = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.org.trim()) e.org = 'Required'
    if (!form.email.trim()) e.email = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Invalid email'
    if (!form.region) e.region = 'Select a region'
    if (!form.investorType) e.investorType = 'Select investor type'
    if (!form.message.trim()) e.message = 'Required'
    if (!form.ack) e.ack = 'Acknowledgment required'
    return e
  }

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault()
    if (status !== 'idle') return
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length > 0) {
      if (!reduced)
        controls.start({ x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.3, ease: 'easeInOut' } })
      return
    }
    setStatus('sending')
    timer.current = window.setTimeout(
      () => {
        setReference(`WCM-${Math.floor(100000 + Math.random() * 900000)}`)
        setStatus('success')
      },
      reduced ? 0 : 900,
    )
  }

  return (
    <section className="bg-ivory px-5 py-[88px] md:px-12 md:py-[160px]" aria-label="Contact form">
      <motion.div
        variants={cardV}
        initial={reduced ? false : 'hidden'}
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        className="mx-auto w-full max-w-[880px] rounded-[2px] border border-[rgba(16,28,46,0.12)] bg-ivory-dim p-7 md:p-16"
      >
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            /* ------------------------- SUCCESS STATE ------------------------- */
            <motion.div
              key="success"
              variants={successGroupV}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              className="flex min-h-[460px] flex-col items-center justify-center py-10 text-center"
            >
              <motion.p
                variants={successItemV}
                className="font-mono text-[0.68rem] uppercase tracking-eyebrow text-forest-700"
              >
                [ Message Sent ]
              </motion.p>
              <motion.h2
                variants={successItemV}
                className="mt-6 font-serif text-[2rem] font-medium text-ink"
              >
                Received.
              </motion.h2>
              <motion.p
                variants={successItemV}
                className="mt-4 font-mono text-[0.72rem] uppercase tracking-nav text-ink-soft"
              >
                Reference: {reference}
              </motion.p>
              <motion.p
                variants={successItemV}
                className="mt-6 max-w-[42ch] font-sans text-base leading-[1.7] text-ink-soft"
              >
                A member of our investor relations team will respond within two business days.
              </motion.p>
              <motion.div variants={successItemV} className="mt-10">
                <TextLink to="/" onDark={false}>
                  Return home
                </TextLink>
              </motion.div>
            </motion.div>
          ) : (
            /* --------------------------- FORM STATE -------------------------- */
            <motion.div
              key="form"
              variants={groupV}
              exit={{ opacity: 0, y: -12, transition: { duration: 0.4, ease: EASE } }}
            >
              {/* card header — document reference */}
              <motion.div
                variants={fieldV}
                className="mb-12 flex items-center gap-4 border-b border-[rgba(16,28,46,0.12)] pb-6"
              >
                <p className="font-mono text-[0.68rem] uppercase tracking-eyebrow text-ink-soft">
                  CONTACT FORM
                </p>
                <p className="ml-auto hidden font-mono text-[0.68rem] uppercase tracking-eyebrow text-ink-soft/50 sm:block">
                  Private &amp; Confidential
                </p>
              </motion.div>

              <form onSubmit={onSubmit} noValidate className="space-y-10">
                <Field
                  id="wcm-name"
                  label="Full name"
                  value={form.name}
                  onChange={(v) => set('name', v)}
                  error={errors.name}
                  controls={controls}
                  autoComplete="name"
                />
                <Field
                  id="wcm-org"
                  label="Organization"
                  value={form.org}
                  onChange={(v) => set('org', v)}
                  error={errors.org}
                  controls={controls}
                  autoComplete="organization"
                />

                <motion.div variants={fieldV} className="grid gap-y-10 md:grid-cols-2 md:gap-x-8">
                  <Field
                    id="wcm-email"
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(v) => set('email', v)}
                    error={errors.email}
                    controls={controls}
                    autoComplete="email"
                  />
                  <Field
                    id="wcm-phone"
                    label="Phone"
                    type="tel"
                    value={form.phone}
                    onChange={(v) => set('phone', v)}
                    controls={controls}
                    optional
                    autoComplete="tel"
                  />
                </motion.div>

                {/* Region — segmented selector, layoutId pill */}
                <motion.div variants={fieldV}>
                  <motion.div animate={errors.region ? controls : undefined}>
                    <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-ink-soft">
                      Region
                    </p>
                    <Magnetic className="mt-4 block w-full">
                      <div
                        role="radiogroup"
                        aria-label="Region"
                        className={cn(
                          'relative grid grid-cols-2 rounded-full border p-1 transition-colors duration-300 sm:grid-cols-4',
                          errors.region ? 'border-forest-700' : 'border-[rgba(16,28,46,0.2)]',
                        )}
                      >
                        {REGIONS.map((r) => {
                          const active = form.region === r
                          return (
                            <button
                              key={r}
                              type="button"
                              role="radio"
                              aria-checked={active}
                              onClick={() => set('region', r)}
                              className="relative rounded-full px-2 py-3 font-mono text-[0.62rem] uppercase tracking-[0.14em] sm:text-[0.72rem]"
                            >
                              {active && (
                                <motion.span
                                  layoutId="wcm-region-pill"
                                  transition={{ duration: 0.4, ease: EASE }}
                                  className="absolute inset-0 rounded-full bg-green-500"
                                />
                              )}
                              <span
                                className={cn(
                                  'relative z-10 transition-colors duration-300',
                                  active
                                    ? 'font-medium text-forest-1000'
                                    : 'text-ink-soft hover:text-ink',
                                )}
                              >
                                {r}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </Magnetic>
                  </motion.div>
                  <ErrorCaption error={errors.region} />
                </motion.div>

                {/* Investor type — radio cards */}
                <motion.div variants={fieldV}>
                  <motion.div animate={errors.investorType ? controls : undefined}>
                    <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-ink-soft">
                      Investor type
                    </p>
                    <div
                      role="radiogroup"
                      aria-label="Investor type"
                      className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2"
                    >
                      {INVESTOR_TYPES.map((t) => {
                        const active = form.investorType === t.id
                        return (
                          <Magnetic key={t.id} className="block">
                            <button
                              type="button"
                              role="radio"
                              aria-checked={active}
                              onClick={() => set('investorType', t.id)}
                              className={cn(
                                'relative block w-full rounded-[2px] border p-5 text-left transition-all duration-500 ease-out-expo',
                                active
                                  ? 'border-green-500 bg-mint-100/50 shadow-[inset_0_0_0_1px_#C9A24A]'
                                  : errors.investorType
                                    ? 'border-forest-700/60 bg-ivory-dim hover:border-forest-700'
                                    : 'border-[rgba(16,28,46,0.12)] bg-ivory-dim hover:border-[rgba(16,28,46,0.35)]',
                              )}
                            >
                              <AnimatePresence>
                                {active && (
                                  <motion.span
                                    initial={{ opacity: 0, scale: 0.6 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.2 } }}
                                    transition={{ duration: 0.3, ease: EASE }}
                                    className="absolute right-3 top-3 flex h-[18px] w-[18px] items-center justify-center rounded-[2px] bg-green-500"
                                  >
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden>
                                      <motion.path
                                        d="M1 4L3.5 6.5L9 1"
                                        stroke="#08111E"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 0.35, ease: EASE }}
                                      />
                                    </svg>
                                  </motion.span>
                                )}
                              </AnimatePresence>
                              <span className="block pr-6 font-mono text-[0.72rem] font-medium uppercase tracking-[0.14em] text-ink">
                                {t.id}
                              </span>
                              <span className="mt-2 block font-sans text-[0.8rem] leading-[1.5] text-ink-soft/80">
                                {t.sub}
                              </span>
                            </button>
                          </Magnetic>
                        )
                      })}
                    </div>
                  </motion.div>
                  <ErrorCaption error={errors.investorType} />
                </motion.div>

                <Field
                  id="wcm-message"
                  label="Message"
                  value={form.message}
                  onChange={(v) => set('message', v)}
                  error={errors.message}
                  controls={controls}
                  textarea
                  placeholder="A few lines about your mandate and what you're looking for…"
                />

                {/* Acknowledgment — custom square checkbox, stroke-drawn check */}
                <motion.div variants={fieldV}>
                  <motion.div animate={errors.ack ? controls : undefined}>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={form.ack}
                      onClick={() => set('ack', !form.ack)}
                      className="group flex items-start gap-4 text-left"
                    >
                      <span
                        aria-hidden
                        className={cn(
                          'mt-[1px] flex h-5 w-5 shrink-0 items-center justify-center rounded-[2px] border transition-colors duration-300',
                          form.ack
                            ? 'border-green-500 bg-green-500'
                            : errors.ack
                              ? 'border-forest-700'
                              : 'border-[rgba(16,28,46,0.35)] group-hover:border-forest-700',
                        )}
                      >
                        <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                          <motion.path
                            d="M1 4.5L4 7.5L10 1"
                            stroke="#08111E"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={false}
                            animate={{ pathLength: form.ack ? 1 : 0 }}
                            transition={{ duration: 0.35, ease: EASE }}
                          />
                        </svg>
                      </span>
                      <span className="font-sans text-[0.8rem] leading-[1.6] text-ink-soft">
                        I understand this site is for discussion purposes only and does not
                        constitute an offer to sell securities.
                      </span>
                    </button>
                  </motion.div>
                  <ErrorCaption error={errors.ack} />
                </motion.div>

                {/* Submit — primary, dual-label swap */}
                <motion.div variants={fieldV} className="flex justify-end pt-2">
                  <Magnetic className="block w-full md:w-auto">
                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-[2px] bg-green-500 px-[34px] py-[18px] font-sans text-[0.85rem] font-semibold uppercase tracking-button text-forest-1000 md:w-auto"
                    >
                      <span className="absolute inset-0 origin-left scale-x-0 bg-mint-400 transition-transform duration-500 ease-out-expo group-hover:scale-x-100" />
                      {status === 'sending' ? (
                        <motion.span
                          aria-live="polite"
                          animate={reduced ? undefined : { opacity: [0.3, 1, 0.3] }}
                          transition={{ repeat: Infinity, duration: 0.9, ease: 'easeInOut' }}
                          className="relative block px-6 font-mono tracking-[0.3em]"
                        >
                          ···
                        </motion.span>
                      ) : (
                        <span className="relative block overflow-hidden">
                          <span aria-hidden className="invisible block whitespace-nowrap">
                            We reply personally
                          </span>
                          <span className="absolute inset-0 flex items-center justify-center whitespace-nowrap transition-transform duration-300 ease-out-expo group-hover:-translate-y-full">
                            Send Message
                          </span>
                          <span
                            aria-hidden
                            className="absolute inset-0 flex translate-y-full items-center justify-center whitespace-nowrap transition-transform duration-300 ease-out-expo group-hover:translate-y-0"
                          >
                            We reply personally
                          </span>
                        </span>
                      )}
                    </button>
                  </Magnetic>
                </motion.div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  )
}
