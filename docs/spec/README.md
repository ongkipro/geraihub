# GeraiHub Specification Index

This directory is the canonical cross-domain specification pack. `../../TASKS.md` is the sole future implementation queue; do not add a second task list here.

## Handoff and navigation documents

Read these first when handing the project to a developer or coding agent.

| Document | Canonical responsibility | Accountable role |
|---|---|---|
| [`HANDOFF.md`](HANDOFF.md) | Safe reading order, authority hierarchy, implementation protocol, and handling of unknowns | Engineering owner |
| [`GLOSSARY.md`](GLOSSARY.md) | Canonical domain language and state terminology | Product + Engineering |
| [`TRACEABILITY.md`](TRACEABILITY.md) | Requirement → specification → task → evidence navigation | Engineering owner |
| [`DECISION-GATES.md`](DECISION-GATES.md) | Open external/provider/legal/production gates that must not be guessed | Cross-functional owners |
| [`CONTEXT-RECORD.md`](CONTEXT-RECORD.md) | Context, provenance, selected overlays, omissions, and approval gates | GeraiHub product owner |

## Domain specifications

| Document | Canonical responsibility | Accountable role |
|---|---|---|
| [`02-PRD.md`](02-PRD.md) | Product scope, observable requirements, non-goals, and accepted policy decisions | GeraiHub product owner |
| [`03-TECHNICAL-DESIGN.md`](03-TECHNICAL-DESIGN.md) | Proposed component behavior, state guards, provider boundary, and verification plan | Engineering owner |
| [`04-SYSTEM-ARCHITECTURE.md`](04-SYSTEM-ARCHITECTURE.md) | Target containers, trust boundaries, reliability boundaries, and explicit deferrals | Engineering owner |
| [`05-DATA-MODEL.md`](05-DATA-MODEL.md) | Logical entities, ownership, constraints, lifecycle, and migration requirements | Engineering owner |
| [`06-TENANT-ISOLATION.md`](06-TENANT-ISOLATION.md) | Organization/branch isolation invariants and negative test matrix | Security owner |
| [`07-IAM-RBAC-ABAC.md`](07-IAM-RBAC-ABAC.md) | Identity lifecycle, roles, action permissions, JIT support, and authorization cases | Security owner |
| [`08-STATE-CONCURRENCY-CONTRACT.md`](08-STATE-CONCURRENCY-CONTRACT.md) | Canonical shipment state transitions, forbidden transitions, ordering, and concurrency contract | Engineering owner |
| [`09-API-SPECIFICATION.md`](09-API-SPECIFICATION.md) | Framework-neutral internal operation contract and async-provider boundary | Engineering owner |
| [`10-DESIGN-SYSTEM-WHITELABEL.md`](10-DESIGN-SYSTEM-WHITELABEL.md) | UI requirements, accessibility, responsive contract, and explicit no-white-label scope | Design owner |
| [`11-BILLING-PAYMENTS.md`](11-BILLING-PAYMENTS.md) | Counter payment records, corrections, provider-finance authority, and estimated-profit policy | Finance owner |
| [`12-SECURITY-ARCHITECTURE.md`](12-SECURITY-ARCHITECTURE.md) | Threats, security controls, secrets, recovery, and security verification | Security owner |
| [`13-COMPLIANCE-PRIVACY.md`](13-COMPLIANCE-PRIVACY.md) | Applicability candidates, personal-data controls, rights, retention, vendors, and transfers | Privacy owner |
| [`14-TEST-STRATEGY.md`](14-TEST-STRATEGY.md) | Test layers, negative matrices, deterministic fixtures, resilience, and evidence requirements | Engineering owner |
| [`15-OPERATIONS-RELEASE-READINESS.md`](15-OPERATIONS-RELEASE-READINESS.md) | Environment, deployment, restore, rollback, incident, and release-readiness contract | Operations owner |
| [`16-OBSERVABILITY-RATE-LIMITING.md`](16-OBSERVABILITY-RATE-LIMITING.md) | Audit/telemetry signals, alerting, redaction, quotas, and rate boundaries | Operations owner |
| [`17-UX-FLOWS-SCREEN-CONTRACTS.md`](17-UX-FLOWS-SCREEN-CONTRACTS.md) | Journeys, screen states, role visibility, responsive behavior, and browser acceptance | Design owner |
| [`18-ERROR-AND-RESULT-CONTRACT.md`](18-ERROR-AND-RESULT-CONTRACT.md) | Stable safe application error/result vocabulary and retry semantics | Engineering owner |

## Authority and status

- These documents describe the planned product and target controls. They are not runtime evidence.
- `~/Documents/work/prd/geraihub/` is a retained pre-promotion snapshot and must not be edited as the current source of truth.
- The implementation stack baseline is accepted in `../adr/ADR-001-RUNTIME-DEPLOYMENT-PROFILE.md`; exact installed package compatibility remains T-1 runtime evidence. Provider behavior, legal conclusions, production controls, and release claims remain gated.
- `HANDOFF.md`, `GLOSSARY.md`, `TRACEABILITY.md`, and `DECISION-GATES.md` are navigation/control documents. They do not override the owning requirement, ADR, or current runtime evidence.

## Structural validation

Run the repository-owned validator from the repository root:

```bash
python3 scripts/check-repository.py .
```

The same command runs in GitHub Actions. It verifies required canonical files, local Markdown links, spec/ADR indexing, task dependency references, task graph acyclicity, and removal of machine-local validator dependencies. It is structural evidence only; it does not prove runtime/provider/legal behavior.
