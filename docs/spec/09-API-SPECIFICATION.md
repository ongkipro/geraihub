# GeraiHub Internal API Contract

> **Status:** Draft, framework-neutral internal contract. It defines GeraiHub's stable application boundary, not Mengantar's API. A machine-readable OpenAPI 3.1 document is generated only after the selected runtime and request schemas are accepted; no provider endpoint, field, or auth route is invented here.

## Document Control

| Field | Value |
|---|---|
| Status | Draft — runtime route/schema evidence pending |
| Authority | Canonical repository specification; promoted from the retained planning snapshot on 2026-09-23 |
| Accountable owner | Engineering owner |

### API-1 — Internal operation contract ownership
- Status: Draft
- Owner: Engineering owner
- Source: PR-1 through PR-11; IAM-1; TD-3 through TD-7
- Statement: All implemented internal operations must satisfy sections 1–5, including authorization, scoped persistence, state guards, and safe provider outcomes.
- Acceptance: Contract tests cover valid operations and unauthenticated, uninvited, wrong-branch, invalid-state, replay, timeout, and revoked-JIT denial without unintended side effects.
- Contract reference: This document is the planning contract; machine-readable OpenAPI and runtime route/schema references are pending HTTP-boundary selection, not claimed complete.
- Constraints: SEC-1 through SEC-11; TEN-1 through TEN-6
- Change history: Existing framework-neutral contract assigned ownership during planning audit.

## 1. Boundary Rules

- Browser-facing operations are same-origin, authenticated GeraiHub application requests. Google OAuth callback/session route paths are owned by the selected maintained auth framework and must not be hand-implemented from this document.
- The server derives actor, role, organization, active branch, and JIT scope from its own session/context. No request may set an authority, tenant, owner, provider credential, settlement value, or provider outcome.
- Every mutation requires server-side schema validation, authorization, branch ownership, CSRF/origin protection where cookie-authenticated, audit evidence, and an idempotency/correlation strategy appropriate to the operation.
- Every operational list/detail request is branch scoped. Identity/membership selection and approved organization/platform aggregates have their explicitly authorized non-operational scope; they never grant shipment mutation authority. A denied or wrong-branch resource uses the implementation's non-enumerating not-found/deny policy and has no side effect.
- Mengantar is accessed only by a server-side adapter/worker. The browser never calls it directly and never receives its credentials or raw payloads.

## 2. Common Contract

| Concern | Contract |
|---|---|
| Identity | Session resolves a GeraiHub user linked to the Google provider subject. Valid Google authentication without invitation/membership is not an application session with access. |
| Active branch | Mutations require one authorized active branch. A branch switch is an explicit server-validated context update, never a client-controlled `branch_id` on arbitrary requests. |
| IDs | Internal IDs are opaque. Customer-facing post-MVP draft references are separate and out of MVP scope. |
| Money | All GeraiHub-owned request/response monetary amounts use exact integer IDR rupiah compatible with PostgreSQL `BIGINT`, per ADR-004; floating-point values are rejected. Provider decimal formats are normalized and validated at the adapter boundary. |
| Errors | Follow `18-ERROR-AND-RESULT-CONTRACT.md`: return a stable machine code, safe user message, correlation ID where relevant, and field errors only for the caller's own validated input. Never return stack traces, raw provider response, secret, or cross-branch existence data. |
| Pagination | Cursor or bounded page size is selected once at initialization. Every list has explicit maximum/default limits and branch/role scope. |
| Idempotency | Shipment submit/cancel and any safe replayable mutation have a server-generated/persisted correlation. The browser must not be trusted to create provider idempotency semantics. |

## 3. Operation Groups

### Identity and context

| Operation | Actor | Input | Success / denial contract | Requirement links |
|---|---|---|---|---|
| Read current session/context | Authenticated member | None | Returns safe profile, permitted memberships, active branch, and JIT state; uninvited/suspended identity gets no operational context. | IAM section 2, SEC-1–4 |
| Switch active branch | Authorized multi-branch member | Selected authorized membership/branch reference | Validates membership server-side, updates context, and makes client invalidate branch-sensitive state. | TEN-1, TEN-3, UI-1 |
| Accept invitation | Intended invited Google identity | Invitation proof through controlled flow | Creates/links only approved scope/role; records acceptance and provider subject. | IAM section 2, SEC-3 |
| Manage membership/branch lifecycle | Permitted owner/admin/platform role | Allowlisted target, role/lifecycle action, required reason | Enforces scope/no self-escalation; audit required. | PR-10, PR-11, IAM section 7 |

### Shipment counter flow

| Operation | Actor | Input | Success / denial contract | Requirement links |
|---|---|---|---|---|
| Create/read/update/cancel local draft | Authorized branch operator/admin | Allowlisted sender/recipient/package/service/COD fields | Branch-owned draft only; material changes invalidate quote confirmation; local cancellation only before provider submission. | PR-1, PR-2, SEC-5–6 |
| Request estimate / select quote | Authorized branch operator/admin | Verified current draft/package/route fields | Adapter returns normalized eligible options/freshness only; provider failure never fabricates a quote. | PR-2, PR-3, TD-4 |
| Record physical verification / confirm final quote | Authorized branch operator/admin | Actual weight/dimensions and selected normalized quote | Rejects stale/invalid quote, incomplete verification, or unauthorized branch. | PR-2, PR-3 |
| Record direct payment | Authorized branch operator/admin | Approved method, amount, minimal verification reference | Creates append-only operational payment record; no provider settlement assertion. | BILL-1–4, SEC-11 |
| Submit shipment | Authorized branch operator/admin | Shipment reference and confirmation intent only | Creates/reuses safe internal dispatch correlation; returns pending/confirmed/unknown state, not a fabricated success. | PR-4, SEC-7 |
| Read shipment queue/detail/timeline | Authorized scoped role | Safe filter/cursor/shipment reference | Returns only current branch-owned, permitted detail; timeline is redacted/audited. | PR-7, TEN-1 |
| Print/reprint confirmed label | Authorized branch operator/admin | Shipment reference | Allowed only when confirmed printable state exists; reprint cannot create an order. | PR-5 |
| Request cancellation / read outcome | Authorized branch operator/admin | Shipment reference, bounded reason code/text | Local request becomes provider-pending only after eligibility check; final outcome comes from reconciliation. | PR-6, SEC-7 |

### Governance, finance, and support

| Operation | Actor | Input | Success / denial contract | Requirement links |
|---|---|---|---|---|
| Read reconciliation/estimate report | Authorized gerai admin/finance/owner or aggregate platform scope | Time/filter/cursor in permitted scope | Labels Mengantar as authoritative; no provider financial modification exists. | PR-8, PR-9 |
| Request payment correction | Authorized branch admin | Payment record/version, bounded reason, proposed allowlisted values | Append a pending request; reject stale/conflicting requests; staff cannot request through this operation. | BILL-3, SEC-11 |
| Decide payment correction / record external refund | Authorized owner in explicit branch | Pending request/version, decision, reason or minimal off-system refund reference | Append decision/event atomically; no in-app transfer or provider settlement change; exceptional self-correction disabled pending policy. | BILL-3, BILL-4, SEC-11 |
| Read platform health/audit aggregate | Platform super admin | Bounded filters | Returns minimum governance metadata; no tenant shipment detail without JIT. | PR-10, IAM section 6 |
| Grant/revoke JIT support | Authorized approver | Named branch, purpose, duration | Validates bounded duration/approval; grant/revoke/access is auditable and expiry is enforced. | PR-10, SEC-10 |

## 4. Async Provider Contract

Provider dispatch is an internal job boundary, not a browser API. The durable operation record has: GeraiHub operation ID, shipment/branch ownership, operation class, safe correlation/idempotency reference, attempt count, request state, sanitized provider outcome, next retry time, and reconciliation result.

Allowed outcomes: `pending`, `confirmed`, `failed`, `unknown`, and `reconciliation_required`, with cancellation tracked separately as specified in `05-DATA-MODEL.md`. An ambiguous timeout cannot be converted into a second create/cancel call merely because the user refreshes or clicks again.

## 5. Contract Gates Before Implementation

1. Select runtime/HTTP framework and then write versioned OpenAPI 3.1 schemas from the actual server routes and validation types.
2. Verify current Mengantar estimate/order/status/label/cancellation contract using sanitized evidence before adding adapter operation schemas.
3. Preserve ADR-004 integer-IDR money and the error vocabulary in `18-ERROR-AND-RESULT-CONTRACT.md`; finalize pagination limits, HTTP status mapping, idempotency header/body representation, and session/context transport from installed framework evidence.
4. Add contract tests for authorized, unauthenticated, uninvited, wrong-branch, invalid-state, replay, provider-timeout, and revoked-JIT cases.

## 6. Explicitly Excluded

- Public customer API, QR/reference lookup, WhatsApp, payment gateway, wallet/COD settlement, webhook endpoint assumptions, and generic provider proxying.
- Any public API version or endpoint path until a product requirement and selected runtime need one.
