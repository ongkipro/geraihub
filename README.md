# GeraiHub

GeraiHub is a planned multi-organization, multi-branch web application for Indonesian shipment-counter operations.

This repository currently contains **planning and specification documents only**. It has no application source code, package manifest, installed dependency, database schema, OAuth configuration, Mengantar API integration, credential, migration, runtime, or deployment.

## Documentation status

- **Authority:** This repository is the canonical planning source.
- **Execution queue:** [`TASKS.md`](TASKS.md).
- **Product entry point:** [`PRD.md`](PRD.md).
- **Specification pack:** [`docs/spec/`](docs/spec/).
- **Architecture decisions:** [`docs/adr/`](docs/adr/).
- **Repository governance:** [`docs/REPOSITORY-GOVERNANCE.md`](docs/REPOSITORY-GOVERNANCE.md).
- **Retained snapshot:** `~/Documents/work/prd/geraihub/` is the pre-promotion snapshot and is no longer authoritative.
- **Development:** Not started and not authorized by the presence of these documents.

## Documentation map

| Path | Purpose |
|---|---|
| [`PRD.md`](PRD.md) | Stable entry point to the canonical product requirements |
| [`TASKS.md`](TASKS.md) | Sole future implementation queue and dependency order |
| [`docs/spec/README.md`](docs/spec/README.md) | Specification index and ownership map |
| [`docs/spec/CONTEXT-RECORD.md`](docs/spec/CONTEXT-RECORD.md) | Scope, provenance, overlays, omissions, and approval gates |
| [`docs/spec/02-PRD.md`](docs/spec/02-PRD.md) | Canonical product requirements |
| [`docs/spec/03-TECHNICAL-DESIGN.md`](docs/spec/03-TECHNICAL-DESIGN.md) | Proposed component behavior and integration gates |
| [`docs/spec/04-SYSTEM-ARCHITECTURE.md`](docs/spec/04-SYSTEM-ARCHITECTURE.md) | Target architecture, not implemented architecture |
| [`docs/adr/README.md`](docs/adr/README.md) | Accepted/proposed architecture decisions and rationale |
| [`scripts/check-repository.py`](scripts/check-repository.py) | Self-contained structural repository validator |

The remaining domain specifications are indexed in `docs/spec/README.md`.

## Protected product boundaries

- Google OAuth authenticates an external identity; GeraiHub owns users, memberships, roles, active-branch authorization, sessions, and audit records.
- Mengantar remains authoritative for provider shipment finance and settlement.
- MVP counter payment records cover cash and branch QRIS only.
- Payment corrections require an admin request and owner decision; customer refunds occur outside GeraiHub and are recorded as audited evidence.
- Estimated profit appears only after verified Mengantar pickup evidence and remains non-authoritative.
- Customer pre-fill, QR/reference lookup, and WhatsApp are post-MVP.

## Validation boundary

Structural validation proves document identifiers, owners, task references, and traceability are internally consistent. It does **not** prove:

- current Mengantar endpoint behavior;
- installed package/runtime compatibility or working application behavior;
- legal or privacy compliance;
- working UI, security controls, database behavior, or deployment readiness.

The accepted implementation baseline is Node.js 24 LTS major + Next.js App Router + PostgreSQL + Drizzle + Better Auth, with separate web and durable worker processes from one modular-monolith codebase; exact package versions and compatibility are not evidence until T-1 creates the lockfile and executes the checks. Production hosting/vendor/region remain gated.

Validate the current documentation repository with:

```bash
python3 scripts/check-repository.py .
```

No application install, build, provider request, or deployment command applies until development is explicitly authorized.
