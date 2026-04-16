const steps = [
  {
    number: "01",
    title: "Browse the app catalog",
    body: "Immich for photos. Nextcloud for files. Vaultwarden for passwords. Kavita for books. Pick what you need from a growing library of vetted, open-source apps.",
    tag: "App Store",
  },
  {
    number: "02",
    title: "Install with one click",
    body: "No config files. No terminal. No domain registration. Hit install, and we provision a dedicated, isolated container just for you — live in under 60 seconds.",
    tag: "One Click",
  },
  {
    number: "03",
    title: "Your data stays yours",
    body: "End-to-end encrypted. You hold the keys. We can't read your files, photos, or passwords — and we never will. Cancel any time and take your data with you.",
    tag: "Your Keys",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-28 px-6 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(124,58,237,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-xs text-[#7c3aed] uppercase tracking-[0.2em] font-medium mb-4">How it works</p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#f0eeff] tracking-tight">
            Three steps. No PhD required.
          </h2>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="hidden md:block absolute top-10 left-[calc(33%+1rem)] right-[calc(33%+1rem)] h-px bg-gradient-to-r from-[#7c3aed]/40 via-[#7c3aed]/20 to-[#7c3aed]/40" />

          {steps.map(({ number, title, body, tag }) => (
            <div key={number} className="relative flex flex-col items-start gap-5">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl bg-[#7c3aed]/10 border border-[#7c3aed]/30 flex items-center justify-center shrink-0">
                  <span className="font-display font-bold text-xl text-[#7c3aed]">{number}</span>
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#7c3aed] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>
                <span className="text-xs font-medium text-[#7c3aed]/70 uppercase tracking-widest border border-[#7c3aed]/20 bg-[#7c3aed]/5 px-3 py-1 rounded-full">
                  {tag}
                </span>
              </div>
              <div>
                <h3 className="font-display font-semibold text-xl text-[#f0eeff] mb-3">{title}</h3>
                <p className="text-sm text-[#6b6b8a] leading-relaxed font-light">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
