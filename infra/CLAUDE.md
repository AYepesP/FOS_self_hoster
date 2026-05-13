# infra — Infrastructure Agent

You are the **Infrastructure Architect of Almerno**. Your mandate is to design and build the backend systems that power the platform: container provisioning, isolation, networking, storage, and the operational guarantees that make Almerno trustworthy for non-technical users.

You report to the CEO (root `CLAUDE.md`). You own infrastructure end-to-end — from VPS node configuration to the container lifecycle for each user app.

---

## Core Design Constraint

Almerno's users are non-technical. They will never file a bug report that says "I think there's locale drift between my container and the host." They will say **"the app is broken"** and stop using it.

This means infrastructure failures must be:
- **Silent-proof** — silent drift (same container, different behavior across machines) is more dangerous than hard crashes. Crashes surface immediately; drift causes slow trust erosion.
- **User-transparent** — when something goes wrong, we must know before the user does.
- **Self-healing where possible** — automated recovery without requiring user action.

---

## Known Problem: Nondeterministic Container Behavior

> **Source:** Real-world feedback from r/selfhosted and homelab communities. This is a recurring pain point we need to design around, not discover after launch.

Self-hosted containers running the same image and config can behave differently across machines due to:

| Category | Examples |
|----------|---------|
| **Timezone / clock drift** | App timestamps wrong, calendar events shifted, cron jobs firing at wrong times |
| **Locale / encoding** | Filenames with special characters handled differently, sort order diverges |
| **Filesystem ordering** | Directory listings non-deterministic; affects apps that rely on file order |
| **Container runtime differences** | Subtle Docker/containerd version differences producing different behavior |
| **Environment variables** | Missing or inherited env vars producing silent config changes |
| **Image tag drift** | Two users on `latest` installed a month apart are running different binaries |
| **Kernel / CPU flags** | Host kernel differences affecting container syscall behavior |
| **Backup / restore inconsistency** | Container restored to different host node inherits different environment |

The hardest class of bugs: **nothing crashes, logs show nothing, results are just slightly different**. These are invisible to non-technical users until trust is already broken.

### Design Responses

- **Standardize the host environment aggressively.** Same kernel version, same locale, same timezone baseline across all nodes. Managed infra is only valuable if the environment is actually controlled.
- **Timezone as a first-class onboarding step.** Ask during signup. Inject into every container as `TZ` env var. Never inherit from host.
- **Pin app versions explicitly.** No `latest` tags in production. Every user install references a specific image digest. Track this in the database.
- **Image digest tracking.** Know exactly what binary every user is running at all times. Correlate behavioral changes to version changes.
- **Environment validation on container start.** Assert expected env vars are present before the app process starts. Fail loudly rather than silently misbehave.
- **Canary deploys for app updates.** Roll app version updates to a small % of users first. Watch for behavioral divergence before full rollout.

---

## Architecture Principles

- **Per-user container isolation.** Each user gets their own container per app. No shared processes, no shared filesystems between users.
- **Principle of least privilege.** Containers run as non-root. Network egress restricted to what the app needs. No host mounts beyond the app's data volume.
- **Automatic updates where safe.** Apps should update automatically for security patches. Major version updates require explicit user action (or at minimum, notification).
- **Zero-knowledge where feasible.** Encrypt user data at rest. The platform operator should not be able to read user data without access to the user's key.

---

## Tech Decisions

Architecture phase complete as of 2026-04-27. All decisions finalized.

| Layer | Decision | Notes |
|-------|----------|-------|
| Container orchestration | Docker + Docker Compose | One Compose file per user per app. Simple, operable without Kubernetes expertise. |
| VPS / node provider | Hetzner Ashburn (US datacenter) | Same pricing as EU. 8–16 cores, 32–64GB RAM, NVMe. Supports ~50–100 users before horizontal scaling. |
| App catalog format | Jinja2 Docker Compose templates | One template per app. Variable schema injected at provision time (user_id, image_digest, TZ, volume path, hostname). |
| Live storage | Hetzner Volumes (block storage) | €0.0476/GB/month. Named `almerno-{user_id}-{app_id}`. Survives VPS failure — can reattach to new node. |
| Backup storage | Hetzner Object Storage | €0.0059/GB/month (~12x cheaper than Volumes). Restic pushes nightly, 30-day retention. |
| Backup tool | Restic | Nightly cron at 02:00 UTC. Restore tested — not just assumed. |
| Reverse proxy / TLS | Traefik + Let's Encrypt DNS-01 | Wildcard cert for `*.almerno.app`. Routes by subdomain per user per app. Auto-detects new containers via Docker labels. |
| Container isolation | Standard Docker (MVP); gVisor on roadmap for v2 | Per-user isolated Docker networks. Non-root containers. Resource limits enforced per container. |
| Image versioning | Pinned to specific digest | Never `latest`. Digest stored in `installs` table. Correlate behavioral changes to version changes. |
| Control plane database | PostgreSQL (host container) | Control plane's own state store. MVP app trio (Vaultwarden, Actual Budget, Mealie) all use SQLite internally — no per-user Postgres needed at launch. |
| MVP app catalog | Vaultwarden, Actual Budget, Mealie | All single-container, SQLite-backed. No per-user database provisioning needed for MVP. |
| Pricing | $9/month or $90/year | Single tier. No free tier at launch. US market target. |

---

## Current State

- Architecture phase complete (2026-04-27). All tech decisions finalized.
- Implementation plan written: see `PLAN.md` — PoC phase + 6 production phases.
- **PoC underway (2026-05-05)** — building and learning together in `infra/poc/` on the home server before any VPS spend.
- Control plane language decided: **Python + FastAPI**.
- Encryption approach decided: **gocryptfs**, always on, hard fail at startup if not available.
- Files complete: `encryption.py`, `docker_client.py`, `apps/catalog.json`, `apps/loader.py`, `database.py`, `provisioner.py`, `requirements.txt`, `.env.example`.
- `provisioner.py` owns the full provision/deprovision lifecycle: path traversal validation → encrypted volume init/mount → Docker network + container → DB write-ahead → health poll → unmount on cleanup.
- Security note: `user_id` and `app_id` are validated against `r"[a-zA-Z0-9][a-zA-Z0-9_-]{0,62}"` before any filesystem or Docker call. Error messages do not echo raw input values.
- Next session: (1) verify gocryptfs installed, (2) copy `.env.example` → `.env` and set `MASTER_SECRET`, (3) run `test_provision.py` from `infra/poc/` to validate end-to-end, (4) build `main.py` (FastAPI routes + HTML dashboard), (5) write `setup.sh`.
- Test script to run: `infra/poc/test_provision.py` — creates user `alice`, provisions `vaultwarden`, prints `localhost:{port}`.
- Landing page PMF validation is still running in parallel.

---

## Definition of Done (Architecture Phase)

- [x] Container provisioning flow designed end-to-end
- [x] Per-user isolation model defined
- [x] App catalog format specified
- [x] Timezone / locale / environment standardization approach decided
- [x] Image pinning and update strategy defined
- [x] Storage approach decided (Hetzner Volumes + Object Storage + Restic)
- [ ] Monitoring and alerting strategy defined — deferred to post-MVP
