# GeraiHub Engineering Standards

## Status and authority

This is a pre-implementation coding contract for T-1 onward, not evidence that application source or tooling exists. The accepted runtime is [ADR-001](../adr/ADR-001-RUNTIME-DEPLOYMENT-PROFILE.md). Product behavior, permissions, state transitions, money policy, errors, UI behavior, and test acceptance remain in their owning specifications; this document governs how implementation keeps those contracts enforceable. If a standard requires a new architecture policy, record an ADR rather than silently changing it here.

## Boundaries and naming

- Keep framework entry points thin: parse and validate input, derive the actor and active branch on the server, call a domain operation, and translate its safe result. Route handlers and server actions must not each implement a different shipment policy.
- Domain operations own transitions, exact arithmetic, quote invalidation, invoice issuance, and provider-operation intent. Persistence owns queries and transactions; the Mengantar adapter owns verified wire mapping. The web process must not run provider dispatch in a request callback. See [Architecture](04-SYSTEM-ARCHITECTURE.md), [State](08-STATE-CONCURRENCY-CONTRACT.md), and [API](09-API-SPECIFICATION.md).
- Use descriptive domain names already defined in [Glossary](GLOSSARY.md). Prefer one name per concept across UI, operations, schema, and tests; map external field names only at the adapter boundary. Name tests by observable behavior and failure condition.
- Avoid circular imports and generic `utils` or `services` buckets that hide ownership. Shared code must have a real second caller or a boundary need. Keep browser-importable code free of credentials, database clients, and provider internals.

## Trust, data, and failure handling

- Validate external input at the server boundary. Recheck authorization and branch ownership inside the operation and at worker claim/dispatch where state may have changed. Never trust a client-supplied role, branch, total, quote freshness, or provider result as authority. See [IAM](07-IAM-RBAC-ABAC.md) and [Tenant Isolation](06-TENANT-ISOLATION.md).
- Use exact integer IDR end to end. Serialize values losslessly across JSON boundaries; test round trips and overflow before arithmetic or PostgreSQL writes. Persisted monetary values must not use floating point. See [ADR-004](../adr/ADR-004-MONEY-CONCURRENCY.md) and [Data Model](05-DATA-MODEL.md).
- Put atomic state, audit, invoice uniqueness, and outbox changes in reviewed database transactions with constraints and concurrency guards. Do not treat a successful HTTP response or UI click as proof of a provider side effect or printed paper. See [ADR-002](../adr/ADR-002-TENANT-DATABASE-ENFORCEMENT.md) and [ADR-003](../adr/ADR-003-OUTBOX-RECONCILIATION.md).
- Return stable, safe application results from domain operations; translate them to transport status and Indonesian recovery copy at the edge. Do not leak SQL errors, raw provider responses, or cross-branch existence. Preserve unknown provider outcomes for reconciliation. See [Error and Result Contract](18-ERROR-AND-RESULT-CONTRACT.md).
- Logs and audit are separate: structured telemetry diagnoses failures using safe correlation IDs; append-only audit records approved business/security actions. Never log secrets, sessions, complete contact details, invoice bodies, or raw provider payloads. See [Observability](16-OBSERVABILITY-RATE-LIMITING.md).

## Implementation hygiene

- Use strict TypeScript checks and the repository's pinned formatter/linter once T-1 creates them. Do not disable a rule or use an unchecked cast to bypass a domain, money, authorization, or provider error; narrow at the boundary and test the invariant.
- Keep migrations versioned and review generated SQL before applying it. Make schema changes compatible with the deployment sequence and test against a disposable PostgreSQL database. Never rely on a developer's existing data to prove a migration. See [Data Model](05-DATA-MODEL.md) and [Operations](15-OPERATIONS-RELEASE-READINESS.md).
- Prefer native HTML and accessible controls. Bind each visible action to a real route/handler, guard, pending/error recovery, and executable check. Screen/action ownership stays in [UX](17-UX-FLOWS-SCREEN-CONTRACTS.md); appearance stays in [Design System](10-DESIGN-SYSTEM-WHITELABEL.md).
- Introduce a dependency only for a demonstrated need, pin it through the accepted lockfile, and review its maintenance/security impact. Avoid extra infrastructure or abstractions for a possible future feature.

## Reviewable evidence

Before coding a bounded unit, record its actual commands/test paths in the owning task. Review the diff and run focused positive and negative checks; run affected browser journeys for visible changes. Keep a safe command/result/artifact reference with the task and reopen evidence after a change invalidates it. The sole execution and review loop is [TASKS.md](../../TASKS.md); test layers and evidence format are owned by [Test Strategy](14-TEST-STRATEGY.md).
