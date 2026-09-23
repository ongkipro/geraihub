# GeraiHub Test Strategy

## Document Control

| Field | Value |
|---|---|
| Status | Accepted planning contract; executable suites pending |
| Version / updated | 1.1 / 2026-09-24 |
| Accountable owner | Engineering owner |
| Authority | Canonical repository specification when merged |

## 1. Testing Principles

- Runtime behavior, migrations, and executable tests are stronger evidence than prose.
- No production data, credentials, or live shipment mutations are used in automated tests.
- Multi-tenant negative tests are first-class acceptance tests, not optional security extras.
- Provider fixtures model only verified contract shapes. Unknown Mengantar behavior stays unknown.
- Domain/UI fixtures may model approved GeraiHub states before provider verification; they must not invent provider wire fields or be recorded as external capability evidence.
- Tests must prove absence of duplicate side effects under replay/concurrency/crash scenarios.

## 2. Test Pyramid and Ownership

| Layer | Scope | Examples | Runs |
|---|---|---|---|
| Static | formatting, lint, typecheck, secret/reference checks | invalid imports, unsafe env exposure | every PR |
| Unit/domain | pure policy and state machine | transitions, permission decisions, money calculations | every PR |
| DB integration | PostgreSQL constraints/transactions/concurrency | tenant FKs, CAS conflicts, outbox claim, invitation race | every PR with disposable DB |
| Auth/HTTP contract | session, CSRF/origin, schemas, errors | uninvited login, wrong branch, mass assignment | every PR |
| Provider adapter contract | normalized fixtures, timeout/replay | estimate parsing, unknown outcomes | every PR; live sandbox separately gated |
| Browser E2E | role-aware operator journeys | create-to-print, branch switch, correction, JIT | PR/release depending cost |
| Security/adversarial | IDOR, privilege, leakage, abuse | cross-branch IDs, stale JIT, PII/log scan | PR/release |
| Resilience | crash, duplicate, ordering, recovery | worker crash after possible dispatch | release candidate |
| Production smoke | safe non-mutating health/login/readiness | headers, health, migrations, connectivity | authorized deploy only |

## 3. Mandatory Suites

### Tenant/IAM

Cover every MVP-applicable TEN-T* and IAM-T* case plus each operational endpoint/action using the same-role two-branch matrix. TEN-T5's enabled public-draft lookup behavior remains post-MVP; the MVP check asserts that no public lookup surface is exposed rather than implementing it for test coverage.

### Shipment state/concurrency

Cover every transition in `08-STATE-CONCURRENCY-CONTRACT.md`, including forbidden paths and actual concurrent database transactions.

For money transport, round-trip canonical strings `"0"`, `"18000"`, `"9007199254740993"` and the PostgreSQL signed BIGINT upper bound `"9223372036854775807"` through schema/JSON/DB without a Number conversion. Versions use the same lossless transport with their positive-version constraint. Transport round-trip does not authorize provider/business limits. Reject numeric JSON amounts, `"1e3"`, `"1.5"`, `"1,000"`, negative nonnegative fields and one-above-bound values. Check overflow at quantity-times-value, summed totals, and COD-base-times-333 before persistence. Represent the unrounded fee for IDR 18,000 as integer numerator `"5994000"` and denominator `"10000"`; the exact display estimate 599.40 is not a final payable amount. T-7/T-8 own these tests.

Exercise both new and existing sender/recipient paths with duplicate names, explicit contact save, wrong-branch contact and pickup probes, later directory edits, and unchanged submitted snapshots. Verify missing/inactive origin, empty item list, invalid quantity/value/overflow, exact line and goods totals, separate shipping/COD amounts, and quote invalidation after material edits. Test non-COD default with no courier collection or COD fee; COD ongkir equal to verified shipping; COD produk equal to goods with optional included shipping; and rejection of unsupported modes, missing sender-at-gerai confirmation when shipping is excluded, stale quote and overflow. For intended COD bases IDR 18,000, IDR 118,000, and IDR 100,000, assert exact 3.33% unrounded estimates of IDR 599.40, IDR 3,929.40, and IDR 3,330.00 respectively, without floating point or invented final rounding. Actual provider fee and collection must not be inferred from fixtures. Public draft-reference lookup remains a distinct post-MVP test.

### Invoice and manual-payment boundary

Prove at most one immutable invoice per eligible shipment, identical reprints, wrong-branch and provider-unknown denial, quote/source consistency, and no gerai-customer-payment method, receipt, paid status, or refund operation in API, schema, or UI. For each collection mode, verify that invoice shipping charge, allocation label, declared goods, and intended courier COD are distinct and no requested COD is labeled collected or paid.

For the counter print flow, prove one action prepares both the original invoice and confirmed provider label, reuses the same documents on duplicate click or browser/printer failure, and never claims paper output from a print dialog. Inspect synthetic A4 and 80 mm invoice output for clipped references, IDR totals, and long names. Verify the actual provider label on its target media without changing barcode, tracking data, or scale; if media are incompatible, verify two ordered print steps from one screen and independent reprints. A cancelled shipment can reprint its existing invoice but cannot issue a new one.

### Provider reliability

Fixtures cover:

- success;
- validated permanent failure;
- pre-dispatch transient failure;
- timeout after possible dispatch;
- duplicated response;
- out-of-order observation;
- malformed/oversized response;
- authentication/contract mismatch;
- worker crash and reclaim.

No test may label an invented provider behavior as verified.

### Redaction

Automated scans of test logs/audit fixtures/browser console must reject secrets, cookies/tokens, raw provider payloads, full phone/address values, and credential-bearing URLs.

## 4. Deterministic Test Data

Use factories/fixtures with synthetic Indonesian-looking but non-real data. Stable fixture IDs must make branch ownership explicit, for example:

`org_alpha/branch_a/user_staff_a/shipment_a`

and a distinct branch B adversary fixture.

## 5. Quality Gates

A change touching a domain must run that domain's unit + DB/contract tests. A release candidate additionally requires all browser/security/resilience suites and T-20 review.

Tests skipped because of an unresolved required provider/legal/production gate are BLOCKED, never PASS. NOT APPLICABLE is reserved for an explicitly excluded phase or accepted scope decision, not a missing prerequisite.

### Review and retest loop

For each implementation unit, compare observed behavior with its owning requirement, negative cases, and the changed code/SQL diff. Classify each finding by affected requirement and risk; fix it within the owning task or record a scoped correction unit in `TASKS.md`. Rerun the failing check and the relevant regression suite after the fix. Browser-visible fixes also repeat the affected journey and visual/accessibility review on desktop/tablet plus narrow-screen recovery. A test skipped without a valid gate, an unresolved high-impact finding, or stale evidence prevents PASS.

Before T-20, run the complete applicable suites from a recorded source/lockfile identity and inspect failures, flaky results, skipped cases, provider-gate status, migration/rollback proof, and screen/action coverage. Every failure has an owner, reproduction and retest result. Do not turn repeated retries into a pass if the root cause is unknown. A later change to a shared authorization, money, provider, or printing path invalidates dependent evidence until the relevant checks rerun.

## 6. Evidence Format

For material work record:

- source identity (commit SHA plus dirty-worktree description when uncommitted; never imply an uncommitted result is a CI result for that commit);
- environment/runtime/package lock identity;
- exact command;
- result summary;
- safe report/artifact path;
- relevant requirement/task IDs.
- finding/retest linkage when a failed or reviewed behavior was corrected.

Screenshots support UX evidence but never replace executable assertions.

## 7. Readiness Refinement Procedures

These are planned behavioral procedures, not passing runtime evidence. Before executing the named task, add its actual test file/command to TASKS.md. The current `pnpm test` suite proves T-1 foundation and T-3 persistence only; it does not satisfy TEST-2 through TEST-5.

### TEST-2 — Quote, invoice, and cancellation safety
- Target: PR-2, PR-3, PR-6, PR-7, BILL-9
- Status: Planned; not executed
- Owner: Engineering owner
- Ref: T-8 domain/DB tests, T-11 dispatch integration, T-13 cancellation and T-21 invoice/browser tests; commands recorded before their implementation units.
- Procedure: Seed a verified quoted shipment. Expire or materially change its quote; assert submit is denied until a fresh quote is explicitly confirmed. Cancel before dispatch; assert no invoice. Repeat cancellation with queued/in-flight/unknown create; assert denial and no invoice/resi. Apply verified no-order failure and repeat safe local cancellation. Confirm a provider order; race two invoice issue requests and assert one stable invoice reference with the exact submit-time quote amount and confirmed resi, even if the quote expires afterward. Reprint after pickup and cancellation; assert the original document remains available but no new invoice can issue after cancellation. Inspect API/schema/UI fixtures for absence of customer-payment status or receipt fields.
- Acceptance: No dispatch on stale quote, duplicate order/invoice, fabricated resi, invoice during provider uncertainty, false local cancellation, or paid-status assertion. Post-issue replacement remains gated until approved examples exist.
- Queue/reprint extensions: Delay a queued create until the quote expires; race two workers against atomic closure and assert no provider call for provably never-dispatched stale work. Crash after the dispatch-start marker and assert reconcile-only behavior. Replace branch provider-account mapping and assert an old operation still targets its original account or stays blocked. Change branch/contact/template data after invoice issue and assert original reprint content/version remains unchanged.

### TEST-3 — Bootstrap and role provisioning
- Target: PR-10, PR-11, IAM-1
- Status: Planned; not executed
- Owner: Security owner
- Ref: T-3 persistence, T-4 bootstrap/auth and T-14 administration tests; commands recorded before their implementation units.
- Procedure: Start with an empty synthetic database. Approve a named bootstrap invitation through the controlled operator procedure; race two attempts and accept only one current invitation. Deny wrong identity, expired/revoked proof, public bootstrap requests and completed-bootstrap replay after administrator suspension. Bind only the validated Google subject. Exercise each IAM provisioning authority, branch finance-viewer read/deny cases, platform revocation and last-admin/owner removal. Assert audit and no tenant grants from a platform role.
- Acceptance: No first-user-wins or self-escalation path; bootstrap completion is permanent, invitations are singular, and each role has an explicit grant/revocation path. No real identity or credential is used.
- Onboarding extension: From an empty tenant database, provision an organization/owner invitation through platform authority, accept it, configure a draft branch including its initial origin, assign admin and verify readiness before activation. Reject operations before activation and duplicate owner-grant replays; no manual tenant membership insertion substitutes for the workflow.
- Recovery extensions: Deny a branch admin's attempt to revoke/relink global identity or transfer another branch's membership. Exercise the controlled global recovery against synthetic identities, approval evidence and session revocation. Cover role-aware landing, logout failure/success, session expiry and no automatic mutation replay through UX scenario 11; JIT request/approval/activation/exit through scenario 13.

### TEST-4 — Suspended history and context freshness
- Target: PR-1, PR-11, TEN-1, TEN-6
- Status: Planned; not executed
- Owner: Security owner
- Ref: T-5 authorization, T-9 browser, T-11 worker and T-14 lifecycle tests; commands recorded before their implementation units.
- Procedure: Switch synthetic branch A to B and replay both a detail request and resource-less draft creation with the old context version. Deny both. Suspend A and deny its old operational context; explicitly select A history mode with a permitted reader and allow a scoped historical read. Deny wrong branch, revoked membership, print/export and every operational mutation. Permit separately authorized lifecycle administration. Pause new provider dispatch while allowing read-only reconciliation of a previously dispatched operation; verify suspension races retain correlation and never report automatic cancellation.
- Acceptance: Historical access works without reviving operational authority; stale requests never operate on a newly selected branch.
- Configuration extensions: Deny owner direct reactivation, allow a platform approval only after readiness, and retain revoked memberships as revoked. Exercise admin-only directory update, version conflict, pickup readiness invalidation and unchanged submitted/invoice snapshots through UX scenario 12.

### TEST-5 — Finance source and snapshot integrity
- Target: PR-8, PR-9, TD-4, TD-7
- Status: Planned; not executed
- Owner: Engineering owner
- Ref: T-10 finance evidence review, T-15 adapter/DB/browser tests and T-22 formula tests; commands recorded before their implementation units.
- Procedure: Tie each fixture to a verified finance-read capability and sanitized source reference. Test missing fields, unavailable capability, wrong account/shipment, exact units, multiple/duplicate pages, partial fetch failure, stale or revised observations and conflicting totals. Assert partial data is not labeled a complete fresh snapshot, missing values are not zero, and estimate prices never substitute for authoritative settlement/cashback. Verify pickup and approved formula inputs independently before showing profit.
- Acceptance: Source, scope and freshness are inspectable; unsupported/unknown data remains unavailable; no provider financial mutation occurs. Synthetic tests alone never close the external capability gate.
