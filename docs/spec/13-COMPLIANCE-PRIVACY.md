# GeraiHub Privacy and Data-Handling Specification

> This document turns known processing into engineering controls. It is not legal advice or a claim of compliance. A qualified privacy/legal owner must decide final legal roles, applicability, retention, transfers, and notification obligations before production.

## Document Control

| Field | Value |
|---|---|
| Status | Draft — engineering baseline; legal decisions pending |
| Version / updated | 0.3 / 2026-09-23 |
| Accountable owner | Privacy owner |
| Engineering owner | Engineering owner |
| Market | Indonesia, Indonesian-language operator surface |
| Applies to | GeraiHub MVP application, databases/backups, Google OAuth, Mengantar integration, logs/audit, support access |
| Authority | Canonical repository specification; promoted from the retained planning snapshot on 2026-09-23 |

## 1. Known Processing and Boundaries

GeraiHub processes sender and recipient names, telephone numbers, addresses, shipment/package/service/COD details, operator identity, branch membership, payment-record evidence, and provider resi/status so an authorized gerai can create and manage a shipment through Mengantar. It is not an online checkout, payment processor, wallet, COD settlement system, or customer-facing pre-fill service in MVP.

The organization operating GeraiHub, its exact controller/processor role for partner-gerai data, hosting/backup regions, remote-support locations, and final Mengantar/Google contractual roles remain **Unknown** pending qualified review. Do not label the product compliant or publish a privacy notice until those decisions are recorded.

## 2. Applicability Register

This is the sole jurisdiction declaration register. Dates copied from earlier drafts are not fresh legal-source verification. Unknown applicability never means not applicable.

| ID | Regime | Trigger facts | Authority/source | Source status | Publication date | Effective date | Retrieved date | Decision | Qualified owner | Engineering impact | Next review |
|---|---|---|---|---|---|---|---|---|---|---|---|
| JUR-ID-1 | Indonesia personal-data protection | CTX-4, CTX-5 | Candidate official source: https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022; current content/implementing rules require qualified review | unknown | 2022-10-17 recorded in prior draft, not reverified | 2022-10-17 recorded in prior draft, not reverified | Not reverified in this audit; prior draft recorded 2026-09-23 | Unknown | Privacy owner | PRIV-6 through PRIV-12; SEC-1 through SEC-14 | Before production/privacy notice or source-status change |
| JUR-XFER-1 | Cross-border processing review under applicable Indonesian rules | CTX-3, CTX-4, CTX-17 | Candidate official source: https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022; specific transfer analysis pending | unknown | Not verified | Not verified | Not retrieved in this audit | Unknown | Privacy owner | PRIV-11, XFER-1; vendor/backup/remote-access inventory | When vendors/deployment are selected; before production |
| JUR-GDPR-1 | GDPR scope candidate, not an applicability conclusion | CTX-5 | Candidate official source: https://eur-lex.europa.eu/eli/reg/2016/679/oj; scope analysis pending | unknown | Not verified | Not verified | Not retrieved in this audit | Unknown | Privacy owner | Reassess PRIV-6 through PRIV-12 only on establishment/targeting/contract evidence | Before market/contract expansion; qualified review before production |

### JUR-ID-2 — Retired duplicate Indonesia candidate
- Status: Superseded
- Superseded by: JUR-ID-1
- Trigger facts: CTX-9
- Authority/source: Same candidate official source as replacement; this ID was duplicated and inconsistently reused for sector rules in the prior draft.
- Source status: unknown
- Publication date: Not independently verified
- Effective date: Not independently verified
- Retrieved date: Not retrieved in this audit
- Decision: Unknown; duplicate removed without deciding legal applicability
- Qualified owner: Privacy owner
- Engineering impact: Use the replacement register entry; sector review remains under JUR-SECTOR-1 and JUR-SECTOR-2 in CONTEXT-RECORD.md.
- Next review: Before qualified applicability approval

### XFER-1 — Vendor and remote-access inventory gate
- Status: Unknown
- Owner: Privacy owner
- Trigger facts: CTX-3, CTX-4, CTX-17
- Exporter role/location: GeraiHub legal entity and role not yet determined
- Importer role/location: Google, Mengantar, hosting, database, backup, and telemetry roles/locations require contract review
- Data subjects/categories: Users and sender/recipient data in PRIV-1 through PRIV-5
- Purpose: Authentication, shipment fulfillment, support, telemetry, and recovery only
- Storage/remote access: Production storage, backups, subprocessors, and support access not selected/verified
- Mechanism review: Pending qualified applicability and contract review; no mechanism assumed
- Safeguards: SEC-1, SEC-8, SEC-10, SEC-14; planned, not implemented
- Onward transfers: Unknown; vendor inventory required before production
- Retention/deletion: PRIV-12 and section 5; final schedule pending
- Evidence: No transfer verification performed; vendor/region/contract evidence required before production

Other Indonesian sector/commerce rules remain candidates under the context sector records, not a second use of the retired jurisdiction ID.

Official sources and qualified interpretations must be added during the production readiness review; this draft does not reproduce legal obligations.

## 3. Data Inventory

| ID | Owner | Data category | Subjects | Purpose | Recipients/systems | Minimization/control |
|---|---|---|---|---|---|---|
| PRIV-1 | Privacy owner | Sender/recipient name, phone, address | Shipment customer/sender/recipient | Create, verify, submit, print, and support shipment | Authorized branch users, GeraiHub database/backup, Mengantar | Collect only fields required by verified provider contract; branch scope; redact logs/audit; no public MVP lookup. |
| PRIV-2 | Privacy owner | Package, service, COD, quote, resi, provider status | Customer/shipment | Shipment operations, reconciliation, operational reporting | Authorized branch users, Mengantar, database/backup | Scoped read/write; no payment credentials; resi not used as public identifier. |
| PRIV-3 | Privacy owner | User profile, Google provider subject, membership, branch, role, session/audit metadata | GeraiHub users | Authentication, authorization, support/security audit | GeraiHub auth/database/audit systems | Bind identity by provider subject; do not store Google API tokens; restricted administrator access. |
| PRIV-4 | Privacy owner | Cash/QRIS payment-record evidence and correction/refund event | Customer and operator | Branch operational record and reconciliation | Authorized branch/finance roles, database/audit | Store method, amount, verifier/time and minimal approved reference only; never store card data, QR image, bank credentials, or payment screenshots by default. |
| PRIV-5 | Privacy owner | Redacted logs, metrics, audit, backups | Users/operations; indirect customer references where necessary | Security, incident diagnosis, recovery | Chosen telemetry/backup vendors | No raw payloads/full PII/secrets; access-controlled and retention-bounded. |

MVP does not use personal data for AI training, advertising audiences, profiling, or customer WhatsApp messaging. Any new purpose requires privacy review and a spec update before implementation.

## 4. Engineering Privacy Requirements

| ID | Owner | Requirement | Verification |
|---|---|---|---|
| PRIV-6 | Privacy owner | The system MUST collect and transmit only provider-required shipment fields and approved operational records; optional free-text fields must be avoided or length-bounded. | Schema/API validation review |
| PRIV-7 | Privacy owner | The system MUST enforce branch-scoped, role-authorized access to all personal/financial operational records and JIT-bound support access. | TEN/IAM negative tests |
| PRIV-8 | Privacy owner | The system MUST redact/full-mask personal data in logs, audit events, metrics, URLs, client errors, and routine queue views; detail view disclosure requires authorized branch context. | Redaction/UI tests |
| PRIV-9 | Privacy owner | The system MUST expose an internal, auditable workflow for authorized correction of operational customer data while preserving shipment/audit history. | Correction workflow test |
| PRIV-10 | Privacy owner | Before production, the system owner MUST publish an approved notice and contact channel explaining the actual controller/processor role, purposes, recipients, retention, and rights process. | Approved notice/version record |
| PRIV-11 | Privacy owner | Before production, each production vendor/subprocessor and region/remote-access path MUST be inventoried; no unreviewed production data destination is permitted. | Vendor/deployment review |
| PRIV-12 | Privacy owner | The system MUST support export and deletion/restriction requests through an authorized internal case workflow, subject to the final approved policy, provider obligations, retention, and legal-hold handling. | Synthetic request exercise |
| PRIV-13 | Privacy owner | Production fixtures, screenshots, demos, and documentation MUST use synthetic data only. | Fixture/document review |

## 5. Retention and Rights Baseline

Final durations are **Unknown** and require product/privacy/legal approval before production. To prevent silent indefinite retention, implementation must make every class configurable by a reviewed policy and able to execute/report deletion actions without rewriting audit evidence.

| Data class | Interim engineering rule | Final decision gate |
|---|---|---|
| Active shipment/customer operational record | Retain while operationally needed; do not automatically delete in MVP without approved schedule. | Approved retention schedule before production |
| Audit/security record | Append-only and access-restricted; retention duration pending security/privacy decision. | Approved audit retention schedule before production |
| Session/auth transient data | Keep only framework-required duration; revoke/suspend per IAM policy. | Auth configuration review |
| Backup copy | Expire according to managed backup policy once selected; deletion follows backup lifecycle, not immediate live-record deletion. | Hosting/backup review before production |
| Post-MVP public draft reference | Not implemented in MVP. Accepted expiry policy is end of next business day with auditable expired state; business calendar/timezone and retention remain unresolved. | Q-5 before post-MVP build |

Rights requests are handled by a designated GeraiHub privacy owner through a secure, logged case process. Identity verification must be proportionate, scope must include live data, backups, exports, and vendors where applicable, and the response decision/timeline must follow approved policy. A request must not be fulfilled by exposing another person's shipment data.

## 6. Vendor, Transfer, and Incident Gates

| Vendor/category | MVP data/purpose | Status |
|---|---|---|
| Google OAuth | User identity assertions and approved profile attributes for login | Vendor/region/contract review required before production |
| Mengantar | Shipment data necessary for quote/order/status/label | Provider contract, data handling, and account-owner review required |
| Hosting/database/backup/telemetry | Not selected | Must be selected, region/access mapped, and approved before production |

For suspected data incidents, engineering preserves safe evidence and escalates to the privacy owner. The privacy owner determines investigation, affected scope, contractual/regulatory notification, and communications; engineering must not independently classify or announce a legally reportable breach.

## 7. Production Readiness Gaps

| Gap | Owner | Required before |
|---|---|---|
| Identify GeraiHub legal entity and controller/processor responsibilities with partner gerai. | Product/privacy owner | Production data collection |
| Approve retention/deletion, audit, backup, and legal-hold policy. | Privacy/legal owner | Production release |
| Select/inventory hosting, database, backup, telemetry, Google, and Mengantar data locations/access/contracts. | Engineering/privacy owner | Production release |
| Approve privacy notice, contact channel, customer/partner rights workflow, and incident decision authority. | Privacy owner | Production release |
| Assess post-MVP QR/reference/phone lookup abuse and notice requirements. | Product/security/privacy owner | Post-MVP feature start |
