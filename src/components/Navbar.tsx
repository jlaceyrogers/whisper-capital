import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

function NavItem({ to, label, onClick }: { to: string; label: string; onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-2 font-mono text-[0.72rem] font-medium uppercase tracking-nav transition-colors duration-300',
          isActive ? 'text-mint-400' : 'text-fog hover:text-white',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            aria-hidden
            className={cn(
              'h-1.5 w-1.5 rounded-full bg-mint-400 transition-opacity duration-300',
              isActive ? 'opacity-100' : 'opacity-0',
            )}
          />
          <span className="relative block overflow-hidden">
            <span className="block transition-transform duration-300 ease-out-expo group-hover:-translate-y-full">
              {label}
            </span>
            <span
              aria-hidden
              className="absolute inset-0 block translate-y-full text-mint-400 transition-transform duration-300 ease-out-expo group-hover:translate-y-0"
            >
              {label}
            </span>
          </span>
        </>
      )}
    </NavLink>
  )
}

const MOBILE_LINKS = [
  { to: '/', num: '00', label: 'Home' },
  { to: '/contact', num: '01', label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const [lastPath, setLastPath] = useState(location.pathname)
  if (lastPath !== location.pathname) {
    // adjust state during render (React-endorsed pattern)
    setLastPath(location.pathname)
    if (open) setOpen(false)
  }

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-[100] h-20 transition-all duration-500 ease-out-expo',
          scrolled
            ? 'border-b border-[rgba(102,204,102,0.14)] bg-[rgba(0,20,0,0.72)] backdrop-blur-[16px]'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <div className="mx-auto flex h-full max-w-container items-center justify-between px-5 md:px-12">
          <Link to="/" className="flex items-center gap-3" aria-label="Whisper Capital — home">
            <img src="/logo.svg" alt="" className="h-7 w-7" />
            <span className="font-sans text-[0.8rem] font-bold uppercase tracking-wordmark text-white">
              Whisper Capital
            </span>
          </Link>

          <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary">
            <NavItem to="/contact" label="Contact" />
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="relative z-[110] flex h-10 w-10 flex-col items-center justify-center gap-[7px] lg:hidden"
          >
            <span
              className={cn(
                'h-px w-6 bg-mint-400 transition-transform duration-300 ease-out-expo',
                open && 'translate-y-[4px] rotate-45',
              )}
            />
            <span
              className={cn(
                'h-px w-6 bg-mint-400 transition-transform duration-300 ease-out-expo',
                open && '-translate-y-[4px] -rotate-45',
              )}
            />
          </button>
        </div>
      </header>

      {/* Mobile full-screen overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[105] flex flex-col justify-center bg-forest-1000 px-8 lg:hidden"
          >
            <nav className="flex flex-col gap-2" aria-label="Mobile">
              {MOBILE_LINKS.map((l, i) => (
                <div key={l.to} className="overflow-hidden">
                  <motion.div
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '110%' }}
                    transition={{ duration: 0.6, delay: 0.07 * i, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <NavLink
                      to={l.to}
                      onClick={() => setOpen(false)}
                      end={l.to === '/'}
                      className={({ isActive }) =>
                        cn(
                          'flex items-baseline gap-4 py-3 font-serif text-4xl font-light',
                          isActive ? 'text-mint-400' : 'text-white',
                        )
                      }
                    >
                      <span className="font-mono text-xs tracking-nav text-fog">{l.num}</span>
                      {l.label}
                    </NavLink>
                  </motion.div>
                </div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
