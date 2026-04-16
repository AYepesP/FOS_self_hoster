# data-vault

> **Working title** -- may change later.

A PaaS that lets non-technical users self-host open source apps (Immich, Nextcloud, etc.) through an app-store-like UI.

---

## Product Vision

Users get a clean app-store interface. When they install an app, we automatically provision an isolated Docker container on our managed VPS infrastructure. No terminal, no YAML, no DNS headaches.

Think one step above Proton: instead of just encrypted email and storage, users get access to a full catalog of self-hosted tools -- photo management, file sync, password managers, and more -- without needing any technical knowledge.

## Target User

Privacy-conscious but non-technical. They want data ownership but lack either the time or the know-how to run a homelab or VPS themselves.

- **Persona**: someone who already uses Proton for email/VPN and wishes they could also self-host everything else.
- **Pain point**: many homelabbers become unwilling "IT support" for their families. data-vault removes that burden entirely -- friends and family can just use the app store.
- **Key insight**: there is a large, vocal community of people who care about privacy but will never touch a terminal. They are currently underserved.

## Core Principles

- **Privacy-first** -- encrypt user data at rest and in transit. Minimize collection of personal information. Aim for zero-knowledge where feasible. The platform operator (us) should know as little as possible about the user's data.
- **Simplicity** -- every interaction should feel as easy as installing a mobile app. If it requires a tutorial, it's too complex.
- **Security** -- containers are isolated per-user. Principle of least privilege throughout the stack. Automatic updates for hosted apps where safe to do so.

## Tech Preferences

| Layer | Choice | Notes |
|-------|--------|-------|
| Frontend | React | Confirmed preference |
| Backend | TBD | To be decided during architecture phase |
| Database | TBD | To be decided during architecture phase |
| Orchestration | TBD | Core to the product |
| Infra/hosting | TBD | To be decided during architecture phase |

## Current Status & Roadmap

### Done

- **Market validation** -- strong signal from privacy communities and homelab burnout discussions. People want this.

### Next Milestone

- Waitlist landing page with email signup.
- If easy to implement, run small A/B tests on pricing tiers and landing page copy to gauge willingness to pay.

### After That

- Design the product architecture end-to-end.
- Build and test an MVP.

## Coding & Contribution Guidelines

> Conventions will be added here as the codebase takes shape. For now, follow these basics:

- Write clear, self-documenting code. Avoid unnecessary comments.
- Keep PRs small and focused.
- All secrets and credentials go in environment variables, never committed.
