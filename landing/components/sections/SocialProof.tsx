type Comment = {
  initials: string;
  handle: string;
  community: string;
  upvotes: number | null;
  badge: string | null;
  quote: string;
};

const comments: Comment[] = [
  {
    initials: "ZK",
    handle: "u/zedkyuu",
    community: "r/homelab",
    upvotes: null,
    badge: "Top 1% Commenter",
    quote:
      "In my experience, it's been updates. When I'm doing an update at work, I test it first in a non-prod environment, then gradually roll it out. At home, I have the one deployment and if the upgrade screws up, I usually have no idea what I was running previously. Oh, and it's usually 10:30 pm at night and I just want to go to bed. There's nothing stopping me from putting more checks in the way other than, well, it's work.",
  },
  {
    initials: "CP",
    handle: "u/ChunkoPop69",
    community: "r/homelab",
    upvotes: 9,
    badge: null,
    quote:
      "After trying to teach countless people how to use tailscale, I've lost a great deal of hope for the average person's technical capabilities.",
  },
  {
    initials: "ON",
    handle: "u/Ok_Negotiation3024",
    community: "r/homelab",
    upvotes: 2,
    badge: null,
    quote:
      "Not many know how. Tons of planning involved and maintenance. People like easy. And the people that do know how, don't want to spend every waking second being tech support for the people that don't want to learn.",
  },
];

function UpvoteIndicator({ upvotes, badge }: { upvotes: number | null; badge: string | null }) {
  if (badge) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#2a9d98]/10 border border-[#2a9d98]/20 text-[10px] font-medium text-[#2a9d98] tracking-wide whitespace-nowrap">
        {badge}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
        className="text-[#ff4500]"
      >
        <path
          d="M6 1L10.5 7H7.5V11H4.5V7H1.5L6 1Z"
          fill="currentColor"
        />
      </svg>
      <span className="text-xs font-medium text-[#5a8a87] tabular-nums">{upvotes}</span>
    </div>
  );
}

export default function SocialProof() {
  return (
    <section className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs text-[#2a9d98] uppercase tracking-[0.2em] font-medium mb-4">
            Community signal
          </p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#e8f8f8] tracking-tight">
            The demand is already there.
          </h2>
          <p className="mt-4 text-[#5a8a87] text-sm max-w-lg mx-auto">
            Voices from the privacy and self-hosting communities — the people we&apos;re building
            this for.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {comments.map(({ initials, handle, community, upvotes, badge, quote }) => (
            <div
              key={handle}
              className="relative rounded-2xl p-7 border border-white/5 bg-[#0f2240] flex flex-col gap-5"
            >
              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#2a9d98]/30 to-transparent" />

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-[#2a9d98] to-[#1b7874] flex items-center justify-center text-xs font-display font-bold text-white">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#e8f8f8] truncate">{handle}</p>
                    <p className="text-xs text-[#2a9d98]/60">{community}</p>
                  </div>
                </div>
                <div className="shrink-0">
                  <UpvoteIndicator upvotes={upvotes} badge={badge} />
                </div>
              </div>

              <p className="text-sm text-[#5a8a87] leading-relaxed font-light italic">
                &ldquo;{quote}&rdquo;
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-white/5 bg-[#0f2240] px-5 py-4 flex items-start gap-3 max-w-xl mx-auto">
          <svg
            width="16"
            height="16"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
            className="shrink-0 mt-0.5"
          >
            <circle cx="7" cy="7" r="6" stroke="#5a8a87" strokeWidth="1.2" />
            <path
              d="M7 4v4M7 9.5v.5"
              stroke="#5a8a87"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          <p className="text-xs text-[#5a8a87] leading-relaxed">
            Real comments from{" "}
            <strong className="text-[#e8f8f8]/50 font-medium">
              an r/homelab thread we posted
            </strong>{" "}
            while researching this problem — not cherry-picked, this is the recurring theme.
          </p>
        </div>
      </div>
    </section>
  );
}
