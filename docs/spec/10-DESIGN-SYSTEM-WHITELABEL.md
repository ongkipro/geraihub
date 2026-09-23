# GeraiHub MVP Design System

## Document Control

| Field | Value |
|---|---|
| Status | Accepted framework-neutral baseline; implementation evidence pending |
| Version / updated | 0.4 / 2026-09-24 |
| Accountable owner | Product owner |
| Applies to | GeraiHub authenticated operator, branch-admin, owner, finance, and platform-governance web surfaces |
| Locale | Bahasa Indonesia (`id-ID`), IDR; each branch has an explicit IANA timezone, defaulting to `Asia/Jakarta` only when applicable |
| Authority | Canonical repository specification; promoted from the retained planning snapshot on 2026-09-23 |

## 1. Scope and Direction

GeraiHub is a keyboard-first counter-operation application, not a consumer storefront and not a tenant white-label product. The MVP has one GeraiHub brand on one platform domain. No custom logo, color theme, font, domain, arbitrary CSS, or tenant asset upload is in scope. This deliberately removes a security, accessibility, cache-isolation, and implementation burden.

The visual direction is **calm operational clarity**: compact but not crowded, high-contrast state cues plus text, a persistent active-branch identity, and one obvious next action. Errors explain recovery; destructive actions name the shipment and consequence. Do not use decorative dashboards, auto-advancing steps, color-only status, or motion that obscures counter work. Use Apple's restraint and typographic discipline as inspiration, not its branding, control shapes, or spacious consumer-app density. The counter must remain legible at speed and on receipt paper.

### Visual implementation baseline

These are proposed starting tokens for T-9, to be checked in rendered desktop/tablet views and contrast tests before adoption. The brand logo and final palette are still Product decisions; changing a token does not change semantic state or role rules.

| Layer | Baseline |
|---|---|
| Surfaces | Warm off-white canvas `#F7F7F4`, white work surface `#FFFFFF`, thin neutral divider `#D9DDD9`; reserve tinted surfaces for actionable exception blocks. |
| Text and action | Ink `#172326`, muted text `#526064`, deep teal primary `#075A56`; avoid pale text on white. Validate every foreground/background pair against section 5 before shipping. |
| State | Success `#176448`, warning `#8B5600`, danger `#A02E2A`, pending `#245A85`; pair each with explicit status text and icon/shape. Do not infer provider confirmation from color. |
| Typography | Platform native sans for fast local rendering; tabular numerals for money/resi, right-aligned money columns, 16 px body/field text, 20–24 px page title, 12–14 px supporting labels. Do not use a font license or network font as a launch dependency. |
| Rhythm and shape | 4/8 px spacing increments; 8 px control radius, 12 px panels; flat surfaces with dividers before shadows; 40 px minimum touch-oriented primary controls. |
| Hierarchy | Persistent branch header → page/job title → one primary action → contextual detail. Shipment entry uses a form plus quote rail, queue uses a table/list, detail uses a status header and timeline, finance uses an exception queue. No equal-weight KPI card grid on the counter path. |

The component appearance contract is: primary buttons are solid and reserved for the next safe action; secondary actions use outline/text treatments; dangerous actions use a distinct confirmation and wording; disabled actions explain the unmet guard nearby. Inputs retain visible labels above the field and inline error space. Dense tables use row dividers, a clear selected/hover/focus treatment, and a persistent row-detail affordance. Invoice and provider label layouts have separate print CSS/media rules; screen styling never rescales a provider label. Reduced motion uses no transition that delays an operational state change.

## 2. UI Requirements

| ID | Owner | Requirement | Source | Verification |
|---|---|---|---|---|
| UI-1 | Design owner | Tenant operational surfaces MUST display the active branch in the persistent header and in submit, invoice issuance, print, cancellation, and branch-membership confirmations. Organization/platform surfaces show their explicit scope; they never fabricate an active branch. JIT detail shows its named branch and support mode. | TEN-1, UX section 5 | Browser scenario: branch switch and destructive action |
| UI-2 | Design owner | The shipment counter flow MUST provide semantic labels, inline errors, visible keyboard focus, logical tab order, and keyboard-operable primary actions. | PR-2, NFR-2 | Keyboard browser scenario |
| UI-3 | Design owner | Every operational/provider state MUST have text and icon/shape in addition to color; loading, empty, error, pending, denied, and success states MUST state the next safe action. | PR-4, PR-6, UX section 3 | Browser state fixtures |
| UI-4 | Design owner | The UI MUST use `Intl` formatting for IDR, dates, and times and must never use floating-point display calculations for money. | BILL-8, LOC-1 | Component/unit test and browser check |
| UI-5 | Design owner | The UI MUST distinguish Mengantar-authoritative facts from GeraiHub operational estimates with explicit labels. | PR-8, PR-9 | Browser finance/detail scenario |
| UI-6 | Design owner | The MVP MUST not expose white-label controls or custom-domain settings. | Architecture section 5 | Route/permission test |

## 3. Layout and Responsive Contract

- **Desktop (>= 1024 CSS px):** persistent navigation; shipment flow uses a main form column and a sticky compact shipment/quote summary.
- **Tablet (768–1023 CSS px):** navigation may collapse; quote summary remains visible before submit; tables permit horizontal scroll without clipping actions.
- **Below 768 CSS px:** supported for read-only monitoring and basic recovery, but the primary counter flow is not optimized or promised for phone-only operation. Never block an emergency reprint/detail action solely because of viewport.
- Use responsive layout based on available container width, not device names. At 200% browser zoom, content must reflow without hidden primary action or horizontal page scrolling except deliberately scrollable data tables.

## 4. Shared Component Contract

| Component | Required states | Interaction/accessibility contract |
|---|---|---|
| Active branch switcher | selected, loading, unavailable, denied | Native/select-like semantics; only authorized branches appear; branch change clears branch-sensitive client state before showing new data. |
| Session/workspace control | branch, organization, platform, JIT, expired, signing out, revoke failed | Role-aware landing; visible scope, sign-out and end-support actions; no mutation replay after reauthentication; unsaved navigation warning and no persistent browser PII. |
| Shipment step form | initial, saved, validating, invalid, provider error, pending | Native label/control association; error summary links to invalid fields; Enter never bypasses required verification. |
| Pickup point summary | active, unavailable, changed, provider-unverified | Show the active gerai and origin address together; an unavailable/mismatched point blocks quote/submit with a clear next action. |
| Sender/recipient selector | searching, no match, multiple matches, selected, new entry | Scope suggestions to the active gerai; mask results until selection, show enough to distinguish duplicate names, and make save-for-reuse explicit. |
| Directory edit | admin editable, staff denied, saving, version conflict | Separate from draft copy; explicit save, stale-state review and preserved shipment/invoice history. |
| Item and amount review | empty, editing, invalid, complete, quote-invalidated | Show quantity and declared line/goods totals separately from shipping charge and COD; server-calculated exact IDR totals are announced after edits. |
| Collection-mode selector | non-COD default, COD ongkir, COD produk, unavailable | Reveal `Ongkir ikut COD?` only for COD produk; show goods, shipping, and requested courier collection as separate labeled amounts. Explain unavailable provider modes and require a new quote after changes. |
| Money/quote summary | estimate, final, changed, unavailable | Shows currency, quote version, source, and freshness; customer charge appears before cashback. |
| Status badge | lifecycle, sync, cancellation, finance variants | Text label plus non-color cue; programmatic status name available. |
| Confirmation dialog | submit, invoice issuance/reprint, print/reprint, cancel, role change | Focus moves into dialog, Escape only closes non-submitting dialogs, focus returns to invoking control; identifies branch and shipment/action. |
| Shipment timeline | loading, populated, no events, denied | Chronological semantic list; timestamps include timezone; redacted event labels only. |
| Queue table | loading, empty, error, filtered, paginated | Header cells, sortable state where supported, keyboard-accessible row/detail link, no PII in URL. |
| Toast/alert | success, warning, error | `role=status` for nonblocking updates and `role=alert` only for urgent failures; never sole error location. |

Use native HTML controls first. A component library may be selected only after T-2 accepts the implementation profile and must preserve these semantics; it is not a prerequisite for development.

## 5. Accessibility, Content, and Motion

- Target: WCAG 2.2 AA for MVP operator surfaces as an engineering target, not a certification claim.
- Minimum contrast: 4.5:1 for normal text and 3:1 for large text/non-text UI indicators; never rely on contrast alone for a meaning.
- Target sizes: primary counter actions have a practical minimum 40 by 40 CSS px when touch is expected.
- Respect `prefers-reduced-motion`; use no essential animation. Transitions must be short and removable without loss of state information.
- UI copy is Bahasa Indonesia. Use familiar, explicit labels: `Simpan draf`, `Verifikasi paket`, `Konfirmasi ongkos kirim`, `Kirim ke Mengantar`, `Cetak resi + invoice`, `Cetak ulang`, `Ajukan pembatalan`.
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
