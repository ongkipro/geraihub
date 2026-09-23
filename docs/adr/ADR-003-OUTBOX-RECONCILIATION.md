# ADR-003 — Durable Provider Dispatch and Reconciliation

- Status: Accepted
- Date: 2026-09-23
- Owner: Engineering owner
- Related: TD-4, TD-5, SEC-7, API-1, OBS-2

## Decision

Every side-effecting Mengantar operation that can become ambiguous uses a PostgreSQL-backed transactional outbox/operation record.

The web transaction:

1. validates actor, branch, resource ownership, state and current version;
2. writes the intended GeraiHub state transition;
3. creates or reuses one durable provider-operation record with a stable internal operation ID;
4. commits before any asynchronous dispatch is considered successful to the user.

The worker:

1. claims eligible operations with transactional locking/lease semantics;
2. revalidates shipment/branch ownership and current operation state;
3. performs only the verified provider operation;
4. records sanitized outcome/correlation evidence;
5. transitions to `confirmed`, `failed`, `unknown`, or `reconciliation_required`;
6. applies bounded retry only when the provider contract proves retry is safe.

A browser refresh/click cannot manufacture provider idempotency or force a second ambiguous create/cancel request.

## Claiming and crash safety

Implementation must use database locking equivalent to `FOR UPDATE SKIP LOCKED` or another reviewed atomic claim strategy. A claim has a bounded lease/heartbeat or recoverable ownership marker so a crashed worker cannot permanently strand a job.

## Retry classes

- **Confirmed success:** terminal for the provider operation.
- **Validated permanent failure:** no automatic retry unless the contract explicitly allows corrected resubmission.
- **Transient pre-dispatch failure:** bounded retry may be allowed.
- **Timeout/ambiguous result after possible dispatch:** no blind repeat; reconcile first.
- **Contract/auth/schema mismatch:** quarantine and alert.

Exact retry counts/backoff are operational/provider decisions after T-10 evidence.

## No generic provider proxy

Only allowlisted verified adapter operations may access the Mengantar base URL. Arbitrary URLs, methods, headers, or browser-supplied provider payloads are prohibited.

## Verification

Fault tests must cover crash before dispatch, crash after possible dispatch, timeout, duplicate worker claim, out-of-order result, stale operation version, provider mismatch, and replayed browser submission.
