export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[#7c3aed] flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
              <rect x="8" y="1" width="5" height="5" rx="1" fill="white" fillOpacity="0.5" />
              <rect x="1" y="8" width="5" height="5" rx="1" fill="white" fillOpacity="0.5" />
              <rect x="8" y="8" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
          <span className="font-display text-sm text-[#f0eeff]/50 tracking-tight">
            alm<span className="text-[#7c3aed]/70">erno</span>
          </span>
        </div>
        <div className="flex items-center gap-5">
          <a href="/privacy" className="text-xs text-[#6b6b8a] hover:text-[#c4b5fd] transition-colors duration-200">
            Privacy
          </a>
          <span className="text-[#6b6b8a]/30 text-xs">|</span>
          <p className="text-xs text-[#6b6b8a] font-light tracking-wide">
            Built for people who value privacy. © {new Date().getFullYear()} Almerno.
          </p>
        </div>
      </div>
    </footer>
  );
}
