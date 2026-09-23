# GeraiHub State and Concurrency Contract

## Document Control

| Field | Value |
|---|---|
| Status | Accepted planning contract; runtime implementation pending |
| Version / updated | 1.0 / 2026-09-23 |
| Accountable owner | Engineering owner |
| Authority | Canonical repository specification when merged |
| Related | PR-1 through PR-7, DATA-5 through DATA-10, ADR-003, ADR-004 |

## 1. State Dimensions

Shipment state is deliberately decomposed. Implementations MUST NOT replace these dimensions with one overloaded status field.

### Operational lifecycle

`draft -> quoted -> payment_recorded -> submission_pending -> submitted -> label_printed -> awaiting_pickup -> picked_up`

Local cancellation may terminate a pre-provider draft. Provider-synchronized cancellation uses the separate cancellation dimension and may cause the operational shipment to become `cancelled` only after authoritative provider confirmation.

### Provider synchronization

`not_started | pending | confirmed | failed | unknown | reconciliation_required`

### Cancellation

`not_requested | local_draft_cancelled | requested | pending_provider | succeeded | rejected | unknown`

### Finance/reconciliation

`not_applicable | snapshot_fresh | stale | mismatch | reviewed`

## 2. Canonical Transition Matrix

| From operational state | Action/event | To state | Mandatory guards | Required side effects |
|---|---|---|---|---|
| draft | save/edit | draft | authorized active branch; expected version | append audit for sensitive/material change as policy requires |
| draft | obtain/select quote | quoted | provider estimate is valid/current; required draft fields valid | immutable quote version; current-quote pointer |
| quoted | material shipment edit | draft or quoted-unconfirmed implementation state | expected version | invalidate final quote confirmation; preserve quote history |
| quoted | confirm physical verification/final quote | quoted | verified package fields complete; selected quote current | verification evidence + audit |
| quoted | record direct payment | payment_recorded | verification/final quote confirmed; no valid payment already recorded | append-only payment + audit |
| payment_recorded | submit intent | submission_pending | current version; no confirmed/pending ambiguous provider create; active branch | transactional provider-operation/outbox record |
| submission_pending | provider confirms order | submitted | matching operation/correlation; validated response | provider mapping, audit, sync confirmed |
| submission_pending | ambiguous timeout/result | submission_pending | operation may have reached provider | sync unknown/reconciliation_required; no blind redispatch |
| submission_pending | verified permanent pre-order failure | payment_recorded | provider evidence proves no order exists | failure evidence; safe operator recovery |
| submitted | label becomes printable / print | label_printed | confirmed provider mapping; printable state | print audit only; no create-order side effect |
| label_printed | await pickup | awaiting_pickup | provider/status policy permits | synchronized status evidence |
| submitted/label_printed/awaiting_pickup | request cancellation | unchanged operational state until confirmation | verified eligibility policy; reason; expected version | cancellation request + outbox |
| any provider-submitted eligible state | provider cancellation confirms | cancelled | authenticated/reconciled authoritative outcome | retain original resi/label/payment/history |
| any provider-submitted eligible state | provider cancellation rejects | unchanged | authoritative rejection | cancellation rejected + audit |
| submitted/label_printed/awaiting_pickup | provider pickup confirms | picked_up | verified provider mapping/status event | pickup evidence; eligible for estimate subject to finance gates |

Exact provider status names/eligibility remain T-10 evidence gates.

## 3. Forbidden Transitions

- No `draft/quoted -> submitted` without payment and durable provider operation.
- No `submission_pending -> second submit intent` while an ambiguous operation exists.
- No print/reprint before confirmed printable mapping.
- No `cancelled` after provider submission from a local-only action.
- No `picked_up` from local operator assertion.
- No estimated-profit eligibility solely from `submitted` or `label_printed`.
- No branch ownership change at any lifecycle point.
- No destructive deletion as a state transition.

## 4. Concurrency Contract

Every state-changing aggregate action requires:

1. server-derived actor and branch scope;
2. current row version or equivalent serialized lock;
3. one database transaction covering state mutation + required audit + outbox/event record;
4. conflict result when the expected version is stale;
5. uniqueness/locking for singular invariants.

### Required conflict scenarios

- two terminals record payment at the same time;
- two terminals click submit;
- admin edits while another terminal confirms final quote;
- two owners decide the same correction request;
- two callbacks/processes consume the same invitation;
- worker and user cancellation race;
- reconciliation applies an older provider result after a newer terminal state.

## 5. Provider Result Ordering

Provider observations carry an observation timestamp/correlation and an adapter-normalized precedence policy. An older or lower-confidence observation MUST NOT silently overwrite a newer authoritative mapping. Ambiguous ordering moves the record to reconciliation rather than guessing.

## 6. Implementation Acceptance

The implementation must expose the transition matrix as one domain-policy owner (module/type/table-driven policy). Route handlers and UI components must not duplicate transition rules independently. Unit tests cover every allowed/forbidden transition; database integration tests cover required concurrency races.
