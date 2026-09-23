# GeraiHub Decision and Evidence Gate Register

## Purpose

This register distinguishes **accepted decisions** from **unverified external facts** and **production policy gates**. It prevents an AI/developer from filling unknowns with plausible assumptions.

The gate keys below are coordination labels, not new product requirement IDs.

## Gate register

| Gate key | Status | What is already decided | What evidence/decision is still required | Owner | Blocks |
|---|---|---|---|---|---|
| GATE-REPO-PROTECTION | CLOSED (observed 2026-09-23) | GitHub reports `main` protected with required PR, strict `validate` check, conversation resolution, admin enforcement, and no force push/deletion; baseline check passed on `fe5742f` | Recheck before T-1; require an independent approval after another maintainer joins | Repository owner | T-23 complete; no longer blocks T-1 |
| GATE-DEVELOPMENT-AUTH | CLOSED (user instruction 2026-09-24) | Product/repository owner explicitly instructed execution of `TASKS.md` to completion | No further development authorization; separate secret, provider mutation, production and release gates remain | Product/repository owner | No longer blocks local source implementation |
| GATE-RUNTIME-COMPAT | PARTIAL (local foundation verified 2026-09-24) | Node 24 LTS major, pnpm, Next.js App Router, PostgreSQL, Drizzle, Better Auth, modular monolith, web+worker baseline accepted; pinned packages and foundation checks passed in an isolated source export | Repeat from a committed clean checkout for T-1 closure; generated auth schema and session behavior remain T-3/T-4 evidence | Engineering owner | T-1 closure and full runtime implementation confidence |
| GATE-MENGANTAR-ESTIMATE | OPEN | Server-only provider adapter boundary | Current fields/units/eligibility/freshness/account behavior from documented or authorized sanitized evidence | Engineering + Mengantar account owner | Provider estimate implementation claims |
| GATE-COD-MODES | OPEN | Non-COD is the default; requested modes are COD ongkir and COD produk with optional shipping in courier collection | Per-courier/service eligibility; provider request/response fields, COD fees/minimum/maximum, whether goods and shipping can be distinguished, payer/remittance semantics, and excluded-shipping sender-at-gerai/provider mapping | Finance + Product + Engineering + Mengantar account owner | Enabling either COD mode in T-8/T-11/T-20; non-COD flow may proceed independently after its own contract gate |
| GATE-COD-FEE | OPEN | GeraiHub planning estimate is 3.33% of intended COD amount, separately displayed for COD modes | Confirm the tariff/base with Mengantar account evidence, whole-rupiah rounding, minimum/maximum, who bears the fee, whether added to collection or deducted from remittance, and actual reconciliation fields | Finance + Product + Engineering + Mengantar account owner | Final COD amount/fee display, enabled COD dispatch, COD net estimate and T-20 |
| GATE-MENGANTAR-SUBMIT | OPEN | Durable outbox/correlation/no-blind-retry policy | Create-order and order-status contracts, including an existing order without resi; idempotency/duplicate semantics, timeout recovery, auth/account limits, failure classes | Engineering + Mengantar account owner | T-11 |
| GATE-MENGANTAR-LABEL | OPEN | Print only after confirmed printable state | Retrieval method, printable status mapping, access/URL handling, invalidation behavior | Engineering + Mengantar account owner | T-12 |
| GATE-MENGANTAR-CANCEL | OPEN | Post-submit cancellation is provider-synchronized and not equivalent to refund | Eligibility, request/result schema, idempotency, timeout recovery, financial effects, terminal states | Engineering + Mengantar account owner | T-13 |
| GATE-MENGANTAR-PICKUP | OPEN | Only authoritative provider pickup/handover qualifies for estimated profit | Exact status/event mapping, ordering/freshness, polling/webhook capability if any | Product + Operations + Engineering | T-22 |
| GATE-BRANCH-PROVIDER-MAPPING | OPEN | MVP policy targets one verified Mengantar account mapping per branch and branch-owned pickup points; operations retain their original mapping/version | Commercial/technical feasibility, ownership, credential scope and same-account rotation verification, pickup-point fields/eligibility and activation/readiness evidence; historical/pending operations must never retarget after account replacement | Platform + Finance + Engineering | T-10/T-14 |
| GATE-PROFIT-FORMULA | OPEN | Report is non-authoritative and pickup-only; GeraiHub money is exact integer IDR; COD product principal is not shipping revenue | Approved mode-specific worked formula, 3.33% COD fee treatment using verified provider fee/remittance, inputs, discount/cashback treatment, missing-data behavior | Finance + Product | T-22 |
| GATE-MENGANTAR-FINANCE | OPEN | Provider finance remains authoritative; missing values remain unavailable | Verified finance-read capabilities, units, account/shipment mapping, pagination, freshness, revisions and sanitized observation | Engineering owner | T-15/T-22 |
| GATE-INVOICE-REPLACEMENT | OPEN | One immutable invoice is issued per confirmed shipment; reprints retain its identity | Finance/Product policy for post-issue corrections, original/replacement linkage, amount/resi handling, and customer-facing wording, with worked examples | Finance + Product | Post-issue invoice replacement in T-21; T-20 release review if enabled |
| GATE-PLATFORM-PROVISIONING | OPEN for real identities | IAM section 3 defines bootstrap and role provisioning; synthetic implementation is permitted only after development authorization | Named initial administrator, environment, approval record, operator access and recovery runbook | Repository owner | Real identity provisioning; T-20 |
| GATE-PRIVACY-LEGAL | OPEN | Engineering minimization/redaction/right-process requirements are defined | Legal entity roles, notice, lawful basis/rights process, retention/legal hold, vendor regions/contracts/transfers | Privacy/legal owner | T-18/T-19/T-20 |
| GATE-PRODUCTION-HOSTING | OPEN | Production needs separated web/worker/database/secrets/backup/telemetry controls | Actual provider/region, access model, secret store, subprocessor review | Operations + Security + Privacy | T-19/T-20 |
| GATE-RECOVERY | OPEN | Backups require actual restore proof; rollback must preserve ambiguous provider state | Approved RPO/RTO, configured backups, measured restore rehearsal, rollback/run-forward evidence | Operations owner | T-19/T-20 |
| GATE-OBSERVABILITY | OPEN | Required signals/redaction categories are defined | Runtime backend(s), retention, alert destination/owner, measured thresholds/SLO/SLI where justified | Operations owner | T-17/T-20 |
| GATE-JIT-OPERATIONS | PARTIALLY DECIDED | JIT is named-branch, time-bounded, purpose-limited, audited, default diagnostic/read-only | Actual operational approver/escalation/incident owner and production revocation procedure | Security + Operations | Production governance |

## Rules for working with gates

1. **Never infer a closed gate from a design document.** A design can specify what evidence is required without supplying that evidence.
2. **Never use synthetic fixtures as proof of an external Mengantar behavior.** Fixtures are valid for deterministic local testing only after the shape is tied to verified evidence.
3. **Never substitute package popularity for compatibility evidence.** The lockfile and executed runtime checks close the implementation compatibility gate.
4. **Never substitute a backup configuration screenshot for restore evidence.**
5. **Never let an OPEN production gate block safe documentation refinement.** It blocks the behavior/release it controls, not unrelated specification work.
6. **When a gate closes, record the source, observation/approval date, environment/scope, safe evidence reference, owner, and affected requirements/tasks.**

## Provider evidence record template

Use this template inside the owning provider contract table or linked evidence file:

| Field | Required value |
|---|---|
| Capability | Estimate / COD mode and fee / submit / status / label / cancellation / pickup / account mapping / finance read |
| Source | Official documentation, support confirmation, or authorized sandbox observation |
| Observed/confirmed date | ISO date |
| Environment/account scope | Sanitized environment and account class |
| Request contract | Sanitized required fields/units/constraints |
| Result contract | Sanitized states/fields and authoritative meaning |
| Idempotency/retry semantics | Verified behavior or explicitly unknown |
| Error/timeout semantics | Verified behavior or explicitly unknown |
| Financial effects | Verified behavior or not applicable/unknown |
| Evidence reference | Safe document/test/report reference |
| Remaining unknowns | Explicit list; empty only when actually resolved |

## Decision-record rule

Create/update an ADR only when the gate resolution changes a durable architecture choice. Provider facts and operational/legal approvals are usually evidence records, not architecture decisions.
