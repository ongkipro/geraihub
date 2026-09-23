# GeraiHub Identity, Authorization, and Privileged Access

## Document Control

| Field | Value |
|---|---|
| Status | Accepted planning policy; runtime verification pending |
| Version / updated | 0.3 / 2026-09-24 |
| Accountable owner | Security owner |
| Applies to | GeraiHub platform staff and whitelisted partner-gerai users |
| Authority | Canonical repository specification; promoted from the retained planning snapshot on 2026-09-23 |

## 1. Authorization Model

A request first resolves a Google OAuth-authenticated identity into a GeraiHub-owned user record, then resolves the operation's permitted platform, organization, or named branch scope. Shipment operations require one authoritative active gerai context; draft-branch setup uses its separate configuration authority and grants no shipment access. Server-side policy then decides the requested action. UI visibility never grants permission. Missing, disabled, ambiguous, stale, or mismatched required grants are denied.

Google is the authentication identity provider, not GeraiHub's authorization database. GeraiHub persists its own stable user ID, OAuth account link (provider subject), memberships, roles, branch scopes, sessions, audit events, and access lifecycle. Google email/name/avatar may be profile attributes; they are never the authorization key, tenant selector, or role claim.

`platform` scope and `gerai` scope are deliberately separate. Platform super-admin access does not automatically confer access to a gerai's shipments or customer data.

### IAM-1 — GeraiHub owns authorization after Google authentication
- Status: Accepted planning policy
- Owner: Security owner
- Source: PR-11, Q-7, OVR-3
- Statement: Validated Google identity resolves to a unique GeraiHub provider-subject link; only approved, active GeraiHub memberships and scoped permissions authorize access. Email/name/avatar never grant a role or link an existing account automatically.
- Acceptance: Execute the synthetic authorization cases in section 8: uninvited login, subject mismatch, cross-branch access, removed membership, and expired JIT all deny without side effects; an invited active member can perform only permitted actions.
- Constraints: TEN-1, SEC-1, SEC-2, SEC-3, SEC-4
- Change history: Existing Google-login and default-deny policy given a permanent requirement ID during planning audit.

## 2. Google OAuth and Account Provisioning

| Concern | Decision |
|---|---|
| Sign-in method | Google OAuth only for MVP. No local password, public self-registration, or email-link flow. |
| Account matching | Link by Google OpenID Connect stable subject (`sub`) stored in GeraiHub's provider-account table; do not match only on mutable email. |
| First login | Default deny. Successful Google authentication creates/links a GeraiHub identity only through a pre-created invitation or approved platform/branch membership flow. It grants no role automatically. |
| Invitations | Platform super admin invites initial organization owner; owner invites gerai admin; gerai admin invites staff-pengiriman. Invitation stores a normalized intended email and expires after a bounded configured period. Acceptance requires Google to assert `email_verified=true` and an email equal to the intended invitation email; the transaction then binds the stable Google `sub`. After binding, later email changes never relink or merge an account automatically. |
| Account removal | Suspend/revoke GeraiHub membership/session; do not depend on deleting/revoking the person's Google account. |
| Google tokens | Do not request or retain Google API access/refresh tokens unless a separately approved feature needs them. Authentication identity is sufficient. |
| OAuth client | One GeraiHub-controlled OAuth client per environment; authorized redirect URIs and trusted origins are explicit allowlists. Client secret stays only in approved server-side secret storage. |

## 3. Roles and Responsibilities

### Controlled platform bootstrap and role provisioning

The first platform super admin is provisioned through an explicit repository/platform-owner-approved, environment-scoped operator procedure, never through public signup or a "first user wins" rule. T-4 must implement a non-HTTP bootstrap command with an exclusive transaction: create one expiring invitation for the approved intended identity only when the environment has never completed bootstrap and no active bootstrap invitation exists. Acceptance uses the same verified Google email and stable-subject binding as normal invitations. Persist bootstrap completion permanently; deleting or suspending the initial administrator must not reopen bootstrap. Reissue an expired unused invitation only through the same approved procedure, invalidating the old invitation atomically.

The procedure records approval reference, operator, environment, intended scope and audit outcome without printing invitation proofs or secrets. The runtime application's database role cannot issue bootstrap invitations or reset bootstrap completion; it may consume only the pre-approved invitation through the constrained acceptance transaction. Synthetic bootstrap tests are local only; real identity provisioning remains a separately authorized operation. Loss of all administrators requires an approved recovery procedure, not automatic re-bootstrap.

| Role to provision | Accountable authority | Grant boundary |
|---|---|---|
| First platform super admin | Repository/platform owner through approved bootstrap procedure | Platform scope only; no tenant operation grant |
| Additional super admin or platform support | Repository/platform owner approves; existing platform super admin executes | Named identity and allowlisted platform role; fresh authentication; audit; no self-escalation |
| Initial organization owner | Platform super admin | One explicit organization; existing invitation contract |
| Branch admin | Organization owner | Selected own branch; no platform/owner grant |
| Staff pengiriman | Branch admin | Selected own branch; no membership administration |
| Finance viewer | Organization owner | Selected own branch, read-only; no organization-wide export or automatic counter permission |

Platform grants are separate from organization/branch memberships; they do not need a fabricated tenant. Suspension/removal revokes their authority on the next protected request. Prevent ordinary removal of the last active platform super admin and last active organization owner; controlled recovery requires a separately approved operator procedure. No application action lets a user approve their own JIT request, even when that user holds several roles.

Initial tenant setup starts with a platform-super-admin-created organization shell and an invitation for its intended initial owner. Owner acceptance grants only that organization scope; the owner then requests/configures a draft branch and assigns its admin, and the platform verifies provider/pickup readiness before activation. An organization awaiting its initial owner grants no operational access. This setup must work from an empty synthetic tenant database after platform bootstrap, without manual insertion of a tenant membership.

T-3/T-4/T-14 must test concurrent bootstrap attempts, consumed/expired/revoked invitations, bootstrap after prior completion, role escalation, last-administrator removal, finance-viewer provisioning, and platform-role revocation.

| Role | Scope | Primary responsibilities | Explicitly not permitted by default |
|---|---|---|---|
| Platform super admin | Platform | Approve/suspend gerai branches; appoint the initial organization owner; govern platform configuration; review integration health, aggregate operational health, audit, and reconciliation queues. | Routine shipment creation/editing, invoice/resi issuance or printing, cancellation, or reading tenant shipment details. |
| Platform support (JIT) | Named gerai, time-bound | Diagnose approved support incident under a visible support-access state. | Permanent access, unapproved tenant access, export, invoice/resi issuance or cancellation. |
| Gerai owner | Organization with one or more authorized gerai branches | Own the business relationship and branch configuration; appoint/remove gerai admins; view organization aggregate reporting and, after selecting an explicit branch context, that branch's operations, audit, reconciliation, and reports. | Platform configuration, any branch outside the organization, authoritative Mengantar financial correction, and cross-branch shipment operations. |
| Gerai admin | Assigned gerai | Run daily gerai operations; manage staff-pengiriman membership; configure permitted local settings; review local shipments, audit, reconciliation, and reports. | Assign owner/platform roles, platform configuration, other-gerai data, authoritative Mengantar financial correction. |
| Staff pengiriman | Assigned gerai | Create and verify shipment; confirm quote; submit; issue/reprint invoice and provider resi when confirmed; request permitted cancellation; resolve assigned operational errors. | User/role management, tenant settings, cross-gerai access, platform settings, settlement correction. |
| Finance viewer | Assigned gerai | Read internal finance estimate, live provider backup, reconciliation mismatch, and eligible shipment/invoice history. | Create/modify shipment, issue invoice/resi, provider submission, cancellation, configuration, exports unless separately approved. |

Role names are an initial product decision; the implementation must authorize stable action permissions rather than scattered role-name checks.

## 4. Permission Matrix

| Resource/action | Super admin | JIT support | Gerai owner | Gerai admin | Staff pengiriman | Finance viewer |
|---|---|---|---|---|---|---|
| Request/configure new branch | Governance review | Deny | Own organization, draft only | Deny | Deny | Deny |
| Approve activation / assign initial owner | Allow: platform | Deny | Deny | Deny | Deny | Deny |
| Suspend branch | Platform policy | Deny | Own organization under lifecycle policy | Deny | Deny | Deny |
| Manage gerai admins | Deny | Deny | Own organization, selected branch | Deny | Deny | Deny |
| Manage finance-viewer membership | Deny | Deny | Own organization, selected branch; read-only role only | Deny | Deny | Deny |
| Manage staff-pengiriman membership | Deny | Deny | Requires separately held branch-admin membership | Own branch | Deny | Deny |
| View tenant shipment details | Deny by default | Approved scope/time, read-only | Explicit own branch | Own branch | Own branch | Read: own branch |
| Create/edit draft, verify/confirm quote, submit, issue/reprint invoice/resi, request permitted cancellation | Deny | Deny | Requires separately held operator/admin membership | Own branch | Own branch | Deny |
| Search/select/create reusable sender/recipient contact | Deny | Deny | Requires separately held operator/admin membership | Own branch | Own branch | Deny |
| Change approved pickup-point configuration or existing directory contact | Deny | Deny | Requires separately held branch-admin membership | Own branch | Deny | Deny |
| View local audit/reconciliation | Aggregate only | Approved read scope | Explicit own branch | Own branch | Own shipment/operational summary only | Read: own branch |
| View estimated profit/report | Aggregate only | Deny | Own organization aggregate or explicit own branch | Own branch | Own shipment charge/invoice summary only | Own branch |
| Override provider financial truth / settlement | Deny | Deny | Deny | Deny | Deny | Deny |

An owner title is not an implicit operator grant. Existing policy grants owners management/report access; a person doing counter work must also hold an approved branch operator/admin membership. JIT remains diagnostic read-only in MVP; mutating support access is out of scope. GeraiHub has no customer-payment action or paid-status authority.

### MVP configuration allowlist

`Permitted local settings` means only the fields/actions below. Unknown configuration fields are denied. All writes validate scope and expected version and emit a redacted audit. Submitted shipment and issued invoice snapshots remain immutable.

| Setting/action | Authority and lifecycle | Guard and effect |
|---|---|---|
| Draft branch identity, address, IANA timezone and initial pickup/origin proposal | Owner, own organization, draft branch configuration context | Validate required values; platform readiness process verifies account/origin mapping before activation. Setup context grants no shipment access. |
| Active branch display identity and timezone | Branch admin in own active branch; owner requires separate admin role | Versioned change; preserve historical invoice identity/timezone and UTC events. Reports explicitly label their selected timezone; no silent historical document rewrite. |
| Pickup point/origin fields and selected default | Branch admin, own active branch | Provider-relevant changes invalidate readiness until reverified under the account/origin gate, then invalidate affected draft quotes. Changes never retarget queued or submitted snapshots. Staff may select an already approved point only. |
| Existing directory contact fields | Branch admin, own active branch | Explicit directory update, expected version, bounded fields; editing a draft copy does not update this entry or past shipments. |
| Provider-account identity/mapping | Platform readiness process with account-owner evidence | Not a generic local settings field. Pin mapping/version to quotes and operations; account replacement and secret rotation follow Data Model section 4. Credentials never enter browser settings. |
| Memberships, activation, suspension and JIT | Exact authority in the permission/provisioning matrices | No generic settings endpoint may bypass the named approval/lifecycle rules. |

Read-only suspended/retired history does not allow these configuration writes. Lifecycle administration uses its separate permission. General branding, rate/fee editing, public registration, settlement overrides, and unrestricted exports are not part of this settings surface.

## 5. Sensitive Action Rules

| Action | Preconditions | Required audit evidence | Recovery |
|---|---|---|---|
| Quote confirmation | Final verification complete; amount/customer charge is visible | Actor, gerai, shipment, quote version, amount representation, time | Material edits invalidate confirmation; a stale quote cannot be submitted. |
| Submission/retry | Authorized gerai; no confirmed prior submission; provider request idempotency key | Actor, transition, correlation, provider outcome | Reconcile provider state before another attempt |
| Invoice/resi issue or print/reprint | Issue invoice only from confirmed provider mapping and submit-time quote on non-cancelled shipment; existing invoice may be reprinted after cancellation; printable provider state for label | Actor, invoice/label/resi reference, issue/reprint flag | Reprint never submits again or creates a second invoice |
| Cancellation | Current state and provider eligibility checked; operator gives reason | Actor, reason code, requested/authoritative provider outcome, correlation | Pending/rejected outcome remains visible; no local false-success |
| JIT support access | Ticket/purpose, named gerai, non-requester platform-super-admin approver, maximum 60-minute expiry | Grant, every accessed resource/action, automatic expiry, review | Revoke immediately; review access log |

### 5.1 JIT approval policy

- A platform-support user requests access to one named branch with a ticket/purpose.
- A platform super admin who is not the requester approves or rejects it.
- Maximum grant duration is 60 minutes; shorter duration is preferred.
- The grant is read-only for shipment/customer diagnostics in MVP. No invoice/resi issuance, submit, print, cancellation, export, role mutation, or provider-financial mutation is authorized.
- A fresh session no older than the ADR-005 freshness window (planning default: 15 minutes) is required at grant activation; otherwise re-authenticate through Google.
- Expiry and revocation are enforced on the next protected request, not merely hidden in the UI.
- The requester may end support without a fresh-session challenge. Expiry, session loss or ending support clears the diagnostic view; failure to confirm server-side closure is shown as unconfirmed, never as successful revocation. Reentry always revalidates the grant and session.
- If no distinct approver is available, tenant-detail JIT access remains unavailable; there is no self-approval emergency bypass in MVP.

## 6. Super-Admin Operating Boundary

The super-admin console is a governance and exception-control surface, not a second operational shipment console. Its initial modules are:

1. gerai branch approval/lifecycle and initial organization-owner assignment; owner manages branch-admin assignment;
2. platform integration health and provider-sync failure queue;
3. aggregate operational health and non-authoritative reconciliation exceptions;
4. audit search and export controls subject to privacy policy;
5. time-bound support-access approval/review.

A super admin may see minimum metadata needed to triage a tenant issue. Opening customer/shipment details requires approved JIT support scope, a visible banner, expiry, and immutable audit. Bulk actions, impersonation, permanent cross-tenant membership, and provider-financial overrides are out of scope until separately specified.

## 7. Identity Lifecycle

- Google OAuth callback success alone creates no membership, role, active branch, or access to shipment/customer data.
- Only platform-authorized staff can provision a gerai and its initial gerai owner.
- A gerai owner can appoint/remove gerai admins only for an explicitly selected branch within the authorized organization.
- An organization owner may view an aggregate dashboard/report across authorized branches, but shipment search, customer details, invoice/resi issuance, print, submit, correction, and cancellation always require one explicit branch context. No cross-branch operational queue or bulk operational action is permitted.
- Gerai admins can invite, suspend, and remove staff-pengiriman only within their authorized gerai.
- Suspended users and removed memberships are denied on the next protected request using authoritative membership state. ADR-005 accepts database-backed Better Auth sessions, no session cookie cache for MVP, a 12-hour planning expiry, 1-hour refresh age, and 15-minute freshness window; T-4 must verify the exact installed configuration.
- Account recovery never matches by email alone. Branch admins may revoke/reinvite only staff memberships within their own branch; they cannot change a global provider-subject link or another branch's grant. A global identity-link recovery uses the repository/platform-owner-approved operator procedure, verifies the intended identity and affected scope, revokes affected sessions/context, and records the old/new identity references and reason without secrets. Recovery does not transfer other memberships automatically; each grant follows its provisioning authority. Automatic merging of two Google subjects is prohibited.

### Session exit and recovery

Sign-out uses the maintained auth framework to revoke the current session and its server-owned context, clear sensitive client state, and return to sign-in. A late response from the old context must not repopulate the UI. A failed sign-out request reports that session revocation is unconfirmed and offers retry; clearing a browser screen alone is not revocation. Warn before intentionally leaving an unsaved form. Do not persist shipment PII in browser storage to survive logout or expiry.

On session expiry, hide protected data and return to sign-in. After authentication, resolve current grants and branch afresh, reopen only an authorized server-saved draft, and require explicit confirmation before any mutation. Never auto-replay submit/cancel/print after reauthentication. Users with platform-only grants go to governance or the limited support workspace without needing a fabricated branch membership; owners without branches go to organization/branch setup. A user with several scopes chooses a permitted workspace explicitly.
- A user may not self-assign a higher role, select another tenant through the client, or preserve access after membership removal.

## 8. Required Authorization Tests

| Test ID | Scenario | Expected result |
|---|---|---|
| IAM-T1 | Operator tampers with shipment/gerai ID for another gerai. | Deny/no data/no side effect; audit security event. |
| IAM-T2 | Finance viewer attempts invoice/resi issuance, submit, print, or cancellation. | Deny/no side effect. |
| IAM-T3 | Super admin accesses a tenant shipment without JIT scope. | Deny/minimum aggregate metadata only. |
| IAM-T4 | Expired/revoked JIT support session retries an action. | Deny and audit. |
| IAM-T5 | A reprint request is replayed or sent for an unsubmitted draft. | No new provider submission; deny invalid state. |
| IAM-T6 | User removed by gerai admin uses an existing session. | Deny on the next protected request; audit without exposing session data. |
| IAM-T7 | A valid Google-authenticated account has no GeraiHub invitation/membership. | Deny application access; no default branch or role is created. |
| IAM-T8 | An attacker changes/uses a matching email but has a different Google provider subject. | Do not attach to an existing GeraiHub account; require controlled account-link/recovery flow. |
| IAM-T9 | OAuth callback has an unapproved redirect/origin/state/PKCE validation failure. | Deny callback, create no session/membership, and emit a safe security event. |
| IAM-T10 | A multi-branch user switches A → B, then replays a stale branch-A tab/context request. | Deny/no branch-A disclosure or mutation; current server context and immutable resource ownership are revalidated. |
