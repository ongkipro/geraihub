# GeraiHub Developer / AI Handoff Contract

## Purpose

This is the shortest safe entry point for a developer or coding agent before implementation. It defines reading order, authority, non-negotiable boundaries, and how to handle unknowns.

It does not authorize implementation by itself.

## Required reading order

1. `../../STATUS.md` — current verified phase and open gates.
2. `../../TASKS.md` — sole implementation queue and dependency order.
3. `02-PRD.md` — product scope and permanent product decisions.
4. `GLOSSARY.md` — canonical domain language.
5. `TRACEABILITY.md` — requirement → spec → task → evidence map.
6. `DECISION-GATES.md` — unknowns that must not be guessed.
7. `../adr/README.md` and referenced ADRs.
8. Read the domain specifications required by the selected task.
9. For source work, read `19-ENGINEERING-STANDARDS.md` and the proposed T-1 layout in `20-REPOSITORY-STRUCTURE.md`; verify actual paths against the repository before using them.

Do not start from a single API/UI document in isolation.

## Authority order

When statements conflict, use this order:

1. current repository/runtime evidence for implemented behavior;
2. accepted owning requirement/ADR for intended behavior;
3. current `TASKS.md` for work status/dependencies;
4. cross-cutting navigation documents such as this file, glossary, and traceability;
5. historical snapshot or memory/context outside the canonical repository.

A stale implementation that violates an accepted requirement is a defect, not a reason to silently rewrite the requirement.

## Non-negotiable boundaries

- Branch is the operational isolation boundary for shipment mutations.
- Client-supplied organization/branch/role values never become authorization authority.
- Google authenticates identity; GeraiHub owns application access, membership, role, session/context, and audit.
- Mengantar is server-only and remains authoritative for provider shipment/finance facts explicitly assigned to it.
- Provider timeout/ambiguity is never converted into blind duplicate submit/cancel.
- Customer payment and any refund are manual gerai processes outside GeraiHub; the app stores neither payment state nor receipt.
- Invoice issuance follows confirmed Mengantar resi and quote; reprint preserves the original document.
- Print/reprint is not order submission.
- Estimated profit is not authoritative accounting profit and requires verified pickup plus approved formula.
- Super-admin has no routine tenant shipment operation; bounded JIT is explicit.
- Secrets, sessions, credential-bearing URLs, raw provider payloads, and unnecessary full PII must not appear in browser/log/test artifacts.
- Post-MVP customer pre-fill/QR/reference/WhatsApp must not leak into MVP implementation.

## Task execution protocol

For an implementation task:

1. identify its primary requirement and constraints in `TASKS.md`;
2. follow traceability to the owning specs/ADR;
3. check `DECISION-GATES.md` for blockers;
4. write or update executable tests for the acceptance contract;
5. implement only within the authorized scope;
6. collect actual evidence;
7. review the changed diff and affected browser/runtime flow, resolve findings, and rerun affected checks;
8. report PASS/FAIL/BLOCKED accurately and reopen stale task evidence when later changes invalidate it.

The root `TASKS.md` owns the closed review loop and remains the only execution queue. Dotfiles skills and local helpers may guide specialist work, but the repository must retain runnable commands and evidence so the result does not depend on one machine's tools.

Do not create a second backlog, hidden requirements list, or competing state machine.

## How to handle an unknown

When an unknown is encountered:

- If it is an external/provider/legal/production fact, keep the relevant gate OPEN/BLOCKED and request/collect the required evidence.
- If it is an implementation detail that does not alter product/architecture policy, choose the smallest reversible design consistent with current ADRs and document it in code/tests.
- If it changes a durable architecture decision, propose an ADR.
- If it changes product policy or role/permission behavior, update the owning requirement first; do not bury the change in source code.

## Reference implementation patterns

These are illustrative only.

### Server-derived scope

```ts
// Reference pattern only.
const actor = await requireSession(request);
const scope = await resolveAuthorizedActiveBranch(actor);

await shipmentService.update({
  actor,
  scope,
  shipmentId,
  expectedVersion,
  input: validatedInput,
});
```

The key rule is that `scope` comes from trusted server state, not an arbitrary request `branch_id`.

### Ambiguous provider result

```ts
// Reference pattern only.
if (result.mayHaveReachedProvider && !result.authoritativeOutcome) {
  return { state: "unknown", nextAction: "reconcile" };
}
```

Do not translate this case into a second provider call.

### Exact IDR

```ts
// Reference pattern only.
type IdrRupiah = bigint;
```

Framework/database representation may vary, but floating-point persisted money is not allowed.

## Handoff completion test

A new developer/agent should be able to answer, from repository docs alone:

- What is authoritative: GeraiHub vs Mengantar?
- What is the operational tenant boundary?
- Who may perform each privileged action?
- What makes a shipment safe to submit/print/cancel?
- What happens after an ambiguous provider timeout?
- Which records are append-only?
- When may estimated profit appear?
- Which unknowns are still blocked rather than assumed?
- Which task is next and what evidence closes it?
- Which workspace does each role enter, and how do logout, stale context and JIT exit recover safely?
- Which provider account/version owns an operation, and how does a never-dispatched expired quote return to review?
- Which screen/action family and concrete control test prove the changed journey, including failure paths?

If the documentation cannot answer one of these questions, improve the owning document instead of adding an undocumented implementation assumption.
