# GeraiHub Product Requirements Document

## Document Control

| Field | Value |
|---|---|
| Status | Accepted product planning baseline; external/runtime evidence pending |
| Version / updated | 0.3 / 2026-09-24 |
| Authority | Canonical repository specification; promoted from the retained planning snapshot on 2026-09-23 |
| Product owner | GeraiHub product owner |
| Scope | Indonesian partner-gerai shipment operations MVP and defined post-MVP boundary |

## 1. Decision Summary

GeraiHub is an authenticated Bahasa Indonesia web application for whitelisted expedition gerai partners. Its MVP helps gerai operators create, verify, submit, print, correct, and monitor shipments through Mengantar. The physical gerai verifies packages and handles customer payment manually outside GeraiHub; the application issues the shipment resi and invoice.

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

- Authenticated gerai operations for pickup-point review, new/existing sender and recipient selection, shipped-item entry with a separate declared-goods total, provider estimate selection, physical package verification, final shipping-charge confirmation, Mengantar submission, and invoice plus label/resi issuance.
- Shipment list/detail, operational statuses, correction before final submission, cancellation requests/outcomes, and visible sync recovery.
- Tenant-scoped user administration, gerai configuration, audit trail, and operational reporting.
- Live backup/reconciliation view of Mengantar financial data and internal estimated-profit report, explicitly non-authoritative.

### Explicit non-goals for MVP

- Customer online checkout, payment collection/verification/status recording, refund processing, wallet management, COD settlement, or official financial ledger.
- Customer self-service pre-fill, QR issuance, short draft reference lookup, or WhatsApp delivery. These are post-MVP.
- Treating GeraiHub financial values as authoritative when they differ from Mengantar.

## 3. Functional Requirements

| ID | Owner | Requirement | Priority | Acceptance evidence |
|---|---|---|---|---|
| PR-1 | GeraiHub product owner | An operator MUST create a shipment only within the active authorized gerai, review its configured pickup point, select an existing branch-local sender/recipient or enter new ones, and enter shipped-item details plus package/service/COD fields required by the verified Mengantar contract. | Must | Wrong-branch contact/pickup lookup is denied; new or existing contacts create a draft with frozen shipment snapshots, not mutable links to later contact edits. |
| PR-2 | GeraiHub product owner | Before submission, the operator MUST verify the physical package, item descriptions, positive quantities, declared unit values and computed goods total, final weight/dimensions, route/service eligibility, and final shipping quote. Non-COD is the default. When COD is chosen, the operator MUST choose shipping-only COD or product COD and explicitly decide whether shipping is included in product COD. | Must | The review shows declared goods value, shipping charge, shipping-charge allocation, and intended courier collection separately; unsupported courier/mode or changed material inputs deny submit until re-estimated and reconfirmed. |
| PR-3 | GeraiHub product owner | The system MUST display the shipping charge before provider cashback and who is instructed to handle it, obtain operator confirmation of the current final quote before submission, and issue a branch-scoped invoice from the confirmed shipment and quote without asserting payment. | Must | Changed quote and collection route are visible before submission; an invoice is available only for a confirmed shipment, shows its exact shipping charge and source version, and never displays an unverified paid status. |
| PR-4 | GeraiHub product owner | The system MUST submit to Mengantar from a trusted backend, handle provider timeout/duplicate/retry outcomes safely, and show whether the final order/resi is confirmed, pending reconciliation, or failed. | Must | Replayed submit produces no duplicate confirmed shipment; a failed sync has a recovery state. |
| PR-5 | GeraiHub product owner | After confirmed successful submission and printable label availability, an operator MUST be able to prepare and print the Mengantar label/resi together with the GeraiHub invoice from one counter action, and later reprint each document from the authorized shipment detail. | Must | One `Cetak resi + invoice` action presents both original documents; each remains individually reprintable without a second provider order or invoice. Printer-dialog completion is not proof that paper was printed. |
| PR-6 | GeraiHub product owner | The system MUST support correction before submission and a cancellation workflow for erroneous shipments, including those whose label/resi was printed or already synchronized. It MUST not represent cancellation as complete until the authoritative Mengantar outcome is known. | Must | Cancellation request, pending/failed/succeeded outcome, actor, reason, and provider correlation are visible and audited. |
| PR-7 | GeraiHub product owner | The system MUST retain an immutable operational audit trail for quote confirmation, submission, invoice issuance/reprint, label/resi print/reprint, shipment correction, cancellation, provider synchronization, and privileged access. | Must | Shipment timeline identifies actor, time, action, resulting state, and correlation without sensitive payloads. |
| PR-8 | GeraiHub product owner | GeraiHub MUST show internal finance as a live backup/reconciliation view, visibly identify Mengantar as the financial source of truth, and surface mismatches for review rather than silently overwriting provider facts. | Must | Financial screen carries non-authoritative status and mismatch state. |
| PR-9 | GeraiHub product owner | The internal estimated net-profit report MUST include only shipments confirmed handed to/picked up by the courier and use an approved mode-specific formula based on shipping charge before cashback and verified Mengantar cost/discount/fee facts. COD product principal MUST NOT be treated as shipping revenue. It MUST label the amount as an estimate. | Must | Draft/submitted-but-not-picked-up shipments do not enter the report; product COD principal is excluded from shipping margin. |
| PR-10 | GeraiHub product owner | A platform super admin MUST be able to administer gerai tenants, gerai-owner assignment, platform configuration, integration health, and audit/reconciliation review without default authority to create, alter, pay, cancel, or print a tenant shipment. | Must | Shipment mutations remain denied in JIT support; only approved, time-bound diagnostic reads become available, with scope, expiry, and audit enforced. |
| PR-11 | GeraiHub product owner | A gerai owner MUST manage gerai-admin membership; a gerai admin MUST manage staff-pengiriman membership and permitted local configuration. A staff-pengiriman user MUST not gain user-management, cross-gerai, owner, or platform access. | Must | Permission matrix tests pass. |
| PR-12 | GeraiHub product owner | In the post-MVP customer pre-fill phase, a customer draft MUST be retrievable at a gerai through either QR scan or the same short non-sequential readable reference. The reference is distinct from the post-submit Mengantar resi. | Could | QR and manual reference resolve the same authorized draft; no online checkout occurs. |

## 4. Lifecycle Contract

`draft` → `quoted` → `submission pending` → `submitted` → `label print requested` → `awaiting pickup` → `picked up`

Invoice issuance is a separate document action after provider confirmation, not a shipment lifecycle state. A shipment can retain an issued invoice whether or not label printing has been requested. `label print requested` does not prove physical output.

Exceptions and terminal paths:

- `draft` / `quoted`: operator correction or cancellation.
- `submission pending`: retry/reconciliation only; no duplicate submit.
- `submitted`, `label print requested`, or `awaiting pickup`: cancellation is a provider-synchronized request; outcome is `cancellation pending`, `cancelled`, `cancellation rejected`, or `provider status unknown`.
- `picked up`: final operational shipment state for the internal estimated-profit inclusion rule. Whether provider cancellation is allowed after this state is intentionally not assumed.

Exact Mengantar cancellation eligibility, provider status mapping, and money reversal behavior are implementation blockers pending current provider-contract verification.

Invoice and quote recovery follows BILL-9 and the state/concurrency matrix: a material change invalidates the confirmed quote before submission; an issued invoice remains historical and cannot be silently rewritten. Provider uncertainty blocks duplicate submission. GeraiHub does not infer whether a customer has paid or been refunded.

The MVP pickup point is the active gerai's approved origin/pickup configuration, shown before draft entry and again at final review. Staff cannot silently switch it or borrow another gerai's location. New/existing sender and recipient choices are branch-local operator conveniences; each shipment stores its own confirmed contact/address snapshot. Item quantity and declared goods value describe parcel contents, while the customer charge and invoice total describe shipping service only. Intended courier collection is computed only after explicit COD mode and shipping-inclusion choices, then checked against the verified provider contract. The exact provider field mapping and pickup eligibility remain T-10 evidence gates.

The accepted counter modes are non-COD (default), COD ongkir (courier collects shipping only), and COD produk (courier collects goods value plus optional shipping). COD produk with shipping excluded allocates shipping to the sender at the gerai through the existing manual process; the operator must confirm this allocation before submission, and the app never infers that money was collected. These are GeraiHub product modes, not evidence that Mengantar or every courier supports them. T-10 must verify service eligibility, field mapping, fees, and authoritative collection semantics for each mode before implementation enables it.

Both COD modes carry a separate GeraiHub planning fee estimate of 3.33% of the intended COD collection amount. Non-COD has no COD fee. The review shows the base, rate, and estimate without adding it to the courier collection request or shipping invoice total. The exact whole-rupiah rounding, fee payer, and actual Mengantar fee/remittance behavior remain open gates; the UI must not claim a final fee or net payout until verified.

## 5. Non-Functional Requirements

| ID | Owner | Requirement | Evidence |
|---|---|---|---|
| NFR-1 | Engineering owner | Every shipment, finance, and user operation MUST be tenant-scoped and server-authorized; a client ID, URL, or search value cannot select another gerai. | Tenant/IAM negative tests |
| NFR-2 | Design owner | The operator flow MUST remain usable on gerai desktop/tablet and support keyboard-first data entry, scanner input, readable error recovery, and reprint without re-submission. | Browser acceptance scenarios |
| NFR-3 | Security owner | Sensitive operational actions (submit, cancellation, invoice/resi issuance and reprint, user/role changes, support access) MUST be auditable with redacted data. | Audit event test |
| NFR-4 | Security owner | Provider credentials and credential-bearing URLs MUST never be sent to the browser or logs. | Static/logging review |

## 6. Decisions and Remaining Gates

IDs below are permanent. Product policy acceptance does not verify Mengantar behavior, approve production, or authorize development.

| ID | Decision | Owner | Blocks |
|---|---|---|---|
| Q-1 | Mengantar current cancellation endpoint, eligibility by shipment state, financial reversal, idempotency, and status mapping. | Engineering + Mengantar account owner | PR-6 implementation |
| Q-2 | Accepted policy: only an authoritative Mengantar pickup/handover status qualifies for estimated profit. Exact provider status/event mapping and synchronization remain unverified. | Product + operations | PR-9 implementation |
| Q-3 | Accepted: any customer payment directly to the gerai is manual and outside GeraiHub. Courier COD collection is a separate Mengantar-authoritative shipment operation, not an app-recorded gerai payment. GeraiHub issues an invoice and a provider-confirmed resi; it does not record gerai payment method, receipt, paid status, or refund. | Finance + product | Invoice amount/identity rules and manual collection SOP remain business operations; COD modes require verified provider evidence, not a GeraiHub payment integration |
| Q-4 | Accepted: one owner organization may have multiple gerai branches. Operational actions remain one explicit branch at a time; exact schema realization and aggregate export policy remain to be designed. | Product + architecture | IAM/data model |
| Q-5 | Accepted post-MVP expiry policy: expire at the end of the next business day, preserve an auditable expired record, and require a new draft to proceed. Branch timezone, business calendar/cutoff, and data-retention duration still require definition before that phase. | Product + privacy | PR-12 implementation |
| Q-6 | Accepted recommendation: a branch is configured by its owner but activated only after platform-super-admin approval/readiness checks; use one verified Mengantar account mapping per branch for MVP. | Platform + finance + engineering | Provider commercial/technical verification |
| Q-7 | Accepted: users authenticate with Google OAuth. GeraiHub stores and governs its own user, membership, role, branch, session/audit, and authorization records; Google identity does not confer access without an approved GeraiHub membership. | Product + security + engineering | OAuth client configuration and security verification |
| Q-8 | Accepted: non-COD is the default counter mode; COD ongkir requests shipping only; COD produk requests goods value with optional included shipping. The amount requested from a courier is not proof of collection. | Product + Finance | COD modes stay unavailable until GATE-COD-MODES verifies per-service contract and the excluded-shipping payer and provider mapping |
| Q-9 | Accepted: estimated COD service fee is 3.33% of the intended COD collection amount for either COD mode; non-COD has no COD fee. The estimate is separate from requested collection and shipping invoice total. | Product + Finance | Final whole-rupiah rounding, fee payer/add-or-deduct treatment, provider tariff and remittance evidence remain GATE-COD-FEE |
