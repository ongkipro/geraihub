# ADR-002 — Tenant and Database Enforcement

- Status: Accepted
- Date: 2026-09-23
- Owner: Security owner
- Related: TEN-1 through TEN-6, SEC-1, SEC-6, DATA-1 through DATA-10

## Decision

GeraiHub uses defense in depth:

1. **Application authorization is mandatory and authoritative for every action.**
2. Every branch-owned table carries immutable `organization_id` and `branch_id` ownership where applicable.
3. Composite foreign keys/checks prevent a resource from referencing a branch outside its organization.
4. Repository/query functions require an explicit server-derived scope object; unscoped branch-resource access is prohibited by code convention and tests.
5. Background jobs persist resource ownership and revalidate it before mutation.
6. Cache keys, locks, idempotency keys, exports, audit events, and rate-limit scopes include organization/branch dimensions where applicable.
7. PostgreSQL Row Level Security is **not the primary authorization boundary for MVP**. It may be added later only after a pooling/session-context proof demonstrates safe behavior and operational debuggability.

## Why

RLS can be useful defense in depth, but relying on connection-scoped tenant session variables with pooled connections creates a second authorization system and can fail dangerously when context is stale. The MVP already requires explicit action authorization and branch ownership constraints. Those controls are easier to test deterministically across web and worker code.

## Required database invariants

- Branch belongs to exactly one organization.
- Shipment branch/organization ownership is immutable after creation.
- Provider mapping, payment, quote, cancellation, reconciliation, and audit records cannot point to a different branch than their shipment.
- No resource is reassigned to another branch as an error-recovery mechanism.
- Retired IDs are never reused.

## Verification

- Same-role two-branch negative tests for every repository/action family.
- Stale-tab and branch-switch tests.
- Background-job mismatch quarantine test.
- Constraint tests that deliberately attempt cross-organization foreign-key combinations.
- Static/code-review check that operational repositories do not offer unscoped list/update/delete helpers.
