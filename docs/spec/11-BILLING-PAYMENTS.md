# GeraiHub Direct-Payment and Financial Reconciliation Policy

> This document governs GeraiHub's operational payment records. It does not make GeraiHub the merchant, wallet, COD, remittance, or settlement system of record; Mengantar remains authoritative for those provider financial facts.

## Document Control

| Field | Value |
|---|---|
| Status | Accepted MVP payment policy; provider formula verification pending |
| Version / updated | 0.2 / 2026-09-23 |
| Market | Indonesia |
| Accountable owner | Finance owner |
| Authority | Canonical repository specification; promoted from the retained planning snapshot on 2026-09-23 |

## 1. MVP Policies and Verification Boundaries

Core cash/QRIS, correction approval, external refund, pickup-only estimate, activation, and account-mapping policies are accepted. Owner self-correction is disabled for MVP; every payment correction requires an admin request and a separate owner decision. Formula inputs and provider behavior still require external evidence.

| ID | Owner | Policy | Why | Consequence / boundary |
|---|---|---|---|---|
| BILL-1 | Finance owner | Accept **cash** and **QRIS** only as direct customer payment methods in MVP. Defer bank transfer, payment links, installments, and GeraiHub online checkout. | These are familiar Indonesian counter-payment methods. Transfer introduces delayed/manual matching; payment links turn the product into a checkout/payment integration prematurely. | QRIS is a branch's existing merchant QRIS; GeraiHub records the method and verified receipt reference only. It does not process QRIS. |
| BILL-2 | Finance owner | Staff pengiriman may record a payment only after payment is physically received or independently verified in the branch's approved QRIS/bank channel. | A button click is not proof of payment and cannot be treated as settlement. | Never auto-mark paid from a customer screenshot. Store minimal reference and verification actor/time. |
| BILL-3 | Finance owner | A payment record is append-only. Staff cannot edit or delete it. A gerai admin may create a correction request with reason and before/after values; a gerai owner other than the requester approves/rejects it. Owner self-correction is disabled for MVP, including single-person branches. | Preserves separation of duties for cash/QRIS corrections and prevents a privileged user from silently rewriting payment history. | A branch without a distinct admin/owner approver cannot perform in-app correction until a second authorized approver exists; the original record remains. This never alters Mengantar settlement. |
| BILL-4 | Finance owner | Do not build an in-app customer refund flow in MVP. Any customer cash/QRIS refund is handled outside the system under branch SOP; GeraiHub records an auditable local correction/refund event after owner approval. | Avoids falsely implying that local refund, provider cancellation, and Mengantar wallet reversal are one transaction. | Provider cancellation and provider financial outcome remain separately synchronized/reconciled. |
| BILL-5 | Finance owner | A shipment enters GeraiHub's estimated-profit report only after Mengantar provides a verified pickup/handover status mapped to `picked_up`. No local staff confirmation can qualify it. | Prevents profit from being reported for cancelled, uncollected, or never-picked-up labels. | Exact provider status/event mapping is a Mengantar-contract verification gate. |
| BILL-6 | GeraiHub product owner | A new branch is requested/configured by the organization owner but becomes active only after platform-super-admin approval and readiness checks. | GeraiHub is a whitelisted partner-gerai product; approval prevents unverified branches, bad pickup settings, and unintended provider/account use. | Owner can prepare draft branch configuration; no shipment operation before activation. |
| BILL-7 | Engineering owner | Treat the Mengantar account mapping as **one account per branch in MVP**. If the provider/account owner later requires a shared organization wallet, introduce it only as an explicit, verified organization-account mapping—not by silently sharing credentials. | Per-branch mapping gives clean balance, pickup, resi, reconciliation, incident, and access boundaries. It is simpler and safer for a multi-branch counter product. | This is an MVP integration policy, not a claim that Mengantar requires separate accounts. Provider contract and commercial setup must be verified. |
| BILL-8 | Finance owner | Customer charge is the final verified quote shown before cashback. Internal estimated gross contribution is calculated from the approved customer charge minus the provider cost represented by the current verified Mengantar data; cashback/discount treatment is versioned and labeled estimate. | Keeps the customer price, provider amount, discount, and later settlement distinct. | Finance owner must approve the exact formula before report release; GeraiHub never rewrites official Mengantar settlement. |

## 2. Money and Source-of-Truth Contract

| Concept | Authority | GeraiHub behavior |
|---|---|---|
| Customer charge | GeraiHub final quote/version, confirmed at counter | Display before payment; retain immutable quote history. |
| Cash/QRIS received record | GeraiHub operational evidence | Record method, amount, minimal reference, verifier, time, and correction history. |
| Mengantar wallet/balance | Mengantar | Read/snapshot/reconcile only; no local adjustment. |
| COD/remittance/settlement | Mengantar | Show backup/reconciliation status only. |
| Provider discount/cashback | Mengantar | Snapshot source/version; use only for labeled internal estimate. |
| Customer refund | Branch external process in MVP | Record approved local event; do not imply provider reversal. |

All GeraiHub-owned monetary values use exact integer IDR rupiah compatible with PostgreSQL `BIGINT`, per ADR-004. Provider decimal values are normalized at the adapter boundary with explicit precision validation. The implementation must not use floating-point arithmetic for money.

## 3. Counter Payment Workflow

1. Staff completes physical package verification and final quote.
2. UI shows the customer charge and selected method (`cash` or `qris`) before recording.
3. For cash, staff confirms receipt; for QRIS, staff verifies payment in the approved merchant channel—never from a customer screenshot alone.
4. Server creates append-only payment-record evidence and audit event.
5. Only then may authorized staff submit to Mengantar. A submission failure/unknown state does not erase payment evidence.
6. If provider submission cannot be resolved, the shipment enters reconciliation; staff must not collect the payment a second time.

### 3.1 QRIS verification SOP baseline

For MVP, QRIS is an external branch merchant channel, not a GeraiHub payment integration.

1. Staff selects `qris` only after the customer has paid using the branch's approved merchant QRIS.
2. Staff verifies the transaction in the merchant/bank channel controlled by the branch; a customer screenshot, message, or verbal claim is insufficient.
3. The displayed paid amount must equal the GeraiHub final customer charge for the current quote version.
4. GeraiHub stores only method, exact amount, verifier, verification timestamp, and the merchant transaction/reference identifier required by branch SOP. Do not store a QR image, bank credential, account balance, screenshot, or raw merchant response.
5. A missing/duplicate/conflicting reference is rejected or escalated according to the branch's approved merchant-channel behavior; GeraiHub never fabricates a successful receipt.
6. Any correction follows BILL-3; any customer refund remains off-system under BILL-4.

## 4. Correction, Cancellation, and Refund Separation

| Situation | GeraiHub record | Provider/Mengantar action |
|---|---|---|
| Wrong field before submit | Edit draft, invalidate quote confirmation where applicable | None |
| Wrong customer charge/payment record | Admin requests correction; owner decides; before/after values retained | None automatically |
| Customer refund at counter | Owner-approved local refund event after off-system refund process | No implied provider action |
| Submitted/printed shipment cancellation | Cancellation request with authoritative provider result | Provider call/reconciliation when current contract permits |
| Provider financial reversal | Snapshot/reconciliation result | Mengantar is authoritative |

## 5. Required Controls and Evidence

- Every payment record, correction request/decision, local refund event, quote confirmation, provider submit, cancellation, and reconciliation event has actor, branch, shipment, time, reason/outcome, and correlation ID.
- Staff cannot delete, backdate, or replace financial history.
- Owner/admin cannot alter official provider financial values.
- Cash and QRIS totals are available as branch operational reports; they are not a declaration of bank/provider settlement.
- Finance screens visibly state: **“Mengantar is the official financial source of truth.”**
- Reconciliation flags stale snapshots, missing provider mappings, amount mismatches, and provider-state unknowns for review.

## 6. Approval/Verification Gates

| Gate | Owner | Required evidence |
|---|---|---|
| Mengantar cancellation and pickup-status mapping | Engineering + provider account owner | Current official docs/support confirmation plus sanitized sandbox/observed result where available |
| Branch account/pickup configuration | Platform super admin + organization owner | Approved branch, provider-account mapping, pickup details, printer readiness policy |
| Estimated-profit formula | Finance + product | Worked synthetic examples covering discount/cashback/cancel/mismatch cases |
| Shared organization provider account (if requested later) | Product + finance + engineering | Provider commercial/technical confirmation and branch allocation/reconciliation design |
