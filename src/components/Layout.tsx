import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import Lenis from 'lenis'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ScrollTrigger } from '@/lib/gsap'
import { setLenis } from '@/lib/lenis'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * Shared layout — owns the fixed-nav offset (nav is 80px / h-20).
 * Pages render inside <main className="pt-20">; full-bleed hero sections
 * opt out with `-mt-20` inside the page itself.
 */
export default function Layout() {
  const location = useLocation()
  const reduced = usePrefersReducedMotion()

  // Lenis smooth scroll, synced with GSAP ScrollTrigger
  useEffect(() => {
    if (reduced) return
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 })
    setLenis(lenis)
    lenis.on('scroll', ScrollTrigger.update)
    let raf = 0
    const loop = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      setLenis(null)
    }
  }, [reduced])

  // Reset scroll on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="min-h-[100dvh] bg-forest-1000 text-white">
      <Navbar />
      <main className="pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
