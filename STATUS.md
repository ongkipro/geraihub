# GeraiHub Status

Updated: 2026-09-24

## Current phase

**Development authorized; T-1 foundation verified from committed clean checkout; T-3 persistence locally verified. T-4 OAuth and provisioning is next.**

Current state is recorded here; older audit sections below are historical evidence from the documentation phase. Source-code authorization does not authorize credentials, Mengantar mutations, production resources, or deployment.

## Verified repository state

- Canonical branch: `main`.
- Active implementation worktree: `feat/development-foundation`, with foundation commit `402b441`. A detached, initially clean checkout of that commit passed frozen install, migration generation/drift check, local PostgreSQL 17 migration/seed, 2 foundation tests, lint, typecheck, build, production web HTTP 200, and worker startup on 2026-09-24. This proves the local foundation only; hosted CI for this commit remains unobserved.
- Product, architecture, tenant/IAM, state/concurrency, API, UI, billing, security, privacy baseline, testing, operations, observability, and error contracts are present.
- The documentation pack now includes canonical glossary, requirement traceability, open decision/evidence gates, and a developer/AI handoff contract.
- T-2 planning runtime baseline is accepted: Node.js 24 LTS major, pnpm, Next.js App Router, PostgreSQL, Drizzle, Better Auth, modular monolith, separate web/worker processes.
- ADR-005 fixes database-backed session and server-owned active-branch context semantics.
- The accepted MVP payment boundary is manual collection by the gerai outside GeraiHub. The application issues at most one immutable charge invoice per confirmed Mengantar shipment and makes the confirmed resi available; it records no customer payment method, receipt, or paid state. The QR code draft reference remains post-MVP.
- The counter handoff is one `Cetak resi + invoice` action. Invoice layout targets A4 and 80 mm media; the Mengantar label retains its provider format. One-job versus ordered two-step printing depends on actual printer/media verification in T-12/T-21. A browser print request is not proof of physical output.
- The MVP shipment-entry contract now covers the active gerai pickup point, branch-local existing/new sender and recipient, item rows with exact declared-goods total, separate COD and customer shipping charge, final review, provider submission, and counter printing. Provider origin/contents field mapping remains T-10 evidence rather than an assumed Mengantar API contract.
- Counter mode now defaults to non-COD. COD ongkir and COD produk (with optional shipping in the courier collection) have separate amount/review rules and remain disabled until per-service Mengantar capability and fee/remittance mapping are verified. When product COD excludes shipping, the current product assumption assigns shipping to the sender's manual gerai process; no paid status is recorded. Product COD principal is excluded from the shipping-profit calculation.
- A new product input sets the GeraiHub COD fee estimate to 3.33% of intended COD amount for both COD modes, zero for non-COD. Whole-rupiah rounding, payer, add-versus-deduct treatment, actual Mengantar tariff and remittance fields remain GATE-COD-FEE; no final fee or payout is claimed.
- The repository-owned validator is `python3 scripts/check-repository.py .`.
- GitHub Actions Specification Validation has produced a successful run on the hardened main baseline. T-23 branch protection is enabled and verified: PR, strict `validate` check, conversation resolution, admin enforcement, and no force push/deletion.
- Exact foundation versions are pinned in `package.json`/`pnpm-lock.yaml` and tested locally; the installed Better Auth/Drizzle adapter now writes/reads the reviewed identity schema. OAuth callback/session policy and tenant authorization remain T-4/T-5 evidence.
- The extended `validate` workflow now declares an ephemeral PostgreSQL 17 service and runs locked install, migration generation/drift check, synthetic migration/seed, lint, typecheck, tests, and build. Locally, `actionlint`, repository validation (37 required files, 41 Markdown files), 18 validator regressions, peer-dependency check, and `git diff --check` passed on 2026-09-24. The updated workflow has not yet run on hosted GitHub Actions.
- T-3's organization/branch, Better Auth identity/context, invitation, membership, platform-grant, and bootstrap-marker persistence is implemented. Three additive migrations passed from an empty disposable PostgreSQL 17 database; 8/8 integration tests, lint, typecheck, build, peer check, repository validator, and schema generation without drift passed locally on 2026-09-24. Invitation acceptance is atomic and requires a previously verified Google subject; no runtime Google callback, public auth route, branch authorization, or real bootstrap is implemented yet.

## Documentation handoff entry points

- `docs/spec/HANDOFF.md` — reading order and execution protocol.
- `docs/spec/GLOSSARY.md` — canonical language.
- `docs/spec/TRACEABILITY.md` — requirement/spec/task/evidence map.
- `docs/spec/DECISION-GATES.md` — open facts/approvals that must not be guessed.

These files are navigation/control layers. The owning product/specification documents and actual runtime/provider evidence remain authoritative.

## Open gates that must not be fabricated

1. **T-4 authentication and provisioning:** T-3 persistence is locally complete, but real Google callbacks, token stripping before storage, invitation-bound session creation, controlled bootstrap, and browser recovery must be implemented and tested.
2. **T-10 Mengantar contract evidence:** estimate/order/idempotency/status/label/cancellation/pickup/account behavior requires current documented and authorized sanitized evidence.
3. **Finance:** invoice replacement policy, final estimated-profit formula inputs, and authoritative pickup/provider mapping require approval/evidence.
4. **Privacy/legal:** legal entity/roles, retention, notice, rights, vendors/regions/transfers remain production gates.
5. **Operations:** production hosting vendor, recovery targets, backup restore, telemetry/alerts, rollback and incident ownership remain T-17 through T-20 evidence.
6. **Invoice replacement:** BILL-9 defines quote refresh and provider-unknown holds. Post-issue invoice replacement needs Finance/Product's worked policy before enabling it or closing T-20 if included.
7. **Finance read integration:** T-10 must verify available finance-read fields, account/shipment mapping, units, pagination and freshness before the real T-15/T-22 adapters.
8. **Platform identities:** IAM section 3 defines controlled bootstrap and all role-provisioning authorities. Actual administrator identity, approval and recovery procedures remain operational evidence before real provisioning.

The detailed gate register is `docs/spec/DECISION-GATES.md`.

## Pre-development task audit — historical, 2026-09-24

All 23 work packages were reviewed against their owner, primary requirement, dependency, completion evidence and open gate. This is a planning audit, not completion of the planned implementation. T-2 and T-23 are complete on their recorded evidence. T-1 is ready to start only after explicit development authorization; application code, lockfile and runtime checks do not exist yet.

The individual task owner, dependency, executable completion condition, and unresolved gate remain in `TASKS.md`. The work-package categories cover foundation and identity (T-1 through T-6), counter/data/provider/documents (T-7 through T-13 and T-21), governance/finance (T-14 through T-16 and T-22), and operational/release evidence (T-17 through T-20). The subsequent full semantic review found missing guards and acceptance detail within those packages and refined them below. Provider capability, finance policy, privacy, and operations gates remain open as described above.

The UX specification now owns a 9-screen/21-action-family development map, including safe navigation, guards, failure states and test ownership. Architecture section 6 maps logical modules to screens/tasks. The design-system document records a restrained counter-first visual baseline inspired by Apple's clarity, subject to rendered contrast/density review. A proposed action ID is a future test/coverage key, not click telemetry or a claim that a control works. Development may begin at T-1 after authorization; full A–Z delivery and release readiness remain contingent on the listed provider, finance, privacy and operations evidence.

## Next dependency sequence

```text
documentation baseline complete
        ↓
T-23 repository protection verified
        ↓
explicit development authorization
        ↓
T-1 bootstrap exact runtime/packages/lockfile
        ↓
T-3 persistence → T-4 auth → T-5 branch authorization → T-6 audit/JIT
        ↓
T-7/T-8 safe shipment/quote/invoice domain
        ↓
T-10 verified Mengantar contracts
        ↓
provider integration + UI + reconciliation
        ↓
production-readiness gates
```

Repository/runtime evidence overrides this status file if they later conflict.

## Whole-document semantic review — 2026-09-24

Scope: all 37 Markdown files, the repository validator/regression suite and CI workflow in the existing uncommitted working tree. Review covered product-to-task traceability, ADR consistency, domain/state/API/data rules, every documented role and screen family, privacy/security boundaries, recovery and release criteria. Two separate read-only domain and UX/access reviews were integrated and their findings rechecked after correction. No application, provider, remote branch-rule, legal-source or production verification was performed.

| Finding corrected | Canonical correction and required implementation proof |
|---|---|
| Owner reactivation and global identity recovery could exceed role authority | IAM/Tenant now require platform reactivation approval and controlled global identity recovery; branch admins only manage their own membership scope. TEST-3/4 and T-4/T-14 prove denial cases. |
| Quote could expire while queued without a safe local recovery path | State/API require an atomic never-dispatched closure before requote; a durable dispatch marker or uncertainty keeps reconciliation mandatory. TEST-2/T-11 cover delayed queue, worker races and crash. |
| Account replacement could retarget an old provider operation | Data/API pin quote, operation and confirmed mapping to a non-secret account/configuration identity; credential rotation is same-account only. T-7/T-11 prove preservation. |
| BIGINT money could lose precision at the browser boundary | API specifies exact integer strings and rational estimate input fields; T-7/T-8 test large-number round trips and overflow. No invented COD rounding is introduced. |
| Invoice reprint could change after branch/contact/template edits | Data/Billing require frozen document content and reproducible rendering version/artifact; T-21 tests original reprints after changes. |
| Platform login, sign-out, full JIT lifecycle and directory correction were incompletely mapped | UX now maps A-19 through A-21 and scenarios 11–13; IAM settings allowlist includes draft-origin setup before activation. Each action family expands into concrete tested controls. |
| Partial draft, source fixture and task prerequisite semantics were ambiguous | Incomplete drafts can be saved but not quoted/submitted; domain fixtures are distinct from verified provider fixtures; T-14 depends on T-7 and T-10 is consumed per verified capability. |

The main shipment and exception flow is diagrammed in Technical Design section 3; no extra architecture or task document was needed. The parser now also detects missing/duplicate screen/action references, missing task ownership and incomplete map rows. Its checks still cannot prove semantic completeness or application behavior. The Mermaid source was reviewed for consistency; no renderer is installed, so rendered-diagram validation is not claimed.

Local verification on this uncommitted documentation target: repository validator PASS (37 required files, 37 Markdown files), validator regression suite PASS (16 cases), optional dotfiles suite audit PASS (166 declarations, 23 tasks, zero findings), `actionlint` PASS, and `git diff --check` PASS. A separate local assertion confirmed 9 unique ordered screen IDs, 21 unique ordered action families and the exact integer numerators for the COD examples. These are specification/tooling results only. Remaining pre-implementation work is task-local command/path and concrete control mapping as source is created; current provider contracts, final COD treatment, finance formula, privacy and production decisions remain the named gates above.

## Pre-development review evidence — 2026-09-23

Base revision: `fe5742f`. Target: the consolidated, uncommitted documentation refinement in the canonical `/home/ongki/Projects/geraihub` working tree, local synthetic/document-only environment. These results apply to this working tree, not a claim that a new commit or GitHub CI run exists.

- `python3 scripts/check-repository.py .`: PASS, 37 required files and 37 Markdown files.
- `python3 scripts/test-check-repository.py`: PASS, 12 regression cases including invalid references, missing/blank owner or completion metadata, malformed dependencies, duplicate declarations, cycles, missing handoff and undeclared ADR.
- `actionlint .github/workflows/spec-validation.yml` and `git diff --check`: PASS. The added CI test command was executed locally; no hosted run of this uncommitted change is claimed.
- Additional independent local check using the dotfiles `development-spec-suite` script: `python3 /data/ai/codex/skills/development-spec-suite/scripts/check-traceability.py . --stage ready`: PASS, 37 files, 166 declarations, 23 tasks, 0 findings. This optional audit source is not a repository/CI dependency.
- After the manual-payment and invoice lifecycle alignment, the same local checks were rerun and passed. The semantic review aligned submit-time quote snapshots, invoice issuance after pickup, and historical reprint after cancellation across billing, state, API, IAM, UX, tests, errors, and tasks. No application behavior was exercised.
- After the counter-print specification update, the repository validator, its 12 regression tests, suite traceability audit, `actionlint`, and `git diff --check` passed again locally. The document contract now covers a single `Cetak resi + invoice` entry point, A4/80 mm invoice output, provider-label media preservation, printer-failure recovery, and a print-request state that does not assert physical output. Real printer and provider-label behavior remain T-12 evidence.
- The subsequent shipment-entry review added approved branch pickup points, same-gerai existing/new sender and recipient paths, item rows with exact declared-goods total, separate shipping charge/COD, final review, and snapshot/quote-invalidating rules across PRD, data, API, IAM, privacy, UX, tasks, and tests. The same local structural, regression, traceability, workflow-lint and diff checks passed; provider field mapping and runtime behavior remain unverified.
- The COD-mode refinement was checked locally with the repository validator, 12 validator regressions, suite traceability audit, `actionlint`, and `git diff --check`. These are document checks only; per-courier COD capability and collection semantics have not been observed.
- The 3.33% COD-fee policy was then aligned across PRD, billing, data, API, UX, glossary, provider gates, tasks, and tests; local checks were rerun after the change. This is synthetic/document evidence, not an observation of Mengantar's actual fee or rounding.
- The 2026-09-24 screen/action, module and visual-baseline refinement passed `python3 scripts/check-repository.py .` (37 files), `python3 scripts/test-check-repository.py` (12 cases), the optional suite traceability check (166 declarations, 23 tasks, zero findings), `actionlint`, and `git diff --check`. This validates documentation structure and references only; no application route, button, print job, or provider behavior was executed.
- The subsequent task-lifecycle review made task-local analysis, diff/UX review, finding closure, affected retest, stale-evidence reopening, and final T-20 regression explicit in the canonical queue and test strategy. The same five local document/workflow/diff checks passed after these edits; no implementation or runtime QA has run.

Refined contracts cover manual-payment isolation, quote/invoice recovery, controlled platform bootstrap and role provisioning, suspended-branch historical reads, provider finance evidence, and task acceptance/decomposition. ADR changes add declaration headings only; accepted architecture decisions are unchanged. TEST-2 through TEST-5 are planned procedures, not executed application tests. Structural `ready` means parser/traceability checks passed; development authorization, task-local evidence and production gates remain open.
