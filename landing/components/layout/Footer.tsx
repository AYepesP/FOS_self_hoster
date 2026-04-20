export default function Footer() {
  return (
    <footer className="border-t border-[rgba(42,157,152,0.15)] py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="15 5 95 95" xmlns="http://www.w3.org/2000/svg">
            <polygon points="41.0,39.5 41.0,18.5 62.0,29.0 62.0,50.0" fill="#2a9d98"/>
            <polygon points="83.0,39.5 83.0,18.5 62.0,29.0 62.0,50.0" fill="#1b7874"/>
            <polygon points="62.0,8.0 83.0,18.5 62.0,29.0 41.0,18.5" fill="#5ececa"/>
            <polyline points="62.0,8.0 83.0,18.5 62.0,29.0 41.0,18.5 62.0,8.0" fill="none" stroke="white" strokeWidth="2.0" strokeLinejoin="round"/>
            <line x1="41.0" y1="39.5" x2="41.0" y2="18.5" stroke="white" strokeWidth="2.0"/>
            <line x1="62.0" y1="50.0" x2="62.0" y2="29.0" stroke="white" strokeWidth="2.0"/>
            <line x1="83.0" y1="39.5" x2="83.0" y2="18.5" stroke="white" strokeWidth="2.0"/>
            <line x1="41.0" y1="39.5" x2="62.0" y2="50.0" stroke="white" strokeWidth="2.0"/>
            <line x1="83.0" y1="39.5" x2="62.0" y2="50.0" stroke="white" strokeWidth="2.0"/>
            <polygon points="62.0,50.0 62.0,29.0 83.0,39.5 83.0,60.5" fill="#2a9d98"/>
            <polygon points="104.0,50.0 104.0,29.0 83.0,39.5 83.0,60.5" fill="#1b7874"/>
            <polygon points="83.0,18.5 104.0,29.0 83.0,39.5 62.0,29.0" fill="#5ececa"/>
            <polyline points="83.0,18.5 104.0,29.0 83.0,39.5 62.0,29.0 83.0,18.5" fill="none" stroke="white" strokeWidth="2.0" strokeLinejoin="round"/>
            <line x1="62.0" y1="50.0" x2="62.0" y2="29.0" stroke="white" strokeWidth="2.0"/>
            <line x1="83.0" y1="60.5" x2="83.0" y2="39.5" stroke="white" strokeWidth="2.0"/>
            <line x1="104.0" y1="50.0" x2="104.0" y2="29.0" stroke="white" strokeWidth="2.0"/>
            <line x1="62.0" y1="50.0" x2="83.0" y2="60.5" stroke="white" strokeWidth="2.0"/>
            <line x1="104.0" y1="50.0" x2="83.0" y2="60.5" stroke="white" strokeWidth="2.0"/>
            <polygon points="20.0,71.0 20.0,50.0 41.0,60.5 41.0,81.5" fill="#2a9d98"/>
            <polygon points="62.0,71.0 62.0,50.0 41.0,60.5 41.0,81.5" fill="#1b7874"/>
            <polygon points="41.0,39.5 62.0,50.0 41.0,60.5 20.0,50.0" fill="#5ececa"/>
            <polyline points="41.0,39.5 62.0,50.0 41.0,60.5 20.0,50.0 41.0,39.5" fill="none" stroke="white" strokeWidth="2.0" strokeLinejoin="round"/>
            <line x1="20.0" y1="71.0" x2="20.0" y2="50.0" stroke="white" strokeWidth="2.0"/>
            <line x1="41.0" y1="81.5" x2="41.0" y2="60.5" stroke="white" strokeWidth="2.0"/>
            <line x1="62.0" y1="71.0" x2="62.0" y2="50.0" stroke="white" strokeWidth="2.0"/>
            <line x1="20.0" y1="71.0" x2="41.0" y2="81.5" stroke="white" strokeWidth="2.0"/>
            <line x1="62.0" y1="71.0" x2="41.0" y2="81.5" stroke="white" strokeWidth="2.0"/>
            <polygon points="41.0,81.5 41.0,60.5 62.0,71.0 62.0,92.0" fill="#2a9d98"/>
            <polygon points="83.0,81.5 83.0,60.5 62.0,71.0 62.0,92.0" fill="#1b7874"/>
            <polygon points="62.0,50.0 83.0,60.5 62.0,71.0 41.0,60.5" fill="#5ececa"/>
            <polyline points="62.0,50.0 83.0,60.5 62.0,71.0 41.0,60.5 62.0,50.0" fill="none" stroke="white" strokeWidth="2.0" strokeLinejoin="round"/>
            <line x1="41.0" y1="81.5" x2="41.0" y2="60.5" stroke="white" strokeWidth="2.0"/>
            <line x1="62.0" y1="92.0" x2="62.0" y2="71.0" stroke="white" strokeWidth="2.0"/>
            <line x1="83.0" y1="81.5" x2="83.0" y2="60.5" stroke="white" strokeWidth="2.0"/>
            <line x1="41.0" y1="81.5" x2="62.0" y2="92.0" stroke="white" strokeWidth="2.0"/>
            <line x1="83.0" y1="81.5" x2="62.0" y2="92.0" stroke="white" strokeWidth="2.0"/>
          </svg>
          <span className="font-display text-sm text-[#e8f8f8]/50 tracking-tight">almerno</span>
        </div>
        <div className="flex items-center gap-5">
          <a href="/privacy" className="text-xs text-[#5a8a87] hover:text-[#5ececa] transition-colors duration-200">
            Privacy
          </a>
          <span className="text-[#5a8a87]/30 text-xs">|</span>
          <p className="text-xs text-[#5a8a87] font-light tracking-wide">
            Built for people who value privacy. © {new Date().getFullYear()} Almerno.
          </p>
        </div>
      </div>
    </footer>
  );
}
