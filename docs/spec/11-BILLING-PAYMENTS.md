# GeraiHub Invoice and Manual-Payment Boundary

> GeraiHub documents the customer charge and the confirmed shipment. The gerai collects and handles customer payment manually outside the application. Mengantar remains authoritative for provider finance, COD, remittance, and settlement.

## Document Control

| Field | Value |
|---|---|
| Status | Accepted MVP invoice policy; provider formula verification pending |
| Version / updated | 0.4 / 2026-09-24 |
| Market | Indonesia |
| Accountable owner | Finance owner |
| Authority | Canonical repository specification; updated after the product owner's manual-payment correction |

## 1. MVP Policies

| ID | Owner | Policy | Consequence / boundary |
|---|---|---|---|
| BILL-1 | Finance owner | Customer payment directly to the gerai is manual and outside GeraiHub; courier COD collection is a separate provider shipment instruction. | No gerai payment method, QR channel, receipt, paid/unpaid status, payment correction, or refund operation is stored or inferred by GeraiHub. Provider COD results remain Mengantar-authoritative. |
| BILL-2 | Finance owner | Display and confirm the final shipping charge from the current verified quote, the chosen non-COD/COD mode, shipping-charge allocation, and intended courier collection before shipment submission. | The quote and collection instruction are price/routing decisions, not evidence that anyone has paid. A changed or stale quote requires fresh confirmation. |
| BILL-3 | Finance owner | Issue at most one invoice for a provider-confirmed shipment/resi, using the quote version confirmed at submission and its exact shipping charge/collection allocation. | Invoice issuance is idempotent per shipment; no invoice is issued for pending, failed, provider-unknown, or cancelled shipments without an existing invoice. Later quote expiry does not change the submitted charge. |
| BILL-4 | Finance owner | Issued invoices are immutable. Reprint returns the same invoice; a later shipment/price correction preserves the original document and needs an explicit approved replacement procedure. | Never silently rewrite a charge, resi, invoice number, or issue time. The correction procedure must respect provider cancellation/eligibility and remains a product/finance gate. |
| BILL-5 | Finance owner | A shipment enters GeraiHub's estimated-profit report only after Mengantar provides a verified pickup/handover status mapped to `picked_up`. No local staff confirmation can qualify it. | Exact provider status/event mapping remains a Mengantar-contract verification gate. |
| BILL-6 | GeraiHub product owner | A new branch is requested/configured by the organization owner but becomes active only after platform-super-admin approval and readiness checks. | Owner can prepare draft branch configuration; no shipment operation before activation. |
| BILL-7 | Engineering owner | Treat the Mengantar account mapping as one account per branch in MVP. A shared account requires an explicit verified organization-account mapping decision. | This is MVP policy, not a claim about Mengantar requirements. Provider contract and commercial setup must be verified. |
| BILL-8 | Finance owner | Shipping charge is the final verified quote before provider cashback. Internal estimated gross contribution uses the approved shipping-charge and verified Mengantar cost/discount inputs, labeled as an estimate; product COD principal is not shipping revenue. | Finance owner must approve mode-specific formula and collection/remittance treatment before report release; GeraiHub never rewrites Mengantar settlement. |
| BILL-9 | Finance owner | Quote expiry or material edits before submission invalidate confirmation. Provider-unknown submission freezes conflicting edits, cancellation, and invoice issuance until reconciled. | A confirmed invoice snapshots the accepted quote and provider mapping. No payment-recovery state exists in GeraiHub. |

## 2. Invoice Contract

An invoice is a branch-scoped document of the shipping charge and collection instruction, not a receipt or proof of payment. It contains a stable unique invoice reference, issuing branch identity, issue time, confirmed Mengantar resi/order reference, service/charge description, exact IDR shipping charge, selected collection mode/allocation, and the quote version used. Customer details are limited to what the approved invoice purpose requires under Privacy. It must not display `paid`, `unpaid`, a payment method, a QR payment image, a bank destination, or refund status without a separately approved product change.

Invoice issuance and reprint are audited. A retry or double click must return the existing document rather than allocate a second invoice reference. The document and its submitted quote/provider mapping remain inspectable; print/reprint never invokes Mengantar order creation. An already issued invoice remains available for authorized historical reprint after pickup or cancellation, with cancellation context shown separately. Cancellation cannot create a new invoice. Whether a corrected post-submit shipment may receive a replacement invoice is a Finance/Product decision before that path is enabled.

The provider label/resi is a separate Mengantar-confirmed artifact. GeraiHub must not invent a resi or make an invoice look like provider confirmation while the order outcome is pending or unknown. Invoice content and rendering version follow Data Model section 4: later branch/contact/template changes cannot alter an original reprint.

For the counter handoff, one `Cetak resi + invoice` action prepares the confirmed provider label/resi and the already issued invoice together. If no invoice exists, that action issues it exactly once before preparing the print view. The invoice shows the gerai name/identity, invoice number and issue time, Mengantar resi, service/route summary, permitted sender/recipient summary, shipping-charge description, exact shipping total IDR, and whether that shipping charge is allocated to manual gerai collection or courier COD. A bounded item summary and declared goods total may appear in a separately labeled information section, never in a second shipping amount. Intended courier COD collection is shown separately from the shipping total so product value is not presented as an extra shipping charge. The 3.33% COD fee remains an internal planning estimate and is not added as a final customer invoice charge while payer and actual provider treatment are unverified. It is a charge invoice/nota, not a tax invoice or payment receipt; tax labels/amounts require separate qualified approval. The label remains the provider artifact; GeraiHub must not alter its barcode, tracking data, or required layout. Payment method, paid status, cashier tender, change due, and refund fields are absent.

The operator sees both documents before invoking browser/system print and can reprint either one independently. A failed dialog, printer error, or browser interruption does not issue a new invoice or provider order. The app may audit a print request, but it cannot claim physical paper was printed without printer acknowledgement. If the provider label format and invoice media cannot be printed safely in one job, the same counter action presents two clearly ordered print steps instead; printer/media compatibility is verified in T-12/T-21 before claiming one-job printing.

## 3. Money and Source of Truth

| Concept | Authority | GeraiHub behavior |
|---|---|---|
| Shipping charge | Confirmed GeraiHub quote/version | Show before submission; snapshot on the invoice after provider confirmation, with collection route clearly labeled. |
| Declared goods total | Shipment item snapshots | Sum exact item line values; display separately from shipping charge and never add it to the shipping invoice total by default. |
| Intended courier COD collection | Explicit mode plus verified quote/item inputs | Compute from the mode table below, show separately, and validate provider mapping/fees before submission; never treat this as proof of actual collection. |
| COD service fee estimate | Product policy: 3.33% of intended courier COD collection | Calculate separately for COD modes only; never include it silently in goods value, shipping charge, or requested courier collection. Final provider fee and remittance remain Mengantar-authoritative. |
| Customer payment/refund | Gerai's manual process | No collection, verification, paid-status, receipt, or refund record. |
| Invoice | GeraiHub issued document | Immutable charge document, auditable issuance and reprint; not payment evidence. |
| Mengantar wallet/balance and COD/remittance/settlement | Mengantar | Read/snapshot/reconcile only where verified; no local adjustment. |
| Provider discount/cashback | Mengantar | Snapshot source/version; use only for labeled internal estimate. |

GeraiHub-owned monetary amounts use exact integer IDR rupiah compatible with PostgreSQL `BIGINT`, per ADR-004, serialized as integer strings under API section 2. The COD estimate numerator/rate are integer calculation inputs; an unrounded rational estimate is never booked or sent as a fractional charge. Provider decimal amounts are normalized at the adapter boundary with explicit precision validation; floating-point money is prohibited.

### Counter mode and amount contract

| Mode | Shipping charge allocation | Intended courier collection before provider-specific fees | Final-review wording |
|---|---|---|---|
| Non-COD (default) | Manual gerai process | None | `Ongkir: Rp… — ditangani gerai`; `Tagihan kurir ke penerima: tidak ada`. |
| COD ongkir | Courier COD | Verified shipping charge only | `COD ongkir: Rp…`; goods value remains declaration information, not courier product collection. |
| COD produk, shipping included | Courier COD | Declared goods total + verified shipping charge | Show product and shipping components and their exact sum; do not present this as two separate payments. |
| COD produk, shipping excluded | Sender at gerai, manual and unrecorded | Declared goods total only | Show product COD and label shipping as sender-handled at the gerai; never claim it was paid. |

The first row is the default counter mode, not evidence of gerai payment. A positive declared goods total is required for product COD. Arithmetic uses server-side exact integer IDR, rejects negative/overflow values, and checks the quoted shipping charge and provider eligibility. Any provider fee rounding, payer convention, minimum/maximum, insurance, actual fee, or collection-field semantics remain T-10/Finance evidence gates; unsupported combinations stay unavailable. Changing mode, inclusion, goods total, or charge invalidates the confirmed quote and requires a fresh review. Actual courier collection, remittance, and settlement are never inferred from the requested COD amount.

### COD service fee policy

For both COD ongkir and COD produk, the GeraiHub planning estimate is **3.33% of intended courier COD collection** (`COD amount × 333 / 10,000`). Non-COD has no COD fee. The base is the requested COD amount before adding any fee, so COD produk with shipping included has a larger fee base than COD produk without shipping. Compute the numerator with exact integer arithmetic and reject overflow; do not use floating point. The final whole-rupiah rounding rule, fee payer, whether Mengantar adds/deducts the fee, and whether its actual tariff matches 3.33% are OPEN evidence/Finance decisions. Until those are verified, label the value `estimasi biaya COD`, keep it separate from requested collection and the shipping invoice total, and do not present an exact final payable/remittance figure for fractional-rupiah results.

Illustrative arithmetic only, with goods declared at IDR 100,000 and verified shipping charge at IDR 18,000; these are synthetic inputs, not Mengantar tariffs or fee rules:

| Choice | Requested courier collection | Shipping allocation | Shipping invoice total |
|---|---:|---|---:|
| Non-COD | IDR 0 | Manual gerai process | IDR 18,000 |
| COD ongkir | IDR 18,000 | Courier COD | IDR 18,000 |
| COD produk + ongkir | IDR 118,000 | Courier COD | IDR 18,000 |
| COD produk without ongkir | IDR 100,000 | Sender at gerai, manual/unrecorded | IDR 18,000 |

At 3.33%, the exact unrounded fee estimate for the COD ongkir example is IDR 599.40, for COD produk + ongkir IDR 3,929.40, and for COD produk without ongkir IDR 3,330.00. These are calculation examples, not final integer-rupiah fees or Mengantar tariff evidence. A supported provider result must be reconciled before presenting a final collection instruction.

## 4. Workflow and Recovery

1. Staff reviews the active pickup point, sender/recipient snapshots, shipped items, declared goods total, COD amount if any, physical package, and current final shipping quote/customer charge as distinct fields.
2. The server durably submits to Mengantar under the provider idempotency and reconciliation contract. Manual payment outside GeraiHub is neither a prerequisite nor a state transition in this workflow.
3. On a confirmed order/resi, authorized staff may issue and print the invoice and provider label/resi. Pending or unknown outcomes show recovery state and offer no fabricated documents.
4. Quote expiry before dispatch requires a fresh estimate and explicit confirmation. Material edits invalidate the previous quote; provider-unknown outcomes deny a conflicting edit or duplicate order.
5. Local draft cancellation creates no invoice. Post-submit cancellation follows Mengantar's verified contract and retains issued document history. Any customer refund remains a separate manual gerai matter with no inferred app status.

## 5. Open Gates

| Gate | Owner | Required decision/evidence |
|---|---|---|
| Post-submit invoice replacement/correction | Finance + Product | Approved cases, authorized actor, original/replacement linkage, amount and resi handling, and customer-facing document wording. Until approved, retain history and block replacement. |
| Mengantar cancellation and pickup mapping | Engineering + provider account owner | Current contract and sanitized authorized observation where required. |
| Branch account/pickup configuration | Platform super admin + organization owner | Approved branch, provider-account mapping, pickup details, printer readiness. |
| Estimated-profit formula | Finance + Product | Mode-specific worked examples for non-COD, COD ongkir, COD produk with/without shipping, provider fees, discount/cashback, cancellation and mismatch; product principal must not be counted as shipping revenue. |
