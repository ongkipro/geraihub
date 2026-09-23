# GeraiHub Operations and Release Readiness

## Document Control

| Field | Value |
|---|---|
| Status | Accepted readiness contract; production values pending |
| Version / updated | 1.0 / 2026-09-23 |
| Accountable owner | Operations owner |
| Authority | Canonical repository specification when merged |
| Related | T-17 through T-20, SEC-13, SEC-14, OBS-1 through OBS-3, PRIV-11 |

## 1. Environments

Minimum environments:

- **local/test** — synthetic data only;
- **staging** — production-like topology and synthetic/provider-authorized sandbox data;
- **production** — real partner/customer data only after all release gates close.

Secrets, databases, OAuth clients, provider credentials, telemetry, and domains are environment-separated.

## 2. Deployment Contract

A release must be reproducible from a commit SHA and lockfile. Deployment sequence:

1. build/verify immutable release;
2. pre-deploy schema compatibility check;
3. apply reviewed migrations with recorded result;
4. deploy web and worker compatible with the resulting schema;
5. run readiness/safe smoke checks;
6. observe error/reconciliation signals;
7. declare release healthy or execute rollback/run-forward procedure.

Destructive/irreversible migrations require an explicit expand/migrate/contract plan and tested backup/restore evidence.

## 3. Health and Readiness

Expose safe endpoints or platform checks for:

- process liveness;
- database connectivity/readiness;
- migration/schema compatibility;
- worker heartbeat/queue age;
- optional provider dependency health as a degraded signal, never as a credential-exposing proxy.

Health output must not contain PII, secrets, raw errors, or provider payloads.

## 4. Backup and Restore

Before production:

- record backup mechanism, encryption, region, retention and access roles;
- define recovery-point/recovery-time targets with the product/operations owner;
- restore an encrypted backup containing synthetic data into an isolated environment;
- verify relational integrity, auth/tenant data, shipment history, audit/outbox state, and application startup;
- document the actual measured restore evidence.

A backup configuration without a successful restore rehearsal is not accepted recovery evidence.

## 5. Rollback and Migration Safety

Rollback strategy must distinguish:

- application rollback with backward-compatible schema;
- run-forward fix where schema/data migration is not safely reversible;
- worker pausing when provider dispatch safety is uncertain.

Never roll back in a way that replays provider operations or loses ambiguous reconciliation state.

## 6. Incident Runbook Minimum

Every production incident record includes:

- severity/impact;
- affected environment and bounded tenant/branch scope;
- safe correlation IDs and release SHA;
- current provider/reconciliation state where relevant;
- containment action;
- owner/escalation;
- recovery verification;
- follow-up action.

Personal-data incidents are escalated to the privacy owner; engineering does not independently make regulatory-notification determinations.

## 7. Release Gate

T-20 may report release-ready only when:

- all required tasks are PASS with evidence;
- no unresolved P0 security/tenant/provider correctness blocker remains;
- T-10 required provider evidence exists;
- privacy/vendor/retention gates required for production are approved;
- restore and rollback rehearsal passed;
- alert destinations and owners are tested;
- migrations and full regression passed.

Release-ready does not itself authorize production deployment.
