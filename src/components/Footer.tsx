import { Link } from 'react-router'

const NAV = [
  { to: '/', num: '00', label: 'Home' },
  { to: '/contact', num: '01', label: 'Contact' },
]

const PROVIDERS = ['SS&C Technologies', 'Tannenbaum Helpern', 'White & Case', 'Kasowitz Benson Torres', 'CohnReznick']

/**
 * Global footer (design.md §7.2) — forest-1000 base, giant cropped wordmark,
 * 4-column info row, compliance block, legal strip.
 */
export default function Footer() {
  return (
    <footer className="border-t border-[rgba(102,204,102,0.14)] bg-forest-1000">
      {/* Row 1 — giant cropped wordmark */}
      <div className="overflow-hidden" aria-hidden>
        <div
          data-footer-wordmark
          className="select-none whitespace-nowrap text-center font-serif text-[clamp(4rem,14vw,10rem)] font-light leading-[0.8] text-[rgba(102,204,102,0.10)]"
          style={{ transform: 'translateY(0.18em)' }}
        >
          WHISPER
        </div>
      </div>

      {/* Row 2 — 4 columns */}
      <div className="mx-auto grid max-w-container grid-cols-1 gap-12 px-5 pb-16 pt-8 md:grid-cols-2 md:px-12 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="" className="h-6 w-6" />
            <span className="font-sans text-[0.75rem] font-bold uppercase tracking-wordmark text-white">
              Whisper Capital
            </span>
          </div>
          <p className="mt-5 font-mono text-[0.72rem] uppercase tracking-nav text-fog">
            A Dual-Engine Investment Firm
          </p>
          <p className="mt-2 font-mono text-[0.72rem] uppercase tracking-nav text-fog/60">New York</p>
        </div>

        <div>
          <p className="font-mono text-[0.68rem] uppercase tracking-eyebrow text-mint-400/70">Navigate</p>
          <ul className="mt-5 space-y-3">
            {NAV.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="font-mono text-[0.72rem] uppercase tracking-nav text-fog transition-colors duration-300 hover:text-mint-400"
                >
                  {l.num} {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-mono text-[0.68rem] uppercase tracking-eyebrow text-mint-400/70">Contact</p>
          <ul className="mt-5 space-y-3 font-mono text-[0.72rem] tracking-nav text-fog">
            <li>
              <a
                href="mailto:ir@whispercapital.example"
                className="uppercase transition-colors duration-300 hover:text-mint-400"
              >
                ir@whispercapital.example
              </a>
            </li>
            <li className="uppercase text-fog/70">APAC — Singapore</li>
            <li className="uppercase text-fog/70">Middle East — Abu Dhabi</li>
            <li className="uppercase text-fog/70">Europe — London</li>
          </ul>
        </div>

        <div>
          <p className="font-mono text-[0.68rem] uppercase tracking-eyebrow text-mint-400/70">Service Providers</p>
          <ul className="mt-5 space-y-3 font-mono text-[0.72rem] uppercase tracking-nav text-fog/70">
            {PROVIDERS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Row 3 — compliance block */}
      <div className="mx-auto max-w-container px-5 md:px-12">
        <p id="disclosures" className="max-w-[90ch] text-[0.8rem] leading-[1.6] text-fog/60">
          Private &amp; Confidential — For Discussion Purposes Only. All figures are illustrative and
          hypothetical. This website does not constitute an offer to sell or a solicitation of an offer to
          buy any securities. Past performance is not indicative of future results. Investing involves
          substantial risk, including the possible loss of principal.
        </p>
      </div>

      {/* Row 4 — legal strip */}
      <div className="mt-12 border-t border-[rgba(102,204,102,0.14)]">
        <div className="mx-auto flex max-w-container flex-col gap-3 px-5 py-6 font-mono text-[0.72rem] uppercase tracking-nav text-fog/60 md:flex-row md:items-center md:justify-between md:px-12">
          <span>© 2026 Whisper Capital Management LP</span>
          <span className="flex gap-6">
            <a href="#disclosures" className="transition-colors duration-300 hover:text-mint-400">
              Privacy
            </a>
            <a href="#disclosures" className="transition-colors duration-300 hover:text-mint-400">
              Disclosures
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}
