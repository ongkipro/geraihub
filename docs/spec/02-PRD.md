# GeraiHub Product Requirements Document

## Document Control

| Field | Value |
|---|---|
| Status | Accepted product planning baseline; external/runtime evidence pending |
| Version / updated | 0.2 / 2026-09-23 |
| Authority | Canonical repository specification; promoted from the retained planning snapshot on 2026-09-23 |
| Product owner | GeraiHub product owner |
| Scope | Indonesian partner-gerai shipment operations MVP and defined post-MVP boundary |

## 1. Decision Summary

GeraiHub is an authenticated Bahasa Indonesia web application for whitelisted expedition gerai partners. Its MVP helps gerai operators create, verify, submit, print, correct, and monitor shipments through Mengantar. The physical gerai remains the point of package verification and direct customer payment.

Mengantar remains authoritative for wallet/balance, COD, remittance, provider settlement, discount, cashback, and final shipment financial state. GeraiHub records operational copies and estimates only.

## 2. Actors and Scope

| Actor | Primary job | Scope |
|---|---|---|
| Gerai owner | Own the business account, administer its authorized gerai branches, appoint gerai admins, and review branch/aggregate reporting | Organization; every operational action is performed in one explicitly selected gerai context |
| Gerai admin | Run the gerai: manage staff-pengiriman, operational settings, monitoring, and local reports | One gerai/tenant |
| Staff pengiriman | Process a customer package accurately and print its label | Assigned gerai only |
| Finance viewer | Review internal operational estimates and mismatches | Assigned gerai, read-only |
| Platform super admin | Govern tenants, platform configuration, integration health, and audited support | Platform-wide; no routine shipment operation |
| Customer | Provide shipping details and pay at the gerai | No authenticated MVP surface |

### MVP in scope

- Authenticated gerai operations for shipment creation, provider estimate selection, physical package verification, direct payment recording, Mengantar submission, and label/resi printing.
- Shipment list/detail, operational statuses, correction before final submission, cancellation requests/outcomes, and visible sync recovery.
- Tenant-scoped user administration, gerai configuration, audit trail, and operational reporting.
- Live backup/reconciliation view of Mengantar financial data and internal estimated-profit report, explicitly non-authoritative.

### Explicit non-goals for MVP

- Customer online checkout, online payment collection, wallet management, COD settlement, or official financial ledger.
- Customer self-service pre-fill, QR issuance, short draft reference lookup, or WhatsApp delivery. These are post-MVP.
- Treating GeraiHub financial values as authoritative when they differ from Mengantar.

## 3. Functional Requirements

| ID | Owner | Requirement | Priority | Acceptance evidence |
|---|---|---|---|---|
| PR-1 | GeraiHub product owner | A gerai operator MUST create a shipment only within the active authorized gerai and enter sender, recipient, package, service, and COD data required by the current Mengantar contract. | Must | Cross-tenant create attempt is denied; valid tenant flow creates a draft. |
| PR-2 | GeraiHub product owner | Before submission, the operator MUST verify the physical package and record final weight, applicable dimensions, route/service/COD eligibility, and final quote. Customer-entered or earlier values are provisional. | Must | Final-submit control remains unavailable until required verification succeeds. |
| PR-3 | GeraiHub product owner | The system MUST display the customer charge before provider cashback and obtain operator confirmation of the final quote before direct-payment recording and submission. | Must | Changed quote is visible before payment/submission. |
| PR-4 | GeraiHub product owner | The system MUST submit to Mengantar from a trusted backend, handle provider timeout/duplicate/retry outcomes safely, and show whether the final order/resi is confirmed, pending reconciliation, or failed. | Must | Replayed submit produces no duplicate confirmed shipment; a failed sync has a recovery state. |
| PR-5 | GeraiHub product owner | After confirmed successful submission, an operator MUST be able to print the Mengantar label/resi and later reprint it from the authorized shipment detail. | Must | Print action is available only when the provider tracking/label state permits it. |
| PR-6 | GeraiHub product owner | The system MUST support correction before submission and a cancellation workflow for erroneous shipments, including those whose label/resi was printed or already synchronized. It MUST not represent cancellation as complete until the authoritative Mengantar outcome is known. | Must | Cancellation request, pending/failed/succeeded outcome, actor, reason, and provider correlation are visible and audited. |
| PR-7 | GeraiHub product owner | The system MUST retain an immutable operational audit trail for quote confirmation, payment recording, submission, print/reprint, correction, cancellation, provider synchronization, and privileged access. | Must | Shipment timeline identifies actor, time, action, resulting state, and correlation without sensitive payloads. |
| PR-8 | GeraiHub product owner | GeraiHub MUST show internal finance as a live backup/reconciliation view, visibly identify Mengantar as the financial source of truth, and surface mismatches for review rather than silently overwriting provider facts. | Must | Financial screen carries non-authoritative status and mismatch state. |
| PR-9 | GeraiHub product owner | The internal estimated net-profit report MUST include only shipments confirmed handed to/picked up by the courier and calculate from the customer charge before cashback and the available Mengantar discount difference. It MUST label the amount as an estimate. | Must | Draft/submitted-but-not-picked-up shipments do not enter the report. |
| PR-10 | GeraiHub product owner | A platform super admin MUST be able to administer gerai tenants, gerai-owner assignment, platform configuration, integration health, and audit/reconciliation review without default authority to create, alter, pay, cancel, or print a tenant shipment. | Must | Super-admin shipment action is denied unless separately approved, time-bound support access is granted and audited. |
| PR-11 | GeraiHub product owner | A gerai owner MUST manage gerai-admin membership; a gerai admin MUST manage staff-pengiriman membership and permitted local configuration. A staff-pengiriman user MUST not gain user-management, cross-gerai, owner, or platform access. | Must | Permission matrix tests pass. |
| PR-12 | GeraiHub product owner | In the post-MVP customer pre-fill phase, a customer draft MUST be retrievable at a gerai through either QR scan or the same short non-sequential readable reference. The reference is distinct from the post-submit Mengantar resi. | Could | QR and manual reference resolve the same authorized draft; no online checkout occurs. |

## 4. Lifecycle Contract

`draft` → `quoted` → `payment recorded` → `submission pending` → `submitted` → `label printed` → `awaiting pickup` → `picked up`

Exceptions and terminal paths:

- `draft` / `quoted`: operator correction or cancellation.
- `submission pending`: retry/reconciliation only; no duplicate submit.
- `submitted`, `label printed`, or `awaiting pickup`: cancellation is a provider-synchronized request; outcome is `cancellation pending`, `cancelled`, `cancellation rejected`, or `provider status unknown`.
- `picked up`: final operational shipment state for the internal estimated-profit inclusion rule. Whether provider cancellation is allowed after this state is intentionally not assumed.

Exact Mengantar cancellation eligibility, provider status mapping, and money reversal behavior are implementation blockers pending current provider-contract verification.

## 5. Non-Functional Requirements

| ID | Owner | Requirement | Evidence |
|---|---|---|---|
| NFR-1 | Engineering owner | Every shipment, finance, and user operation MUST be tenant-scoped and server-authorized; a client ID, URL, or search value cannot select another gerai. | Tenant/IAM negative tests |
| NFR-2 | Design owner | The operator flow MUST remain usable on gerai desktop/tablet and support keyboard-first data entry, scanner input, readable error recovery, and reprint without re-submission. | Browser acceptance scenarios |
| NFR-3 | Security owner | Sensitive operational actions (direct-payment recording, submit, cancellation, reprint, user/role changes, support access) MUST be auditable with redacted data. | Audit event test |
| NFR-4 | Security owner | Provider credentials and credential-bearing URLs MUST never be sent to the browser or logs. | Static/logging review |

## 6. Decisions and Remaining Gates

IDs below are permanent. Product policy acceptance does not verify Mengantar behavior, approve production, or authorize development.

| ID | Decision | Owner | Blocks |
|---|---|---|---|
| Q-1 | Mengantar current cancellation endpoint, eligibility by shipment state, financial reversal, idempotency, and status mapping. | Engineering + Mengantar account owner | PR-6 implementation |
| Q-2 | Accepted policy: only an authoritative Mengantar pickup/handover status qualifies for estimated profit. Exact provider status/event mapping and synchronization remain unverified. | Product + operations | PR-9 implementation |
| Q-3 | Accepted recommendation: MVP direct payments are cash and branch QRIS only; staff records verified receipt, admin requests a correction, owner approves it, and refund remains external-to-app but auditable. | Finance + product | Define QRIS verification SOP and correction evidence before payment implementation |
| Q-4 | Accepted: one owner organization may have multiple gerai branches. Operational actions remain one explicit branch at a time; exact schema realization and aggregate export policy remain to be designed. | Product + architecture | IAM/data model |
| Q-5 | Accepted post-MVP expiry policy: expire at the end of the next business day, preserve an auditable expired record, and require a new draft to proceed. Branch timezone, business calendar/cutoff, and data-retention duration still require definition before that phase. | Product + privacy | PR-12 implementation |
| Q-6 | Accepted recommendation: a branch is configured by its owner but activated only after platform-super-admin approval/readiness checks; use one verified Mengantar account mapping per branch for MVP. | Platform + finance + engineering | Provider commercial/technical verification |
| Q-7 | Accepted: users authenticate with Google OAuth. GeraiHub stores and governs its own user, membership, role, branch, session/audit, and authorization records; Google identity does not confer access without an approved GeraiHub membership. | Product + security + engineering | OAuth client configuration and security verification |
