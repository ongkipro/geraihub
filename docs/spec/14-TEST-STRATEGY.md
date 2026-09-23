# GeraiHub Test Strategy

## Document Control

| Field | Value |
|---|---|
| Status | Accepted planning contract; executable suites pending |
| Version / updated | 1.0 / 2026-09-23 |
| Accountable owner | Engineering owner |
| Authority | Canonical repository specification when merged |

## 1. Testing Principles

- Runtime behavior, migrations, and executable tests are stronger evidence than prose.
- No production data, credentials, or live shipment mutations are used in automated tests.
- Multi-tenant negative tests are first-class acceptance tests, not optional security extras.
- Provider fixtures model only verified contract shapes. Unknown Mengantar behavior stays unknown.
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

Cover every TEN-T* and IAM-T* case plus each operational endpoint/action using the same-role two-branch matrix.

### Shipment state/concurrency

Cover every transition in `08-STATE-CONCURRENCY-CONTRACT.md`, including forbidden paths and actual concurrent database transactions.

### Payment/correction

Prove append-only original records, singular correction decision, no staff edit/delete, wrong-branch denial, and no provider-finance mutation.

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

Tests skipped because of an unresolved provider/legal/production gate are reported as BLOCKED/NOT APPLICABLE, never PASS.

## 6. Evidence Format

For material work record:

- commit SHA;
- environment/runtime/package lock identity;
- exact command;
- result summary;
- safe report/artifact path;
- relevant requirement/task IDs.

Screenshots support UX evidence but never replace executable assertions.
