# GeraiHub Specification Index

This directory is the canonical cross-domain specification pack. `../../TASKS.md` is the sole future implementation queue; do not add a second task list here.

| Document | Canonical responsibility | Accountable role |
|---|---|---|
| [`CONTEXT-RECORD.md`](CONTEXT-RECORD.md) | Context, provenance, selected overlays, omissions, and approval gates | GeraiHub product owner |
| [`02-PRD.md`](02-PRD.md) | Product scope, observable requirements, non-goals, and accepted policy decisions | GeraiHub product owner |
| [`03-TECHNICAL-DESIGN.md`](03-TECHNICAL-DESIGN.md) | Proposed component behavior, state guards, provider boundary, and verification plan | Engineering owner |
| [`04-SYSTEM-ARCHITECTURE.md`](04-SYSTEM-ARCHITECTURE.md) | Target containers, trust boundaries, reliability boundaries, and explicit deferrals | Engineering owner |
| [`05-DATA-MODEL.md`](05-DATA-MODEL.md) | Logical entities, ownership, constraints, lifecycle, and migration requirements | Engineering owner |
| [`06-TENANT-ISOLATION.md`](06-TENANT-ISOLATION.md) | Organization/branch isolation invariants and negative test matrix | Security owner |
| [`07-IAM-RBAC-ABAC.md`](07-IAM-RBAC-ABAC.md) | Identity lifecycle, roles, action permissions, JIT support, and authorization cases | Security owner |
| [`09-API-SPECIFICATION.md`](09-API-SPECIFICATION.md) | Framework-neutral internal operation contract and async-provider boundary | Engineering owner |
| [`10-DESIGN-SYSTEM-WHITELABEL.md`](10-DESIGN-SYSTEM-WHITELABEL.md) | UI requirements, accessibility, responsive contract, and explicit no-white-label scope | Design owner |
| [`11-BILLING-PAYMENTS.md`](11-BILLING-PAYMENTS.md) | Counter payment records, corrections, provider-finance authority, and estimated-profit policy | Finance owner |
| [`12-SECURITY-ARCHITECTURE.md`](12-SECURITY-ARCHITECTURE.md) | Threats, security controls, secrets, recovery, and security verification | Security owner |
| [`13-COMPLIANCE-PRIVACY.md`](13-COMPLIANCE-PRIVACY.md) | Applicability candidates, personal-data controls, rights, retention, vendors, and transfers | Privacy owner |
| [`16-OBSERVABILITY-RATE-LIMITING.md`](16-OBSERVABILITY-RATE-LIMITING.md) | Audit/telemetry signals, alerting, redaction, quotas, and rate boundaries | Operations owner |
| [`17-UX-FLOWS-SCREEN-CONTRACTS.md`](17-UX-FLOWS-SCREEN-CONTRACTS.md) | Journeys, screen states, role visibility, responsive behavior, and browser acceptance | Design owner |

## Authority and status

- These documents describe the planned product and target controls. They are not runtime evidence.
- `~/Documents/work/prd/geraihub/` is a retained pre-promotion snapshot and must not be edited as the current source of truth.
- No stack, provider behavior, legal conclusion, production control, or release claim is accepted unless its stated gate is closed with the required evidence.
- Files are numbered by the suite's domain map; intentionally absent numbers represent omitted or deferred artifacts, not missing files.

## Structural validation

Run the validator from the repository root so it can see both this pack and the root `TASKS.md`:

```bash
python3 ~/dotfiles/skills/local/development-spec-suite/scripts/check-traceability.py ~/Projects/geraihub
python3 ~/dotfiles/skills/local/development-spec-suite/scripts/check-traceability.py ~/Projects/geraihub --stage planning
```

Running it against `docs/spec/` alone is incomplete because task declarations live at the repository root.
