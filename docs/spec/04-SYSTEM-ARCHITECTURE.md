# GeraiHub System Architecture

## Document Control

| Field | Value |
|---|---|
| Status | Accepted target architecture; deployment/runtime evidence pending |
| Version / updated | 0.3 / 2026-09-24 |
| Authority | Canonical repository specification; promoted from the retained planning snapshot on 2026-09-23 |

## 1. Architecture Drivers

GeraiHub is a multi-organization, multi-branch Indonesian shipment-operations application. It requires strict branch isolation, trusted Mengantar integration, physically verified counter workflow, provider-state reconciliation, and auditability. A modular monolith plus relational database is the smallest design that meets those needs; separate microservices are not justified for MVP.

## 2. Target Container View

```mermaid
flowchart LR
  O[Gerai operator / owner / admin] -->|HTTPS| W[GeraiHub web application]
  S[Platform super admin] -->|HTTPS| W
  W -->|authenticated, authorized request| A[Trusted application backend]
  A --> D[(Relational database)]
  A --> Q[Dispatch / reconciliation worker]
  Q -->|claim and reconcile durable operations| D
  Q -->|server-only HTTPS| M[Mengantar API]
  M -->|status/result| Q
  A --> L[Redacted audit / telemetry]
```

| ID | Owner | Review | Container | Responsibility | State |
|---|---|---|---|---|---|
| ARCH-1 | Engineering owner | Architecture review pending before implementation | Web application | Operator/admin/governance UI; explicit active-branch selection | No authoritative business state |
| ARCH-2 | Engineering owner | Security review pending before implementation | Application backend | Auth, policy, shipment transitions, provider adapter, read APIs | Stateless runtime |
| ARCH-3 | Engineering owner | Data/privacy review pending before migration | Relational database | Organization/branch/membership, shipments, provider mappings, audit, reconciliation data | System operational state |
| ARCH-4 | Engineering owner | Provider contract review pending before dispatch | Worker | Bounded asynchronous provider dispatch/retry/reconciliation | Job/outbox/sync state in database |
| ARCH-5 | Engineering owner | Provider account-owner review pending | Mengantar | Provider estimate/order/label/cancellation/status and authoritative finance/settlement | External source of truth |
| ARCH-6 | Operations owner | Privacy review pending before deployment | Telemetry/audit sink | Redacted reliability/security evidence | Policy-controlled records |

## 3. Trust Boundaries

| Flow | Boundary/control |
|---|---|
| Browser → backend | Authentication, CSRF/session policy, action authorization, server-derived branch context, input validation/rate limiting. |
| Backend → database | Branch ownership constraints, transaction/idempotency, least-privilege database identity. |
| Backend/worker → Mengantar | Server-only credential retrieval; sanitized logs; timeout/retry/correlation; current contract verification. |
| Platform support → branch data | Default-deny; approved JIT branch scope, expiry, visible mode, immutable audit. |
| Telemetry | Redact credentials, URLs, invoice/customer payloads; tenant/branch identifiers follow privacy policy. |

## 4. Deployment and Reliability Boundaries

- Provider requests must not occur from browsers.
- A failed web request must not imply provider submission failed; provider correlation/reconciliation decides ambiguous outcomes.
- The worker may be co-deployed with the app for MVP but remains a separate responsibility/queue boundary in code and observability.
- Database backup, restore, storage/processing region, access, and retention remain infrastructure/privacy decisions before production.
- Counter printing prepares the confirmed provider label and GeraiHub invoice together after label availability; the browser/system owns the physical printer dialog. Local printer installation/spooler details and successful paper output are not observable by the application without a separately verified printer integration.

## 5. Explicitly Deferred

- Public customer pre-fill/QR service and WhatsApp messaging.
- Cross-branch operational queues and bulk actions.
- GeraiHub-managed wallet, COD settlement, provider-financial adjustment, or payment gateway.
- Microservices, event bus, warehouse, or real-time tracking unless measured demand requires them.

## 6. Module and Screen Ownership Map

The accepted modular monolith and separate web/worker processes share domain contracts, not browser state or provider credentials. These are logical boundaries for T-1's implementation layout, not an extra service or a required filesystem scaffold. Map actual source paths to these boundaries when T-1 creates the application.

| Boundary | Owns | Screens / tasks | Prohibited shortcut |
|---|---|---|---|
| Identity/context | Google identity link, invitation, session, active branch, authorization | S-01/S-02; T-3 to T-6 | UI role checks as the only authorization |
| Counter domain | Branch pickup/contact snapshots, items, quote version, mode, verification, shipment state | S-03/S-04/S-05; T-7 to T-9 | Browser-calculated authoritative money or mutable submitted snapshots |
| Provider adapter and worker | Verified Mengantar mapping, outbox dispatch, reconciliation, label retrieval, cancellation outcome | S-03/S-05/S-06; T-10/T-11/T-13 | Browser-to-provider calls or blind retry after unknown outcome |
| Documents | Immutable invoice issue/reprint and safe confirmed-label print pack | S-05/S-06; T-12/T-21 | Treating a print dialog as proof of paper output or making a second order |
| Finance read model | Provider-labeled finance backup, mismatches, pickup-only estimate | S-07; T-15/T-22 | Editing provider financial truth or marking manual customer payment received |
| Governance | Branch/member lifecycle, aggregate platform health, JIT support | S-08/S-09; T-6/T-14/T-16 | Default platform access to tenant shipment details |
| Cross-cutting evidence | Redacted audit, telemetry, privacy controls, browser/action coverage | All; T-6/T-17 to T-20 | Capturing PII in click logs or accepting a green build as UI proof |

Screen/action identifiers and their routes through the UI are controlled by UX sections 9–10. Operation semantics remain in API section 3; authorization remains in IAM; state and money rules remain in their owning specifications. The action register should become a test manifest after source exists, while sensitive business events continue to use the audit contract rather than raw button-click logging.
