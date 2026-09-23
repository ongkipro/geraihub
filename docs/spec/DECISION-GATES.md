# GeraiHub Decision and Evidence Gate Register

## Purpose

This register distinguishes **accepted decisions** from **unverified external facts** and **production policy gates**. It prevents an AI/developer from filling unknowns with plausible assumptions.

The gate keys below are coordination labels, not new product requirement IDs.

## Gate register

| Gate key | Status | What is already decided | What evidence/decision is still required | Owner | Blocks |
|---|---|---|---|---|---|
| GATE-REPO-PROTECTION | OPEN | Canonical branch is `main`; Specification Validation exists | GitHub evidence that required PR/status/force-push/deletion/conversation rules are active | Repository owner | T-1 via T-23 |
| GATE-DEVELOPMENT-AUTH | OPEN | Planning baseline is accepted | Explicit authorization to initialize application source/runtime | Product/repository owner | T-1 and all source implementation |
| GATE-RUNTIME-COMPAT | OPEN until T-1 evidence | Node 24 LTS major, pnpm, Next.js App Router, PostgreSQL, Drizzle, Better Auth, modular monolith, web+worker baseline accepted | Exact installed versions, lockfile, build/typecheck/test/migration/start compatibility | Engineering owner | Runtime implementation confidence |
| GATE-MENGANTAR-ESTIMATE | OPEN | Server-only provider adapter boundary | Current fields/units/eligibility/freshness/account behavior from documented or authorized sanitized evidence | Engineering + Mengantar account owner | Provider estimate implementation claims |
| GATE-MENGANTAR-SUBMIT | OPEN | Durable outbox/correlation/no-blind-retry policy | Create-order contract, idempotency/duplicate semantics, timeout recovery, auth/account limits, failure classes | Engineering + Mengantar account owner | T-11 |
| GATE-MENGANTAR-LABEL | OPEN | Print only after confirmed printable state | Retrieval method, printable status mapping, access/URL handling, invalidation behavior | Engineering + Mengantar account owner | T-12 |
| GATE-MENGANTAR-CANCEL | OPEN | Post-submit cancellation is provider-synchronized and not equivalent to refund | Eligibility, request/result schema, idempotency, timeout recovery, financial effects, terminal states | Engineering + Mengantar account owner | T-13 |
| GATE-MENGANTAR-PICKUP | OPEN | Only authoritative provider pickup/handover qualifies for estimated profit | Exact status/event mapping, ordering/freshness, polling/webhook capability if any | Product + Operations + Engineering | T-22 |
| GATE-BRANCH-PROVIDER-MAPPING | OPEN | MVP policy targets one verified Mengantar account mapping per branch | Commercial/technical feasibility, ownership, credential scope, activation/readiness evidence | Platform + Finance + Engineering | T-10/T-14 |
| GATE-QRIS-SOP | OPEN | MVP payment methods are cash and branch QRIS; receipt must be physically/independently verified | Operational verification SOP and minimum evidence fields | Finance + Product | T-8 |
| GATE-PROFIT-FORMULA | OPEN | Report is non-authoritative and pickup-only; GeraiHub money is exact integer IDR | Approved worked formula, inputs, discount/cashback treatment, missing-data behavior | Finance + Product | T-22 |
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
| Capability | Estimate / submit / status / label / cancellation / pickup / account mapping |
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
