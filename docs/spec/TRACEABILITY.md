# GeraiHub Requirement Traceability

## Purpose

This document gives one review surface for tracing product requirements to their controlling specifications, implementation work packages, and required evidence. It is a navigation/verification map, not a competing task queue.

If this matrix conflicts with a requirement's owning document or `TASKS.md`, the owning specification and current task queue win and this file must be corrected.

## Product requirement traceability

| Requirement | Product intent | Controlling specifications | Primary implementation tasks | Minimum acceptance/evidence family |
|---|---|---|---|---|
| PR-1 | Create shipment only in active authorized branch | 05 Data Model; 06 Tenant Isolation; 07 IAM; 08 State/Concurrency; 09 API | T-3, T-5, T-7 | Cross-branch create/read/update denial; immutable ownership; authorized draft creation |
| PR-2 | Physical verification before final submission | 08 State/Concurrency; 09 API; 11 Billing/Payments; 17 UX | T-7, T-8, T-9 | Invalid/incomplete verification denied; material edits invalidate confirmation |
| PR-3 | Show and confirm final customer charge before payment/submission | 08 State/Concurrency; 09 API; 11 Billing/Payments; 17 UX | T-8, T-9 | Changed/final quote visibly confirmed; payment cannot precede accepted current quote |
| PR-4 | Safe trusted-backend Mengantar submission and recovery | 03 Technical Design; 08 State/Concurrency; 09 API; 12 Security; 16 Observability | T-10, T-11 | Verified provider contract; replay/timeout/crash tests; no duplicate confirmed order |
| PR-5 | Print/reprint only after confirmed provider mapping | 03 Technical Design; 08 State/Concurrency; 09 API; 17 UX | T-11, T-12 | Print eligibility from confirmed state; reprint produces no provider create side effect |
| PR-6 | Correction/cancellation without false finality | 03 Technical Design; 08 State/Concurrency; 09 API; 11 Billing/Payments; 16 Observability | T-10, T-13, T-21 | Local vs provider cancellation separation; pending/unknown visible; authoritative final outcome |
| PR-7 | Immutable operational audit | 05 Data Model; 07 IAM; 12 Security; 16 Observability | T-6, T-7, T-21 | Append-only/redacted audit; actor/scope/action/outcome/correlation preserved |
| PR-8 | Non-authoritative Mengantar finance reconciliation | 03 Technical Design; 05 Data Model; 11 Billing/Payments; 16 Observability | T-10, T-15 | Source-of-truth labeling; stale/mismatch surfaced; no provider truth mutation |
| PR-9 | Pickup-only estimated-profit report | 05 Data Model; 11 Billing/Payments; 16 Observability | T-10, T-15, T-22 | Verified pickup mapping; approved formula examples; non-picked-up excluded |
| PR-10 | Platform governance without routine tenant operation | 06 Tenant Isolation; 07 IAM; 12 Security; 17 UX | T-6, T-14, T-16 | Aggregate default; shipment detail/action denied without bounded JIT |
| PR-11 | Owner/admin/staff membership hierarchy | 05 Data Model; 06 Tenant Isolation; 07 IAM; 09 API | T-3, T-4, T-5, T-14 | Permission matrix; no staff escalation/cross-branch access; revocation enforced |
| PR-12 | Post-MVP QR/manual draft lookup | 02 PRD; 05 Data Model; 06 Tenant Isolation; 12 Security; 13 Privacy; 17 UX | Deferred task set | Same opaque reference via QR/manual; abuse/privacy/expiry controls before enablement |

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
| Q-3 cash/QRIS correction baseline | Finance + Product | 02 PRD; 11 Billing | T-8 / T-21 policy implementation |
| Q-4 multi-branch organization model | Product + Architecture | 02 PRD; 05 Data Model; 06 Tenant Isolation | IAM/data implementation |
| Q-5 post-MVP expiry/business calendar | Product + Privacy | 02 PRD; 05 Data Model; 13 Privacy | PR-12 |
| Q-6 branch activation/provider mapping | Platform + Finance + Engineering | 02 PRD; 05 Data Model; 11 Billing | T-10 / T-14 |
| Q-7 Google OAuth + GeraiHub authorization ownership | Product + Security + Engineering | 02 PRD; 07 IAM; ADR-005 | T-4 |
| Runtime/deployment planning baseline | Engineering | ADR-001 through ADR-005 | T-1 |
| Repository protection | Repository owner | REPOSITORY-GOVERNANCE; TASKS T-23 | T-1 |
| Privacy/legal production policy | Privacy owner | 13 Compliance/Privacy | T-18/T-19/T-20 |
| Production recovery/operations | Operations owner | 15 Operations; 16 Observability | T-17/T-19/T-20 |

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
