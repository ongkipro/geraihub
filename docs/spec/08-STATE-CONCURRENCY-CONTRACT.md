# GeraiHub State and Concurrency Contract

## Document Control

| Field | Value |
|---|---|
| Status | Accepted planning contract; runtime implementation pending |
| Version / updated | 1.1 / 2026-09-24 |
| Accountable owner | Engineering owner |
| Authority | Canonical repository specification when merged |
| Related | PR-1 through PR-7, DATA-5 through DATA-10, ADR-003, ADR-004 |

## 1. State Dimensions

Shipment state is deliberately decomposed. Implementations MUST NOT replace these dimensions with one overloaded status field.

### Operational lifecycle

`draft -> quoted -> submission_pending -> submitted -> label_print_requested -> awaiting_pickup -> picked_up`

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
| draft | obtain/select quote | quoted | approved active-branch pickup point; sender/recipient snapshots; at least one valid item; package and provider-required fields valid; provider estimate is valid/current | immutable quote version; current-quote pointer |
| quoted | material shipment edit | draft or quoted-unconfirmed implementation state | expected version | invalidate final quote confirmation; preserve quote history |
| quoted | confirm physical verification/final quote | quoted | verified package fields complete; selected quote current | verification evidence + audit |
| draft/quoted | cancel local draft | cancelled | authorized branch; expected version; no queued, in-flight, confirmed, or ambiguous provider create | local_draft_cancelled + audit; retain quote history |
| quoted | refresh or change quote before submit | quoted | BILL-9; current package/service/COD inputs; fresh estimate and explicit final confirmation | append quote version; preserve prior quote history |
| quoted | submit intent | submission_pending | current version; approved pickup and sender/recipient/item snapshots; exact goods/shipping/intended COD review; provider-supported collection mode and resolved shipping allocation; current confirmed quote/verification; no confirmed/pending/ambiguous provider create; active branch | transactional provider-operation/outbox record with frozen submit inputs |
| submission_pending | provider confirms order | submitted | matching operation/correlation; validated response | provider mapping, audit, sync confirmed |
| submission_pending | ambiguous timeout/result | submission_pending | operation may have reached provider | sync unknown/reconciliation_required; no blind redispatch |
| submission_pending | verified permanent pre-order failure | quoted | provider evidence proves no order exists; quote must be rechecked before retry | failure evidence; safe operator recovery |
| submission_pending | stale quote/configuration detected before dispatch | quoted | atomic operation/lease guard proves no dispatch-start marker and no prior possibly dispatched attempt; no network call can begin after the guard closes the operation | close operation as not dispatched; invalidate confirmation; retain audit/history; require fresh estimate and explicit resubmission |
| submitted/label_print_requested/awaiting_pickup/picked_up | issue invoice | unchanged | confirmed provider resi/mapping and quote version captured at submit; authorized branch; no existing invoice; shipment not cancelled | one immutable invoice and issue audit; no create-order side effect |
| any state retaining an issued invoice, including cancelled | reprint existing invoice | unchanged | authorized branch; existing immutable invoice | reprint audit only; no new invoice or provider order |
| submitted | operator starts confirmed-label print | label_print_requested | confirmed provider mapping; printable state; authorized branch | print-request audit only; no create-order side effect or claim of physical printer completion |
| label_print_requested/awaiting_pickup/picked_up | reprint confirmed label | unchanged | authorized branch; confirmed printable mapping; provider eligibility still valid | reprint audit only; no create-order side effect |
| label_print_requested | await pickup | awaiting_pickup | provider/status policy permits | synchronized status evidence |
| submitted/label_print_requested/awaiting_pickup | request cancellation | unchanged operational state until confirmation | verified eligibility policy; reason; expected version | cancellation request + outbox |
| any provider-submitted eligible state | provider cancellation confirms | cancelled | authenticated/reconciled authoritative outcome | retain original resi/label/invoice/history |
| any provider-submitted eligible state | provider cancellation rejects | unchanged | authoritative rejection | cancellation rejected + audit |
| submitted/label_print_requested/awaiting_pickup | provider pickup confirms | picked_up | verified provider mapping/status event | pickup evidence; eligible for estimate subject to finance gates |

Exact provider status names/eligibility remain T-10 evidence gates.

`label_print_requested` means a confirmed label was handed to the browser/system print flow. It is not physical printer acknowledgement. The UI must say print requested/ready for reprint, never claim the paper was printed solely from this state.

### Quote and document recovery

BILL-9 owns quote recovery. A provider-confirmed no-order failure returns to `quoted`; the operator must check freshness and explicitly reconfirm before another submit. A stale quote blocks submission even if the row version is current. Material changes before dispatch invalidate the prior confirmation and require a new verified quote.

Pickup point, sender/recipient snapshot, item line/declared total, package measurement, service, COD mode, shipping inclusion/allocation, and amount changes are material whenever they affect provider eligibility, label/resi data, or price. The server recomputes item totals and intended courier collection from explicit choices and never trusts a client-supplied aggregate. Goods value, shipping charge, and requested COD amount remain separate money fields. Non-COD requests no courier collection; COD ongkir requests shipping only; COD produk requests goods plus shipping only when included. Provider-specific fees and actual collection are not inferred.

Once submission may have reached Mengantar, material edits and invoice issuance are held until an authoritative outcome is known. After confirmation, the issued invoice snapshots the quote confirmed at submit and the resi; expiry of that quote after submit does not change the charge. A later correction never rewrites the invoice. Replacement issuance remains gated by BILL-4. GeraiHub has no payment state, and local/provider cancellation makes no claim about manual refunds.

`submission_pending`, including timeout, unknown, and an expired worker lease, is never eligible for operator local cancellation. The worker may close a provably never-dispatched stale operation only under the atomic guard above. A durable dispatch-start marker is committed before network I/O; a crash after that marker is potentially dispatched even if no response or resi exists. Otherwise reconciliation must first prove a no-order outcome or confirm the order and use the provider cancellation path. Invoice issuance and provider-result application serialize on the shipment version so an unknown outcome cannot produce a document.

## 3. Forbidden Transitions

- No `draft/quoted -> submitted` without confirmed final quote and durable provider operation.
- No `submission_pending -> second submit intent` while an ambiguous operation exists.
- No print/reprint before confirmed printable mapping.
- No invoice before a confirmed provider resi/mapping or from an unconfirmed quote.
- No COD submission for a provider-ineligible mode, unresolved excluded-shipping allocation, or unconfirmed requested collection amount.
- No `cancelled` after provider submission from a local-only action.
- No `picked_up` from local operator assertion.
- No estimated-profit eligibility solely from `submitted` or `label_print_requested`.
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

- two terminals issue the same invoice at the same time;
- two terminals click submit;
- admin edits while another terminal confirms final quote;
- invoice issuance races provider cancellation or an older provider result;
- two callbacks/processes consume the same invitation;
- worker and user cancellation race;
- reconciliation applies an older provider result after a newer terminal state.
- queue delay expires a quote while two workers race to claim/close the operation;
- account/pickup configuration changes after quote or enqueue; old operations retain their original account binding.

## 5. Provider Result Ordering

Provider observations carry an observation timestamp/correlation and an adapter-normalized precedence policy. An older or lower-confidence observation MUST NOT silently overwrite a newer authoritative mapping. Ambiguous ordering moves the record to reconciliation rather than guessing.

## 6. Implementation Acceptance

The implementation must expose the transition matrix as one domain-policy owner (module/type/table-driven policy). Route handlers and UI components must not duplicate transition rules independently. Unit tests cover every allowed/forbidden transition; database integration tests cover required concurrency races.
