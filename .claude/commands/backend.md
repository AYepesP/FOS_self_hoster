---
description: Backend implementation guidelines for Almerno. Load this before writing any API route, server action, database schema, infrastructure script, or configuration.
---

# Backend Implementation Guidelines

## Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Runtime | Node.js (Vercel Functions) | Default for API routes |
| API | Next.js Route Handlers | `app/api/*/route.ts` |
| Server Actions | Next.js Server Actions | For form mutations only |
| Email / CRM | Loops.so (`loops` npm package) | Waitlist integration |
| Secrets | Environment variables | Never in source |

## Almerno-Specific Context

The product provisions **isolated Docker containers per user** on managed VPS infrastructure. Every backend decision should be evaluated against these constraints:

- **Isolation**: a compromise in one tenant's container must not affect others. Design with blast-radius in mind.
- **Orchestration**: container lifecycle (provision, start, stop, update, destroy) must be fully automated and auditable.
- **Networking**: each user's apps need a subdomain, TLS, and reverse-proxy routing — all automated.
- **Cost at rest**: most containers will be idle most of the time. Resource management is a core product concern.
- **Non-technical users**: errors must never surface raw stack traces, container IDs, or system internals to the user.

## API Design Rules

- REST for external-facing endpoints. tRPC or Server Actions for internal UI mutations.
- Every route validates input at the boundary. Never trust the request body.
- Return consistent error shapes: `{ error: string, code?: string }`.
- HTTP status codes must be semantically correct: 200, 201, 400, 401, 403, 404, 422, 500. Do not return 200 with an error body.
- Never log user PII (email, name) to console or external logging unless explicitly required and documented.

## Security Rules

- Principle of least privilege: every service, every container, every API key gets only the permissions it needs.
- Input validation at every boundary. Sanitise before passing to shell, SQL, or external APIs.
- Secrets in environment variables only — never hardcoded, never committed.
- No dynamic code execution on user-supplied strings. No shell interpolation with user input.
- Rate-limit public endpoints. Waitlist, auth, and any unauthenticated mutation endpoint must have rate limiting.

## Database Rules (when applicable)

- PostgreSQL as the default. Justify any deviation.
- Schema is multi-tenancy-aware from the start. Every table that holds user data has a `user_id` or `tenant_id` foreign key.
- Migrations are forward-only. Never a destructive migration without a rollback plan documented alongside it.
- Parameterised queries only — no SQL built by string concatenation.

## Infrastructure Rules

- Containers run as non-root users.
- No container mounts the Docker socket unless it is the orchestrator and that is explicitly justified.
- Network policies are allowlist-based: containers cannot reach each other unless explicitly permitted.
- Every provisioned resource gets a TTL or a cleanup path. Nothing is created without a way to destroy it.

## Code Rules

- One concern per file. Route handler is not also business logic is not also DB access.
- Functions do one thing. If a function name needs "and" in it, split it.
- Errors are handled explicitly. No silent catch blocks. No `catch (e) {}` that swallows the error.
- Async functions must handle rejection. No floating promises.
- No `any`. Types are explicit.

## Architecture Checklist (before committing to a design)

- [ ] What is the failure mode if this component goes down?
- [ ] How does this scale to 10x users? 100x?
- [ ] Where are the secrets and who can access them?
- [ ] What does a new developer need to do to run this locally in under 10 minutes?
- [ ] Is there a clear data deletion / user offboarding path?
- [ ] What is the blast radius of a bug in this component?
