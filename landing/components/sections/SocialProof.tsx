const testimonials = [
  {
    initials: "RK",
    handle: "u/rk_selfhosted",
    community: "r/selfhosted",
    stars: 5,
    quote:
      "I've been running my own Nextcloud for four years. The maintenance alone cost me more weekends than I care to admit. Something like this would have saved me hundreds of hours.",
  },
  {
    initials: "SM",
    handle: "u/signal_matters",
    community: "r/privacy",
    stars: 5,
    quote:
      "The barrier to entry for self-hosting is still too high for most people. My family uses Google Photos because I couldn't get them to trust my server. A proper UI layer would change everything.",
  },
  {
    initials: "TN",
    handle: "u/tired_netadmin",
    community: "r/homelab",
    stars: 5,
    quote:
      "I finally convinced my wife to switch off iCloud. Two weeks later, my Immich server went down during a family trip. I need something that just works, without me babysitting it.",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill="#7c3aed">
          <path d="M6 1l1.3 2.7L10 4.2l-2 2 .5 2.8L6 7.7l-2.5 1.3.5-2.8-2-2 2.7-.5z" />
        </svg>
      ))}
    </div>
  );
}

export default function SocialProof() {
  return (
    <section className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs text-[#7c3aed] uppercase tracking-[0.2em] font-medium mb-4">Community signal</p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#f0eeff] tracking-tight">
            The demand is already there.
          </h2>
          <p className="mt-4 text-[#6b6b8a] text-sm max-w-lg mx-auto">
            Voices from the privacy and self-hosting communities — the people we&apos;re building this for.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(({ initials, handle, community, stars, quote }) => (
            <div
              key={handle}
              className="relative rounded-2xl p-7 border border-white/5 bg-[#0e0e1a] flex flex-col gap-5"
            >
              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#7c3aed]/30 to-transparent" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] flex items-center justify-center text-xs font-display font-bold text-white">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#f0eeff]">{handle}</p>
                    <p className="text-xs text-[#7c3aed]/60">{community}</p>
                  </div>
                </div>
                <Stars count={stars} />
              </div>

              <p className="text-sm text-[#6b6b8a] leading-relaxed font-light italic">&ldquo;{quote}&rdquo;</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-white/5 bg-[#0e0e1a] px-5 py-4 flex items-start gap-3 max-w-xl mx-auto">
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-0.5">
            <circle cx="7" cy="7" r="6" stroke="#6b6b8a" strokeWidth="1.2" />
            <path d="M7 4v4M7 9.5v.5" stroke="#6b6b8a" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <p className="text-xs text-[#6b6b8a] leading-relaxed">
            These are <strong className="text-[#f0eeff]/50 font-medium">representative voices</strong>, not real user accounts. They reflect the genuine sentiment we see across r/selfhosted, r/privacy, and r/homelab — we haven&apos;t launched yet, so we don&apos;t have real testimonials. We&apos;ll replace these the moment we do.
          </p>
        </div>
      </div>
    </section>
  );
}
