# GeraiHub MVP Design System

## Document Control

| Field | Value |
|---|---|
| Status | Accepted framework-neutral baseline; implementation evidence pending |
| Version / updated | 0.3 / 2026-09-23 |
| Accountable owner | Product owner |
| Applies to | GeraiHub authenticated operator, branch-admin, owner, finance, and platform-governance web surfaces |
| Locale | Bahasa Indonesia (`id-ID`), IDR; each branch has an explicit IANA timezone, defaulting to `Asia/Jakarta` only when applicable |
| Authority | Canonical repository specification; promoted from the retained planning snapshot on 2026-09-23 |

## 1. Scope and Direction

GeraiHub is a keyboard-first counter-operation application, not a consumer storefront and not a tenant white-label product. The MVP has one GeraiHub brand on one platform domain. No custom logo, color theme, font, domain, arbitrary CSS, or tenant asset upload is in scope. This deliberately removes a security, accessibility, cache-isolation, and implementation burden.

The visual direction is **calm operational clarity**: compact but not crowded, high-contrast state cues plus text, a persistent active-branch identity, and one obvious next action. Errors explain recovery; destructive actions name the shipment and consequence. Do not use decorative dashboards, auto-advancing steps, color-only status, or motion that obscures counter work.

## 2. UI Requirements

| ID | Owner | Requirement | Source | Verification |
|---|---|---|---|---|
| UI-1 | Design owner | The application MUST display the active branch in the persistent header and in submit, payment, print, cancellation, and membership-change confirmations. | TEN-1, UX section 5 | Browser scenario: branch switch and destructive action |
| UI-2 | Design owner | The shipment counter flow MUST provide semantic labels, inline errors, visible keyboard focus, logical tab order, and keyboard-operable primary actions. | PR-2, NFR-2 | Keyboard browser scenario |
| UI-3 | Design owner | Every operational/provider state MUST have text and icon/shape in addition to color; loading, empty, error, pending, denied, and success states MUST state the next safe action. | PR-4, PR-6, UX section 3 | Browser state fixtures |
| UI-4 | Design owner | The UI MUST use `Intl` formatting for IDR, dates, and times and must never use floating-point display calculations for money. | BILL-8, LOC-1 | Component/unit test and browser check |
| UI-5 | Design owner | The UI MUST distinguish Mengantar-authoritative facts from GeraiHub operational estimates with explicit labels. | PR-8, PR-9 | Browser finance/detail scenario |
| UI-6 | Design owner | The MVP MUST not expose white-label controls or custom-domain settings. | Architecture section 5 | Route/permission test |

## 3. Layout and Responsive Contract

- **Desktop (>= 1024 CSS px):** persistent navigation; shipment flow uses a main form column and a sticky compact shipment/quote summary.
- **Tablet (768–1023 CSS px):** navigation may collapse; summary remains visible before payment and submit; tables permit horizontal scroll without clipping actions.
- **Below 768 CSS px:** supported for read-only monitoring and basic recovery, but the primary counter flow is not optimized or promised for phone-only operation. Never block an emergency reprint/detail action solely because of viewport.
- Use responsive layout based on available container width, not device names. At 200% browser zoom, content must reflow without hidden primary action or horizontal page scrolling except deliberately scrollable data tables.

## 4. Shared Component Contract

| Component | Required states | Interaction/accessibility contract |
|---|---|---|
| Active branch switcher | selected, loading, unavailable, denied | Native/select-like semantics; only authorized branches appear; branch change clears branch-sensitive client state before showing new data. |
| Shipment step form | initial, saved, validating, invalid, provider error, pending | Native label/control association; error summary links to invalid fields; Enter never bypasses required verification. |
| Money/quote summary | estimate, final, changed, unavailable | Shows currency, quote version, source, and freshness; customer charge appears before cashback. |
| Status badge | lifecycle, sync, cancellation, finance variants | Text label plus non-color cue; programmatic status name available. |
| Confirmation dialog | payment, submit, print/reprint, cancel, role change | Focus moves into dialog, Escape only closes non-submitting dialogs, focus returns to invoking control; identifies branch and shipment/action. |
| Shipment timeline | loading, populated, no events, denied | Chronological semantic list; timestamps include timezone; redacted event labels only. |
| Queue table | loading, empty, error, filtered, paginated | Header cells, sortable state where supported, keyboard-accessible row/detail link, no PII in URL. |
| Toast/alert | success, warning, error | `role=status` for nonblocking updates and `role=alert` only for urgent failures; never sole error location. |

Use native HTML controls first. A component library may be selected only after T-2 accepts the implementation profile and must preserve these semantics; it is not a prerequisite for development.

## 5. Accessibility, Content, and Motion

- Target: WCAG 2.2 AA for MVP operator surfaces as an engineering target, not a certification claim.
- Minimum contrast: 4.5:1 for normal text and 3:1 for large text/non-text UI indicators; never rely on contrast alone for a meaning.
- Target sizes: primary counter actions have a practical minimum 40 by 40 CSS px when touch is expected.
- Respect `prefers-reduced-motion`; use no essential animation. Transitions must be short and removable without loss of state information.
- UI copy is Bahasa Indonesia. Use familiar, explicit labels: `Simpan draf`, `Verifikasi paket`, `Catat pembayaran`, `Kirim ke Mengantar`, `Cetak ulang`, `Ajukan pembatalan`.
- Dates/times show the branch timezone in operational/audit/detail contexts. Every branch stores an explicit IANA timezone; `Asia/Jakarta` is the initialization default only for branches confirmed to operate in WIB. Address and phone input validation follows the verified Mengantar contract; do not invent restrictive Indonesian-name/address rules.

## 6. Implementation and Validation Boundary

Runtime design tokens and components become the implementation source of truth after authorized implementation begins. Keep colors, spacing, typography, radii, shadows, and z-index as small semantic token sets; no tenant override layer is needed. Prefer system fonts until real brand/font licensing and performance evidence justify a web font.

Required browser evidence before declaring a UI task done:

1. desktop and tablet screenshots/interaction checks for the changed flow;
2. keyboard-only completion of the affected primary action;
3. visible pending/error/denied state where applicable;
4. active-branch context remains correct after navigation or refresh;
5. no sensitive data is exposed in route, client error, or browser console output.

## 7. AI- and Terminal-Independent Handoff

This document specifies observable behavior, not a design-tool file or model prompt. Any developer or terminal-capable AI can implement from it by using semantic HTML/CSS first, then the repository's selected component pattern. A Figma subscription, an image-generation model, a proprietary browser agent, or a paid component registry is not a prerequisite.

Required deliverables are source code, deterministic fixtures, and repeatable browser/automated checks stored in the repository. Screenshots may support a review but do not replace executable behavior checks.

## 8. Open Decisions

| Item | Owner | Gate |
|---|---|---|
| Brand logo, final palette, and any paid component library | Product owner | Before public/operator visual release; does not block backend/auth work |
| Phone-only counter support | Product owner | Before claiming mobile-counter support |
