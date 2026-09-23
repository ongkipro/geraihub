# GeraiHub Status

Updated: 2026-09-23

## Current phase

**Canonical documentation baseline and handoff layer complete; application implementation has not started.**

This file reports current state only. It does not authorize source-code initialization, credentials, Mengantar mutations, production resources, or deployment.

## Verified repository state

- Canonical branch: `main`.
- Product, architecture, tenant/IAM, state/concurrency, API, UI, billing, security, privacy baseline, testing, operations, observability, and error contracts are present.
- The documentation pack now includes canonical glossary, requirement traceability, open decision/evidence gates, and a developer/AI handoff contract.
- T-2 planning runtime baseline is accepted: Node.js 24 LTS major, pnpm, Next.js App Router, PostgreSQL, Drizzle, Better Auth, modular monolith, separate web/worker processes.
- ADR-005 fixes database-backed session and server-owned active-branch context semantics.
- The repository-owned validator is `python3 scripts/check-repository.py .`.
- GitHub Actions Specification Validation has produced a successful run on the hardened main baseline.
- Current official stack documentation was rechecked on 2026-09-23; exact installed package compatibility remains T-1/T-4 evidence.

## Documentation handoff entry points

- `docs/spec/HANDOFF.md` — reading order and execution protocol.
- `docs/spec/GLOSSARY.md` — canonical language.
- `docs/spec/TRACEABILITY.md` — requirement/spec/task/evidence map.
- `docs/spec/DECISION-GATES.md` — open facts/approvals that must not be guessed.

These files are navigation/control layers. The owning product/specification documents and actual runtime/provider evidence remain authoritative.

## Open gates that must not be fabricated

1. **T-23 repository administration:** GitHub currently reports `main` unprotected and no ruleset enabled. Enable required branch/ruleset controls.
2. **Development authorization:** T-1 cannot initialize application code until explicitly authorized.
3. **T-10 Mengantar contract evidence:** estimate/order/idempotency/status/label/cancellation/pickup/account behavior requires current documented and authorized sanitized evidence.
4. **Finance:** final estimated-profit formula inputs and authoritative pickup/provider mapping require approval/evidence.
5. **Privacy/legal:** legal entity/roles, retention, notice, rights, vendors/regions/transfers remain production gates.
6. **Operations:** production hosting vendor, recovery targets, backup restore, telemetry/alerts, rollback and incident ownership remain T-17 through T-20 evidence.

The detailed gate register is `docs/spec/DECISION-GATES.md`.

## Next dependency sequence

```text
documentation baseline complete
        ↓
T-23 enable repository rules
        ↓
explicit development authorization
        ↓
T-1 bootstrap exact runtime/packages/lockfile
        ↓
T-3 persistence → T-4 auth → T-5 branch authorization → T-6 audit/JIT
        ↓
T-7/T-8 safe shipment/payment domain
        ↓
T-10 verified Mengantar contracts
        ↓
provider integration + UI + reconciliation
        ↓
production-readiness gates
```

Repository/runtime evidence overrides this status file if they later conflict.
