import { gsap } from '@/lib/gsap'

/** Roll a numeric text counter 0 → value inside an element. */
export function animateCounter(
  el: HTMLElement,
  value: number,
  opts: { duration?: number; decimals?: number; prefix?: string; suffix?: string; delay?: number } = {},
) {
  const { duration = 1.6, decimals = 0, prefix = '', suffix = '', delay = 0 } = opts
  const obj = { v: 0 }
  return gsap.to(obj, {
    v: value,
    duration,
    delay,
    ease: 'expo.out',
    onUpdate: () => {
      el.textContent = prefix + obj.v.toFixed(decimals) + suffix
    },
  })
}
