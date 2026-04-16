# landing

Waitlist landing page for data-vault. Primary goal: **capture emails** to validate product-market fit before building the full product.

---

## Objectives

1. Communicate the value proposition quickly and clearly to a non-technical, privacy-conscious audience.
2. Convert visitors into waitlist signups (email + optional first name only — no more).
3. Feel trustworthy, modern, and minimal — consistent with a privacy-first brand.

---

## Tech Stack

| Tool | Version / Notes |
|------|----------------|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Component library | shadcn/ui |
| Email / waitlist | Resend (transactional) + Loops.so (waitlist management) — decide before starting |
| Linting | ESLint + Prettier |

### Why Next.js over plain Vite?
App Router gives us server actions for the email signup form (no separate API route file needed), built-in SSR for SEO, and easy deployment to Vercel.

---

## Component Architecture

**Rule: one concern per file. No big page files with all logic inside.**

Prefer many small components over few large ones. A page file should read like an outline — it composes components, it does not implement them.

```
landing/
├── app/
│   ├── layout.tsx          # Root layout, fonts, metadata
│   ├── page.tsx            # Composes section components only
│   └── actions.ts          # Server actions (waitlist form submit)
├── components/
│   ├── ui/                 # shadcn primitives (auto-generated, do not edit manually)
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── sections/           # One file per landing page section
│       ├── Hero.tsx
│       ├── Problem.tsx
│       ├── HowItWorks.tsx
│       ├── SocialProof.tsx
│       ├── WaitlistForm.tsx
│       └── FAQ.tsx
├── lib/
│   └── waitlist.ts         # Email service client / submit logic
└── CLAUDE.md
```

---

## Landing Page Sections

Build these sections in order. Each maps to a file in `components/sections/`.

### 1. `Hero.tsx`
- Bold headline focused on the outcome, not the tech ("Your apps. Your data. Zero server knowledge.")
- One-line subheadline clarifying who it's for
- Inline `WaitlistForm` (or a CTA button that scrolls to it)
- Keep it above the fold

### 2. `Problem.tsx`
- 2–3 short pain points the target user feels (homelab burnout, trusting Big Tech with everything, family IT support burden)
- Use icons + short copy, not paragraphs

### 3. `HowItWorks.tsx`
- 3-step visual: Browse the app store → Install in one click → Your data stays yours
- Simple numbered steps or a timeline component

### 4. `SocialProof.tsx`
- Placeholder quotes / community signal from Reddit/HN/homelab discussions
- Can be swapped for real testimonials post-launch
- Show it early to build credibility

### 5. `WaitlistForm.tsx`
- Fields: **Email** (required) + **First name** (optional)
- No phone, no company, no "how did you hear about us" — respect user privacy
- Submit calls a Next.js server action in `app/actions.ts`
- Show a friendly success state inline (no redirect)
- Loading + error states required

### 6. `FAQ.tsx`
- Use shadcn `Accordion` component
- 4–6 questions addressing trust objections: "Where is my data stored?", "Is this open source?", "How much does it cost?", etc.

---

## Email / Waitlist Integration

Collect only: **email** + **first name (optional)**.

**Recommended: Loops.so**
- Built for early-stage waitlists
- Lets you send broadcast emails to the list later
- Simple REST API, privacy-friendly
- Free tier covers early traction

**Alternative: Resend**
- Good if you want to own the list in your own DB (Supabase, etc.) and just use Resend for the confirmation email
- More control, more setup

Whichever is chosen, the integration lives in `lib/waitlist.ts` and is called only from `app/actions.ts` (server-side). The client never touches the API key.

Confirm the choice before starting — add the service name and setup steps here once decided.

---

## Frontend Development Skill

When building any component or section in this project, invoke the **`frontend-design`** skill (`/frontend-design`). This plugin produces distinctive, production-grade UI — use it instead of writing components from scratch. It is aware of Tailwind and shadcn/ui and will avoid generic AI-generated aesthetics.

Apply it per component, not once for the whole page. Example workflow:
1. Scaffold the project structure manually.
2. For each section component (`Hero`, `WaitlistForm`, etc.), invoke `/frontend-design` with the component's purpose and constraints from this file.
3. Wire the components together in `page.tsx`.

---

## Design Guidelines

- **Color palette**: dark background preferred (privacy/security aesthetic). Use a single accent color (e.g. violet or teal). Keep it minimal.
- **Typography**: a clean sans-serif (Inter or Geist). Large, confident headlines.
- **Spacing**: generous whitespace. Do not cram content.
- **Animations**: subtle fade-in on scroll is fine. No heavy animations that hurt performance or feel gimmicky.
- **Mobile-first**: design and test on mobile width first, then scale up.
- **No stock photos**: use abstract shapes, gradients, or illustrations instead.

---

## Conversion Optimisation

- The `WaitlistForm` should appear at least twice: in the `Hero` and again near the bottom of the page.
- The CTA copy should be specific and low-friction: "Join the waitlist" not "Submit".
- Show a count or signal of interest if available ("X people already signed up").
- Keep the page fast: aim for Lighthouse performance score > 90.

---

## Data & Privacy

- Collect only what is stated above (email + optional name).
- Never log or expose emails in client-side code or analytics.
- If using analytics, prefer a privacy-respecting tool (Plausible, Fathom) over Google Analytics.
- Include a minimal privacy note near the form: "No spam. Unsubscribe any time."

---

## Environment Variables

```
# .env.local (never commit)
LOOPS_API_KEY=
# or
RESEND_API_KEY=
WAITLIST_LIST_ID=
```

---

## Definition of Done

- [ ] All sections render correctly on mobile and desktop
- [ ] Waitlist form submits successfully and shows confirmation
- [ ] Error states handled gracefully
- [ ] No TypeScript errors
- [ ] Lighthouse performance > 90, accessibility > 90
- [ ] Deployed to Vercel (or staging URL shared)
