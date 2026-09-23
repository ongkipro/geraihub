# GeraiHub Error and Result Contract

## Document Control

| Field | Value |
|---|---|
| Status | Accepted planning contract; transport mapping pending runtime implementation |
| Version / updated | 1.0 / 2026-09-23 |
| Accountable owner | Engineering owner |

## 1. Principles

User-facing errors must be safe, actionable, stable enough for UI recovery, and non-enumerating across tenant boundaries. Raw provider errors, stack traces, SQL messages, secrets, internal paths, or cross-branch existence metadata never reach the browser.

Canonical application result shape conceptually contains:

- stable `code`;
- Indonesian safe `message`;
- optional allowlisted `fieldErrors`;
- safe `correlationId` when useful;
- optional current resource/version metadata only if caller is authorized.

HTTP status mapping is finalized with the implemented route schemas/OpenAPI.

## 2. Initial Error Vocabulary

| Code | Meaning / recovery |
|---|---|
| AUTH_REQUIRED | No valid GeraiHub application session; authenticate. |
| AUTH_MEMBERSHIP_REQUIRED | Identity is valid but no active authorized membership. |
| AUTH_SESSION_STALE | Session/context must be refreshed after membership/security change. |
| SCOPE_NOT_FOUND | Resource unavailable in the caller's authorized scope; do not reveal cross-branch existence. |
| BRANCH_CONTEXT_REQUIRED | Select an authorized active branch. |
| BRANCH_INACTIVE | Branch cannot perform operational mutations. |
| PERMISSION_DENIED | Authenticated actor lacks the requested action. |
| VALIDATION_FAILED | Caller-owned input fails schema validation. |
| RESOURCE_CONFLICT | Expected version/current state is stale; reload/review before repeating. |
| SHIPMENT_INVALID_STATE | Requested shipment action is not allowed from current state. |
| QUOTE_REQUIRED | Valid current estimate/quote is missing. |
| QUOTE_STALE | Material data changed or quote freshness is invalid; requote. |
| COD_MODE_UNAVAILABLE | The selected courier/service cannot support the requested COD mode under the verified contract; choose an eligible mode/service. |
| SHIPPING_ALLOCATION_REQUIRED | COD produk excludes shipping but sender-at-gerai shipping allocation was not confirmed; review before submit. |
| VERIFICATION_REQUIRED | Physical verification is incomplete. |
| INVOICE_NOT_AVAILABLE | Confirmed provider resi or submit-time quote is absent, or a cancelled shipment has no existing invoice; wait for reconciliation or recheck source. |
| INVOICE_ALREADY_ISSUED | An invoice already exists for the shipment; return the same document for authorized reprint. |
| PROVIDER_PENDING | Durable provider work is still pending. |
| PROVIDER_UNKNOWN | Outcome may have reached provider; do not repeat blindly. |
| PROVIDER_RECONCILIATION_REQUIRED | Manual/worker reconciliation is required before another provider side effect. |
| PROVIDER_REJECTED | Provider returned a validated terminal rejection. |
| PROVIDER_CONTRACT_ERROR | Response/auth/schema behavior does not match the verified adapter contract; escalate. |
| LABEL_NOT_AVAILABLE | Confirmed printable provider state is absent. |
| CANCELLATION_NOT_ELIGIBLE | Verified current policy/provider state does not allow request. |
| CANCELLATION_PENDING | Provider cancellation outcome is not authoritative yet. |
| RATE_LIMITED | Caller/scope exceeded a safe limit; retry only as instructed. |
| JIT_SCOPE_REQUIRED | Platform/support user requires approved branch-scoped JIT access. |
| JIT_EXPIRED | Approved support scope has expired/revoked. |
| INTERNAL_ERROR | Unexpected safe failure; use correlation ID for support. |

## 3. Security Rules

- Wrong-branch object probes use the same externally safe result family as unavailable resources.
- Validation errors echo only allowlisted caller-provided fields and never provider/internal schemas.
- `INTERNAL_ERROR` details live only in redacted server telemetry.
- Provider error strings are classified server-side; never pass-through raw text blindly.
- Correlation IDs are opaque and contain no tenant/PII meaning.

## 4. Retry Semantics

The UI may retry only operations explicitly marked safe by current application state. `PROVIDER_UNKNOWN` and `PROVIDER_RECONCILIATION_REQUIRED` are not user-click retry instructions for create/cancel operations.
