import { cn } from '@/lib/utils'

/**
 * Whisper Capital Management lockup — gold ring mark, wide-tracked serif
 * "WHISPER" in cream, "CAPITAL MANAGEMENT" in small tracked gold beneath.
 * Mirrors the deck's top-left lockup.
 */
export default function Wordmark({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const s = {
    sm: { mark: 'h-7 w-7', top: 'text-[0.95rem] tracking-[0.42em]', sub: 'text-[0.42rem] tracking-[0.36em]', gap: 'gap-3' },
    md: { mark: 'h-9 w-9', top: 'text-[1.2rem] tracking-[0.42em]', sub: 'text-[0.5rem] tracking-[0.38em]', gap: 'gap-3.5' },
    lg: { mark: 'h-14 w-14 md:h-16 md:w-16', top: 'text-[1.7rem] tracking-[0.44em] md:text-[2.1rem]', sub: 'text-[0.62rem] tracking-[0.4em] md:text-[0.72rem]', gap: 'gap-5' },
  }[size]

  return (
    <span className={cn('inline-flex items-center', s.gap, className)}>
      <img src="/logo.svg" alt="" className={cn('shrink-0', s.mark)} />
      <span className="flex flex-col leading-none">
        <span className={cn('font-serif font-medium uppercase text-ivory', s.top)}>Whisper</span>
        <span className={cn('mt-[0.35em] font-sans font-medium uppercase text-mint-400', s.sub)}>
          Capital Management
        </span>
      </span>
    </span>
  )
}
