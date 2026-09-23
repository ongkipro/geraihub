# GeraiHub Context Record

> Planning context and candidate applicability only. No legal, security, compliance, certification, implementation, or release-readiness conclusion is implied.

## Document Control

| Field | Value |
|---|---|
| Owner | GeraiHub product owner |
| Status | Repository planning baseline — implementation not started |
| Authority | Canonical repository specification since promotion on 2026-09-23; staging copy is retained only as a snapshot |
| Audit date | 2026-09-23 (local system date) |
| Depth profile | platform |
| Approval gate | Product owner approves scope and development separately; specialist owners approve their unresolved domain decisions |

### Provenance and preservation

The previous draft used 2026-10-23 for briefs, provider retrieval, and document updates, while this audit's system date is 2026-09-23. Those prior dates are unverified provenance, not evidence of a future observation. Original brief/provider captures were not available for reinspection in this audit. Existing document version dates are retained as inherited labels; do not cite them as fresh verification.

This record therefore treats agreed product policies as `Decision`, unresolved assumptions as `Assumption`, and planning recommendations as `Proposal`. Provider requirements are design decisions, not proof that Mengantar supports an endpoint or behavior. The canonical domain documents below retain the policy detail; this record selects context and review gates. The historical initializer input is retained only in the non-authoritative staging snapshot and must not regenerate this pack without reconciliation.

Protected boundaries: Google OAuth authenticates while GeraiHub owns users/memberships/authorization; cash and branch QRIS only; admin-request/owner-approval corrections and off-system refunds; provider-confirmed pickup gates estimated profit; Mengantar remains financial authority; owner-request/platform-approved branches and one verified account mapping per branch; customer pre-fill/QR/WhatsApp remain post-MVP. Document promotion is complete. Source-code initialization, package installation, secrets access, provider requests, and deployment are not authorized by this record.

Owner labels identify accountable roles, not proof that people have been appointed. The product owner must appoint actual engineering, security, privacy, finance, design, and operations approvers before their gates can close. One person may hold several roles, but that does not bypass a required separation-of-duties approval.

## Context Facts and Decisions

| ID | Dimension | Statement | Status | Evidence kind | Source | Owner | Recheck trigger |
|---|---|---|---|---|---|---|---|
| CTX-1 | Product surface | Authenticated Bahasa Indonesia web application for whitelisted gerai partners; physical counter workflow is MVP. | Decision | human-policy | Accepted product brief retained in 02-PRD.md sections 1–2 | GeraiHub product owner | Audience or MVP surface changes |
| CTX-2 | Operating entities | Organization, gerai branch, owner/admin/staff, customer/sender/recipient, shipment, and Mengantar are the operational frame. | Decision | human-policy | 02-PRD.md section 2; 05-DATA-MODEL.md | GeraiHub product owner | Ownership or workflow changes |
| CTX-3 | External integration | Provider calls and pickup/address/shipment synchronization must use a trusted GeraiHub backend; current provider capabilities are not verified by this decision. | Decision | human-policy | PR-4; 03-TECHNICAL-DESIGN.md provider evidence gates; candidate documentation https://api-public.mengantar.com/docs/ | Engineering owner | API, account, environment, or contract changes |
| CTX-4 | Personal data | Shipment operations require bounded sender/recipient names, phone numbers, addresses, and authenticated operator identity. | Decision | human-policy | PR-1; PRIV-1 through PRIV-5 | Privacy owner | Fields, purposes, retention, or vendor changes |
| CTX-5 | Market and locale | Indonesia, Bahasa Indonesia, and IDR are the current scope. Every branch stores an explicit IANA timezone; `Asia/Jakarta` is only an initialization default for branches confirmed to operate in WIB. Post-MVP business-calendar/cutoff policy remains separate. | Decision | human-policy | 02-PRD.md scope; 10-DESIGN-SYSTEM-WHITELABEL.md locale contract | GeraiHub product owner | Branch geography, business calendar, or locale changes |
| CTX-6 | Commerce | Shipment COD/non-COD and provider finance are separate from GeraiHub's cash/QRIS counter records. GeraiHub does not operate a wallet, payment gateway, or settlement ledger. | Decision | human-policy | Q-3; BILL-1 through BILL-8 | Finance owner | Tender, fee, refund, or settlement role changes |
| CTX-7 | Tenant and identity | An organization may own several branches. Google-authenticated identities need GeraiHub-managed invitations/memberships; each operation resolves one authorized active branch. | Decision | human-policy | Q-4, Q-7; TEN-1; IAM-1 | Security owner | Onboarding, roles, or scope changes |
| CTX-8 | Courier availability | Courier/service and COD eligibility must derive from verified provider estimates, never a fabricated catalog or assumed discounts. | Decision | human-policy | PR-2; TD-4; provider evidence gates | Engineering owner | Estimate schema or active-courier policy changes |
| CTX-9 | Jurisdiction candidate | Indonesia requires engineering applicability review; selection is not a legal conclusion. | Proposal | inference | CTX-4, CTX-5 and the prior initializer jurisdiction candidate | Privacy owner | Operating/legal-entity scope changes |
| CTX-10 | Sector candidate | Ecommerce/logistics/payment roles require qualified assessment; a sector label does not establish obligations. | Proposal | inference | CTX-6 and the prior initializer sector candidate | Privacy owner | Business/payment model or partner contract changes |
| CTX-11 | Locale contract | id-ID UI, exact IDR presentation, explicit branch timezone, and WCAG 2.2 AA as an engineering target are the accepted planning localization contract; this is not a certification claim. | Decision | human-policy | LOC-1; UI-2, UI-4; design-system sections 3–5 | Design owner | Locale/accessibility requirements change |
| CTX-12 | Deferred pre-fill | Post-MVP customer pre-fill presents a short non-sequential readable reference and QR for the same draft, distinct from Mengantar resi; counter verification/payment remain required. | Decision | human-policy | PR-12; 17-UX-FLOWS-SCREEN-CONTRACTS.md section 6 | GeraiHub product owner | Separate post-MVP authorization |
| CTX-13 | Correction/cancellation | Correct local drafts before submission; submitted/printed shipments require authoritative Mengantar cancellation outcomes and verified eligibility/side effects. | Decision | human-policy | PR-6; Q-1 | GeraiHub product owner | Provider cancellation or correction policy changes |
| CTX-14 | Financial authority | Mengantar owns provider balance/COD/remittance/settlement. GeraiHub reports estimates only after authoritative pickup evidence; formula inputs still require verification. | Decision | human-policy | PR-8, PR-9; Q-2; BILL-5, BILL-8 | Finance owner | Pickup, discount, cashback, or formula changes |
| CTX-15 | Deferred lookup/lifecycle | Post-MVP QR/manual reference resolve the same draft. Restricted phone or name-plus-last-four lookup requires minimized verification; name-only lookup is prohibited. End-of-next-business-day expiry preserves audit; timezone/calendar/cutoff and retention remain open. | Decision | human-policy | Q-5; TEN-4; 17-UX-FLOWS-SCREEN-CONTRACTS.md section 6 | GeraiHub product owner | Post-MVP lookup, business calendar, or retention changes |
| CTX-16 | Deferred notification | WhatsApp is optional/deferred until official provider, consent, templates, failure handling, and privacy controls are approved; gerai service never depends on delivery. | Decision | human-policy | 02-PRD.md non-goals; UX post-MVP contract | GeraiHub product owner | Messaging scope or consent policy selected |
| CTX-17 | Google identity boundary | Google OAuth supplies external identity; GeraiHub stores provider subject, internal user, memberships, roles, sessions, and audit. No Google API-token feature is approved. Vendor processing locations/contracts remain unknown. | Decision | human-policy | Q-7; IAM-1; PRIV-3, PRIV-11 | Security owner | Auth scope, account recovery, or vendor contract changes |

## Overlay and Capability Decisions

| ID | Capability/overlay | Status | Trigger facts | Selected artifacts | Owner | Reason | Review gate |
|---|---|---|---|---|---|---|---|
| OVR-1 | commerce | Active | CTX-6 | commerce, privacy, security | Finance owner | COD and cash/QRIS operational records | Payment SOP and exact formula review |
| OVR-2 | external-integration | Active | CTX-3 | technical-design, architecture | Engineering owner | Server-only Mengantar integration | Current sources and authorized sanitized sandbox evidence |
| OVR-3 | identity | Active | CTX-7, CTX-17 | iam, security | Security owner | Google identity with GeraiHub authorization | Runtime verification of IAM-1 and ADR-005 under T-4/T-5 |
| OVR-4 | localized-ui | Active | CTX-5 | localized-ui | Design owner | Bahasa Indonesia, IDR, branch time policy | LOC-1 and TEST-1 |
| OVR-5 | multi-tenant | Active | CTX-7 | multi-tenant, observability, security | Security owner | Branch isolation | TEN-1 through TEN-6 |
| OVR-6 | persistence | Active | CTX-2, CTX-4 | data-model | Engineering owner | Operational history and provider mapping | Schema/lifecycle/retention review |
| OVR-7 | personal-data | Active | CTX-4, CTX-17 | privacy, security | Privacy owner | Shipment and user personal data | Legal roles, retention, vendor/transfer decisions |
| OVR-8 | product-ui | Active | CTX-1, CTX-2 | localized-ui, ux-flows | Design owner | Stateful counter workflow | UX-1, UI-1 through UI-6 |
| OVR-9 | production-service | Active | CTX-1 | observability | Operations owner | Future maintained service | Deployment, recovery, alert ownership before production |

## Artifact Selection

| Artifact | Decision | Owner | Reason and remaining gate |
|---|---|---|---|
| PRD | Selected | GeraiHub product owner | Product scope and permanent decision IDs |
| Technical design / architecture | Selected | Engineering owner | Modular monolith and trusted provider/worker boundary; runtime baseline accepted in ADR-001, exact installed compatibility remains T-1 evidence |
| Data model / tenant isolation / IAM | Selected | Engineering owner | Identity, ownership, lifecycle, and branch authorization |
| Internal API contract | Selected | Engineering owner | 09-API-SPECIFICATION.md defines internal operations; machine-readable HTTP contract remains blocked until boundary selection |
| Design system / UX | Selected | Design owner | Counter workflow and browser acceptance; no tenant white-label |
| Billing | Selected | Finance owner | Operational cash/QRIS and non-authoritative finance |
| Security / privacy | Selected | Security owner | Control and applicability contracts; privacy owner retains qualified privacy decisions |
| Observability | Selected | Operations owner | Audit/redaction, limits, reconciliation, alerting |
| BRD | Omitted | GeraiHub product owner | No distinct commercial study requested |
| Custom domain / public API | Omitted | GeraiHub product owner | No MVP tenant domains or public customer API |
| Operations/release-readiness contract | Selected | Operations owner | `15-OPERATIONS-RELEASE-READINESS.md` fixes environment/deploy/restore/rollback/runbook requirements; provider-specific targets/evidence remain T-17 through T-20 gates |

### Repository hardening — 2026-09-23

The canonical repository owns its structural validator at `scripts/check-repository.py`, CI runs it from `.github/workflows/spec-validation.yml`, ADRs own concrete architecture choices, and dedicated state/concurrency, testing, operations/release, and error contracts remove previously implicit implementation choices. The first hardening change was merged to `main` and the Specification Validation workflow completed successfully on 2026-09-23. This is repository-structure evidence only; application runtime evidence still does not exist.

## Jurisdiction, Sector, and Transfers

Jurisdiction declarations and transfer inventory live only in [13-COMPLIANCE-PRIVACY.md](13-COMPLIANCE-PRIVACY.md): JUR-ID-1, JUR-XFER-1, JUR-GDPR-1, and XFER-1. The duplicate Indonesia candidate was superseded there. No qualified legal conclusion or source-currentness claim has been made.

| ID | Sector | Trigger facts | Decision | Qualified owner | Official source/status | Next review |
|---|---|---|---|---|---|---|
| JUR-SECTOR-1 | Commerce/logistics/payment-role assessment | CTX-6 | Unknown | Privacy owner | Official source not yet selected; source status unknown | Before production or payment-role change |
| JUR-SECTOR-2 | Prior initializer ecommerce review candidate | CTX-10 | Unknown | Privacy owner | Historical candidate retained, not an independent legal conclusion; source status unknown | Resolve overlap with sector assessment before qualified approval |

## Locale Contract

| ID | Locale | Fallback | Regional rules | Accessibility | Test evidence | Owner | Status |
|---|---|---|---|---|---|---|---|
| LOC-1 | id-ID | en for technical diagnostics only, never a substitute for required Indonesian operator copy | Exact IDR formatting and explicit per-branch IANA timezone; post-MVP business calendar/cutoff remains a separate gate | WCAG 2.2 AA engineering target; desktop/tablet counter flow, narrow-screen recovery and zoom reflow | TEST-1 (planned procedure, not an observed pass) | Design owner | Accepted planning contract |

### TEST-1 — Regional and accessible counter-flow acceptance
- Target: NFR-2, UI-2, UI-4, LOC-1
- Status: Planned; not executed
- Owner: Design owner
- Procedure: After implementation, seed synthetic authorized users and two branches, then run the repository browser suite at desktop/tablet widths and 200% zoom. Complete the affected flow by keyboard; verify Indonesian labels, focus/error recovery, exact IDR display against fixture values, timezone-bearing timestamps, date-boundary filtering in the approved branch timezone, and safe narrow-screen detail/reprint. Exercise a branch switch and denied/provider-pending state.
- Acceptance: No missing label/focus, clipped primary action, incorrect amount/date grouping, cross-branch result, or color-only state. Counter-entry on a phone is not claimed supported.
- Ref: Repository browser test command and path must be recorded by T-9 before execution; no runtime evidence exists yet.

## Planning Audit and Approval Gate

### Executed structural checks — 2026-09-23

Historical target: the staged `geraihub/` pack, before the application repository existed.

```bash
python3 ~/dotfiles/skills/local/development-spec-suite/scripts/check-traceability.py ~/Documents/work/prd/geraihub
python3 ~/dotfiles/skills/local/development-spec-suite/scripts/check-traceability.py ~/Documents/work/prd/geraihub --stage planning
```

Both checks returned exit 0: `PASS files=15 declarations=152 tasks=22 findings=0`. The initial legacy check reported 140 findings for 142 declarations and 20 tasks. The validator was not changed or bypassed to obtain this result.

An independent Python-stdlib audit also passed at staging time: consistent Markdown table widths, 22 unique task IDs, all dependency references resolved, an acyclic task graph, T-2 stack selection before T-1 initialization, and parseable historical initializer input. On 2026-09-23, the documents were promoted to `~/Projects/geraihub/`; the repository copy is now canonical. The project remains documentation-only. These are document checks only, not application TEST/EVID or runtime proof.

Material corrections: formal requirement ownership; one jurisdiction register and preserved supersession; explicit IAM/TEN/API/UX ownership; bullet task metadata; dedicated payment-correction and profit-report tasks; removal of staff user-management/admin self-promotion contradictions; accepted payment/expiry/auth policies distinguished from provider/operational gates; provenance dates no longer claimed verified. Core product requirements remain unchanged. Owner counter permissions remain explicit-role only; JIT support is read-only with distinct approval; owner self-correction is disabled for MVP. Actual staffing/approvers and runtime enforcement still require evidence before release.

A structurally valid pack and accepted planning stack are not installed-runtime evidence, a current provider contract, a validated UI, or permission to begin development.

- [ ] Explicit development authorization and accepted task scope.
- [x] Runtime/deployment planning baseline accepted under T-2 / ADR-001; exact locked-package/runtime compatibility remains T-1 evidence.
- [ ] Current Mengantar contracts and separately authorized sanitized sandbox proof.
- [x] Account recovery/invitation identity policy, JIT approval policy, QRIS verification baseline, and no-self-correction MVP policy recorded in canonical specs.
- [ ] Estimated-profit formula and provider pickup/account mapping verified.
- [ ] Privacy/legal roles, notices, retention, vendor/regions, and transfer decisions approved before production.
- [ ] Actual specialist approvers appointed; release, backup/restore, and incident responsibilities assigned.
- [ ] Tasks split to reviewable work units and command-level checks recorded before each authorized implementation unit.
