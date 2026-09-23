# GeraiHub Internal API Contract

> **Status:** Accepted framework-neutral planning contract. It defines GeraiHub's stable application boundary, not Mengantar's API. A machine-readable OpenAPI 3.1 document is generated only after the selected runtime and request schemas are accepted; no provider endpoint, field, or auth route is invented here.

## Document Control

| Field | Value |
|---|---|
| Status | Accepted planning contract — runtime route/OpenAPI evidence pending |
| Authority | Canonical repository specification; promoted from the retained planning snapshot on 2026-09-23 |
| Accountable owner | Engineering owner |

### API-1 — Internal operation contract ownership
- Status: Accepted planning contract
- Owner: Engineering owner
- Source: PR-1 through PR-11; IAM-1; TD-3 through TD-7
- Statement: All implemented internal operations must satisfy sections 1–5, including authorization, scoped persistence, state guards, and safe provider outcomes.
- Acceptance: Contract tests cover valid operations and unauthenticated, uninvited, wrong-branch, invalid-state, replay, timeout, and revoked-JIT denial without unintended side effects.
- Contract reference: This document is the planning contract; machine-readable OpenAPI and concrete runtime route/schema references are generated during implementation and are not claimed complete.
- Constraints: SEC-1 through SEC-15; TEN-1 through TEN-6
- Change history: Existing framework-neutral contract assigned ownership during planning audit.

## 1. Boundary Rules

- Browser-facing operations are same-origin, authenticated GeraiHub application requests. Google OAuth callback/session route paths are owned by the selected maintained auth framework and must not be hand-implemented from this document.
- The server derives actor, role, organization, active branch, and JIT scope from its own session/context. No request may set an authority, tenant, owner, provider credential, settlement value, or provider outcome.
- Every mutation requires server-side schema validation, authorization, resource ownership in its permitted scope, CSRF/origin protection where cookie-authenticated, audit evidence, and an idempotency/correlation strategy appropriate to the operation. Tenant setup and platform administration never manufacture an operational branch context.
- Every operational list/detail request is branch scoped. Identity/membership selection and approved organization/platform aggregates have their explicitly authorized non-operational scope; they never grant shipment mutation authority. A denied or wrong-branch resource uses the implementation's non-enumerating not-found/deny policy and has no side effect.
- Suspended/retired history reads use the explicit server-owned read-only context in Tenant Isolation section 4. No mutation/print/export is authorized by that context; stale operational context is rejected.
- Every branch-bound request, including draft creation without an existing resource ID, carries an expected context version for comparison with server state. A mismatch denies before access or mutation; the client version never selects a branch or grants permission.
- Mengantar is accessed only by a server-side adapter/worker. The browser never calls it directly and never receives its credentials or raw payloads.

## 2. Common Contract

| Concern | Contract |
|---|---|
| Identity | Session resolves a GeraiHub user linked to the Google provider subject. Valid Google authentication without invitation/membership is not an application session with access. |
| Active branch | Operational shipment mutations require one authorized active branch under ADR-005. Setup/lifecycle administration uses its separate organization/branch/platform permission. A branch switch accepts only a candidate membership/reference, validates it server-side, and persists server-owned context; client `branch_id` values never become authority. |
| IDs | Internal IDs are opaque. Customer-facing post-MVP draft references are separate and out of MVP scope. |
| Money | Financial amounts use canonical base-10 integer strings at JSON/form boundaries, exact integer rupiah internally, and PostgreSQL `BIGINT` range validation per ADR-004. JSON numeric money, exponent notation, separators, fractional amount strings and negatives for nonnegative fields are rejected. The unrounded COD estimate is represented by separate integer-string numerator and denominator fields, never a rounded financial amount. Provider decimal formats are normalized and validated at the adapter boundary. |
| Versions | Resource and context versions use canonical integer strings at JSON/form boundaries; compare as exact integers server-side, never a JavaScript `Number` conversion. |
| Errors | Follow `18-ERROR-AND-RESULT-CONTRACT.md`: return a stable machine code, safe user message, correlation ID where relevant, and field errors only for the caller's own validated input. Never return stack traces, raw provider response, secret, or cross-branch existence data. |
| Pagination | Cursor or bounded page size is selected once at initialization. Every list has explicit maximum/default limits and branch/role scope. |
| Sensitive search | Contact/phone/name search values travel only in validated request bodies, never URLs, analytics or request-body logs. Non-sensitive filters may be shareable; search results and input remain branch-scoped and ephemeral. |
| Idempotency | Shipment submit/cancel and any safe replayable mutation have a server-generated/persisted correlation. The browser must not be trusted to create provider idempotency semantics. |

## 3. Operation Groups

### Identity and context

| Operation | Actor | Input | Success / denial contract | Requirement links |
|---|---|---|---|---|
| Read current session/context | Authenticated member | None | Returns safe profile, permitted memberships, active branch, and JIT state; uninvited/suspended identity gets no operational context. | IAM section 2, SEC-1–4 |
| Select/switch active branch | Authorized branch member or organization owner | Selected authorized membership/branch reference | Validates membership/ownership server-side, updates context, and makes client invalidate branch-sensitive state; applies to initial selection and switching. | TEN-1, TEN-3, UI-1 |
| Accept invitation | Intended invited Google identity | Invitation proof through controlled flow | Creates/links only approved scope/role; records acceptance and provider subject. | IAM section 2, SEC-3 |
| Provision organization and initial owner invitation | Platform super admin | Allowlisted organization identity and intended owner | Create/reuse governed organization setup without duplicate grants; invitation acceptance does not activate a branch or confer platform access. | IAM section 3, PR-10, PR-11 |
| Manage membership/branch lifecycle | Permitted owner/admin/platform role | Allowlisted target, role/lifecycle action, required reason | Enforces scope/no self-escalation; audit required. | PR-10, PR-11, IAM section 7 |
| Sign out / resume after session expiry | Current session owner | Maintained auth-framework session operation | Revoke current session/context and clear sensitive client state; a failed revocation is not reported successful. Reauthentication resolves grants afresh and never replays a pending mutation. | IAM section 7, SEC-4 |

### Shipment counter flow

| Operation | Actor | Input | Success / denial contract | Requirement links |
|---|---|---|---|---|
| Read/select pickup point | Authorized branch operator/admin | Active context and configured point reference | Return only approved points for the active gerai; default to its configured origin. Wrong-branch, inactive, or provider-ineligible points deny submission. | PR-1, TEN-1 |
| Search/select/create sender or recipient | Authorized branch operator/admin | Bounded branch-local contact query or validated contact fields | Return minimized scoped matches; selecting copies a contact snapshot to the shipment. Explicit create-for-reuse is allowed to branch staff; updating an existing directory entry requires branch-admin permission and never rewrites a submitted shipment. No cross-branch contact lookup. | PR-1, PRIV-1 |
| Update existing directory contact | Branch admin | Scoped contact reference, expected version, allowlisted fields | Conflict on stale version; retain audit, do not rewrite saved shipment snapshots or invoices. Staff may edit a draft copy only. | IAM permission matrix, PRIV-9 |
| Add/edit/remove shipped item | Authorized branch operator/admin | Bounded description, positive quantity, exact integer IDR declared unit value | Server recomputes line and declared-goods totals, rejects invalid/overflow inputs, and invalidates quote confirmation when material fields change. Shipping charge and courier collection remain separate amounts. | PR-1, PR-2, ADR-004 |
| Select collection mode | Authorized branch operator/admin | `non_cod`, `cod_shipping`, or `cod_product`; explicit shipping-in-COD choice for product mode and separate shipping allocation when excluded | Default non-COD. Recompute intended courier collection exactly from mode, goods total and verified shipping charge, then derive the separate 3.33% COD fee estimate from that amount. Reject unsupported provider service/mode, unresolved allocation, invalid amount or stale quote. Do not add an unverified fee to the provider collection request or record gerai payment. | PR-2, BILL-1, BILL-2 |
| Create/read/update/cancel local draft | Authorized branch operator/admin | Allowlisted sender/recipient/package/service/COD fields | Branch-owned draft only; material changes invalidate quote confirmation; local cancellation only before provider submission. | PR-1, PR-2, SEC-5–6 |
| Request estimate / select quote | Authorized branch operator/admin | Verified current draft/package/route and collection-mode fields | Adapter returns normalized eligible options/freshness and supported COD-mode evidence only; provider failure never fabricates a quote or COD eligibility. | PR-2, PR-3, TD-4 |
| Record physical verification / confirm final quote | Authorized branch operator/admin | Actual weight/dimensions and selected normalized quote | Rejects stale/invalid quote, incomplete verification, or unauthorized branch. | PR-2, PR-3 |
| Refresh quote / cancel local shipment | Authorized branch operator/admin | Shipment/version and current context; fresh quote confirmation or reason | BILL-9 guards; no local cancellation of an ambiguous provider operation. | PR-3, PR-6, BILL-9 |
| Submit shipment | Authorized branch operator/admin | Shipment reference and confirmation intent only | Recheck current quote, provider-supported mode, shipping allocation and exact requested courier collection before creating/reusing safe dispatch correlation; returns pending/confirmed/unknown state, not a fabricated success. | PR-2, PR-4, SEC-7 |
| Read shipment queue/detail/timeline | Authorized scoped role | Safe filter/cursor/shipment reference | Returns only current branch-owned, permitted detail; timeline is redacted/audited. | PR-7, TEN-1 |
| Print/reprint confirmed label | Authorized branch operator/admin | Shipment reference | Allowed only when confirmed printable state exists; reprint cannot create an order. | PR-5 |
| Issue/reprint invoice | Authorized branch operator/admin | Shipment reference and expected version | Issue only for a confirmed non-cancelled shipment using its submit-time quote and resi; later quote expiry does not change the charge. Authorized reprint returns the same existing invoice even after pickup/cancellation; neither path creates a second invoice or provider order. No payment status is returned. | PR-3, BILL-1–4 |
| Prepare counter print pack | Authorized branch operator/admin | Shipment reference and expected version | Under branch/state checks, issue the invoice once if absent and return a print preview containing that invoice and the unmodified confirmed printable provider label/resi. Replay returns the same documents; a failed browser/printer handoff can retry without a new invoice or provider order. Physical print completion is unknown to the application. | PR-3, PR-5, TD-6 |
| Request cancellation / read outcome | Authorized branch operator/admin | Shipment reference, bounded reason code/text | Local request becomes provider-pending only after eligibility check; final outcome comes from reconciliation. | PR-6, SEC-7 |

### Governance, finance, and support

| Operation | Actor | Input | Success / denial contract | Requirement links |
|---|---|---|---|---|
| Read reconciliation/estimate report | Authorized gerai admin/finance/owner or aggregate platform scope | Time/filter/cursor in permitted scope | Labels Mengantar as authoritative; no provider financial modification exists. | PR-8, PR-9 |
| Read platform health/audit aggregate | Platform super admin | Bounded filters | Returns minimum governance metadata; no tenant shipment detail without JIT. | PR-10, IAM section 6 |
| Request/read JIT access | Platform-support requester; distinct approver for review | Named branch, bounded purpose/ticket; own request reference | Requester sees own status, approver sees scoped approval queue; pending/rejected requests grant no tenant access. | PR-10, IAM section 5.1 |
| Approve/reject/revoke JIT support | Distinct authorized platform-super-admin approver | Request reference, expected version, bounded duration/reason | No self-approval; fixed expiry, read-only scope, audit and immediate revocation. | PR-10, SEC-10 |
| Activate/end own JIT session | Approved requester | Grant reference; fresh auth session for activation only | Check requester, branch, expiry and revocation on activation without extending grant expiry. Exit never requires fresh authentication; clear diagnostic client state even if closure confirmation fails, report uncertainty, and revalidate before reentry. | IAM section 5.1, ADR-005 |

## 4. Async Provider Contract

Provider dispatch is an internal job boundary, not a browser API. The durable operation record has: GeraiHub operation ID, shipment/branch ownership, non-secret provider-account mapping identity/configuration version, operation class, safe correlation/idempotency reference, attempt count, durable dispatch-start marker, request state, sanitized provider outcome, next retry time, and reconciliation result. Quotes and confirmed order mappings retain the same account binding. Credential rotation for that same account does not retarget the operation; account replacement cannot change old operations or their reconciliation scope.

For create-order dispatch, immediately before network I/O the worker atomically rechecks quote freshness, frozen inputs, account binding, branch readiness and dispatch eligibility, then records dispatch start. A demonstrably never-dispatched stale create is closed without provider I/O and returns to quote review under the state contract. Cancellation uses its own current eligibility and original order/account mapping; quote expiry after submission does not block cancellation or read-only reconciliation. After a side-effect dispatch marker exists, crash/lease expiry is potentially dispatched and requires reconciliation; absence of a resi is never proof of no order.

Allowed outcomes: `pending`, `confirmed`, `failed`, `unknown`, and `reconciliation_required`, with cancellation tracked separately as specified in `05-DATA-MODEL.md`. An ambiguous timeout cannot be converted into a second create/cancel call merely because the user refreshes or clicks again.

## 5. Contract Gates Before Implementation

Platform bootstrap is a controlled operator procedure defined in IAM section 3, not a browser endpoint. Runtime role provisioning must preserve that section's approver and scope boundaries.

1. Use the accepted runtime/framework baseline and write versioned OpenAPI 3.1 schemas from the actual implemented server routes and validation types under T-1/T-3 onward.
2. Verify current Mengantar estimate/order/status/label/cancellation contract using sanitized evidence before adding adapter operation schemas.
3. Preserve ADR-004 integer-IDR money, ADR-005 server-owned session/active-branch semantics, and the error vocabulary in `18-ERROR-AND-RESULT-CONTRACT.md`; finalize pagination limits, HTTP status mapping, idempotency header/body representation, and exact installed-framework mapping.
4. Add contract tests for authorized, unauthenticated, uninvited, wrong-branch, invalid-state, replay, provider-timeout, and revoked-JIT cases.

OpenAPI describes only actual application-owned HTTP route handlers. Framework-managed auth routes retain their maintained contract; server actions retain typed input/result schemas and operation-level contract tests. Do not create duplicate HTTP endpoints merely to generate OpenAPI for a framework action. T-1 and each implementing task record the chosen transport/schema owner in this operation map.

## 6. Explicitly Excluded

- Public customer API, QR/reference lookup, WhatsApp, payment gateway, wallet/COD settlement, webhook endpoint assumptions, and generic provider proxying.
- Any public API version or endpoint path until a product requirement and selected runtime need one.
