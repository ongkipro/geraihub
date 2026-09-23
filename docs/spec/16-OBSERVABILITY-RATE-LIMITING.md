# GeraiHub Observability and Rate Limiting

## Document Control

| Field | Value |
|---|---|
| Status | Draft |
| Version / updated | 0.2 / 2026-09-23 |
| Authority | Canonical repository specification; promoted from the retained planning snapshot on 2026-09-23 |

## 1. Requirements

| ID | Owner | Requirement | Verification |
|---|---|---|---|
| OBS-1 | Operations owner | Every shipment mutation, provider request/result, cancellation, print/reprint, branch switch, role change, and JIT support action MUST emit a redacted audit event with actor, organization/branch scope, resource, outcome, and correlation ID. | Audit test/query |
| OBS-2 | Operations owner | Provider submission/cancellation must be observable by idempotency/correlation, state transition, latency, error class, retry count, and reconciliation age without logging credential URLs or request payload PII. | Synthetic timeout/retry test |
| OBS-3 | Operations owner | Alert the owner/on-call queue on aged unknown provider state, failed reconciliation, repeated provider auth/contract failure, and branch isolation/security-denial anomaly. | Alert simulation |
| RATE-1 | Engineering owner | Apply rate/concurrency controls to login, customer-reference lookup, sender-phone fallback lookup, provider estimate, provider submit/cancel, print, and exports according to measured/provider limits. | Negative/load test |

## 2. Signals

| Signal | Required fields | Prohibited fields |
|---|---|---|
| Audit | action, actor ID, organization/branch ID, resource ID, result/reason, correlation, timestamp | credentials, session/token/cookie, full PII, full request/response bodies |
| Provider operation | operation class, correlation/idempotency, branch, sanitized status/error class, duration, retry/reconciliation state | credential-bearing URL, API key, complete address/contact payload |
| Metrics | operation/outcome/latency, queue age/depth, provider sync/cancellation state counts, branch-scoped rate-limit events | customer contact or resi as metric label |
| Finance/reconciliation | snapshot freshness, mismatch count/type, report eligibility count | payment credentials, unnecessary customer values |

## 3. Dashboards and Alerts

- **Counter operation health:** estimate, submit, label confirmation, print/reprint success/failure; scoped per branch and aggregate.
- **Provider reconciliation:** pending/unknown age, retries, cancellation pending/rejected, sync contract/auth errors.
- **Security/governance:** denied cross-branch attempts, JIT grants/expiry, privileged action volume, role changes.
- **Finance backup:** last successful provider snapshot, stale branch, mismatch queue, eligible estimated-profit calculation health.

Thresholds and retention remain evidence-based operational decisions; do not invent numeric SLOs before baseline measurement.

## 4. Rate and Abuse Boundaries

| Surface | Scope | Behavior when exceeded |
|---|---|---|
| Login/recovery | identity/IP risk policy | Generic throttled response; audit security signal. |
| Customer pre-fill reference/phone lookup (post-MVP) | Branch/operator plus IP/session as appropriate | Deny/throttle without confirming record existence; alert enumeration patterns. |
| Provider estimate | Branch/user and provider contract | Coalesce/debounce safe repeats; show retry state. |
| Provider order/cancel | Branch and provider account; serialization where provider requires it | Queue/reconcile; never parallel blind retry. |
| Print/reprint | Branch/user/shipment | Permit legitimate reprint but rate-limit abuse; audit each action. |
| Exports | Branch/organization/role | Queue or deny over policy; preserve tenant scope. |

## 5. Incident Evidence

For a provider or isolation incident, preserve correlation IDs, sanitized transition history, actor/branch scope, release version, and timing. Do not preserve secrets, raw customer payload, or payment credentials merely for debugging.
