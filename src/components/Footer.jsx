export default function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-white/5 py-8">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-white/20 text-sm">
          © {new Date().getFullYear()} Logan Clampitt. All rights reserved.
        </p>
        <p className="text-white/20 text-sm">
          Developer <span className="text-[#4F46E5]">&</span> Sim Racer
        </p>
      </div>
    </footer>
  )
}
