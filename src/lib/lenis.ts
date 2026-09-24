import Lenis from 'lenis'

let lenis: Lenis | null = null

export function setLenis(instance: Lenis | null) {
  lenis = instance
}

export function getLenis(): Lenis | null {
  return lenis
}

export function scrollToTarget(target: string | number | HTMLElement) {
  if (lenis) {
    lenis.scrollTo(target, { offset: 0, duration: 1.4 })
  } else if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: 'smooth' })
  } else if (typeof target === 'string') {
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
  } else {
    target.scrollIntoView({ behavior: 'smooth' })
  }
}
