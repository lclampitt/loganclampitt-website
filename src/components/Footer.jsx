import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="pb-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="site-footer w-full">
          <p className="font-dot font-black text-[1.25rem] md:text-[1.4rem] tracking-[0.02em] text-ink">
            goodbye, world
            <span className="greet-caret" aria-hidden="true">_</span>
          </p>
          <p className="font-mono text-[11px] leading-relaxed text-dim text-right">
            © {new Date().getFullYear()} Logan Clampitt
            <br />
            loganclampitt.com
            <br />
            <Link to="/privacy" className="underline decoration-dashed decoration-1 underline-offset-4 hover:text-ink">
              Privacy
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
