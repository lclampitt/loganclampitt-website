export default function Footer() {
  return (
    <footer className="pb-32 pt-4">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="site-footer mx-auto w-full max-w-[52rem]">
          <p className="font-dot font-black text-[1.25rem] md:text-[1.4rem] tracking-[0.02em] text-ink">
            goodbye, world
            <span className="greet-caret" aria-hidden="true">_</span>
          </p>
          <p className="font-mono text-[11px] leading-relaxed text-dim text-right">
            © {new Date().getFullYear()} Logan Clampitt
            <br />
            loganclampitt.com
          </p>
        </div>
      </div>
    </footer>
  )
}
