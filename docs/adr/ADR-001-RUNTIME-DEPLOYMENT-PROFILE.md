# ADR-001 — Runtime and Deployment Profile

- Status: Accepted baseline
- Date: 2026-09-23
- Owner: Engineering owner
- Related: TD-9, T-2, SEC-2, SEC-4, SEC-14, PRIV-11

## Context

GeraiHub needs a server-rendered authenticated web application, PostgreSQL transactions, Google OAuth, strict branch authorization, a durable provider outbox/reconciliation worker, and repeatable local/staging/production behavior. The MVP does not justify microservices or an independent queue broker.

## Decision

Use one TypeScript modular-monolith codebase with:

- Node.js **24 LTS major** for the initial implementation runtime. T-1 pins the exact supported 24.x release used by CI/deployment.
- Next.js App Router as the web/application framework.
- PostgreSQL as the authoritative GeraiHub operational database.
- Drizzle ORM + version-controlled SQL migrations generated/applied through Drizzle Kit.
- Better Auth with Google OAuth/OIDC and the Drizzle/PostgreSQL adapter; GeraiHub business authorization remains outside the auth adapter.
- Two deployable processes from the same repository:
  - `web`: authenticated UI/API/application process;
  - `worker`: always-on durable outbox/provider reconciliation process.
- PostgreSQL is the initial queue durability mechanism through an application-owned outbox/job table. Redis/RabbitMQ is not required for MVP.
- Reference non-production deployment: a container platform capable of an always-on web service, always-on worker, private networking, managed secrets, and PostgreSQL. Railway is a compatible reference profile, not a mandatory production vendor.

Exact Next.js/Drizzle/Better Auth package versions are not written into this ADR. T-1 installs compatible current packages, commits the lockfile, records versions, and proves install/build/test/migration/start commands.

## Production gate

A production hosting vendor is accepted only after PRIV-11/SEC-14 review records region, backups, recovery, access, secret storage, telemetry, and vendor/subprocessor boundaries. The reference platform does not close those gates.

## Consequences

### Positive

- One language and one codebase for UI, domain logic, auth integration, DB access, and worker code.
- Provider dispatch survives browser/request failure because the durable operation is persisted before worker execution.
- PostgreSQL transactions can atomically couple shipment state, audit, and outbox records.
- No Redis/service-bus operational dependency until measured throughput requires it.

### Trade-offs

- The worker must be deployed as an always-on process; serverless-request execution alone is insufficient.
- Database-backed job claiming needs explicit locking, retry, lease, and quarantine rules.
- Framework/auth upgrades require contract and migration tests before adoption.

## Rejected alternatives

- Microservices for MVP: adds distributed-state and deployment complexity without demonstrated need.
- Browser-to-Mengantar calls: violates the credential/trust boundary.
- In-memory/background work launched from a web request: loses durable reconciliation on crash/redeploy.
- Current/non-LTS Node major for production: avoidable support risk.

## Verification

T-1 must prove from a clean checkout:

```text
install
lint
typecheck
unit/integration tests
migration generation/check
migration apply on disposable database
synthetic seed
web startup
worker startup
```

No live Mengantar mutation or production credential is part of this ADR.
