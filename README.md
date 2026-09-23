# GeraiHub

GeraiHub is a planned multi-organization, multi-branch web application for Indonesian shipment-counter operations.

This repository currently contains **planning and specification documents only**. It has no application source code, package manifest, installed dependency, database schema, OAuth configuration, Mengantar API integration, credential, migration, runtime, or deployment.

## Documentation status

- **Authority:** This repository is the canonical planning source.
- **Current status:** [`STATUS.md`](STATUS.md).
- **Execution queue:** [`TASKS.md`](TASKS.md).
- **Product entry point:** [`PRD.md`](PRD.md).
- **Developer/AI handoff:** [`docs/spec/HANDOFF.md`](docs/spec/HANDOFF.md).
- **Specification pack:** [`docs/spec/`](docs/spec/).
- **Architecture decisions:** [`docs/adr/`](docs/adr/).
- **Repository governance:** [`docs/REPOSITORY-GOVERNANCE.md`](docs/REPOSITORY-GOVERNANCE.md).
- **Retained snapshot:** `~/Documents/work/prd/geraihub/` is the pre-promotion snapshot and is no longer authoritative.
- **Development:** Not started and not authorized by the presence of these documents.

## Documentation map

| Path | Purpose |
|---|---|
| [`STATUS.md`](STATUS.md) | Current phase, verified repository state, blockers, and next gates |
| [`PRD.md`](PRD.md) | Stable entry point to the canonical product requirements |
| [`TASKS.md`](TASKS.md) | Sole future implementation queue and dependency order |
| [`docs/spec/HANDOFF.md`](docs/spec/HANDOFF.md) | Shortest safe entry point for a developer/coding agent |
| [`docs/spec/GLOSSARY.md`](docs/spec/GLOSSARY.md) | Canonical business/technical terminology |
| [`docs/spec/TRACEABILITY.md`](docs/spec/TRACEABILITY.md) | Requirement → spec → task → evidence map |
| [`docs/spec/DECISION-GATES.md`](docs/spec/DECISION-GATES.md) | Open facts/approvals that must not be guessed |
| [`docs/spec/README.md`](docs/spec/README.md) | Full specification index and ownership map |
| [`docs/spec/CONTEXT-RECORD.md`](docs/spec/CONTEXT-RECORD.md) | Scope, provenance, overlays, omissions, and approval gates |
| [`docs/adr/README.md`](docs/adr/README.md) | Accepted/proposed architecture decisions and rationale |
| [`scripts/check-repository.py`](scripts/check-repository.py) | Self-contained structural repository validator |

## Protected product boundaries

- Google OAuth authenticates an external identity; GeraiHub owns users, memberships, roles, active-branch authorization, sessions, and audit records.
- Branch/gerai is the operational isolation boundary for shipment mutations.
- Mengantar remains authoritative for provider shipment finance and settlement.
- Customer payment is handled manually by each gerai outside GeraiHub. The application issues an invoice for the confirmed charge and a Mengantar-confirmed resi, without recording payment status or method.
- Issued invoices are immutable; any replacement after issuance needs an approved Finance/Product policy. The deferred customer draft-reference QR code is unrelated to payment.
- Estimated profit appears only after verified Mengantar pickup evidence and remains non-authoritative.
- Customer pre-fill, QR/reference lookup, and WhatsApp are post-MVP.
- Provider ambiguity is never converted into blind duplicate submit/cancel.

## Recommended reading order for implementation handoff

```text
STATUS.md
  ↓
TASKS.md
  ↓
docs/spec/02-PRD.md
  ↓
docs/spec/GLOSSARY.md
  ↓
docs/spec/TRACEABILITY.md
  ↓
docs/spec/DECISION-GATES.md
  ↓
docs/adr/*
  ↓
task-specific domain specs
```

## Validation boundary

Structural validation checks declared numeric requirement/ADR/task IDs and their references, declaration owners, task metadata/primary requirements, dependency cycles, local links, document indexing, and screen/action references and task ownership. It does **not** prove semantic completeness or that task acceptance criteria cover every requirement. It also does not prove:

- current Mengantar endpoint behavior;
- installed package/runtime compatibility or working application behavior;
- legal or privacy compliance;
- working UI, security controls, database behavior, or deployment readiness.

The accepted implementation baseline is Node.js 24 LTS major + pnpm + Next.js App Router + PostgreSQL + Drizzle + Better Auth, with separate web and durable worker processes from one modular-monolith codebase. ADR-005 adds database-backed sessions with server-owned active-branch context. Exact package versions and compatibility are not evidence until T-1 creates the lockfile and executes the checks. Production hosting/vendor/region remain gated.

Validate the current documentation repository with:

```bash
python3 scripts/check-repository.py .
python3 scripts/test-check-repository.py
```

No application install, build, provider request, or deployment command applies until development is explicitly authorized.
