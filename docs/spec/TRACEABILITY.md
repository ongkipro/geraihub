# GeraiHub Requirement Traceability

## Purpose

This document gives one review surface for tracing product requirements to their controlling specifications, implementation work packages, and required evidence. It is a navigation/verification map, not a competing task queue.

If this matrix conflicts with a requirement's owning document or `TASKS.md`, the owning specification and current task queue win and this file must be corrected.

Linked IDs below are references, not duplicate requirement declarations. Task coverage includes primary requirements and mandatory constraints; TASKS.md owns the exact primary assignment.

## Product requirement traceability

| Requirement | Product intent | Controlling specifications | Implementation coverage (primary or constraint) | Minimum acceptance/evidence family |
|---|---|---|---|---|
| [PR-1](02-PRD.md) | Branch pickup point, new/existing sender and recipient, and itemized shipment in active branch | 05 Data Model; 06 Tenant Isolation; 07 IAM; 09 API; 17 UX | T-3, T-5, T-7, T-9 | Wrong-branch contact/pickup denial; new and existing paths; frozen shipment snapshots |
| [PR-2](02-PRD.md) | Non-COD default, eligible COD ongkir/produk modes, and physical/item/amount verification | 05 Data Model; 08 State/Concurrency; 09 API; 11 Billing; 17 UX | T-7, T-8, T-9, T-10, T-11 | Exact goods/shipping/intended COD amounts; unsupported modes denied; material edits invalidate confirmation |
| [PR-3](02-PRD.md) | Confirm shipping charge and collection route; issue invoice after provider confirmation | 08 State/Concurrency; 09 API; 11 Billing/Payments; 17 UX | T-8, T-9, T-21 | Changed/final quote and payer route visibly confirmed; one immutable invoice follows confirmed resi and quote |
| [PR-4](02-PRD.md) | Safe trusted-backend Mengantar submission and recovery | 03 Technical Design; 08 State/Concurrency; 09 API; 12 Security; 16 Observability | T-10, T-11 | Verified provider contract; replay/timeout/crash tests; no duplicate confirmed order |
| [PR-5](02-PRD.md) | One counter action prepares confirmed provider resi and invoice for print | 03 Technical Design; 08 State/Concurrency; 09 API; 11 Billing; 17 UX | T-11, T-12, T-21 | Both documents previewed from confirmed state; provider label preserves format; print failure/reprint creates no second invoice or order |
| [PR-6](02-PRD.md) | Correction/cancellation without false finality | 03 Technical Design; 08 State/Concurrency; 09 API; 11 Billing/Payments; 16 Observability | T-10, T-13, T-21 | Local vs provider cancellation separation; pending/unknown visible; authoritative final outcome |
| [PR-7](02-PRD.md) | Immutable operational audit | 05 Data Model; 07 IAM; 12 Security; 16 Observability | T-6, T-7, T-21 | Append-only/redacted audit; actor/scope/action/outcome/correlation preserved |
| [PR-8](02-PRD.md) | Non-authoritative Mengantar finance reconciliation | 03 Technical Design; 05 Data Model; 11 Billing/Payments; 16 Observability | T-10, T-15 | Source-of-truth labeling; stale/mismatch surfaced; no provider truth mutation |
| [PR-9](02-PRD.md) | Pickup-only estimated-profit report | 05 Data Model; 11 Billing/Payments; 16 Observability | T-10, T-15, T-22 | Verified pickup mapping; approved formula examples; non-picked-up excluded |
| [PR-10](02-PRD.md) | Platform governance without routine tenant operation | 06 Tenant Isolation; 07 IAM; 12 Security; 17 UX | T-6, T-14, T-16 | Aggregate default; diagnostic detail requires bounded JIT; mutations remain denied in JIT |
| [PR-11](02-PRD.md) | Owner/admin/staff membership hierarchy | 05 Data Model; 06 Tenant Isolation; 07 IAM; 09 API | T-3, T-4, T-5, T-14 | Permission matrix; no staff escalation/cross-branch access; revocation enforced |
| [PR-12](02-PRD.md) | Post-MVP QR/manual draft lookup | 02 PRD; 05 Data Model; 06 Tenant Isolation; 12 Security; 13 Privacy; 17 UX | Deferred task set | Same opaque reference via QR/manual; abuse/privacy/expiry controls before enablement |

## Non-functional requirement traceability

| Requirement | Controlled by | Evidence |
|---|---|---|
| NFR-1 tenant/server authorization | 06 Tenant Isolation; 07 IAM; ADR-002; ADR-005 | Same-role two-branch negative tests; stale-session/context tests |
| NFR-2 desktop/tablet keyboard-first operator UX | 10 Design System; 17 UX | Browser scenarios, keyboard navigation, narrow-screen recovery evidence |
| NFR-3 sensitive actions auditable | 12 Security; 16 Observability | Audit event assertions and redaction scans |
| NFR-4 provider credentials never browser/logs | 03 Technical Design; 12 Security; 16 Observability | Static/runtime browser/log evidence; outbound adapter boundary tests |

## Cross-cutting decision traceability

| Decision/gate | Canonical owner | Primary documents | Blocked work |
|---|---|---|---|
| Q-1 Mengantar cancellation contract | Engineering + Mengantar account owner | 02 PRD; 03 Technical Design | PR-6 / T-13 |
| Q-2 authoritative pickup mapping | Product + Operations | 02 PRD; 03 Technical Design; 11 Billing | PR-9 / T-22 |
| Q-3 manual customer payment outside GeraiHub | Finance + Product | 02 PRD; 11 Billing | T-8 quote guard; T-21 invoice issuance; no payment task |
| Q-4 multi-branch organization model | Product + Architecture | 02 PRD; 05 Data Model; 06 Tenant Isolation | IAM/data implementation |
| Q-5 post-MVP expiry/business calendar | Product + Privacy | 02 PRD; 05 Data Model; 13 Privacy | PR-12 |
| Q-6 branch activation/provider mapping | Platform + Finance + Engineering | 02 PRD; 05 Data Model; 11 Billing | T-10 / T-14 |
| Q-7 Google OAuth + GeraiHub authorization ownership | Product + Security + Engineering | 02 PRD; 07 IAM; ADR-005 | T-4 |
| Q-8 non-COD default and two gated COD modes | Product + Finance | 02 PRD; 05 Data Model; 11 Billing; 17 UX | T-8/T-9 synthetic mode logic; T-10 evidence before T-11 live COD |
| Q-9 3.33% COD fee estimate | Product + Finance | 02 PRD; 05 Data Model; 09 API; 11 Billing; 17 UX | T-8/T-9/T-22 exact estimate cases; T-10 provider fee and rounding evidence |
| Runtime/deployment planning baseline | Engineering | ADR-001 through ADR-005 | T-1 |
| Repository protection | Repository owner | REPOSITORY-GOVERNANCE; TASKS T-23 | T-1 |
| Privacy/legal production policy | Privacy owner | 13 Compliance/Privacy | T-18/T-19/T-20 |
| Production recovery/operations | Operations owner | 15 Operations; 16 Observability | T-17/T-19/T-20 |

## Readiness refinement coverage

| Canonical contract | Implementation coverage | Planned verification | Remaining boundary |
|---|---|---|---|
| [BILL-9](11-BILLING-PAYMENTS.md) quote/document recovery; state transition matrix | T-7, T-8, T-9, T-11, T-13, T-21 | TEST-2 | Post-issue replacement requires GATE-INVOICE-REPLACEMENT; provider ambiguity never authorizes local cancellation |
| [IAM-1](07-IAM-RBAC-ABAC.md) bootstrap/provisioning | T-3, T-4, T-14 | TEST-3 | Real identity provisioning requires named operator/approval evidence |
| [TEN-6](06-TENANT-ISOLATION.md) suspended history and context freshness | T-5, T-9, T-11, T-14 | TEST-4 | Read-only context cannot restore operational privileges |
| [TD-4](03-TECHNICAL-DESIGN.md) finance-source evidence | T-10, T-15, T-22 | TEST-5 | GATE-MENGANTAR-FINANCE and approved formula/pickup inputs |
| [TD-10](03-TECHNICAL-DESIGN.md) privacy implementation | T-18 | Synthetic rights exercise in task completion procedure | Qualified policies and publishing authorization remain separate |
| [TD-11](03-TECHNICAL-DESIGN.md) recovery implementation | T-19 | Synthetic restore/release rehearsal in task completion procedure | Production hosting, recovery targets and deployment authorization remain separate |

## Screen and action coverage

UX sections 9–10 own the MVP screen map (S-01 through S-09) and action register (A-01 through A-21). The architecture module map assigns boundaries; `TASKS.md` owns implementation and completion. T-9 maps counter/queue/detail navigation, T-12/T-21 own document actions, T-14/T-16 own branch/platform controls, and T-15/T-22 own finance reads. T-20 must compare the full register with real routes, handlers, permissions and browser evidence. These planning IDs are not proof that any route or button exists yet.

The pre-development semantic audit extends existing task acceptance: T-4/T-5 cover session exit and bounded identity recovery, T-7/T-8 cover lossless money and account/snapshot constraints, T-11 covers delayed-queue quote expiry and pinned account reconciliation, T-14 covers initial setup/reactivation and allowlisted directory/configuration changes, T-16 covers the full JIT request-to-exit path, and T-21 covers unchanged invoice content after mutable settings/template changes. TEST-2 through TEST-4 and UX scenarios 11–13 carry the added recovery cases. No additional task queue is introduced.

## Evidence semantics

Use these statuses consistently in reviews:

| Status | Meaning |
|---|---|
| PLANNED | Requirement/task exists; no execution evidence. |
| BLOCKED | Required external decision/evidence/authorization is absent. |
| IMPLEMENTED | Source/runtime artifact exists, but all acceptance evidence may not yet be complete. |
| PASS | Required verification actually executed against the stated version/environment and passed. |
| FAIL | Verification executed and did not satisfy the contract. |
| NOT APPLICABLE | Requirement is legitimately outside the reviewed change/release scope with rationale. |

Never use `PASS` for a prose review alone when the requirement explicitly calls for runtime/provider/security/restore evidence.

## Change-control rule

A product-policy change must update, as applicable:

1. the owning requirement/decision in `02-PRD.md`;
2. state/data/IAM/API/security/UX documents affected by the change;
3. this traceability matrix;
4. `TASKS.md` acceptance/dependency wording;
5. an ADR when the change alters a durable architecture decision.

A new implementation task must not silently redefine product policy.
