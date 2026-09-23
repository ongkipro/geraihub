# GeraiHub Tenant and Branch Isolation Strategy

## Document Control

| Field | Value |
|---|---|
| Status | Accepted isolation contract; runtime verification pending |
| Version / updated | 0.3 / 2026-09-24 |
| Accountable owner | Security owner |
| Decision | An owner organization can operate multiple gerai branches; each operational request has exactly one active branch context. |
| Authority | Canonical repository specification; promoted from the retained planning snapshot on 2026-09-23 |

## 1. Boundary Model

- **Organization** is the business ownership boundary. One owner may control one or more branches.
- **Gerai branch** is the operational and data-access boundary for physical package handling, invoice/resi issuance, printer use, pickup, shipment search, cancellation, and customer information.
- A user has one identity and one or more memberships. Membership role is scoped to an organization or a branch according to IAM.
- A user is never duplicated merely because they are assigned to another branch.
- A branch is not chosen from a browser-provided `gerai_id`; the backend resolves it from a selected context plus verified membership.

| ID | Owner | Requirement | Enforcement | Evidence |
|---|---|---|---|---|
| TEN-1 | Security owner | Every operational shipment request MUST resolve exactly one authorized active branch before data access or mutation. | Server authorization/request context | Cross-branch tamper test |
| TEN-2 | Security owner | Shipment, draft, invoice, print, provider mapping, audit event, reconciliation item, and internal-finance estimate MUST be owned by one immutable branch. | Database key/foreign key + scoped query policy | Schema/integration test |
| TEN-3 | Security owner | Organization aggregate reporting MAY span its authorized branches, but cannot expose a cross-branch operational queue or authorize a cross-branch shipment mutation. | Separate aggregate read model + action policy | UI/API authorization test |
| TEN-4 | Security owner | A short customer draft reference or QR MUST resolve only after branch context and a qualified lookup path are authorized; it must not become an enumeration endpoint. | Opaque reference, scoped lookup, rate limit, minimized pre-verification result | Abuse/IDOR test |
| TEN-5 | Security owner | Platform staff have no routine branch shipment access; support access is explicit, tenant/branch-bound, expiring, and audited. | JIT policy | Support access test |

### TEN-6 — Context freshness across entry points
- Status: Accepted planning contract
- Owner: Security owner
- Source: TEN-1, SEC-6; context rules below
- Statement: Branch switching must invalidate branch-sensitive client state; every subsequent read, mutation, cache lookup, and background job must validate current authorization and persisted resource ownership. A stale tab/context must never silently operate on another branch.
- Acceptance: Switch a two-branch synthetic member from branch A to B, replay the old tab request and a mismatched job, and verify no cross-branch disclosure or mutation; the job is quarantined.
- Constraints: TEN-2, SEC-1
- Change history: Existing context-resolution rules consolidated into a traceable requirement during planning audit.

## 2. Context Resolution

| Entry point | Authoritative branch resolution | Failure behavior |
|---|---|---|
| Web operator mutation | Authenticated membership + selected active branch stored/validated server-side | Deny when missing, disabled, stale, or unauthorized |
| Suspended/retired branch history read | Freshly selected server-owned read-only branch context + current read permission | Deny mutations and revoked memberships; never reuse the former operational context |
| Branch switch | User selects from their authorized memberships only | Refresh authorization context; no silent fallback to previous/default branch |
| Shipment, contact, and pickup-point route/search/reference | Active authorized branch plus scoped resource lookup | Return not found/deny without another branch metadata; contact and pickup IDs never select another branch |
| Background provider sync/job | Persisted shipment branch ownership, revalidated by worker | Quarantine mismatch; never reassign automatically |
| Platform aggregate view | Organization/platform policy and explicit aggregate query | Read aggregate only; branch detail/action requires JIT/selected branch policy |

Rules:

1. The active branch is visible in the UI header and dangerous-action confirmation.
2. A branch switch clears branch-specific list/search state and cached sensitive records.
3. `organization_id` never substitutes for `branch_id` in an operational mutation.
4. Cache, idempotency, locks, rate limits, exports, audit, and telemetry carry organization and branch scope where applicable.
5. Deleted/suspended branch IDs are never reused.

## 3. Membership and Privileged Access

| Actor | Scope | Branch rule |
|---|---|---|
| Gerai owner | Organization | May switch only to a branch belonging to the organization; aggregate reporting allowed. |
| Gerai admin | Assigned branch | Cannot switch to an unassigned branch. |
| Staff pengiriman | Assigned branch(s) | May be assigned to multiple branches for relief/roving work, but defaults to one and works in one explicit active branch at a time. |
| Finance viewer | Assigned branch(s) | Read-only, branch scoped; organization aggregate access requires explicit owner/finance policy. |
| Platform super admin | Platform | Aggregate governance only by default. |
| JIT support | Named branch and duration | Visible support mode; no unbounded organization access. |

## 4. Branch Lifecycle

| Transition | Authority | Operational effect | Data/access effect | Audit |
|---|---|---|---|---|
| Create branch | Organization owner requests; platform super admin approves activation | No shipment activity until provider-account, pickup, and readiness checks pass | Create draft branch; assign admin(s); no user duplication | Request, approval/rejection, and membership event |
| Active → suspended | Owner/platform policy | New shipment/submit/invoice/print/cancel actions blocked; existing records readable by permitted roles | Invalidate operational context/version; retain identity login and read memberships unless independently revoked | Reason/actor/time |
| Suspended → active | Owner requests reactivation; platform super admin approves under IAM activation permission | Resume only after configuration/integration readiness checks; an owner cannot undo platform suspension directly | Restore eligibility only for memberships still active; do not resurrect revoked grants | Request and activation event |
| Retire branch | Approved owner/platform process | No new operational mutations; historical records retained | Retain branch ID/ownership for audit and privacy lifecycle | Retire reason/evidence |

Whether a branch has one or multiple printer/pickup-address configurations is an implementation/configuration decision; branch ownership remains unchanged.

Suspension changes action eligibility, not record ownership. After invalidation, an authorized user may explicitly select that branch in read-only history mode. The server derives this mode from branch lifecycle and current membership, persists the context/version, and allows only scoped historical reads. It never accepts a client-provided read-only flag as authority. UI shows the suspended/retired state; invoice/resi issuance, print, export, correction, cancellation, submit, and configuration mutations remain denied. Branch lifecycle administration uses its separate owner/platform permission, not the history context. Revoked users/memberships receive no historical access.

Workers stop new side-effect dispatch on suspended/retired branches. Already dispatched or ambiguous operations retain their correlation and may receive verified read-only reconciliation results, preserving history without initiating another create/cancel. Invalidation races must be tested: a request committed before suspension may already have caused a provider side effect; suspension never pretends to undo it.

## 5. Required Isolation Tests

| Test ID | Adversarial action | Expected result |
|---|---|---|
| TEN-T1 | Staff alters a shipment route ID from branch A to branch B. | No data or mutation; security audit. |
| TEN-T2 | Owner requests aggregate report then attempts print/cancel through aggregate identifier. | Aggregate read allowed; operational action denied until explicit branch context and authorization. |
| TEN-T3 | Multi-branch staff switches branch then uses stale browser search/detail state. | Branch-specific cache/list is cleared; old record cannot be read/mutated. |
| TEN-T4 | Provider job carries a mismatched shipment and branch mapping. | Quarantine/reconciliation alert; no automatic reassignment. |
| TEN-T5 | Unauthenticated or wrong-branch user probes a short pre-fill reference. | No draft existence/PII disclosure; rate-limit/audit behavior applies. |
| TEN-T6 | JIT support expires mid-session. | Subsequent detail/action denied and expiry is audited. |
