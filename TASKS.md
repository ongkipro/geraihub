# GeraiHub Implementation Tasks

> **Execution status: Development authorized; T-1 foundation verification in progress.** This is the sole canonical implementation queue. Source-code authorization does not authorize secrets, provider mutations, production resources, deployment, or release.

## Execution Rules

- Any terminal-capable AI or human may use this queue. No proprietary model, IDE agent, paid design registry, or browser agent is required. Repository scripts, current official documentation, synthetic fixtures, and repeatable browser tests are the handoff.
- Repository source, migrations, tests, and runtime evidence are authoritative. `docs/spec/` is the canonical specification; `~/Documents/work/prd/geraihub/` is a retained, non-authoritative planning snapshot. Read repository instructions and `docs/spec/` before every task.
- Mark a task complete only after executing its Done-when procedure. Planned scenarios are not passing tests. Record actual command, environment, safe output/report reference, and verdict in the repository.
- Each task has one primary requirement; constraints are mandatory. Requirements and task scope must be reviewed/accepted before execution. Do not infer approval from a task appearing here.
- Use non-interactive commands with documented prerequisites. No production data in fixtures, screenshots, logs, or docs. Secret access and provider mutations require separate explicit approval; never print credentials or credential-bearing URLs.
- Never guess Mengantar endpoints, status codes, payloads, retry semantics, or financial formulas. T-10 gates real provider work, not local synthetic state-machine exploration.
- These are planning work packages. Split any package exceeding one reviewable implementation session into subtasks in this same queue before starting; retain its primary and constraints. Do not create a competing queue.
- Execution follows dependencies, not numeric order: T-2 selects and records the stack/deployment profile; only then may an explicitly authorized T-1 initialize and verify the implementation repository workflow. Never treat machine-global tools as project evidence.
- Before starting a work package, record its exact executable command/test path and bounded implementation unit here. Command names are implementation deliverables, not evidence that a script already exists. TEST-2 through TEST-5 in the test strategy define reproducible scenarios for this readiness refinement.
- T-10 capability gates close independently as specified in Technical Design section 7. A completed estimate check never authorizes label, cancellation, finance or activation work. T-20 must review every required capability and business gate even if local synthetic tasks passed.
- A dependency on T-10 is capability-specific: a bounded non-COD adapter unit may start after its estimate/submit/status/account evidence passes even while unrelated COD/finance units remain blocked. Record the exact prerequisite units and evidence in the task before execution; do not mark all of T-10 or the dependent task complete from that partial result. T-20 still requires every capability in the accepted MVP scope or an explicit Product scope change.
- Execute each bounded unit as a closed review loop: inspect the owning contract and current code; state the acceptance and failure cases; implement; run focused unit/DB/contract checks; exercise the affected browser path when visible; review the diff for tenant, money, privacy, accessibility, and unnecessary complexity; fix findings; rerun affected checks; then record the observed verdict. A failed check or unresolved high-impact finding keeps the unit open. Review after a fix must cover the changed behavior and nearby regressions, not only the original happy path.
- For browser-visible work, review the rendered desktop/tablet flow and narrow-screen recovery against UX sections 9–10 and the design-system contract. A screenshot alone is not a pass: exercise controls, keyboard navigation, denied/pending/error states, and safe return paths. A changed action must retain or update its route/handler/guard/test mapping.
- A later change that invalidates a completed task's evidence reopens that task or creates a scoped correction unit here, then reruns its dependent checks before T-20. T-20 is the final cross-domain regression and release-readiness review, not a substitute for task-local QA. Record findings and closure evidence with the affected task rather than starting a second backlog.
- Use relevant maintained dotfiles skills/checks for architecture, provider, security, UX, testing, and review when they improve the work; verify their current instructions before use. They are working aids, not a project runtime dependency or proof of behavior. Persist the actual app commands, fixtures, test paths, and safe results in this repository so a developer without those dotfiles can reproduce them.
- UX layout and interaction exploration may start against synthetic local fixtures while foundation/domain work proceeds, provided no invented provider capability is presented as fact. T-9 closes only when its T-8 guards and browser acceptance actually pass.

## Milestone 0 — Project and Contract Foundation

### T-1 — Initialize the implementation workflow reproducibly
- Status: In progress — local foundation checks passed; committed clean-checkout proof pending
- Owner: Engineering owner
- Primary requirement: TD-9
- Constraints: SEC-8, SEC-15, PRIV-13
- Dependencies: T-2, T-23
- Current evidence: Uncommitted `feat/development-foundation` worktree at base `fc9aed0` has pinned Node 24/pnpm 11.22.0, Next.js 16.3.6, React 19.3.0, PostgreSQL 17 local probe, Drizzle 0.45.3/Kit 0.31.11, and Better Auth 1.7.5. The web/worker source, lockfile, reviewed probe SQL, seed, and two foundation tests exist. This is not yet a committed clean checkout or CI result.
- Done when: After explicit development authorization, initialize the accepted profile and, from a clean checkout in an approved local environment, execute documented install, lint/typecheck, tests, startup, migration, and synthetic seed commands. Record prerequisites and results without proprietary AI tools or live provider writes.
- Scope boundary: Verify migration/seed tooling with a disposable minimal schema. T-3 and T-7 own business tables; bootstrap tooling must not duplicate their implementation.
- Source-layout acceptance: Replace the proposal in `docs/spec/20-REPOSITORY-STRUCTURE.md` with observed web/worker/module/DB/test paths and enforce the applicable import boundaries. Apply `docs/spec/19-ENGINEERING-STANDARDS.md` while proving the commands above; neither planning document is runtime evidence.
- Execution unit (authorized 2026-09-24): Pin the accepted runtime and build a minimal web/worker/PostgreSQL migration probe, without business tables or provider access. Run `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:seed`, `pnpm dev`, and `pnpm worker` against a disposable local PostgreSQL instance. Record observed results below before changing status.
- Local result (2026-09-24, Node 24.18.0, pnpm 11.22.0, PostgreSQL 17 Alpine, synthetic data): From an isolated source export without `node_modules`, build output, or generated Next types, frozen install PASS; migration generation found no drift; migration and synthetic seed PASS against a new disposable database; lint and typecheck PASS; 2/2 Node tests PASS; Next production build PASS; production web startup returned HTTP 200; worker startup reported ready with provider dispatch disabled. The existing worktree's development web startup also returned HTTP 200, and Chromium displayed the foundation route at desktop and narrow widths. A negative ESLint probe rejected a worker import of `src/app/`. No auth, branch isolation, shipping, provider, print, or production behavior is proved by these checks. Final T-1 closure awaits the same commands from an actual committed clean checkout.

### T-2 — Select and record the runtime and deployment profile
- Status: Complete — planning baseline accepted in ADR-001; exact package/runtime proof remains T-1
- Owner: Engineering owner
- Primary requirement: TD-9
- Constraints: TD-2, SEC-2, SEC-4, SEC-14, PRIV-11
- Dependencies: None
- Current evidence: ADR-001 accepts Node.js 24 LTS major, pnpm, Next.js App Router, PostgreSQL, Drizzle, Better Auth, and separate web/worker processes from one modular-monolith codebase. ADR-002 through ADR-005 fix tenant enforcement, outbox/reconciliation, exact money/concurrency, and session/active-branch policy. Current official stack documentation was rechecked on 2026-09-23; the later installed-package and lockfile evidence is recorded under T-1.
- Done when: Review compatible web runtime, auth adapter, PostgreSQL/Drizzle, worker/outbox execution, deployment, and secret/backup boundaries against current official documentation. Record one accepted profile with reasons and unresolved production gates; T-1 then initializes and verifies actual locked package versions and API compatibility. Do not create source code, remote resources, or credentials as part of this selection task.

### T-23 — Enable and verify canonical branch protection
- Status: Complete — GitHub branch protection verified on 2026-09-23
- Owner: Repository owner
- Primary requirement: TD-9
- Constraints: SEC-15
- Dependencies: None
- Current evidence: GitHub branch protection API reports `main` protected with required PRs, strict `validate` check from GitHub Actions, conversation resolution, admin enforcement, and force push/deletion disabled. The latest baseline `validate` check passed on `fe5742f`. There is one repository maintainer, so required independent approvals remain zero until another maintainer is appointed.
- Done when: GitHub branch/ruleset evidence shows pull-request-only changes to `main`, required `Specification Validation / validate` status, blocked force pushes/deletion, and required conversation resolution. Require at least one independent approval when more than one maintainer is available. Record the observed ruleset/protection result without exposing credentials.

### T-3 — Build organization, branch, identity, invitation, and membership persistence
- Status: Planned
- Owner: Engineering owner
- Primary requirement: PR-11
- Constraints: DATA-1 through DATA-4, TEN-1 through TEN-3, IAM-1, SEC-1, SEC-3
- Dependencies: T-1
- Done when: Apply local migrations and execute synthetic integration tests for organization/branch ownership, unique provider-subject links, one-time/expired/revoked invitation acceptance, concurrent acceptance, permitted multi-branch memberships, and duplicate active-grant rejection. Record resulting schema/constraint evidence.
- Implementation units (execute sequentially): organization/branch keys and lifecycle; auth-adapter/user identity and server context; invitation/membership/platform-grant constraints and permanent bootstrap marker. Each unit requires reviewed SQL and its own migration/negative-test command before execution. Shipment/quote/invoice/provider tables belong to T-7.

### T-4 — Implement Google OAuth and GeraiHub provisioning
- Status: Planned — identity/recovery/session policy accepted; runtime implementation pending
- Owner: Engineering owner
- Primary requirement: PR-11
- Constraints: IAM-1, IAM section 2 and authorization cases, SEC-2 through SEC-4
- Dependencies: T-3
- Done when: Execute synthetic auth tests proving invalid callback/origin/state/PKCE denial, uninvited Google identity denial, subject mismatch refusal, and approved invitation granting only its stored scope/role. Inspect persistence to prove Google API access/refresh tokens are not retained. Real Google client setup/credential use requires separate approval.
- Additional acceptance: Execute TEST-3 bootstrap cases from an empty synthetic database, including concurrent bootstrap, expired/replaced invitation, completed-bootstrap replay and no public bootstrap endpoint. Implement the controlled operator procedure and approval/audit record; no real administrator is provisioned by this task.
- Recovery acceptance: Execute UX browser scenario 11 for role-aware landing, sign-out, expiry and no mutation replay. TEST-3 must prove branch-admin recovery cannot relink global identity or affect another branch; the controlled global procedure records approval and revokes affected sessions.

### T-5 — Implement active-branch context and action authorization
- Status: Planned
- Owner: Engineering owner
- Primary requirement: PR-1
- Constraints: TEN-1 through TEN-6, IAM-1 and permission matrix, SEC-1, SEC-6
- Dependencies: T-3, T-4
- Done when: Execute two-branch same-role integration tests against routes/actions, queries, caches, stale tabs/context, and mismatched background jobs. Assert no cross-branch disclosure or mutation, no implicit owner counter permission, and authorized switching invalidates old branch state.
- Additional acceptance: Execute TEST-4, including stale context on resource-less draft creation, suspended-history reads, revoked-reader denial, and mutation/print/export denial from read-only context.

### T-6 — Implement audit, JIT support, revocation, and redaction
- Status: Planned — JIT approval policy accepted; runtime implementation pending
- Owner: Engineering owner
- Primary requirement: PR-7
- Constraints: PR-10, IAM-1, OBS-1, SEC-4, SEC-8, SEC-10, PRIV-8
- Dependencies: T-4, T-5
- Done when: Execute tests for sensitive-action auditing, next-protected-request membership revocation, JIT expiry/revocation, super-admin detail default denial, and read-only diagnostic support. Inspect synthetic log/audit output for absence of secrets, sessions, full PII, and raw provider payloads.
- Implementation units (execute sequentially): append-only audit/redaction; authoritative revocation; JIT request/approval/activation/expiry. Give each unit a runnable integration target before coding; JIT acceptance retains a distinct approver and fresh-session check.

## Milestone 1 — Safe Counter Workflow

### T-7 — Implement shipment, quote, invoice, provider-sync, cancellation, and audit persistence
- Status: Planned
- Owner: Engineering owner
- Primary requirement: PR-1
- Constraints: DATA-5 through DATA-10, BILL-2 through BILL-4, SEC-5, SEC-11
- Dependencies: T-5, T-6
- Done when: Apply local migrations and run transaction tests proving immutable branch ownership, branch-scoped pickup/contact selection, frozen sender/recipient/pickup/item snapshots, constrained non-COD/COD mode and shipping-allocation snapshots, exact goods/shipping/requested-COD totals, versioned quotes, unique immutable invoice issuance/reprint, concurrency guards, and retained original document history after cancellation. Review generated SQL before acceptance; no gerai-customer-payment state or table is created.
- Implementation units (execute sequentially): branch pickup/contact and shipment/item ownership; quote/version and immutable submit snapshots; invoice snapshot/reference constraints; provider operation/mapping/cancellation persistence. Each unit runs reviewed migration and concurrent-transaction tests.
- Boundary acceptance: Pin account mapping/version to quotes/operations/order mappings; test account replacement cannot retarget history. Persist invoice business-content/template snapshots. Exercise lossless integer-string money/version round trips and input/product/sum/rational-numerator overflow rejection from the API and test-strategy contracts.

### T-8 — Implement physical verification, quote, and submission guards
- Status: Planned — manual customer payment is outside GeraiHub
- Owner: Engineering owner
- Primary requirement: PR-2
- Constraints: PR-3, BILL-1 through BILL-4, BILL-9, UX-1, SEC-5, SEC-11
- Dependencies: T-7
- Done when: Execute transition tests rejecting missing/inactive pickup point, absent sender/recipient, empty/invalid item rows, incomplete physical verification, stale/unconfirmed quote, duplicate submit, unsupported COD mode, unconfirmed sender-at-gerai allocation when product COD excludes shipping, and invoice issuance before provider confirmation. Non-COD defaults to zero requested courier collection; COD ongkir requests shipping only; COD produk requests goods plus explicitly included shipping; excluded shipping stays sender-at-gerai manual. Changing origin, contact snapshot, items, mode/inclusion or measurements invalidates quote confirmation when provider-relevant. Exact goods/shipping/COD amounts remain separate; COD fee estimate is exactly `COD amount * 333 / 10000` before unverified rounding, while non-COD has no fee. No gerai payment-method, receipt, or paid-status input/guard exists.
- Additional acceptance: Execute TEST-2 for quote refresh, local cancellation before provider dispatch, and provider-unknown denial under BILL-9. Manual payment never changes shipment state.

### T-9 — Build counter flow and branch queue/detail UI
- Status: Planned
- Owner: Engineering owner
- Primary requirement: PR-3
- Constraints: NFR-2, UX-1, UI-1 through UI-6, PRIV-8
- Dependencies: T-8
- Done when: Execute TEST-1 and UX browser scenarios 1, 2, 5, 9, and 10 with synthetic provider fixtures. Verify pickup review, existing/new sender and recipient paths, wrong-branch contact denial, item rows, non-COD default, eligible COD choices, 3.33% fee estimate with base and unverified-rounding label, and separate exact goods/COD/shipping totals. Record desktop/tablet and narrow-screen recovery evidence, keyboard completion, branch context, pending/error/denied recovery, exact quote display, and no PII in URL/console/errors. UI fixtures are not live provider validation.
- Additional acceptance: Display the provider-unknown/document-unavailable state and suspended-history mode from TEST-2/TEST-4. Use synthetic domain-adapter fixtures before T-10; never present invented provider response fields as verified wire contracts.
- Screen/action coverage: Map actual routes for S-01 through S-05 and bind A-01 through A-11 where owned by this and prerequisite tasks. A repository-owned check must catch visible controls without a registered handler or safe destination; browser tests cover enabled, denied, pending, failure, and stale-context paths.
- Recovery coverage: Exercise A-19 and the counter entry to A-20 through browser scenarios 11/12; directory writes remain admin-only. Expand every action family into concrete control/test subkeys before accepting coverage.

### T-10 — Verify current Mengantar contracts with sanitized evidence
- Status: Blocked — public documentation reviewed; separately authorized account/sandbox evidence still required
- Owner: Engineering owner
- Primary requirement: TD-4
- Constraints: Q-1, Q-2, Q-6, BILL-5 through BILL-8, SEC-7, SEC-9
- Dependencies: T-2
- Done when: Complete the contract evidence table in Technical Design section 7 with actual sources, environment/account scope, observation dates, sanitized schemas/results, and unresolved fields, including pickup-origin, sender/recipient, item/declared-value, COD field mapping, actual COD fee rate/base/rounding and payer/add-or-deduct treatment. Start only with an explicitly authorized sandbox non-COD estimate. Order/cancel/label mutation tests require separate scoped authorization and a provider-supported sandbox path; no production order may be created for validation. Unknown required capabilities keep dependent tasks blocked; documentation or synthetic fixtures alone cannot close runtime-proof gates.
- Capability units: non-COD estimate/submit; COD ongkir and COD produk per-service eligibility, 3.33% policy versus actual fee/base/rounding, request/response mapping, excluded-shipping sender-at-gerai treatment, and collection/remittance semantics; submit/retry/order status (including any existing provider order without a resi); label; cancellation; branch pickup-point/origin fields and eligibility; provider pickup status; account mapping; finance reads. Record PASS/BLOCKED and evidence per unit. One verified non-COD capability does not enable COD. Finance must cover the fields/units/freshness/correlation in TEST-5; no synthetic fixture closes external evidence.
- Documentation unit (2026-09-24): Read-only retrieval with `curl -fsSL https://api-public.mengantar.com/docs/` succeeded; Technical Design section 7 records the documented estimate/order/read/label/cancellation/finance surfaces and unresolved GeraiHub-specific semantics. A GeraiCUAN `.env.local` file was detected by filename only; its contents and all credentials were left unopened. No sandbox estimate, order, label, cancellation, finance read, or account entitlement was tested. All capability units remain BLOCKED pending separately authorized, sanitized account/sandbox evidence.

### T-11 — Implement provider estimate, dispatch, idempotency, and reconciliation
- Status: Blocked — T-10 provider contract gate
- Owner: Engineering owner
- Primary requirement: PR-4
- Constraints: TD-3 through TD-5, API-1, OBS-2, RATE-1, SEC-7, SEC-9
- Dependencies: T-7, T-8, T-10
- Done when: Execute adapter/worker integration tests for replay, process crash before/after dispatch, timeout, duplicated/out-of-order response, insufficient-balance outcome if verified, bounded retry, and account-scoped concurrency. Assert one correlated operation and no blind duplicate order; unsupported reconciliation behavior fails closed. Record separately authorized sandbox results where the contract gate requires them.
- Implementation units (execute sequentially): verified estimate adapter; transactional dispatch/claim; outcome normalization and reconciliation/crash recovery. Execute one bounded adapter/DB test target per unit. TEST-2/TEST-4 cover quote recovery and suspension races; a provider order without tracking must never be classified as no order without verified evidence.
- Dispatch acceptance: Delay queued work beyond quote expiry, race worker claim/closure and configuration changes, and crash after the durable dispatch-start marker. Only provably never-dispatched stale work returns to review; all possible dispatch reconciles. Account replacement never changes an old operation's dispatch/status/cancel account.

### T-12 — Implement confirmed label print and reprint
- Status: Planned
- Owner: Engineering owner
- Primary requirement: PR-5
- Constraints: TD-6, API-1, IAM authorization cases, OBS-1, RATE-1, SEC-11
- Dependencies: T-9, T-11, T-21
- Done when: Run browser scenarios 1, 3, and 4 plus integration tests proving `Cetak resi + invoice` prepares the unmodified confirmed printable provider label and one immutable invoice from a single authorized action. Verify print/reprint audit, separate document reprints, no duplicate order/invoice after browser/printer failure, safe label delivery without provider credentials, and no false physical-print success claim. Test A4 and 80 mm invoice output and the actual provider-label media with synthetic documents; use two ordered print steps when a combined job would crop or rescale the provider label.
- Screen/action coverage: Map S-06 and A-12/A-13 to actual controls, guards, and browser evidence.

### T-13 — Implement provider-synchronized cancellation
- Status: Blocked — verified cancellation contract required
- Owner: Engineering owner
- Primary requirement: PR-6
- Constraints: Q-1, API-1, UX-1, SEC-7, SEC-11
- Dependencies: T-10, T-11, T-12
- Done when: Execute local-draft and post-submit/print-requested cancellation tests including replay, timeout, rejected/ineligible and confirmed outcomes. Browser scenario 6 shows pending/unknown until provider confirmation and retains original order/label/invoice history; it never claims a manual customer refund.
- Additional acceptance: TEST-2 proves local cancellation only before any possible provider order and refusal during queued/in-flight/unknown dispatch. The local cancellation guard is owned by T-8; this task integrates verified provider cancellation.

### T-21 — Implement invoice issuance and reprint
- Status: Planned — invoice replacement after issuance remains a Finance/Product gate
- Owner: Engineering owner
- Primary requirement: PR-3
- Constraints: PR-7, BILL-1 through BILL-4, BILL-9, IAM permission matrix, API-1, UX-1, SEC-11
- Dependencies: T-7, T-9, T-11
- Done when: Execute API/browser and concurrent issuance cases proving a confirmed provider resi and submit-time quote create at most one immutable branch-scoped invoice reference per shipment; replay, counter print-pack preparation, and reprint return the same document without order creation. Wrong-branch, unconfirmed/unknown provider, mismatched submit-time quote, cancelled shipment without an invoice, and unprivileged issuance deny. Later quote expiry does not change the charge. Verify invoice number, branch, issue time, resi, charge description, exact IDR total, and approved customer summary; no payment method or paid status appears.
- Additional acceptance: TEST-2 checks invoice unavailability while provider outcome is unknown, issuance after pickup, and existing-invoice reprint after cancellation; post-issue replacement stays blocked until the Finance/Product policy in BILL-4 is approved.
- Snapshot acceptance: Change branch identity/timezone, contact data and the current rendering template after issue; original invoice content and rendering version remain reproducible and unchanged on reprint, with cancellation context separate.

## Milestone 2 — Governance and Reconciliation

### T-14 — Implement branch lifecycle and membership administration
- Status: Planned
- Owner: Engineering owner
- Primary requirement: PR-11
- Constraints: Q-6, TEN-1 through TEN-6, IAM-1 and matrix, SEC-1, SEC-10
- Dependencies: T-5, T-6, T-7
- Done when: Execute role/scope tests showing platform activation/initial-owner assignment, owner branch-admin management, branch-admin staff management, no staff user-management or self-escalation, and no operational mutation on inactive branches. Verify membership/lifecycle changes audit and revoke stale access.
- Additional acceptance: Execute TEST-3 role-provisioning and TEST-4 lifecycle cases, including owner-managed branch finance viewers and last-administrator removal denial. Local draft-branch tests do not close GATE-BRANCH-PROVIDER-MAPPING; real activation needs verified account/readiness evidence.
- Screen/action coverage: Map S-08 and A-16/A-17 to actual controls and denial/recovery tests.
- Configuration acceptance: Implement only the IAM settings allowlist; test owner reactivation denial, platform readiness approval, admin-only contact updates, stale-edit conflict and unchanged historical snapshots through browser scenario 12. A-20 is covered with T-9's counter entry.

### T-15 — Implement non-authoritative finance reconciliation
- Status: Blocked — GATE-MENGANTAR-FINANCE evidence required for the real adapter
- Owner: Engineering owner
- Primary requirement: PR-8
- Constraints: BILL-7, BILL-8, TD-7, DATA-9, UX-1, PRIV-4
- Dependencies: T-10, T-11
- Done when: Run synthetic snapshot tests and browser finance cases for freshness, mismatch, missing mapping, and unavailable provider data. Assert visible Mengantar source-of-truth labels, safe organization aggregates versus explicit branch detail, and no operation capable of changing provider truth.
- Additional acceptance: Execute TEST-5 and record T-10 finance-read evidence. Missing/unsupported fields remain unavailable rather than zero; source, account/shipment mapping, units, timestamps, pagination and revisions must be verified before adapter implementation.

### T-22 — Implement pickup-only estimated-profit report
- Status: Blocked — finance formula and authoritative pickup mapping approval required
- Owner: Engineering owner
- Primary requirement: PR-9
- Constraints: Q-2, BILL-5, BILL-8, TD-7, DATA-9, UX-1, UI-5
- Dependencies: T-15
- Done when: Execute approved synthetic worked examples for non-COD, COD ongkir, and COD produk with/without shipping, covering shipping charge, product principal exclusion, 3.33% policy estimate versus verified provider cost/actual fee, discount/cashback, cancellation, missing inputs, stale/mismatched snapshots, and pickup evidence. Non-picked-up or unverified-input shipments never receive a fabricated amount; calculation inputs/version remain inspectable, values use exact money, and UI labels estimates without granting staff report permission.

### T-16 — Implement platform governance and JIT UI
- Status: Planned
- Owner: Engineering owner
- Primary requirement: PR-10
- Constraints: IAM-1 and matrix, UX-1, UI-1, SEC-10
- Dependencies: T-6, T-14
- Done when: Execute browser scenario 7 and authorization tests proving aggregate-only default governance, approved named-branch reason/duration, denied detail without grant, read-only JIT, visible support state, and expiry enforced during an existing session.
- Screen/action coverage: Map S-09/A-18 to actual controls and denial/recovery tests.
- JIT acceptance: Complete A-21 and browser scenario 13 for requester/approver-specific views, request/rejection, fresh-session activation, fixed expiry and explicit exit. A support-only login never inherits governance permissions.

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
- Primary requirement: TD-10
- Constraints: PRIV-6 through PRIV-13, SEC-14, XFER-1
- Dependencies: T-2, T-6, T-7
- Done when: Review approved legal roles, vendor/regions, notice/contact/version, retention/deletion/legal-hold policy, and rights-case process. Execute a synthetic export/deletion/restriction exercise including backup/vendor handling; verify scope, audit, and exception behavior. Publishing notice or sending real requests remains separately approval-gated.

### T-19 — Prepare deployment, backup restore, and rollback evidence
- Status: Blocked — hosting, recovery targets, access and retention decisions required
- Owner: Operations owner
- Primary requirement: TD-11
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
- Additional acceptance: Review TEST-2 through TEST-5, invoice replacement policy if enabled, and real platform provisioning/recovery evidence. Document-level validator PASS is never application or provider evidence.
- Screen/action coverage: Reconcile S-01 through S-09 and A-01 through A-21, including all concrete control subkeys, against actual routes, rendered controls, handlers, guards, and executable interaction/denial evidence. A visible dead menu/button or untested critical path prevents completion. Do not equate click telemetry with functional verification.

## Deferred Work

Customer pre-fill, QR/reference/phone lookup, next-business-day draft expiry, and WhatsApp require a separately authorized task set under PR-12, Q-5, TEN-4, and the UX/security/privacy contracts. No MVP dependency requires building them.
