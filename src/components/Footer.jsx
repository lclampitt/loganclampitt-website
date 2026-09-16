export default function Footer() {
  return (
    <footer className="pb-28 pt-4">
      <div className="mx-auto max-w-6xl px-5 md:px-8 flex items-center justify-between gap-4 text-xs text-dim">
        <p>© {new Date().getFullYear()} Logan Clampitt</p>
        <p className="font-mono">loganclampitt.com</p>
      </div>
    </footer>
  )
}
