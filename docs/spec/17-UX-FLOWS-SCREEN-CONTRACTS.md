# GeraiHub UX Flows and Screen Contracts

## Document Control

| Field | Value |
|---|---|
| Status | Draft |
| Version / updated | 0.2 / 2026-09-23 |
| Primary surface | Indonesian gerai operator web application |
| Primary input | Desktop/tablet, keyboard, barcode/QR scanner where available |
| Authority | Canonical repository specification; promoted from the retained planning snapshot on 2026-09-23 |

## 1. Experience Direction

GeraiHub is an operational counter tool, not a consumer checkout. The primary user is under time pressure with a physical package and customer present. The UX prioritizes: a single obvious next action, fast keyboard data entry, visible verification state, provider-sync certainty, safe reprint, and reversible correction before submission.

Use Bahasa Indonesia, `id-ID` currency formatting, and a confirmed business-timezone policy. The UI must distinguish clearly between GeraiHub operational records and Mengantar-authoritative information.

### UX-1 — Safe counter and governance screen contract
- Status: Draft
- Owner: Design owner
- Source: PR-1 through PR-11; NFR-2; IAM-1
- Statement: Implement the MVP journeys, screen states, and role boundaries in sections 2–5 and 7; section 6 is post-MVP only. Reusable presentation/accessibility follows the design-system document.
- Acceptance: Execute section 8 scenarios 1–6 and TEST-1 against synthetic fixtures; wrong-branch and unprivileged actions deny, pending outcomes remain visible, and reprint never resubmits. Scenario 7 is deferred.
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
| 1. Start | Begin a customer shipment | Start blank draft; tenant/gerai context is visible and immutable. | Resume own eligible local draft; do not expose another gerai's draft. |
| 2. Enter data | Record sender, recipient, package and requested service/COD data | Validate required fields before estimate. | Inline field error; preserve entered non-sensitive data. |
| 3. Estimate | Choose eligible service | Show only current provider-supported routes/services/COD eligibility and quote inputs. | Provider failure shows retry/save-draft state, never invented quote. |
| 4. Verify physically | Align draft with package at counter | Record verified weight, applicable dimensions, route/service/COD check, and final quote. | Changing relevant inputs invalidates earlier quote confirmation. |
| 5. Confirm payment | Receive direct payment | Show customer charge before cashback and require explicit operator confirmation. | Staff cannot edit/delete a record; gerai admin requests correction and owner approves/rejects. |
| 6. Submit | Create provider order safely | Enter `submission pending`; use idempotent submit; show progress. | Timeout/unknown becomes reconciliation state, not automatic repeat submit. |
| 7. Print | Hand customer label/resi | Enable print only after confirmed provider outcome; show tracking number distinctly. | Reprint works from detail without a new submission. |
| 8. Monitor | Follow pickup and exceptions | Status/timeline records provider sync, pickup, cancellation, and mismatch outcomes. | Clear retry/escalation ownership. |

## 4. Cancellation and Correction Journey

| Situation | Allowed user path | Required UI truth |
|---|---|---|
| Wrong input before submit | Edit the draft; quote must be revalidated when affected fields change. | No resi/provider order is implied. |
| User abandons an unsubmitted draft | Cancel draft with reason. | Audit preserved; no provider cancellation request. |
| Resi printed or order synchronized | Choose **Ajukan pembatalan**, supply reason, and confirm the correct shipment. | Show `cancellation pending`; do not claim cancelled until Mengantar confirms. |
| Provider rejects/does not support cancellation | Show authoritative rejected/unknown outcome and next support route. | Printed label is not silently invalidated. |
| Provider cancellation succeeds | Mark cancelled and preserve original resi, provider result, actor, reason, and time. | Never delete shipment/finance history. |

Cancellation, reprint, payment record, and final submit are dangerous actions. Each needs a compact confirmation naming the shipment and non-reversible consequence; confirmation is not a substitute for provider state validation.

## 5. MVP Screen Contracts

### A. Proses kiriman

- **Purpose:** finish exactly one physical counter shipment safely.
- **Primary action:** move through enter → estimate → verify → confirm payment → submit.
- **Layout:** persistent compact shipment summary and final quote; step content has one primary action. Avoid dashboard widgets.
- **States:** initial; draft saved; validating; estimate loading/no service/provider error; verification incomplete; quote changed; payment confirmed; submission pending/failed/unknown/success.
- **Accessibility:** semantic field labels/errors, keyboard step order, visible focus, scanner input does not trap focus, no color-only eligibility/status.

### B. Daftar kiriman

- **Purpose:** locate an existing shipment and resolve operational work.
- **Priority:** state, created/updated time, sender/recipient summary, destination, service, provider resi when available, sync/cancellation flag.
- **Actions:** open detail; resume eligible draft; filters for needs-attention, pending provider sync, printed-awaiting-pickup, cancellation pending, and picked up.
- **Safety:** all results are tenant-scoped. Search must never disclose another gerai's result.

### C. Detail kiriman

- **Purpose:** understand authoritative and internal state before an action.
- **Priority:** current operational state; final quote/customer charge; Mengantar sync state and resi; label action; immutable timeline; cancellation section; financial-estimate disclaimer.
- **Actions:** reprint only valid label; request cancellation according to state; retry only a safe reconciliation-supported action.
- **States:** loading; denied/not found; provider pending/unknown; cancellation pending/rejected/succeeded; label unavailable.

### D. Rekonsiliasi & keuangan

- **Purpose:** find discrepancies, not replace Mengantar financial truth.
- **Priority:** explicit banner “Mengantar adalah sumber keuangan resmi”; last successful synchronization; mismatch queue; eligible internal estimated-profit report.
- **Rules:** internal profit includes only confirmed picked-up shipments. Amounts remain estimates and are never editable into provider truth.
- **Permissions:** owner/admin/finance per IAM; staff sees only its own branch's cash/QRIS operational summary, not estimated-profit/provider settlement controls. Platform aggregate view is separate.

### E. Gerai and user management

- **Purpose:** keep business ownership, daily gerai administration, and counter operations separated.
- **Role hierarchy:** platform super admin → organization/gerai owner → gerai admin → staff pengiriman. An owner can belong to multiple branches, but each operational screen has one explicit active-branch context.
- **Actions:** owner switches branch, appoints/suspends/removes that branch's gerai admins, and sees aggregate organization reporting; gerai admin invites/suspends/removes staff-pengiriman and edits permitted settings only for the active branch. Display role impact before save.
- **Branch safety:** aggregate reports may combine branches, but shipment search, customer details, create/edit, payment, submit, print, cancel, and correction never combine branches. The active branch is persistent and visible in the header and every destructive-action confirmation.
- **Safety:** no role may assign a higher/platform role, modify another gerai, or silently retain an existing session; every membership/role change is audited.

### F. Super-admin governance

- **Purpose:** govern platform/tenant health without routine access to customer shipments.
- **Actions:** approve activation/suspend branches, appoint the initial organization owner, inspect aggregate integration/reconciliation health, search audit, and approve/revoke JIT support under the approved approver policy.
- **JIT support:** requires reason, named gerai, approved duration, visible support state, auto-expiry, and per-action audit.
- **Excluded:** routine shipment processing, payment/cancellation/print, financial overrides, and unbounded exports.

## 6. Post-MVP Customer Pre-fill Contract

Customer pre-fill creates a provisional draft, not a checkout. Completion presents a short non-sequential, human-readable reference and QR containing that same reference. At the gerai, scan QR or enter/search the reference to open the same draft. Operator-only fallback uses sender phone or sender name plus the last four phone digits; name-only search is prohibited.

Before revealing full details or processing, show masked sender contact, destination area, and draft status and require operator/customer confirmation. Operator repeats physical verification and final quote/payment/submit flow. The Mengantar resi is distinct and appears only after successful submission. WhatsApp reference delivery is optional/deferred and cannot be required for service.

## 7. State and Permission Summary

| State | Operator | Gerai admin | Finance viewer | Super admin |
|---|---|---|---|---|
| Draft / quoted | Edit, cancel | Edit, cancel | Read only if allowed | No tenant detail by default |
| Payment recorded / submission pending | Read/reconcile; no duplicate submit | Read/reconcile | Read | Aggregate health only |
| Submitted / label printed | Reprint; request permitted cancellation | Reprint; request permitted cancellation | Read | No default detail/action |
| Cancellation pending/rejected | Read provider outcome; escalate | Read/escalate | Read | Aggregate health/JIT only |
| Picked up | Read shipment; no estimated-profit report permission | Read/report | Read/report | Aggregate report only |

Eligibility is a shipment rule, not a staff reporting permission. Owner permissions, any separately held counter role, and payment correction approvals follow the canonical IAM matrix.

### Payment correction and external refund states

In branch shipment detail/finance, staff can read recorded payment but cannot edit/delete it. Admin can submit one pending correction per affected record version with reason and before/after values; owner sees the same branch, shipment, requester, and values before approve/reject. Stale or already-decided requests reject without a second adjustment. Approved corrections append history; rejection preserves the request and reason. Owner-approved off-system refunds record outcome/reference only, never trigger QRIS or provider settlement. Exceptional owner self-correction stays disabled until BILL-3's separate policy gate is approved.

## 8. Browser Acceptance Scenarios

1. At desktop and tablet widths, an operator completes a valid shipment using keyboard navigation and sees final quote before payment/submit.
2. A provider timeout yields a visible pending/reconciliation state; retry does not create a duplicate confirmed shipment.
3. Reprint from a confirmed shipment does not invoke order creation.
4. An operator cannot locate or mutate a shipment from another gerai by URL or search.
5. A cancellation after label printing remains pending until mocked/verified provider outcome and retains the original audit timeline.
6. A super admin cannot open a tenant shipment without approved JIT support; the access state is visible and expires.
7. In the post-MVP fixture, QR and manual short-reference lookup open the same draft; a name-only search is unavailable.
