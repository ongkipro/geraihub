# GeraiHub Security Architecture

> This is an engineering security specification, not legal advice, audit opinion, or certification claim.

## Document Control

| Field | Value |
|---|---|
| Status | Draft — control requirements; implementation and runtime verification pending |
| Version / updated | 0.3 / 2026-09-23 |
| Accountable owner | Security owner |
| System owner | Engineering owner |
| Applies to | GeraiHub web app, worker, database, Mengantar integration, audit/telemetry, backups, and support access |
| Classification | Internal |
| Authority | Canonical repository specification; promoted from the retained planning snapshot on 2026-09-23 |

## 1. Assets and Boundaries

| Asset | Required protection | Boundary |
|---|---|---|
| Sender/recipient identity, phone, address, shipment detail | Confidentiality and accurate branch-scoped processing | Browser ↔ backend ↔ database/Mengantar |
| Google OAuth identity and GeraiHub session | Prevent login CSRF, account link takeover, session theft, and stale privilege | Browser ↔ OAuth callback ↔ auth/session store |
| GeraiHub membership, role, active branch, and JIT grant | Prevent cross-tenant/object access and privilege escalation | Backend authorization ↔ database ↔ worker |
| Payment record, quote, provider order/resi, cancellation state | Prevent alteration, duplicate provider orders, and false completion | Transaction/outbox ↔ Mengantar adapter ↔ reconciliation worker |
| Mengantar and OAuth client secrets | Never expose to browser/logs/repository | Approved server-side secret store ↔ workload only |
| Audit, reconciliation, backups | Prevent unauthorized read/alteration and support recovery | Restricted operational access |

Authoritative boundaries: Google proves an external identity; GeraiHub decides account link, membership, branch, role, and every action. Mengantar decides provider order/cancellation/settlement facts. Client requests, client role/branch values, provider responses until validated, and all logs/search input are untrusted.

## 2. Security Requirements

| ID | Owner | Requirement | Enforcement point | Verification |
|---|---|---|---|---|
| SEC-1 | Security owner | The backend MUST derive user, membership, role, organization, branch, and JIT scope from its authenticated session/database context; it MUST ignore client-supplied authority values. | Auth middleware and action policy | Cross-branch/object authorization tests |
| SEC-2 | Security owner | Google OAuth MUST use the maintained auth framework flow with exact allowlisted origins/redirect URIs, state and PKCE validation, and server-only client secret handling. | Auth configuration/callback | Invalid origin, state, PKCE, and callback tests |
| SEC-3 | Security owner | Google callback success MUST NOT grant a GeraiHub role, branch, or membership without an unexpired, approved invitation/provisioning record. | Account-link and invitation transaction | Uninvited-login test |
| SEC-4 | Security owner | Cookie-authenticated state changes MUST retain CSRF/origin protection; sessions MUST be secure, HttpOnly, HTTPS-only in production, bounded, and rechecked against authoritative membership for privileged actions. | Auth/session layer | Cross-origin denial and revoked-membership test |
| SEC-5 | Security owner | Every API/action input MUST be schema-validated server-side with strict writable-field allowlists, bounded strings/counts/pagination, and safe error responses. | Route/action boundary | Invalid/extra-field and mass-assignment tests |
| SEC-6 | Security owner | Every branch-owned database read/write, cache key, job, export, idempotency key, and provider operation MUST include authoritative organization/branch ownership. | Repository/data access and worker | Same-role two-branch negative tests |
| SEC-7 | Security owner | Provider operations MUST be idempotent, transactionally correlated, bounded in retry/concurrency, and reconciled after timeout/unknown response; no blind repeat order/cancel request is allowed. | Outbox/worker/adapter | Timeout, replay, and out-of-order fixture tests |
| SEC-8 | Security owner | Mengantar credentials, credential-bearing URLs, OAuth secrets, sessions, raw provider payloads, and full PII MUST NOT appear in browser bundles, logs, audits, fixtures, or documentation. | Secret/logging/build review | Static scan and redaction test |
| SEC-9 | Security owner | Provider-facing outbound requests MUST be limited to the verified Mengantar base URL/operations, with explicit timeout, response-size, and redirect policy. | Adapter HTTP client | Host/redirect configuration test |
| SEC-10 | Security owner | Privileged support access MUST be default-deny, branch-bound, reasoned, approved, time-limited, visibly indicated, immediately revocable, and audit every access/action. | JIT grant policy | Expiry/revocation/access audit test |
| SEC-11 | Security owner | Sensitive history (payment records, quote confirmations, provider sync, cancellation, role changes, prints) MUST be append-only/audited; ordinary staff cannot delete or rewrite it. | Database and application transition guards | Mutation authorization/history test |
| SEC-12 | Security owner | Rate/concurrency limits MUST protect login, lookup, estimate, submit/cancel, print, and export using shared persistent storage when deployed on more than one instance. | Auth/app limiter and queue | Bounded abuse/limit test |
| SEC-13 | Security owner | Production transport MUST use HTTPS; response headers must restrict framing, content type sniffing, referrer leakage, and browser capabilities proportionately. CSP/CORS rules must be explicit allowlists. | Deployment/app headers | Browser/header verification |
| SEC-14 | Security owner | Backups and operational access MUST be restricted, encrypted by the chosen managed platform, tested by a restore exercise before production, and subject to the privacy retention schedule. | Infrastructure/runbook | Restore evidence without production PII |

## 3. Threat Register

The residual ratings below are provisional targets, not observed security outcomes; no control has been implemented or tested.

| ID | Threat | Treatment | Owner | Residual risk target (unverified) |
|---|---|---|---|---|
| THR-1 | Operator changes an ID/branch or uses stale UI state to read/mutate another branch. | SEC-1, SEC-5, SEC-6; scoped queries and negative tests. | Engineering owner | Low after repeated authorization tests. |
| THR-2 | Valid Google account gains access through uninvited login, changed email, or callback tampering. | SEC-2, SEC-3, provider subject binding, invitation lifecycle. | Security owner | Low; account recovery policy remains operational risk. |
| THR-3 | Existing session keeps a removed member or expired support user privileged. | SEC-4, SEC-10; authoritative recheck for privileged actions. | Engineering owner | Bounded by session/revocation design verified at implementation. |
| THR-4 | Timeout/retry creates duplicate provider order or incorrect cancellation. | SEC-7 and provider contract verification before implementation. | Engineering owner | Medium until Mengantar contract/sandbox proof exists. |
| THR-5 | Secrets/PII leak through UI, logs, audit, fixtures, or telemetry. | SEC-8, redaction review, least-privilege access. | Security owner | Medium until production observability/storage is selected. |
| THR-6 | Malicious input, unexpected fields, or untrusted provider values alter state or reach a sensitive sink. | SEC-5, parameterized data access, output escaping, strict adapter schemas. | Engineering owner | Low when all boundaries are tested. |
| THR-7 | Super admin/support accesses tenant data without approved incident scope. | SEC-1, SEC-10, audit review. | Platform owner | Low after JIT test and operating review. |
| THR-8 | Provider credential is abused through SSRF/redirect or uncontrolled egress. | SEC-9; fixed verified provider destination and no generic server fetch endpoint. | Engineering owner | Low. |
| THR-9 | Brute-force/enumeration or provider saturation affects operations. | SEC-12 and `RATE-*`; generic denial responses. | Engineering owner | Medium until measured limits/provider ceilings are set. |

## 4. Authentication, Session, and Secrets Baseline

- Use Google OpenID Connect through Better Auth or an equivalent maintained framework accepted under T-2. Do not implement OAuth protocol primitives manually.
- Keep CSRF protection enabled. Trusted origins and redirect URLs are explicit environment-specific allowlists; do not trust arbitrary forwarded host headers.
- Use a high-entropy auth secret from approved secret storage; never put it in source control. OAuth client secrets and Mengantar credentials are environment-scoped and server-only.
- Do not request/store Google access or refresh tokens for MVP. Persist only the minimum provider account link needed for identity (`provider`, stable `sub`, GeraiHub user relation) and approved display attributes.
- Log security decisions using safe identifiers/correlation IDs, never cookie, token, signature, credential, full address, or full phone value.

## 5. Data Protection and Recovery

| State | Mechanism/decision | Verification |
|---|---|---|
| In transit | TLS at the selected hosting edge/application and HTTPS-only provider calls. | Deployment/header and provider-client checks. |
| At rest | Use managed database/backup encryption offered by the selected platform; no application field encryption is justified for MVP before a provider/obligation requires it. | Platform configuration review. |
| Secrets | Managed secret store with workload-scoped access; separate local/staging/production values. | Secret inventory and access review without value disclosure. |
| Backups | Encrypted managed backup, least-privilege restore access, retention defined by PRIV-5. | Safe restore rehearsal before production. |

## 6. Incident and Verification

A security or provider incident preserves only correlation IDs, safe state history, release/version, branch scope, and redacted diagnostics. Engineering escalates suspected personal-data incidents to the privacy owner; it does not independently make legal notification claims.

Before production, run: authorization/tenant tests; OAuth callback and uninvited-login tests; session revocation/JIT expiry tests; schema/mass-assignment tests; provider timeout/replay/out-of-order tests; secret/redaction scan; browser header checks; rate-limit checks; and a backup restore rehearsal.

## 7. Open Risks and Gates

| Item | Owner | Gate |
|---|---|---|
| Verify Mengantar cancellation, pickup, idempotency, label, and status contract with documented/sandbox evidence. | Engineering + provider account owner | Before provider order/cancel production release |
| Select hosting, database, secret store, backup region, and proxy boundary. | Engineering/operations owner | Before deployment design |
| Approve JIT support operational approver and emergency revoke procedure. | Platform owner | Before super-admin support release |
| Approve account-link/email-change recovery procedure. | Security + product owner | Before invitations/account recovery release |
