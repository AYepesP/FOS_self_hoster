import WaitlistForm from "./WaitlistForm";

export default function WaitlistSection() {
  return (
    <section id="waitlist" className="py-28 px-6 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(124,58,237,0.1) 0%, transparent 70%)",
        }}
      />
      <div className="relative max-w-6xl mx-auto">
        <div className="rounded-3xl border border-[#7c3aed]/20 bg-[#0e0e1a]/80 px-8 py-16 sm:px-16 flex flex-col items-center text-center gap-8 relative overflow-hidden">
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.6), transparent)",
            }}
          />

          <div>
            <p className="text-xs text-[#7c3aed] uppercase tracking-[0.2em] font-medium mb-4">
              Reserve your spot
            </p>
            <h2 className="font-display font-bold text-3xl sm:text-5xl text-[#f0eeff] tracking-tight leading-tight">
              Be the first to get access.
            </h2>
            <p className="mt-4 text-[#6b6b8a] text-base max-w-lg mx-auto font-light leading-relaxed">
              We&apos;re building in the open. Waitlist members get early access, founder pricing, and
              a direct line to shape what we build.
            </p>
          </div>

          <WaitlistForm />

          <div className="flex flex-wrap items-center justify-center gap-8 text-xs text-[#6b6b8a]">
            {[
              "Early-access pricing",
              "Shape the product roadmap",
              "Cancel any time",
            ].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
