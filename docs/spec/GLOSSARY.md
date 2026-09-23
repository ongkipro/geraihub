# GeraiHub Canonical Glossary

## Purpose

This glossary fixes the meaning of terms that cross product, architecture, security, finance, provider, UX, and operations documents. When wording elsewhere is ambiguous, use the definition here together with the owning specification. This document does not replace requirement IDs or provider evidence.

## Canonical domain terms

| Term | Canonical meaning | Do not use it to mean |
|---|---|---|
| Organization | GeraiHub business/account ownership boundary that may own multiple branches. | A single physical counter or the active operational scope. |
| Branch / Gerai | Physical/operational tenant boundary where shipment actions occur. Every operational shipment action is scoped to one authorized branch. | Organization-wide authority. |
| Tenant | Generic architecture term for an isolated customer scope. In GeraiHub operational documents, prefer **branch/gerai** when the actual boundary is branch-level. | A browser-supplied tenant ID or arbitrary organization ID. |
| Active branch | Server-owned branch context selected from an authenticated user's currently authorized memberships. | A client-controlled `branch_id` query/body field. |
| Membership | GeraiHub authorization relation between a user and an organization/branch role or scope. | Google identity itself. |
| Role | Named authorization grouping such as gerai owner, gerai admin, staff pengiriman, finance viewer, or platform super admin. | A permission check performed only in the browser. |
| Permission / action | Stable server-side authorization capability used to decide whether an actor may perform an operation. | A role string trusted directly from the client. |
| JIT support | Explicit, time-bounded, named-branch support access granted for an approved purpose and audited. | Permanent super-admin access to tenant shipment detail. |
| Shipment | GeraiHub operational aggregate representing one package workflow under immutable organization/branch ownership. | Provider settlement record or customer checkout order. |
| Draft | Branch-owned shipment state before provider submission. | A Mengantar order. |
| Quote | Versioned normalized estimate used for operator review and final customer charge confirmation. | Provider settlement truth or a permanently valid price. |
| Physical verification | Operator verification of actual package values before final quote and submission. | Customer-entered values or an unverified estimate. |
| Shipping charge / customer shipping charge | Verified quote amount for delivery service before provider cashback/discount, with an explicit manual-gerai or courier-COD collection allocation. | Declared goods value, requested courier COD amount, actual collected money, or provider cost. |
| Pickup point / origin | Approved address/configuration of the active gerai used as the shipment's origin and snapshotted at submit. | Courier pickup/handover status or another branch's origin. |
| Contact directory | Optional branch-local reusable sender/recipient details searched by authorized staff; a selected entry is copied into a shipment snapshot. | Public draft lookup or a cross-branch customer database. |
| Declared goods total | Exact sum of shipped-item quantity times declared unit value, describing parcel contents. | Shipping invoice total or COD amount. |
| Non-COD | Default shipment mode with no courier collection requested; any gerai-counter payment is handled manually outside the app. | Proof that shipping was paid. |
| COD ongkir | Shipment mode requesting courier collection of the verified shipping charge only, subject to provider eligibility. | Product-value collection. |
| COD produk | Shipment mode requesting courier collection of the declared goods total, with verified shipping charge included only when explicitly selected. | Automatic gerai payment or proof of courier remittance. |
| Intended courier collection | Exact amount requested from Mengantar under a confirmed COD mode before provider-specific adjustments. | Actual collected, remitted, or settled amount. |
| COD service fee estimate | GeraiHub planning calculation of 3.33% of intended COD amount (`333 / 10,000`), with rounding and payer unresolved. | Verified Mengantar fee, additional recipient collection, or final net remittance. |
| Manual customer payment | Gerai collects customer payment outside GeraiHub; the app does not record or infer method, status, receipt, correction, or refund. | A shipment state or prerequisite for provider submission. |
| Invoice | Immutable branch-issued charge document tied to one confirmed provider resi and quote version; reprint preserves its identity. | Receipt or proof of payment. |
| Draft-reference QR code | Deferred post-MVP representation of the same opaque customer draft reference shown in text. | Payment QR code or Mengantar resi. |
| Provider | Mengantar, as the external shipment/provider integration authority in the current product design. | GeraiHub itself. |
| Provider operation | Durable GeraiHub record for an external side-effect intent such as create/cancel, including correlation, attempts, and reconciliation state. | A browser request or UI click. |
| Provider truth | Current authoritative Mengantar result for shipment/provider finance fields that GeraiHub explicitly treats as external source of truth. | A locally assumed result after timeout. |
| Submission pending | GeraiHub has durably accepted submit intent but provider order confirmation is not yet authoritative. | Confirmed successful order creation. |
| Submitted | Provider order/resi mapping is confirmed according to the verified integration contract. | "Request was sent" or "HTTP request returned something." |
| Provider unknown | Provider may have received the side effect, but GeraiHub does not have an authoritative outcome. | Failed, safe-to-retry, or cancelled. |
| Reconciliation required | Automatic safe progression cannot determine the authoritative provider outcome; a reconciliation path is required before another conflicting side effect. | A generic retry button. |
| Resi / tracking number | Provider-confirmed shipment identifier under verified provider/account scope. | GeraiHub post-MVP short draft reference. |
| Label | Printable artifact associated with a provider-confirmed shipment mapping. | Proof that a create-order request may be safely repeated. |
| Cancellation request | GeraiHub intent/request to cancel a provider-submitted shipment. | Final cancellation success. |
| Cancelled | Operational state used only when local pre-provider cancellation is valid or authoritative provider cancellation is confirmed. | "User clicked cancel" or timeout/unknown. |
| Pickup / handover | Authoritative provider evidence that the courier accepted/picked up the shipment, using the provider status/event mapping verified under T-10. | Staff assertion or label printing. |
| Finance snapshot | Non-authoritative GeraiHub copy/read model of provider finance data for reconciliation and reporting. | Official ledger or settlement owner. |
| Estimated profit | Internal, non-authoritative estimate calculated only for shipments with verified pickup evidence and approved formula inputs. | Realized accounting profit or provider settlement. |
| Audit event | Append-only redacted evidence of a security/operational action, actor, scope, resource, result, correlation, and time. | Full request/response payload logging. |
| Correlation ID | Opaque identifier used to connect safe logs, provider operations, audit, and support evidence. | PII, tenant meaning, credential, or provider secret. |
| Planning contract | Accepted repository specification describing required behavior/constraints. | Proof that runtime behavior works. |
| Runtime evidence | Executed test, observed provider result, generated/reviewed schema, verified configuration, or other actual implementation evidence. | A checklist marked complete without execution. |
| Provider evidence | Current documented or separately authorized sanitized observation proving a Mengantar contract behavior. | Invented fixture or stale assumption. |
| Release-ready | T-20 evidence shows required implementation, security, provider, privacy, restore/rollback, and regression gates are satisfied. | Automatic authorization to deploy production. |
| Production authorization | Explicit decision to perform production deployment/change after readiness gates. | Merely passing tests or merging a PR. |

## State language rules

Use exact qualifiers when writing state:

- **local** — owned entirely by GeraiHub before an external side effect;
- **pending** — a durable operation exists but no authoritative final outcome exists;
- **confirmed** — evidence from the authoritative system satisfies the verified contract;
- **failed** — evidence proves the operation did not succeed under the applicable contract;
- **unknown** — the external side effect may have happened and blind retry is unsafe;
- **reconciliation required** — additional provider evidence or governed recovery is required.

Avoid the standalone words **success**, **failed**, **cancelled**, **paid**, **profit**, or **synced** when the authoritative domain is not obvious.

## Language rules for documentation

Prefer:

- "branch-scoped" over "tenant-scoped" when describing shipment operations;
- "manual customer payment outside GeraiHub" over an application payment state;
- "Mengantar authoritative finance/provider state" over "GeraiHub balance";
- "estimated profit" over "profit";
- "provider-confirmed cancellation" over "cancelled" when discussing post-submission flows;
- "server-derived active branch" over "selected branch ID";
- "planning baseline" over "implemented" until runtime evidence exists.

## Code/reference naming guidance

Implementation names may differ for framework ergonomics, but domain types should preserve the distinctions above. Example only:

```ts
type ProviderSyncState =
  | "not_started"
  | "pending"
  | "confirmed"
  | "failed"
  | "unknown"
  | "reconciliation_required";
```

This example is reference terminology, not source code or package/API evidence.
