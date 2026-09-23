# Contributing to GeraiHub

GeraiHub is specification-first. Repository code, migrations, tests, and runtime evidence become authoritative once implementation starts; until then, the canonical planning contracts live under `docs/spec/`, ADRs under `docs/adr/`, and the sole implementation queue is `TASKS.md`.

## Before changing a contract

1. Identify the owning requirement/task/ADR.
2. Preserve protected product boundaries unless the product owner explicitly changes them.
3. Do not guess Mengantar behavior, legal obligations, provider limits, or financial formulas.
4. Prefer one canonical owner for a rule instead of duplicating it across documents.

For application work, follow the source-boundary standards in [`docs/spec/19-ENGINEERING-STANDARDS.md`](docs/spec/19-ENGINEERING-STANDARDS.md) and check the proposed layout in [`docs/spec/20-REPOSITORY-STRUCTURE.md`](docs/spec/20-REPOSITORY-STRUCTURE.md) against actual T-1 source paths.

## Required validation

Run from repository root:

```bash
python3 scripts/check-repository.py .
python3 scripts/test-check-repository.py
```

When application code exists, also run the task-specific lint/typecheck/test/migration/browser commands recorded by the repository.

## Evidence rules

- Planned test scenarios are not PASS evidence.
- Use synthetic data in fixtures, screenshots, logs, and documentation.
- Never commit secrets, sessions, customer data, credential-bearing URLs, or raw provider payloads.
- Record current sources and observation dates for external contracts.
- A production/provider mutation requires its separate approval gate.

## Pull requests

Keep changes reviewable. Include requirement/task IDs, changed invariants, exact validation commands/results, and unresolved blockers. Architecture choices that constrain future implementation require an ADR.

The implementation and review sequence lives in `TASKS.md`; the test layers, failure/retest rules, and evidence format live in `docs/spec/14-TEST-STRATEGY.md`. For each bounded unit, show the relevant diff, focused checks and negative cases, plus the affected browser journey when visible. Link findings and retests to the owning task. Do not call a document check, successful build, or screenshot a functional PASS.
