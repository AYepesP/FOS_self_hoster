const problems = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2h-4" stroke="#7c3aed" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M9 3a2 2 0 014 0v4H9V3z" stroke="#7c3aed" strokeWidth="1.75" />
        <path d="M9 12h6M9 16h4" stroke="#7c3aed" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
    title: "Homelab burnout is real.",
    body: "You set it up on a Saturday. Three updates, two broken configs, and one failed migration later — it's 2am and nothing works. There has to be a better way.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#7c3aed" strokeWidth="1.75" />
        <path d="M2 12h4M18 12h4M12 2v4M12 18v4" stroke="#7c3aed" strokeWidth="1.75" strokeLinecap="round" />
        <circle cx="12" cy="12" r="3" stroke="#7c3aed" strokeWidth="1.75" />
      </svg>
    ),
    title: "Big Tech owns your photos, files, and memories.",
    body: "Google Photos. iCloud. Dropbox. You pay them to store your data, they use it to build your profile. You've been uneasy about it for years.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#7c3aed" strokeWidth="1.75" strokeLinecap="round" />
        <circle cx="9" cy="7" r="4" stroke="#7c3aed" strokeWidth="1.75" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#7c3aed" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
    title: "Your server going down shouldn't be a family emergency.",
    body: "When Nextcloud crashes, the people you set it up for can't access their files — and you're the one getting the calls. Self-hosting shouldn't mean being on-call 24/7 for the people you care about.",
  },
];

export default function Problem() {
  return (
    <section className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs text-[#7c3aed] uppercase tracking-[0.2em] font-medium mb-4">The problem</p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#f0eeff] tracking-tight">
            Privacy shouldn&apos;t come with homework.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map(({ icon, title, body }) => (
            <div
              key={title}
              className="group relative rounded-2xl p-8 border border-white/5 bg-[#0e0e1a] hover:border-[#7c3aed]/30 transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#7c3aed]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-[#7c3aed]/10 border border-[#7c3aed]/20 flex items-center justify-center mb-6">
                  {icon}
                </div>
                <h3 className="font-display font-semibold text-lg text-[#f0eeff] mb-3 leading-snug">{title}</h3>
                <p className="text-sm text-[#6b6b8a] leading-relaxed font-light">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
