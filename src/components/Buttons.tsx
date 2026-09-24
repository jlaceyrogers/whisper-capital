import { useRef, type ReactNode } from 'react'
import { Link } from 'react-router'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/* Magnetic wrapper — CTAs translate up to 6px toward cursor in 60px   */
/* ------------------------------------------------------------------ */
export function Magnetic({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 180, damping: 18, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 180, damping: 18, mass: 0.4 })

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    const dist = Math.hypot(dx, dy)
    const radius = 60 + Math.max(r.width, r.height) / 2
    if (dist < radius) {
      x.set(Math.max(-6, Math.min(6, dx * 0.25)))
      y.set(Math.max(-6, Math.min(6, dy * 0.35)))
    } else {
      x.set(0)
      y.set(0)
    }
  }
  const onLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy }}
      className={cn('inline-block', className)}
    >
      {children}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* Dual-label — label slides up on hover, mint duplicate slides in     */
/* ------------------------------------------------------------------ */
function DualLabel({ text }: { text: string }) {
  return (
    <span className="relative block overflow-hidden">
      <span className="block transition-transform duration-300 ease-out-expo group-hover:-translate-y-full">
        {text}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 block translate-y-full transition-transform duration-300 ease-out-expo group-hover:translate-y-0"
      >
        {text}
      </span>
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Primary — green-500 fill, clip-path wipe on hover handled via CSS   */
/* ------------------------------------------------------------------ */
export function PrimaryButton({
  children,
  to,
  large,
  className,
  onClick,
}: {
  children: string
  to?: string
  large?: boolean
  className?: string
  onClick?: () => void
}) {
  const inner = (
    <>
      <span className="absolute inset-0 origin-left scale-x-0 bg-mint-400 transition-transform duration-400 ease-out-expo group-hover:scale-x-100" />
      <span className="relative">
        <DualLabel text={children} />
      </span>
    </>
  )
  const cls = cn(
    'group relative inline-flex items-center justify-center overflow-hidden rounded-[2px] bg-green-500 font-sans font-semibold uppercase tracking-button text-forest-1000',
    large ? 'px-[44px] py-[22px] text-[0.9rem]' : 'px-[34px] py-[18px] text-[0.85rem]',
    className,
  )
  return (
    <Magnetic>
      {to ? (
        <Link to={to} className={cls} onClick={onClick}>
          {inner}
        </Link>
      ) : (
        <button type="button" className={cls} onClick={onClick}>
          {inner}
        </button>
      )}
    </Magnetic>
  )
}

/* ------------------------------------------------------------------ */
/* Secondary — mint outline on dark                                     */
/* ------------------------------------------------------------------ */
export function SecondaryButton({
  children,
  to,
  className,
  arrow,
}: {
  children: string
  to?: string
  className?: string
  arrow?: boolean
}) {
  const cls = cn(
    'group inline-flex items-center gap-3 rounded-[2px] border border-[rgba(102,204,102,0.4)] px-[34px] py-[18px] font-sans text-[0.85rem] font-semibold uppercase tracking-button text-mint-200 transition-all duration-500 ease-out-expo hover:border-mint-400 hover:bg-[rgba(102,204,102,0.08)]',
    className,
  )
  const inner = (
    <>
      <DualLabel text={children} />
      {arrow && (
        <span aria-hidden className="transition-transform duration-300 ease-out-expo group-hover:translate-x-1">
          →
        </span>
      )}
    </>
  )
  return (
    <Magnetic>
      {to ? (
        <Link to={to} className={cls}>
          {inner}
        </Link>
      ) : (
        <button type="button" className={cls}>
          {inner}
        </button>
      )}
    </Magnetic>
  )
}

/* ------------------------------------------------------------------ */
/* Text link — mono uppercase, animated underline + trailing arrow     */
/* ------------------------------------------------------------------ */
export function TextLink({
  children,
  to,
  onDark = true,
  className,
}: {
  children: string
  to: string
  onDark?: boolean
  className?: string
}) {
  return (
    <Link
      to={to}
      className={cn(
        'group inline-flex items-center gap-2 font-mono text-[0.72rem] font-medium uppercase tracking-nav',
        onDark ? 'text-mint-200' : 'text-forest-700',
        className,
      )}
    >
      <span className="relative">
        {children}
        <span
          aria-hidden
          className={cn(
            'absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-300 ease-out-expo group-hover:scale-x-100',
            onDark ? 'bg-mint-400' : 'bg-forest-700',
          )}
        />
      </span>
      <span aria-hidden className="transition-transform duration-300 ease-out-expo group-hover:translate-x-1">
        →
      </span>
    </Link>
  )
}
