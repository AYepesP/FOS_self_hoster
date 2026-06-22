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

## ⚠️ PoC-Only Deviations from Production (MUST REVERT BEFORE PROD)

These settings exist only to make local testing possible. They represent real security vulnerabilities in a production environment. Every item here must be reverted before any real user data touches the system.

| Setting | File | PoC value | Prod value | Risk if left in |
|---------|------|-----------|------------|-----------------|
| `SIGNUPS_ALLOWED` | `apps/catalog.json` | `true` | `false` | Anyone who finds the container URL can create a Vaultwarden account |

**Why `SIGNUPS_ALLOWED=true` is test-only:** In production, Almerno's control plane provisions user credentials — self-signup is never needed and is a direct attack surface. Any exposed port with open signup is an invitation for abuse.

**Revert checklist before production:**
- [ ] Set `SIGNUPS_ALLOWED` back to `"false"` in `catalog.json`
- [ ] Verify no other catalog entries have open signup equivalents (`ALLOW_SIGNUP`, `DISABLE_REGISTRATION`, etc.)

---

## Known Issue: gocryptfs + Docker Require `-allow_other`

**Discovered:** 2026-06-22, during PoC end-to-end test.

**The problem:** gocryptfs creates a FUSE mount owned by the running user (uid 1000). The Docker daemon runs as root. By default, FUSE blocks all other users — including root — from accessing a user-created mount. Docker cannot bind-mount the plaintext directory into a container without root access to that directory.

**The fix (current, in `encryption.py`):**
- `/etc/fuse.conf` must have `user_allow_other` uncommented — system-level gate.
- `mount_volume()` passes `-allow_other` to gocryptfs — opens the mount to root.

**Does this break the privacy model?** No, for two reasons:
1. The encryption protects against **third parties** (disk theft, Hetzner), not against Almerno as the operator. The decryption key is derived from `MASTER_SECRET`, which Almerno controls — so the operator could always decrypt. `-allow_other` doesn't change this.
2. Inter-user isolation is maintained by Docker: each user's plaintext is bind-mounted only into their own container. `-allow_other` is about root access, not cross-user access.

**Real risk:** On a multi-user system where multiple people have shell login access, `-allow_other` would allow any of them to walk into another user's plaintext directory while mounted. On a production server with no other SSH users, this is not a live risk.

**Long-term fix:** Switch to **rootless Docker** (Docker daemon runs as uid 1000, same as the gocryptfs mount owner). No `-allow_other` needed — root cannot access the plaintext even while mounted. This is planned for v2 alongside gVisor. See Architecture Principles below.

---

## Privacy Tier System (Pending Implementation)

**Decision made: 2026-06-22.**

Every app in `catalog.json` must declare a `privacy_tier` field. This field drives two things: honest documentation for the team, and a visible tag on each app card in the UI ("E2E Encrypted", "Encrypted at Rest", etc.).

### Why

Not all apps offer the same privacy guarantees. Treating them identically in the catalog — and in the UI — would be misleading. Users deserve to know what they're getting. This also forces us to evaluate every new app we add before it ships.

The root insight: some apps encrypt your data on your device before the server ever sees it (true zero-knowledge). Others require the server to process plaintext to function at all. No infrastructure-level encryption changes the latter — the server must see your data to serve it.

### Tiers

| Tier | Label shown in UI | Meaning |
|------|-------------------|---------|
| `e2e` | E2E Encrypted | App encrypts data on the client before the server sees it. Almerno (and any attacker) cannot read your data even while the service is running. Example: Vaultwarden — the Bitwarden protocol encrypts your vault in the browser; the server stores only ciphertext. |
| `encrypted_at_rest` | Encrypted at Rest | Data is encrypted on disk when the container is stopped. While the container is running, Almerno's infrastructure can access plaintext. Protects against third parties (disk theft, provider breach) but not against the operator. |
| `partial` | Partial Encryption | Some data is E2E, some is server-visible. Document specifics in the catalog entry. |
| `none` | Standard Privacy | No encryption beyond TLS in transit. Data is readable by the operator while stored and in use. Honest default for apps that require server-side processing (ML, search indexing, etc.). |

### Current App Assessments

| App | Tier | Reason |
|-----|------|--------|
| Vaultwarden | `e2e` | Bitwarden protocol: vault encrypted client-side via AES-256. Server stores encrypted blobs only. Server never sees passwords. This is true even without gocryptfs — our volume encryption is redundant for vault contents but does protect metadata (login timestamps, account count). |
| Actual Budget | `encrypted_at_rest` | Simple data store; no client-side encryption. Server sees your financial data while running. gocryptfs protects at rest. |
| Mealie | `encrypted_at_rest` | Server must render recipes, parse imports, serve images. Server-side processing requires plaintext access. gocryptfs protects at rest. |

### Catalog Schema Change (Implemented 2026-06-22)

Each entry in `catalog.json` now carries:

```json
"privacy_tier": "e2e",
"privacy_note": "Your vault is encrypted in your browser before leaving your device. Almerno cannot read your passwords."
```

`loader.py` validates `privacy_tier` against `VALID_PRIVACY_TIERS` at load time — unknown tiers raise a `ValueError` immediately at startup. Both fields are required; omitting either will raise a `KeyError`.

### UI Change (Not Yet Implemented)

On the app store card:
- Display a small tag using the tier label
- On hover/tap: show the `privacy_note`
- Color suggestion: teal for `e2e`, muted teal for `encrypted_at_rest`, grey for `none`

This belongs in the frontend implementation. When implementing, load the `/frontend` skill and reference this section.

### App Evaluation Checklist (for future catalog additions)

Before adding any new app, answer:
- Does it have documented client-side encryption? (Check their security whitepaper / source)
- Does the server need to process or index the data to function?
- What does the app store on disk, and in what format?
- Is there a known security audit?

If the answers don't clearly support `e2e`, default to `encrypted_at_rest` or `none` and be honest about it.

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
