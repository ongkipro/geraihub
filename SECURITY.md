# Security Policy

GeraiHub handles shipment/customer data and external provider credentials. Security defects involving tenant isolation, authentication, authorization, payment records, provider dispatch, secrets, or personal-data exposure are treated as sensitive.

## Reporting

Do **not** publish exploit details, credentials, customer data, or proof-of-concept data exposure in a public issue.

Prefer GitHub Private Vulnerability Reporting if it is enabled for this repository. If private reporting is unavailable, contact the repository owner through an agreed private channel and include only the minimum information necessary to reproduce the issue safely.

## Scope priorities

Highest-priority classes include:

- cross-organization/branch access or mutation;
- authentication/account-link/session bypass;
- privilege escalation or JIT-support bypass;
- duplicate/unauthorized provider order or cancellation;
- payment/audit history alteration;
- secret/session/PII exposure;
- SSRF or uncontrolled provider egress;
- unsafe migration/backup/restore behavior that can corrupt tenant history.

Use synthetic data for reproduction whenever possible. Never create a production shipment, cancellation, refund, or provider mutation merely to demonstrate a vulnerability.
