# GeraiHub Architecture Decision Records

Architecture Decision Records (ADRs) preserve durable engineering decisions that materially constrain implementation. Specifications define required behavior; ADRs explain why a concrete technical approach was selected.

## Rules

- ADRs are immutable after acceptance except for typo/link fixes. A changed decision gets a new ADR that supersedes the old one.
- `Status: Proposed` does not authorize implementation. `Status: Accepted` means the architectural choice is approved, not that provider/legal/production gates are closed.
- Exact package versions are locked by the implementation repository lockfile during T-1. ADRs may select a supported version family/major where that is part of the decision.
- Repository/runtime evidence overrides stale planning assumptions.

## Index

| ADR | Decision | Status |
|---|---|---|
| [ADR-001](ADR-001-RUNTIME-DEPLOYMENT-PROFILE.md) | Runtime and deployment profile | Accepted baseline; production vendor gate remains |
| [ADR-002](ADR-002-TENANT-DATABASE-ENFORCEMENT.md) | Tenant/database enforcement | Accepted |
| [ADR-003](ADR-003-OUTBOX-RECONCILIATION.md) | Durable provider dispatch/reconciliation | Accepted |
| [ADR-004](ADR-004-MONEY-CONCURRENCY.md) | Exact money and optimistic concurrency | Accepted |
