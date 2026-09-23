# ADR-004 — Exact Money and Concurrency

- Status: Accepted
- Date: 2026-09-23
- Owner: Engineering owner
- Related: BILL-1 through BILL-8, DATA-5 through DATA-10, SEC-11

## Exact money

All IDR values owned by GeraiHub are represented as integer rupiah units in application contracts and PostgreSQL `BIGINT`-compatible exact storage. Floating-point arithmetic is prohibited for persisted or calculated money.

If a verified provider contract returns a different decimal representation, the adapter converts it at the boundary with explicit validation and rejects precision that cannot be represented without loss under the approved formula.

Every derived estimate records its input values and formula/version so historical reports remain explainable.

## Optimistic concurrency

Mutable aggregates carry a monotonically increasing `version`. A mutation that depends on previously read state uses compare-and-swap semantics:

```text
UPDATE ...
SET ..., version = version + 1
WHERE id = :id
  AND branch_id = :authorized_branch
  AND version = :expected_version
```

Zero affected rows means stale/conflicting state and must not be silently retried as if the user decision were still current.

## Operations requiring version/conflict protection

- shipment draft/verification/quote confirmation;
- direct payment recording;
- submit intent;
- cancellation request;
- payment correction request and decision;
- membership/branch lifecycle changes where stale approval matters;
- provider reconciliation applying an outcome to an aggregate.

Database uniqueness/locking remains required for invariants that optimistic versioning alone cannot protect, including one active invitation acceptance, one active scoped grant, one provider mapping, and one provider operation correlation.

## Verification

Tests must execute real concurrent transactions for duplicate payment, duplicate submit intent, simultaneous correction decisions, invitation acceptance, and provider-result application. Exactly one valid winner is accepted where the contract requires singularity; losers receive a stable conflict result with no duplicate side effect.
