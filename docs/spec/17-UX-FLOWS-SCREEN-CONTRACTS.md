# GeraiHub UX Flows and Screen Contracts

## Document Control

| Field | Value |
|---|---|
| Status | Accepted UX planning contract; implementation/browser evidence pending |
| Version / updated | 0.3 / 2026-09-24 |
| Primary surface | Indonesian gerai operator web application |
| Primary input | Desktop/tablet, keyboard, barcode/QR scanner where available |
| Authority | Canonical repository specification; promoted from the retained planning snapshot on 2026-09-23 |

## 1. Experience Direction

GeraiHub is an operational counter tool, not a consumer checkout. The primary user is under time pressure with a physical package and customer present. The UX prioritizes: a single obvious next action, fast keyboard data entry, visible verification state, provider-sync certainty, safe reprint, and reversible correction before submission.

Use Bahasa Indonesia, `id-ID` currency formatting, and a confirmed business-timezone policy. The UI must distinguish clearly between GeraiHub operational records and Mengantar-authoritative information.

### UX-1 — Safe counter and governance screen contract
- Status: Accepted planning contract
- Owner: Design owner
- Source: PR-1 through PR-11; NFR-2; IAM-1
- Statement: Implement the MVP journeys, screen states, and role boundaries in sections 2–5 and 7; section 6 is post-MVP only. Reusable presentation/accessibility follows the design-system document.
- Acceptance: Execute section 8 scenarios 1–7 and 9–13 plus TEST-1 against synthetic fixtures; wrong-branch and unprivileged actions deny, pending outcomes remain visible, and reprint never resubmits. Scenario 8 is deferred.
- Constraints: TEN-1 through TEN-6; UI-1 through UI-6
- Change history: Existing screen contracts assigned a canonical requirement during planning audit.

## 2. Information Architecture

### Gerai operator/admin navigation

- **Proses kiriman** — start a shipment; continue a local draft.
- **Daftar kiriman** — queue/search/filter by operational state, resi, sender, and date within the gerai.
- **Detail kiriman** — timeline, provider sync, print/reprint, cancellation/correction states.
- **Rekonsiliasi & keuangan** — non-authoritative Mengantar backup, mismatch queue, estimated profit; role-gated.
- **Gerai saya** — owner switches an explicitly selected branch, manages branches and their gerai admins; gerai admin manages staff-pengiriman and permitted settings only for the active branch.

### Platform super-admin navigation

- **Gerai** — review/activate/suspend gerai branches and appoint initial organization owners; owners manage branch admins.
- **Kesehatan integrasi** — aggregate provider health and sync failure queue.
- **Rekonsiliasi** — aggregate exception monitoring, never financial override.
- **Audit & akses bantuan** — audit search; JIT support approval and review.

Super admin does not receive the operational *Proses kiriman* workflow by default.

## 3. Core Operator Journey

| Step | Operator goal | Required behavior | Failure/recovery |
|---|---|---|---|
| 1. Start/pickup point | Begin in the active gerai | Show the approved pickup point name/address and readiness; allow only an approved same-gerai alternative if configured. | An inactive/missing/unmapped point blocks estimate/submit with an actionable branch-configuration message; never silently use another gerai. |
| 2. Sender | Select existing or enter new sender | Branch-scoped bounded search by name/phone; show masked matches, then reveal the chosen contact in the authorized draft. New-entry form captures only required fields and offers explicit save-for-reuse. | No match leads to new entry; duplicate names require disambiguation, never automatic merge. |
| 3. Recipient | Select existing or enter new recipient | Same branch-scoped search/new-entry pattern, with recipient address and contact review independent of sender. | Switching selection warns before replacing unsaved edits; wrong-branch references deny without disclosure. |
| 4. Shipped items | Describe parcel contents and value | Add one or more item rows with description, positive quantity, declared unit value, computed line totals and declared-goods total. | Inline validation for empty item, invalid/overflow quantity/value; changing a row invalidates quote confirmation. |
| 5. Package, service, and collection mode | Choose delivery and who collects what | Enter/verify weight and dimensions; default to non-COD. Offer COD ongkir or COD produk only for verified eligible services. COD produk exposes a separate `Ongkir ikut COD?` choice; if not, show and require confirmation that the sender handles shipping manually at the gerai. | Ineligible COD option is unavailable with reason; provider failure keeps draft; changing mode/inclusion resets estimate and confirmation. |
| 6. Final review | Confirm shipment and collection instruction | Show pickup point, sender, recipient, item/goods total, service, shipping charge, mode, shipping allocation, intended courier COD collection, and separate estimated COD fee (3.33% of COD amount) as distinct labeled rows; require explicit verification and quote confirmation. | Changed origin/contact/item/package/mode/inclusion/charge requires revalidation; fee rounding/payer remain visibly unverified, and no gerai paid status is collected. |
| 7. Submit | Create provider order safely | Enter `submission pending`; use idempotent submit; show progress. | Timeout/unknown becomes reconciliation state, not automatic repeat submit. |
| 8. Issue documents | Hand customer invoice and label/resi | When the confirmed provider label is printable, offer one `Cetak resi + invoice` action that issues the invoice once and previews both documents before printing. | If one print job cannot preserve the provider label format, guide two ordered print steps. Printer failure leaves both document identities intact for reprint, without a new submission. |
| 9. Monitor | Follow pickup and exceptions | Status/timeline records provider sync, pickup, cancellation, and mismatch outcomes. | Clear retry/escalation ownership. |

The sender and recipient selectors are shipment-entry conveniences, not the post-MVP public draft/reference lookup. Both operate only after staff login and active-branch authorization. Each selected contact becomes an editable draft snapshot; the review distinguishes an unsaved shipment edit from an explicit directory update. The UI never searches another gerai's contact directory or assumes that a phone number uniquely identifies a person.

Mode labels are `Non-COD` (preselected), `COD ongkir`, and `COD produk`. Do not show a generic COD checkbox with an unexplained amount. For COD produk, show the exact goods component, optional shipping component, and courier-requested sum before submit. If shipping is excluded, show `Ongkir ditangani pengirim di gerai (manual)` without suggesting it is already paid. The invoice and resi preview preserve the same mode/allocation and do not turn a requested courier collection into a completed payment.

For either COD mode, show `Estimasi biaya COD (3,33% dari nominal COD)` beside its base and rate, separate from `Ditagih kurir`, `Ongkir`, and `Nilai barang`. Do not show a precise rounded fee or net received amount for fractional-rupiah estimates until GATE-COD-FEE resolves rounding and fee payer. Non-COD hides the COD fee row or shows `Tidak ada`; changing the COD base refreshes the estimate without asserting the provider's actual fee.

## 4. Cancellation and Correction Journey

| Situation | Allowed user path | Required UI truth |
|---|---|---|
| Wrong input before submission | Edit the draft; quote must be revalidated when affected fields change. | No resi/provider order or invoice is implied. |
| Stale or changed quote | Follow BILL-9: require a fresh quote and explicit confirmation before submission. | No payment assertion or invoice is created. |
| User abandons an unsubmitted draft | Cancel draft with reason. | Audit preserved; no provider cancellation request. |
| Resi printed or order synchronized | Choose **Ajukan pembatalan**, supply reason, and confirm the correct shipment. | Show `cancellation pending`; do not claim cancelled until Mengantar confirms. |
| Provider rejects/does not support cancellation | Show authoritative rejected/unknown outcome and next support route. | Printed label is not silently invalidated. |
| Provider cancellation succeeds | Mark cancelled and preserve original resi, invoice, provider result, actor, reason, and time. | Never delete shipment/finance history or imply a manual refund. |

Cancellation, document issuance/reprint, and final submit are sensitive actions. Each needs a compact confirmation naming the shipment and consequence; confirmation is not a substitute for provider state validation.

## 5. MVP Screen Contracts

### A. Proses kiriman

- **Purpose:** finish exactly one physical counter shipment safely.
- **Primary action:** move through pickup point → sender → recipient → items/package → delivery/COD mode → estimate → final review → submit → `Cetak resi + invoice`.
- **Layout:** persistent compact shipment summary and final quote; step content has one primary action. Avoid dashboard widgets.
- **States:** initial; draft saved; validating; estimate loading/no service/provider error; verification incomplete; quote changed; submission pending/failed/unknown/confirmed; invoice/resi unavailable or issued.
- **Accessibility:** semantic field labels/errors, keyboard step order, visible focus, scanner input does not trap focus, no color-only eligibility/status.

### B. Daftar kiriman

- **Purpose:** locate an existing shipment and resolve operational work.
- **Priority:** state, created/updated time, sender/recipient summary, destination, service, provider resi when available, sync/cancellation flag.
- **Actions:** open detail; resume eligible draft; filters for needs-attention, pending provider sync, print-requested/awaiting-pickup, cancellation pending, and picked up.
- **Safety:** all results are tenant-scoped. Search must never disclose another gerai's result.

### C. Detail kiriman

- **Purpose:** understand authoritative and internal state before an action.
- **Priority:** current operational state; final quote/customer charge; Mengantar sync state and resi; invoice and label actions; immutable timeline; cancellation section; financial-estimate disclaimer.
- **Actions:** prepare both valid documents from one print action; reprint invoice or label separately; request cancellation according to state; retry only a safe reconciliation-supported action.
- **States:** loading; denied/not found; provider pending/unknown; cancellation pending/rejected/succeeded; label unavailable.

### D. Rekonsiliasi & keuangan

- **Purpose:** find discrepancies, not replace Mengantar financial truth.
- **Priority:** explicit banner “Mengantar adalah sumber keuangan resmi”; last successful synchronization; mismatch queue; eligible internal estimated-profit report.
- **Rules:** internal profit includes only confirmed picked-up shipments. Amounts remain estimates and are never editable into provider truth.
- **Permissions:** owner/admin/finance per IAM; staff sees only its own branch's shipment charge and invoice summary, not estimated-profit/provider settlement controls. Platform aggregate view is separate.

### E. Gerai and user management

- **Purpose:** keep business ownership, daily gerai administration, and counter operations separated.
- **Role hierarchy:** platform super admin → organization/gerai owner → gerai admin → staff pengiriman. An owner can belong to multiple branches, but each operational screen has one explicit active-branch context.
- **Actions:** owner switches branch, appoints/suspends/removes that branch's gerai admins, and sees aggregate organization reporting; gerai admin invites/suspends/removes staff-pengiriman and edits permitted settings only for the active branch. Display role impact before save.
- **Branch safety:** aggregate reports may combine branches, but shipment search, customer details, create/edit, invoice/resi issuance, submit, print, cancel, and correction never combine branches. The active branch is persistent and visible in the header and every destructive-action confirmation.
- **Safety:** no role may assign a higher/platform role, modify another gerai, or silently retain an existing session; every membership/role change is audited.
- **Settings:** use only the IAM configuration allowlist. Provide an admin-only explicit directory-edit action from the selected contact or Gerai saya; distinguish it from editing this shipment's draft copy. Version conflicts require reload/review, not overwrite. Owner reactivation requests go to platform approval.

### F. Super-admin governance

- **Purpose:** govern platform/tenant health without routine access to customer shipments.
- **Actions:** approve activation/suspend branches, appoint the initial organization owner, inspect aggregate integration/reconciliation health, search audit, and approve/revoke JIT support under the approved approver policy.
- **JIT support:** requires reason, named gerai, approved duration, visible support state, auto-expiry, and per-action audit.
- **Support workspace:** a support-only user sees their own request/status and approved diagnostic workspace; they do not inherit platform governance menus. Request, review, rejection, fresh-session activation, expiry, revoke, and end-support all have explicit states. The approver is a distinct platform super admin; no available approver means no tenant detail. Activation cannot restart the expiry timer.
- **Excluded:** routine shipment processing, invoice/resi issuance, cancellation/print, financial overrides, and unbounded exports.

## 6. Post-MVP Customer Pre-fill Contract

Customer pre-fill creates a provisional draft, not a checkout. Completion presents a short non-sequential, human-readable reference and QR containing that same reference. At the gerai, scan QR or enter/search the reference to open the same draft. Operator-only fallback uses sender phone or sender name plus the last four phone digits; name-only search is prohibited.

Before revealing full details or processing, show masked sender contact, destination area, and draft status and require operator/customer confirmation. Operator repeats physical verification and final quote/submit flow. The Mengantar resi is distinct and appears only after successful submission. WhatsApp reference delivery is optional/deferred and cannot be required for service.

## 7. State and Permission Summary

| State | Operator | Gerai admin | Finance viewer | Super admin |
|---|---|---|---|---|
| Draft / quoted | Edit, cancel | Edit, cancel | Read only if allowed | No tenant detail by default |
| Quoted, no possible provider order | Submit with current confirmed quote or safely cancel local draft | Same guards | Read only if allowed | Aggregate health only |
| Submission pending / unknown | Read/reconcile; no duplicate submit or local cancel | Read/reconcile | Read | Aggregate health only |
| Submitted / label print requested | Issue/reprint invoice/resi; request permitted cancellation | Same | Read | No default detail/action |
| Cancellation pending/rejected | Read provider outcome; escalate | Read/escalate | Read | Aggregate health/JIT only |
| Picked up | Read shipment; no estimated-profit report permission | Read/report | Read/report | Aggregate report only |

Eligibility is a shipment rule, not a staff reporting permission. Owner permissions and any separately held counter role follow the canonical IAM matrix.

Suspended/retired branches offer explicit read-only history selection under Tenant Isolation section 4. Show branch lifecycle and mode persistently; deny print/export and all operational mutation controls on server and UI. After suspension or a context change, discard stale data/actions and require fresh context selection. Role management includes owner-controlled branch finance viewers; platform provisioning follows IAM section 3, with no public bootstrap screen.

### Invoice history

The shipment detail shows the confirmed charge, invoice reference, issue time, resi and reprint action. It never labels an invoice paid or exposes a customer-payment entry form. An existing invoice remains reprintable after pickup or cancellation; a cancelled shipment cannot issue a new invoice and shows cancellation context separately. Post-issue replacement stays unavailable until the Finance/Product policy in BILL-4 is approved.

The counter print preview names the active gerai and resi, shows a distinct invoice and provider label, and offers one primary `Cetak resi + invoice` flow plus separate reprint controls. The invoice print layout supports A4 and 80 mm receipt media without clipping references, amounts, or long names; the provider label keeps its required format. If media differ, show two ordered print steps from the same screen. It must not auto-open multiple browser print dialogs or imply that closing a dialog completed printing. On printer/browser failure, show how to retry either existing document. The browser does not persist a paid or physically printed assertion.

## 8. Browser Acceptance Scenarios

1. At desktop and tablet widths, an operator completes a valid shipment using keyboard navigation, sees the final quote before submit, and issues invoice/resi only after provider confirmation.
2. A provider timeout yields a visible pending/reconciliation state; retry does not create a duplicate confirmed shipment.
3. Reprint from a confirmed shipment does not invoke order creation.
4. The counter action previews both documents and survives a cancelled print dialog or printer failure without creating another invoice/resi; A4/80 mm invoice and provider-label media remain legible and unclipped, using ordered print steps where needed.
5. An operator cannot locate or mutate a shipment from another gerai by URL or search.
6. A cancellation after a label print request remains pending until mocked/verified provider outcome and retains the original audit timeline.
7. A super admin cannot open a tenant shipment without approved JIT support; the access state is visible and expires.
8. In the post-MVP fixture, QR and manual short-reference lookup open the same draft; a name-only search is unavailable.
9. In an MVP counter fixture, an operator chooses an approved pickup point, selects an existing sender, creates a new recipient, enters two item rows, reviews exact declared-goods and separate shipping/COD amounts, then submits; a wrong-branch contact and a changed item after quote confirmation are denied until corrected/reconfirmed.
10. With a non-COD eligible service, non-COD is preselected and no courier collection or COD fee is requested. COD ongkir requests shipping only. COD produk shows goods total with shipping included or excluded as selected; each COD variant shows a separate 3.33% fee estimate on its requested COD base. Every change forces re-estimate/reconfirmation. An unsupported courier/mode or COD produk with shipping excluded cannot submit until sender-at-gerai allocation is confirmed, and the invoice never calls requested COD `paid`.
11. Platform-only login lands in governance or the limited support workspace without a branch membership; an owner without branches lands in setup. Sign-out/expiry clears protected state, rejects stale requests and late responses, and reauthentication never replays submit/cancel/print. A failed sign-out shows revocation uncertainty and retry; unsaved data never enters browser storage.
12. Branch staff cannot update a saved directory entry; a branch admin can update it with current version, receives a conflict on stale edit, and sees unchanged saved shipment and invoice snapshots. Changing pickup configuration blocks affected stale quotes until readiness/review is restored. Owner cannot directly reactivate a suspended branch.
13. A support requester submits and views their own JIT request, cannot approve it, and activates only a distinct approver's valid grant with fresh authentication. Rejection, missing approver, wrong requester, expiry and revoke all deny tenant detail; ending support clears its branch detail without granting counter privileges.

## 9. MVP Development Screen Map

Screen IDs are stable planning identifiers, not invented URLs. T-1/T-9 choose actual routes and record their mapping here before implementing navigation. Each screen has a direct entry or an explicit parent; loading, empty, denied, expired-session, stale-branch, and service-error states must have a safe destination. The active branch remains visible on every tenant screen.

| Screen ID / surface | Entry and exit path | Main data and state | Role / implementation owner | Evidence |
|---|---|---|---|---|
| S-01 Sign-in/invitation | Unauthenticated entry → S-02 for branch roles, S-08 for owner setup, S-09 for platform/support, or denied/recovery | Google identity, invitation result, explicit workspace choice for multiple scopes; no public bootstrap | T-4 | TEST-3, browser 11, auth negatives |
| S-02 Branch context | Header switcher → S-03/S-04 or read-only history | Active branch, lifecycle, permitted memberships, JIT indicator | T-5, T-9 | TEST-4, browser 5 |
| S-03 Proses kiriman | Main nav or eligible S-04 draft → S-05 after submit | Pickup → sender → recipient → items/package → mode/service → quote/review; local draft and unknown outcome | T-7 to T-9, T-11 | Browser 1, 2, 9, 10; TEST-1/2 |
| S-04 Daftar kiriman | Main nav → S-05 or resume S-03 | Branch-scoped search, state filters, pagination, empty/error | T-9 | Browser 5, TEST-4 |
| S-05 Detail kiriman | S-03 submit or S-04 result → S-06 print or cancellation state | Operational/provider status, immutable history, charge, invoice/resi availability | T-9, T-11, T-13, T-21 | Browser 2–6; TEST-2 |
| S-06 Counter print preview | S-05 or confirmed S-03 → return S-05 | One pack action, separate immutable invoice/label previews, media-aware print/reprint | T-12, T-21 | Browser 1, 3, 4 |
| S-07 Rekonsiliasi & keuangan | Role-gated nav → scoped shipment S-05 when permitted | Provider-source freshness, mismatch, estimated-profit eligibility | T-15, T-22 | TEST-5, finance browser cases |
| S-08 Gerai saya / anggota | Role-gated nav or owner setup → S-02 or member/branch detail | Branch lifecycle, allowlisted configuration, directory edit, invitations, membership | T-14 | TEST-3/4, browser 12, role matrix |
| S-09 Platform governance / support | Role-gated nav → aggregate governance for super admin, own JIT requests/diagnostics for support | Default aggregate, activation, JIT request/review/activation/expiry; tenant detail only under diagnostic grant | T-16 | Browser 7/11/13, TEST-3/4 |

S-03 steps and S-06 preview may share a route with their parent; preserve the ID and testable state boundary. S-07 estimated profit cannot claim finality while T-10 finance evidence, pickup mapping, or formula approval is open. The post-MVP QR/manual lookup in section 6 has no MVP route or button.

## 10. Action and Navigation Register

Every visible menu, button, row link, form submit, and keyboard equivalent must resolve to an action below or to a documented read-only navigation in section 9. The table records product behavior; the internal operation names are from the API specification, not wire endpoints. `Own branch` means current server-owned context plus object ownership and lifecycle checks. The IAM matrix remains authoritative for each role; an owner needs a separate counter membership for counter actions.

| Action ID / control | Screen → result | Guard / backend operation | Failure, feedback, and evidence |
|---|---|---|---|
| A-01 Sign in / accept invitation | S-01 → role-appropriate S-02/S-08/S-09 or denial | Approved identity/invite/grant; read context, accept invitation; T-4 | Expired/uninvited returns safe recovery; TEST-3/browser 11 |
| A-02 Switch branch / open history | S-02 → scoped S-04 or read-only S-05 | Membership and lifecycle; switch active branch; T-5 | Clear stale state, refuse old-tab writes; TEST-4/browser 5 |
| A-03 Start/resume/save draft | S-04/S-03 → S-03 | Own branch, editable state; create/read/update draft; T-7/8/9 | Preserve unsaved fields, show validation/denial; browser 1/9 |
| A-04 Select pickup | S-03 → next step | Approved same-branch point; read/select pickup; T-7/8/9 | Missing/mismatched point blocks quote; browser 9 |
| A-05 Search/select/new sender or recipient | S-03 → next step | Bounded own-branch contact read/create; T-7/9 | Mask matches, no cross-branch disclosure, preserve edits; browser 5/9 |
| A-06 Add/edit/remove item and package | S-03 → recalculated review | Own editable draft; item/draft operations; T-7/8/9 | Inline errors, exact totals, quote invalidation; browser 9/10 |
| A-07 Select service/mode/shipping allocation | S-03 → quote required | Verified eligibility and explicit COD choice; select mode; T-8/9/10 | Unsupported mode disabled with reason; browser 10 |
| A-08 Verify package/request or refresh estimate | S-03 → quote options | Physical checks, valid draft; estimate/refresh quote; T-8/9/11 | Timeout/stale quote retains draft and blocks submit; TEST-2/browser 1/2 |
| A-09 Confirm quote/final review | S-03 → submit-ready | Current version, amount and collection route; confirm quote; T-8/9 | Material edit resets confirmation; browser 9/10 |
| A-10 Submit to Mengantar | S-03 → S-05 pending/confirmed | Own active branch, confirmed current quote; submit shipment; T-8/11 | Disable duplicate request, reconcile unknown; TEST-2/browser 1/2 |
| A-11 Search/filter/open/resume shipment | S-04 → S-05/S-03 | Scoped queue/detail read; T-5/9 | Empty/denied states, no foreign result; browser 5 |
| A-12 Prepare `Cetak resi + invoice` | S-05/S-03 → S-06 | Confirmed printable label; prepare print pack and issue invoice once; T-12/21 | Unavailable/unknown blocks issue; replay preserves IDs; browser 1/4 |
| A-13 Print/reprint invoice or label | S-06/S-05 → S-05 | Existing authorized documents; print/reprint operations; T-12/21 | Printer cancel/failure offers retry, no claim of paper output; browser 3/4 |
| A-14 Cancel local draft / request provider cancellation | S-03/S-05 → S-05 status | State-specific guard and reason; cancel local/request cancellation; T-8/13 | Unknown/in-flight blocks local cancel; pending/rejected visible; TEST-2/browser 6 |
| A-15 View finance/mismatch/profit | S-07 → scoped S-05 if allowed | Finance role/scope; reconciliation/report read; T-15/22 | Stale/unavailable source labeled, no financial override; TEST-5 |
| A-16 Configure branch/pickup / invite/revoke member | S-08 → updated S-08/S-02 | Exact role and target scope; manage lifecycle/membership; T-14 | Confirmation, audit, stale-session revoke; TEST-3/4 |
| A-17 Provision organization / appoint initial owner / activate or suspend branch | S-09 → updated aggregate | Platform policy and provider readiness; governed setup/lifecycle; T-14/16 | Pending owner/readiness and blocked activation explained, audit; TEST-3/4 |
| A-18 Review health/audit / approve/reject/revoke JIT | S-09 → aggregate/approval state | Distinct platform approver, named branch and expiry; health/JIT operations; T-6/16 | Default detail denial, rejection, visible expiry and audit; browser 7/13 |
| A-19 Sign out / recover expired session | Authenticated surface → S-01 → fresh permitted workspace | Own session/context; maintained auth sign-out, new grant resolution; T-4/5/9 | No stale content or mutation replay; failed revoke permits retry; browser 11 |
| A-20 Update directory contact | S-03/S-08 → reviewed contact | Branch-admin scope and expected version; update contact; T-7/9/14 | Staff denial, conflict, preserved snapshots; browser 12 |
| A-21 Request/read/activate/end JIT | S-09 request/status → approved read-only detail or S-09 | Requester-bound grant, fresh session for activation only, fixed expiry; T-6/16 | Pending/rejected/expired denies, exit clears detail without reauthentication, no self-approval; browser 13 |

For each action, implementation must bind a stable `action_id` to the rendered control and corresponding handler/test. This is a coverage key, not permission to record personal data or every click. Sensitive mutation outcomes belong in the redacted audit contract; operational errors/correlation belong in observability. Do not log input values, contact search terms, invoice payloads, or provider credentials. Before T-9/T-12/T-14/T-16/T-21 are complete, a repository-owned check must compare rendered menu/action IDs with this register, detect missing handlers or unreachable destinations, and exercise enabled, denied, loading, failure, and stale-context states for the changed action. T-20 reruns the whole register and confirms no visible dead control; browser tests prove navigation and effect, not just element presence.

The A-series rows are action families. Before implementing a screen, enumerate each concrete control in its test manifest using stable subkeys such as `A-06.add`, `A-06.edit`, and `A-06.remove`; one exercised family must not conceal an untested sibling control. Include menu links, back/next/cancel, filters, pagination, dialog close and keyboard equivalents. Navigation-only controls need route/focus/dirty-form evidence; mutations additionally need authorization, state, and persisted-effect assertions. Report coverage against the explicit manifest, not a claim of 100% behavior from a count of button elements.
