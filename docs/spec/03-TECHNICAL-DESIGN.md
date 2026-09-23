# GeraiHub Technical Design

## Document Control

| Field | Value |
|---|---|
| Status | Draft |
| Version / updated | 0.2 / 2026-09-23 |
| Authority | Canonical repository specification; promoted from the retained planning snapshot on 2026-09-23 |
| Scope | Branch-scoped shipment operations with Mengantar integration |

## 1. Design Summary

Build one modular web application and one transactional relational database before considering services. The trusted backend owns authorization, provider calls, idempotency, provider synchronization, print eligibility, audit events, and reconciliation. Browser clients never receive Mengantar credentials or credential-bearing URLs.

The system is organization-aware but branch-operational: an owner may belong to multiple branches; every shipment mutation resolves one authorized branch context. Aggregated organization reports are read-only. Mengantar remains authoritative for provider shipment finance and settlement.

## 2. Component Responsibility Map

| ID | Owner | Component | Responsibility | Owned state | Failure contract |
|---|---|---|---|---|---|
| TD-1 | Engineering owner | Web operator/admin UI | Branch selection, counter workflow, queues, detail, governance surfaces | Local UI state only | Preserve entered form data; show recoverable provider/sync state. |
| TD-2 | Security owner | Auth/context policy | Complete Google OAuth login, resolve provider subject to GeraiHub user/account, resolve membership/active branch, authorize action | GeraiHub session/context/account link | Deny missing, stale, disabled, uninvited, or mismatched scope. |
| TD-3 | Engineering owner | Shipment application module | Draft, quote version, physical verification, payment record, lifecycle guards | Shipment aggregate | Reject invalid state transition; serialize/guard concurrent mutation. |
| TD-4 | Engineering owner | Mengantar adapter | Sanitize/validate provider requests and responses; estimate, order, status, cancellation/label operations once verified | Provider mapping/sync evidence | Never expose credential; classify timeout/unknown separately from failure; idempotent retry/reconcile. |
| TD-5 | Engineering owner | Dispatch/reconciliation worker | Reliably run provider work and reconcile pending/unknown outcomes | Job/outbox/sync records | Retry bounded transient failure; quarantine mismatches; no blind duplicate order. |
| TD-6 | Engineering owner | Print service | Render/obtain confirmed label for print/reprint | Print audit only | Refuse if provider label state is not confirmed; reprint never creates order. |
| TD-7 | Engineering owner | Finance read model | Provider snapshots, mismatch queue, eligible estimated-profit report | Non-authoritative snapshots | Label stale/mismatch/estimate; do not overwrite provider truth. |
| TD-8 | Engineering owner | Audit/observability | Immutable operational/security events and redacted diagnostics | Audit events | Never log secrets/full payloads; alert reconciliation/security failures. |

### TD-9 — Reproducible implementation foundation
- Status: Accepted planning requirement
- Owner: Engineering owner
- Source: NFR-1, NFR-4; terminal-independent delivery constraint in TASKS.md
- Statement: The future repository must pin its selected runtime/package versions and provide documented non-interactive install, lint/typecheck, tests, local startup, migrations, and synthetic seed commands without a proprietary AI/IDE dependency.
- Acceptance: From a clean checkout in an approved local environment, a developer executes the documented commands with declared prerequisites; required checks succeed without live provider writes or production credentials.
- Constraints: SEC-8, PRIV-13
- Change history: Added during planning audit; runtime/deployment baseline accepted by ADR-001 while exact installed versions remain T-1 evidence.

## 3. Key Flows

### Create to print

1. Server resolves the Google OAuth-authenticated provider subject to a GeraiHub user, then active branch, membership, and action permission.
2. Operator saves a branch-owned draft and obtains a current provider estimate from the backend.
3. Operator verifies package values; any material change invalidates prior quote confirmation.
4. Server records final quote version and direct-payment record under one transaction/audit boundary.
5. Submission creates one idempotency/correlation record, then dispatches provider order creation serially or in a provider-supported batch. Current Mengantar documentation must determine the exact concurrency strategy.
6. On provider confirmation, persist tracking/label mapping, transition state, and enable print. Timeout/ambiguous response stays pending reconciliation.
7. Print/reprint requires confirmed mapping and writes audit only.

### Cancellation

1. Before provider submission, cancel local draft and retain audit history.
2. After submission/print, authorize cancellation request, validate current provider eligibility, persist `pending_provider`, and dispatch once with provider correlation.
3. Only an authenticated current provider response/reconciliation can mark cancellation succeeded/rejected. Unknown remains visible and actionable for reconciliation.

### Branch switching

1. User selects an authorized branch membership.
2. Server issues/updates validated active context; UI clears branch-sensitive search/cache and shows active branch persistently.
3. Every subsequent query/mutation carries server-derived branch scope. Aggregate reports never provide an operational mutation handle.

## 4. Required State-Transition Guards

- No submission without valid active branch, required verified package data, valid final quote, direct-payment record policy, and no confirmed prior provider order.
- No duplicate submit when a prior request is pending/unknown; reconcile first.
- No print/reprint for unconfirmed/non-printable provider state.
- No local “cancelled” state for a submitted order before authoritative provider result.
- No estimated-profit inclusion until the approved pickup evidence is synchronized.
- No role/member change may be self-escalating or cross-branch.

## 5. Interface Boundaries

- Internal operation boundaries and contract gates are defined in `09-API-SPECIFICATION.md`; state/concurrency ownership is defined in `08-STATE-CONCURRENCY-CONTRACT.md`; safe error semantics are defined in `18-ERROR-AND-RESULT-CONTRACT.md`. Implementation selects exact HTTP/session/schema transport from installed framework evidence. Do not invent provider cancellation endpoint or payload until current Mengantar contract is verified.
- Provider adapter is server-only and logs sanitized request metadata/outcomes, never credential URL or customer payload.
- Database constraints implement ownership/idempotency invariants from `05-DATA-MODEL.md`.
- Authorization checks use action vocabulary from `07-IAM-RBAC-ABAC.md`, not client-selected role strings.

## 6. Rollout Sequence

1. Identity, organization/branch/membership, active-branch context, and negative authorization tests.
2. Branch-scoped draft/quote/verification/print audit UI using controlled provider integration fixtures.
3. Current documented/sandbox-verified Mengantar estimate and order flow with safe provider-state reconciliation.
4. Cancellation only after endpoint/state/financial effects are verified.
5. Finance backup/reconciliation and picked-up estimated-profit report after authoritative event/status definition is accepted.
6. Customer pre-fill QR/reference only as a separately enabled post-MVP feature.

## 7. Stack and Provider Evidence Gates

The repository remains documentation-only and has no application package manifest, lockfile, installed dependency, migration, or runtime evidence. T-2 accepted the planning baseline recorded in ADR-001: Node.js 24 LTS major, Next.js App Router, PostgreSQL, Drizzle, Better Auth, and separate web/worker processes from one modular-monolith codebase. ADR-002 through ADR-004 fix tenant enforcement, durable outbox/reconciliation, exact-IDR money, and concurrency policy. T-1 must still install compatible exact versions, commit the lockfile, and prove runtime commands after explicit development authorization. Production hosting vendor/region is not accepted until SEC-14/PRIV-11 gates close.

| Contract area | Required safe evidence | Unresolved behavior |
|---|---|---|
| Estimate | Current official schema and a separately authorized, backend-only sandbox non-COD estimate; sanitized HTTP status, shape, eligibility flags, account/environment, and actual observation date | Required fields, units, quote validity, courier/account availability |
| Submit and retry | Current docs/support contract plus approved sandbox-only mutation evidence when available | Idempotency semantics, duplicate detection, timeout recovery, insufficient balance, concurrency scope/limits |
| Label | Current docs and sanitized sandbox label mapping | Retrieval method, authorization/URL handling, printable states, cancellation invalidation |
| Pickup/status | Documented source/event/status mapping and sanitized observation | Ordering, freshness, polling or webhook support; no webhook endpoint assumed |
| Cancellation | Documented eligibility/state/financial effects and separately approved sandbox exercise | Request/status fields, terminal outcomes, ambiguous timeout and reversal behavior |
| Account mapping | Provider/account-owner confirmation and approved branch configuration evidence | Account/pickup ownership, one-account-per-branch feasibility, wallet scope |

No provider call has been executed by this documentation work. Documentation alone is not runtime proof. No production shipment is created for validation; the minimum estimate smoke does not authorize order/cancel tests. Unavailable sandbox capabilities require a documented provider-supported validation path and explicit approval, not guessed fixtures presented as evidence. T-10 gates T-11 through T-15 where applicable.

## 8. Verification Plan

- Follow `14-TEST-STRATEGY.md`; automated transition, concurrency, idempotency, tenant/branch authorization, redaction, and provider-adapter contract tests are mandatory.
- Browser scenarios in `17-UX-FLOWS-SCREEN-CONTRACTS.md` at desktop/tablet widths.
- Sanitized sandbox estimate smoke test before asserting current provider contract.
- Fault tests for timeout, duplicated response, out-of-order status, printed-label cancellation, and branch-switch stale state.
- Audit/redaction checks for every sensitive action.


## 9. Architecture Decision References

- `../adr/ADR-001-RUNTIME-DEPLOYMENT-PROFILE.md` — runtime/deployment baseline.
- `../adr/ADR-002-TENANT-DATABASE-ENFORCEMENT.md` — application + database tenant enforcement; RLS not primary MVP boundary.
- `../adr/ADR-003-OUTBOX-RECONCILIATION.md` — durable provider dispatch/reconciliation.
- `../adr/ADR-004-MONEY-CONCURRENCY.md` — integer-IDR money and optimistic concurrency.
