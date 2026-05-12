---
description: Frontend implementation guidelines for Almerno. Load this before writing any UI component, page, or visual feature.
---

# Frontend Implementation Guidelines

## Stack

| Tool | Version / Notes |
|------|----------------|
| Framework | Next.js App Router |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui — use primitives, compose rather than override |
| Animation | Framer Motion — sparingly, purposefully |
| Analytics | `@vercel/analytics/next` — already wired in layout.tsx |

## Almerno Design System

- **Background**: `#0c1a35` (navy)
- **Accent light**: `#5ececa`
- **Accent mid**: `#2a9d98`
- **Accent dark**: `#1b7874`
- **Display font**: Bricolage Grotesque (`--font-syne` CSS variable)
- **Body font**: DM Sans (`--font-dm-sans` CSS variable)
- **Mono font**: Geist Mono (`--font-geist-mono` CSS variable)
- Never hardcode hex values in components — use Tailwind tokens or the CSS variables already defined in `globals.css`.

## File Rules

- One component per file. No exceptions.
- Components live in `components/sections/`, `components/layout/`, or `components/ui/` (shadcn only).
- `app/page.tsx` composes sections only — no logic, no state, no inline JSX beyond section imports.
- `app/layout.tsx` handles fonts, metadata, and global wrappers only.
- Never edit files in `components/ui/` manually — those are shadcn-managed.

## Code Rules

- Mobile-first. Design at 375px, then scale up with `md:` and `lg:` breakpoints.
- No inline styles. Tailwind classes or CSS variables only.
- Semantic HTML. Use `<nav>`, `<main>`, `<section>`, `<article>`, `<button>` correctly.
- Every interactive element must be keyboard-accessible.
- Images need `alt` text. Icons used decoratively get `aria-hidden="true"`.
- No `any`. Prop types are explicit interfaces or inferred from usage.

## Animation Rules

- Only animate when it improves comprehension or delight — never for decoration.
- Respect `prefers-reduced-motion`. Wrap Framer Motion variants with a reduced-motion check.
- Entrance animations: short (200–400ms), easing out. Nothing that makes the user wait.

## Component Checklist

Before a component is done:
- [ ] Renders correctly at 375px, 768px, 1280px
- [ ] No TypeScript errors (`tsc --noEmit`)
- [ ] Loading state exists if async data is involved
- [ ] Error state exists if async data is involved
- [ ] Keyboard navigation works
- [ ] No hardcoded colors outside design system tokens

## What Bad Looks Like (avoid)

- A `page.tsx` file with 300 lines of mixed JSX and business logic
- Tailwind classes like `text-[#2a9d98]` instead of a defined token
- A component that fetches its own data AND renders UI AND handles error state all in one file
- `className="..."` strings over 10 classes long with no extraction into a variant
- Props typed as `any` or `object`
