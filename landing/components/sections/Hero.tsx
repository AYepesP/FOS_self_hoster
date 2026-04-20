import WaitlistForm from "./WaitlistForm";
import { Badge } from "@/components/ui/badge";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden grid-texture">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full animate-float"
          style={{
            background: "radial-gradient(circle, rgba(42,157,152,0.18) 0%, rgba(42,157,152,0.06) 40%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full animate-pulse-slow"
          style={{
            background: "radial-gradient(circle, rgba(42,157,152,0.08) 0%, transparent 70%)",
            animationDelay: "2s",
          }}
        />
        <div
          className="absolute bottom-1/3 left-1/4 w-[200px] h-[200px] rounded-full animate-pulse-slow"
          style={{
            background: "radial-gradient(circle, rgba(94,206,202,0.06) 0%, transparent 70%)",
            animationDelay: "4s",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center gap-8 max-w-4xl mx-auto">
        <Badge
          className="animate-reveal-fade bg-[#2a9d98]/15 text-[#5ececa] border border-[#2a9d98]/30 px-4 py-1.5 text-xs font-medium uppercase tracking-widest rounded-full"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#5ececa] mr-2 animate-pulse-slow inline-block" />
          Now accepting early access
        </Badge>

        <h1 className="animate-reveal-up delay-100 font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight">
          <span className="text-gradient">Your apps.</span>
          <br />
          <span className="text-[#e8f8f8]">Your data.</span>
          <br />
          <span className="text-[#e8f8f8]/60">Big Tech doesn&apos;t get a vote.</span>
        </h1>

        <p className="animate-reveal-up delay-200 text-lg sm:text-xl text-[#5a8a87] max-w-2xl leading-relaxed font-light">
          An app store for privacy-first tools — Immich, Nextcloud, Vaultwarden, and more.
          One click to install. We run the server.{" "}
          <span className="text-[#5ececa]/80">You hold the keys. Always.</span>
        </p>

        <div className="animate-reveal-up delay-300 w-full flex justify-center">
          <WaitlistForm />
        </div>

        <div className="animate-reveal-fade delay-500 flex flex-wrap items-center justify-center gap-6 text-sm text-[#5a8a87]">
          {[
            { icon: "🔒", label: "End-to-end encrypted" },
            { icon: "🚫", label: "No tracking" },
            { icon: "🗑️", label: "Delete anytime" },
          ].map(({ icon, label }) => (
            <span key={label} className="flex items-center gap-2">
              <span>{icon}</span>
              <span>{label}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-pulse-slow">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[#5a8a87]">
          <path d="M10 4v12M6 12l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  );
}
