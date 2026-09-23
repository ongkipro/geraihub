# ADR-005 — Session and Active-Branch Context

- Status: Accepted
- Date: 2026-09-23
- Owner: Security owner
- Related: IAM-1, TEN-1 through TEN-6, SEC-1 through SEC-4, T-4, T-5

## Context

GeraiHub must revoke removed memberships and expired JIT access on the next protected request, while multi-branch users need one explicit active branch for operational work. A browser cookie, route parameter, or cached role cannot be the authority for either membership or branch scope.

Better Auth currently documents database-backed cookie sessions and warns that cookie session caching can delay revocation until the cache expires. Immediate authorization revocation is more important for this MVP than avoiding a database session lookup.

Official source reviewed 2026-09-23: https://better-auth.com/docs/concepts/session-management

## Decision

### Authentication session

- Use Better Auth database-backed sessions with the opaque session token carried in its production-secure, HttpOnly cookie.
- Do **not** enable Better Auth `session.cookieCache` for MVP. Stateless session mode is also out of scope.
- Planning defaults are: `expiresIn` 12 hours, `updateAge` 1 hour, and `freshAge` 15 minutes.
- T-1/T-4 must verify exact installed Better Auth option names and semantics before release; if the maintained API changes, preserve the security properties rather than copying stale configuration.
- Membership, branch lifecycle, and JIT authorization are rechecked from GeraiHub-owned authoritative data on every protected operational or privileged request.
- A fresh session is required for JIT grant activation and other explicitly designated high-risk administration actions. If freshness cannot be proven, re-authenticate through Google.

### Active branch

- The browser may request a branch switch only by sending an opaque candidate branch/membership reference.
- The server validates that candidate against the current authenticated user's active membership and branch lifecycle.
- The accepted active branch is stored in **GeraiHub-owned server-side session context**, separate from client authority. T-1/T-3 select the exact table/foreign-key realization after the Better Auth schema is generated.
- Persist a monotonic context version or equivalent freshness marker. A branch switch changes that context and causes branch-sensitive client cache/list/detail state to be discarded.
- Resource ownership is revalidated independently of the active context. A stale tab that names a resource from the old branch cannot use the new session context to read or mutate it.
- Background jobs never inherit browser active-branch state; they use immutable persisted resource ownership.

## Cookie and origin boundary

- Production auth cookies are host-only unless a separately reviewed cross-subdomain requirement exists.
- HTTPS and Secure/HttpOnly cookie behavior are mandatory in production.
- Same-origin mutation protections and Better Auth's maintained OAuth state/CSRF/origin controls remain enabled.
- Forwarded host/origin values are not trusted outside the selected deployment proxy allowlist.

## Consequences

- Database/session checks are intentionally favored over cookie-cache performance for MVP.
- Membership removal, branch suspension, JIT expiry, and JIT revocation can be enforced on the next protected request.
- Branch switching has one server-owned source of current operational context but still cannot override immutable resource ownership.
- If future measured scale requires session caching, a new ADR must preserve bounded immediate-revocation behavior for privileged operations.

## Verification

T-4/T-5 must prove:

1. revoked/expired session or membership is denied on the next protected request;
2. JIT expiry/revocation is denied mid-session;
3. branch A → B switch makes an old branch-A request fail without disclosure;
4. client-tampered branch/context values do not change authority;
5. session cookie/cache configuration matches this ADR;
6. fresh-session enforcement applies to JIT activation;
7. no Google API access/refresh token is retained for MVP.
