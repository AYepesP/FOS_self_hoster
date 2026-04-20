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
    body: "Your apps run in a dedicated container that belongs only to you — no shared infrastructure, no data mining, no ads. We profit from your subscription, not your data. Cancel any time and take everything with you.",
    tag: "Your Container",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-28 px-6 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(42,157,152,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-xs text-[#2a9d98] uppercase tracking-[0.2em] font-medium mb-4">How it works</p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#e8f8f8] tracking-tight">
            Three steps. No PhD required.
          </h2>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map(({ number, title, body, tag }) => (
            <div key={number} className="relative flex flex-col items-start gap-5">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl bg-[#2a9d98]/10 border border-[#2a9d98]/30 flex items-center justify-center shrink-0">
                  <span className="font-display font-bold text-xl text-[#2a9d98]">{number}</span>
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#2a9d98] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>
                <span className="text-xs font-medium text-[#2a9d98]/70 uppercase tracking-widest border border-[#2a9d98]/20 bg-[#2a9d98]/5 px-3 py-1 rounded-full">
                  {tag}
                </span>
              </div>
              <div>
                <h3 className="font-display font-semibold text-xl text-[#e8f8f8] mb-3">{title}</h3>
                <p className="text-sm text-[#5a8a87] leading-relaxed font-light">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
