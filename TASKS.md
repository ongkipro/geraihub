# GeraiHub Implementation Tasks

> **Execution status: Documentation promoted; development not started.** This is the sole canonical future implementation queue. Product scope acceptance is separate from technical design acceptance and authorization for source code, package installation, secrets, provider access, deployment, or release.

## Execution Rules

- Any terminal-capable AI or human may use this queue. No proprietary model, IDE agent, paid design registry, or browser agent is required. Repository scripts, current official documentation, synthetic fixtures, and repeatable browser tests are the handoff.
- Repository source, migrations, tests, and runtime evidence are authoritative. `docs/spec/` is the canonical specification; `~/Documents/work/prd/geraihub/` is a retained, non-authoritative planning snapshot. Read repository instructions and `docs/spec/` before every task.
- Mark a task complete only after executing its Done-when procedure. Planned scenarios are not passing tests. Record actual command, environment, safe output/report reference, and verdict in the repository.
- Each task has one primary requirement; constraints are mandatory. Requirements and task scope must be reviewed/accepted before execution. Do not infer approval from a task appearing here.
- Use non-interactive commands with documented prerequisites. No production data in fixtures, screenshots, logs, or docs. Secret access and provider mutations require separate explicit approval; never print credentials or credential-bearing URLs.
- Never guess Mengantar endpoints, status codes, payloads, retry semantics, or financial formulas. T-10 gates real provider work, not local synthetic state-machine exploration.
- These are planning work packages. Split any package exceeding one reviewable implementation session into subtasks in this same queue before starting; retain its primary and constraints. Do not create a competing queue.
- Execution follows dependencies, not numeric order: T-2 selects and records the stack/deployment profile; only then may an explicitly authorized T-1 initialize and verify the implementation repository workflow. Never treat machine-global tools as project evidence.

## Milestone 0 — Project and Contract Foundation

### T-1 — Initialize the implementation workflow reproducibly
- Status: Blocked — development authorization required
- Owner: Engineering owner
- Primary requirement: TD-9
- Constraints: SEC-8, SEC-15, PRIV-13
- Dependencies: T-2, T-23
- Current evidence: Documentation-only repository; no source tree, package manifest, lockfile, installed dependency, migration, or application check exists.
- Done when: After explicit development authorization, initialize the accepted profile and, from a clean checkout in an approved local environment, execute documented install, lint/typecheck, tests, startup, migration, and synthetic seed commands. Record prerequisites and results without proprietary AI tools or live provider writes.

### T-2 — Select and record the runtime and deployment profile
- Status: Complete — planning baseline accepted in ADR-001; exact package/runtime proof remains T-1
- Owner: Engineering owner
- Primary requirement: TD-9
- Constraints: TD-2, SEC-2, SEC-4, SEC-14, PRIV-11
- Dependencies: None
- Current evidence: ADR-001 accepts Node.js 24 LTS major, pnpm, Next.js App Router, PostgreSQL, Drizzle, Better Auth, and separate web/worker processes from one modular-monolith codebase. ADR-002 through ADR-005 fix tenant enforcement, outbox/reconciliation, exact money/concurrency, and session/active-branch policy. Current official stack documentation was rechecked on 2026-09-23; no installed package/lockfile/runtime evidence exists yet.
- Done when: Review compatible web runtime, auth adapter, PostgreSQL/Drizzle, worker/outbox execution, deployment, and secret/backup boundaries against current official documentation. Record one accepted profile with reasons and unresolved production gates; T-1 then initializes and verifies actual locked package versions and API compatibility. Do not create source code, remote resources, or credentials as part of this selection task.

### T-23 — Enable and verify canonical branch protection
- Status: Planned — GitHub currently reports `main` unprotected and no ruleset active
- Owner: Repository owner
- Primary requirement: TD-9
- Constraints: SEC-15
- Dependencies: None
- Current evidence: Specification Validation exists and has passed on the hardened baseline, but branch/ruleset administration is still disabled as observed on 2026-09-23.
- Done when: GitHub branch/ruleset evidence shows pull-request-only changes to `main`, required `Specification Validation / validate` status, blocked force pushes/deletion, and required conversation resolution. Require at least one independent approval when more than one maintainer is available. Record the observed ruleset/protection result without exposing credentials.

### T-3 — Build organization, branch, identity, invitation, and membership persistence
- Status: Planned
- Owner: Engineering owner
- Primary requirement: PR-11
- Constraints: DATA-1 through DATA-4, TEN-1 through TEN-3, IAM-1, SEC-1, SEC-3
- Dependencies: T-1
- Done when: Apply local migrations and execute synthetic integration tests for organization/branch ownership, unique provider-subject links, one-time/expired/revoked invitation acceptance, concurrent acceptance, permitted multi-branch memberships, and duplicate active-grant rejection. Record resulting schema/constraint evidence.

### T-4 — Implement Google OAuth and GeraiHub provisioning
- Status: Planned — identity/recovery/session policy accepted; runtime implementation pending
- Owner: Engineering owner
- Primary requirement: PR-11
- Constraints: IAM-1, IAM section 2 and authorization cases, SEC-2 through SEC-4
- Dependencies: T-3
- Done when: Execute synthetic auth tests proving invalid callback/origin/state/PKCE denial, uninvited Google identity denial, subject mismatch refusal, and approved invitation granting only its stored scope/role. Inspect persistence to prove Google API access/refresh tokens are not retained. Real Google client setup/credential use requires separate approval.

### T-5 — Implement active-branch context and action authorization
- Status: Planned
- Owner: Engineering owner
- Primary requirement: PR-1
- Constraints: TEN-1 through TEN-6, IAM-1 and permission matrix, SEC-1, SEC-6
- Dependencies: T-3, T-4
- Done when: Execute two-branch same-role integration tests against routes/actions, queries, caches, stale tabs/context, and mismatched background jobs. Assert no cross-branch disclosure or mutation, no implicit owner counter permission, and authorized switching invalidates old branch state.

### T-6 — Implement audit, JIT support, revocation, and redaction
- Status: Planned — JIT approval policy accepted; runtime implementation pending
- Owner: Engineering owner
- Primary requirement: PR-7
- Constraints: PR-10, IAM-1, OBS-1, SEC-4, SEC-8, SEC-10, PRIV-8
- Dependencies: T-4, T-5
- Done when: Execute tests for sensitive-action auditing, next-protected-request membership revocation, JIT expiry/revocation, super-admin detail default denial, and read-only diagnostic support. Inspect synthetic log/audit output for absence of secrets, sessions, full PII, and raw provider payloads.

## Milestone 1 — Safe Counter Workflow

### T-7 — Implement shipment, quote, payment, provider-sync, cancellation, and audit persistence
- Status: Planned
- Owner: Engineering owner
- Primary requirement: PR-1
- Constraints: DATA-5 through DATA-10, BILL-2 through BILL-4, SEC-5, SEC-11
- Dependencies: T-5, T-6
- Done when: Apply local migrations and run transaction tests proving immutable branch ownership, versioned quotes, append-only payment/correction evidence, concurrency guards, and retained original history after cancellation. Review generated SQL before acceptance.

### T-8 — Implement physical verification, quote, payment, and submission guards
- Status: Planned — QRIS verification baseline accepted; runtime implementation pending
- Owner: Engineering owner
- Primary requirement: PR-2
- Constraints: PR-3, BILL-1 through BILL-4, UX-1, SEC-5, SEC-11
- Dependencies: T-7
- Done when: Execute transition tests rejecting incomplete verification, stale/unconfirmed quote, missing or invalid cash/QRIS receipt evidence, and duplicate payment. Material edits invalidate confirmation; exact-money assertions match synthetic fixtures. Provider failure retains payment evidence and never requires collecting twice.

### T-9 — Build counter flow and branch queue/detail UI
- Status: Planned
- Owner: Engineering owner
- Primary requirement: PR-3
- Constraints: NFR-2, UX-1, UI-1 through UI-6, PRIV-8
- Dependencies: T-8
- Done when: Execute TEST-1 and UX browser scenarios 1, 2, and 4 with synthetic provider fixtures. Record desktop/tablet and narrow-screen recovery evidence, keyboard completion, branch context, pending/error/denied recovery, exact quote display, and no PII in URL/console/errors. UI fixtures are not live provider validation.

### T-10 — Verify current Mengantar contracts with sanitized evidence
- Status: Blocked — current source review and separately authorized sandbox access required
- Owner: Engineering owner
- Primary requirement: TD-4
- Constraints: Q-1, Q-2, Q-6, BILL-5 through BILL-8, SEC-7, SEC-9
- Dependencies: T-2
- Done when: Complete the contract evidence table in Technical Design section 7 with actual sources, environment/account scope, observation dates, sanitized schemas/results, and unresolved fields. Start only with an explicitly authorized sandbox non-COD estimate. Order/cancel/label mutation tests require separate scoped authorization and a provider-supported sandbox path; no production order may be created for validation. Unknown required capabilities keep dependent tasks blocked; documentation or synthetic fixtures alone cannot close runtime-proof gates.

### T-11 — Implement provider estimate, dispatch, idempotency, and reconciliation
- Status: Blocked — T-10 provider contract gate
- Owner: Engineering owner
- Primary requirement: PR-4
- Constraints: TD-3 through TD-5, API-1, OBS-2, RATE-1, SEC-7, SEC-9
- Dependencies: T-7, T-8, T-10
- Done when: Execute adapter/worker integration tests for replay, process crash before/after dispatch, timeout, duplicated/out-of-order response, insufficient-balance outcome if verified, bounded retry, and account-scoped concurrency. Assert one correlated operation and no blind duplicate order; unsupported reconciliation behavior fails closed. Record separately authorized sandbox results where the contract gate requires them.

### T-12 — Implement confirmed label print and reprint
- Status: Planned
- Owner: Engineering owner
- Primary requirement: PR-5
- Constraints: TD-6, API-1, IAM authorization cases, OBS-1, RATE-1, SEC-11
- Dependencies: T-9, T-11
- Done when: Run browser scenario 3 and integration tests proving print/reprint requires an authorized confirmed printable provider mapping, writes audit, and never calls order creation. Verify safe label delivery does not expose provider credentials.

### T-13 — Implement provider-synchronized cancellation
- Status: Blocked — verified cancellation contract required
- Owner: Engineering owner
- Primary requirement: PR-6
- Constraints: Q-1, API-1, UX-1, SEC-7, SEC-11
- Dependencies: T-10, T-11, T-12
- Done when: Execute local-draft and post-submit/printed cancellation tests including replay, timeout, rejected/ineligible and confirmed outcomes. Browser scenario 5 shows pending/unknown until provider confirmation, retains original order/label/payment history, and never equates provider cancellation with a local refund.

### T-21 — Implement payment correction approval and external refund records
- Status: Planned — owner self-correction disabled for MVP
- Owner: Engineering owner
- Primary requirement: PR-7
- Constraints: BILL-3, BILL-4, IAM permission matrix, API-1, UX-1, SEC-11
- Dependencies: T-7, T-8, T-9
- Done when: Execute API/browser cases for staff denial, admin reasoned request, owner approval/rejection, wrong-branch denial, stale version, duplicate decision, and simultaneous approvals. Exactly one append-only correction is recorded; original payment remains. External refund evidence never invokes a payment gateway/provider reversal. Confirm no owner self-correction route exists in MVP and all corrections require a distinct admin request plus owner decision.

## Milestone 2 — Governance and Reconciliation

### T-14 — Implement branch lifecycle and membership administration
- Status: Planned
- Owner: Engineering owner
- Primary requirement: PR-11
- Constraints: Q-6, TEN-1 through TEN-6, IAM-1 and matrix, SEC-1, SEC-10
- Dependencies: T-5, T-6
- Done when: Execute role/scope tests showing platform activation/initial-owner assignment, owner branch-admin management, branch-admin staff management, no staff user-management or self-escalation, and no operational mutation on inactive branches. Verify membership/lifecycle changes audit and revoke stale access.

### T-15 — Implement non-authoritative finance reconciliation
- Status: Planned
- Owner: Engineering owner
- Primary requirement: PR-8
- Constraints: BILL-7, BILL-8, TD-7, DATA-9, UX-1, PRIV-4
- Dependencies: T-10, T-11
- Done when: Run synthetic snapshot tests and browser finance cases for freshness, mismatch, missing mapping, and unavailable provider data. Assert visible Mengantar source-of-truth labels, safe organization aggregates versus explicit branch detail, and no operation capable of changing provider truth.

### T-22 — Implement pickup-only estimated-profit report
- Status: Blocked — finance formula and authoritative pickup mapping approval required
- Owner: Engineering owner
- Primary requirement: PR-9
- Constraints: Q-2, BILL-5, BILL-8, TD-7, DATA-9, UX-1, UI-5
- Dependencies: T-15
- Done when: Execute approved synthetic worked examples covering customer charge, cost, discount/cashback, cancellation, missing inputs, stale/mismatched snapshots, and pickup evidence. Non-picked-up or unverified-input shipments never receive a fabricated amount; calculation inputs/version remain inspectable, values use exact money, and UI labels estimates without granting staff report permission.

### T-16 — Implement platform governance and JIT UI
- Status: Planned
- Owner: Engineering owner
- Primary requirement: PR-10
- Constraints: IAM-1 and matrix, UX-1, UI-1, SEC-10
- Dependencies: T-6, T-14
- Done when: Execute browser scenario 6 and authorization tests proving aggregate-only default governance, approved named-branch reason/duration, denied detail without grant, read-only JIT, visible support state, and expiry enforced during an existing session.

## Milestone 3 — Production Readiness (Not Deployment Authorization)

### T-17 — Implement limits, operational telemetry, and safe alerts
- Status: Planned
- Owner: Engineering owner
- Primary requirement: TD-8
- Constraints: RATE-1, OBS-1 through OBS-3, SEC-8, SEC-12, PRIV-5
- Dependencies: T-11, T-12, T-13
- Done when: Run bounded local/staging simulations for throttling, shared-store enforcement, provider account concurrency, aged unknown outcomes, and reconciliation failure. Verify redacted signals reach the configured test alert destination and record owner/runbook/threshold decisions; do not run a production load test.

### T-18 — Implement privacy and vendor/retention/rights operational controls
- Status: Blocked — qualified policy decisions required
- Owner: Privacy owner
- Primary requirement: PRIV-10
- Constraints: PRIV-6 through PRIV-13, SEC-14, XFER-1
- Dependencies: T-2, T-6, T-7
- Done when: Review approved legal roles, vendor/regions, notice/contact/version, retention/deletion/legal-hold policy, and rights-case process. Execute a synthetic export/deletion/restriction exercise including backup/vendor handling; verify scope, audit, and exception behavior. Publishing notice or sending real requests remains separately approval-gated.

### T-19 — Prepare deployment, backup restore, and rollback evidence
- Status: Blocked — hosting, recovery targets, access and retention decisions required
- Owner: Operations owner
- Primary requirement: SEC-14
- Constraints: SEC-13, PRIV-11, OBS-3
- Dependencies: T-17, T-18
- Done when: In an authorized non-production environment, verify HTTPS/headers/origins, restricted secrets/access, approved recovery targets, encrypted backup restore with synthetic records, and release/rollback/migration compatibility rehearsal. Record executable runbooks and actual results. Production deploy, remote writes, or service changes require explicit separate approval.

### T-20 — Run complete regression and release-readiness review
- Status: Planned — cannot close with unresolved release blockers
- Owner: Engineering owner
- Primary requirement: PR-7
- Constraints: All MVP product, tenant, IAM, billing, security, privacy, UI, API, and observability contracts; PR-12 and deferred lookup are excluded
- Dependencies: T-9, T-10, T-11, T-12, T-13, T-14, T-15, T-16, T-17, T-18, T-19, T-21, T-22
- Done when: Execute the repository quality/test/browser/security/provider-fixture commands and review every prerequisite's evidence. Record target/version and safe report references; no stale or unexecuted check is marked passing. Open provider/legal/operational blockers prevent release-ready status. Passing this review still does not authorize production deployment.

## Deferred Work

Customer pre-fill, QR/reference/phone lookup, next-business-day draft expiry, and WhatsApp require a separately authorized task set under PR-12, Q-5, TEN-4, and the UX/security/privacy contracts. No MVP dependency requires building them.
