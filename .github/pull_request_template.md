## Scope

Describe the exact requirement/task/ADR changed.

## Contract impact

- [ ] Product scope
- [ ] Tenant/IAM
- [ ] Data/state
- [ ] Provider boundary
- [ ] Billing/finance
- [ ] Security/privacy
- [ ] UX/accessibility
- [ ] Operations/deployment
- [ ] Documentation only

## Verification

Record the exact commands and safe results. Do not mark planned checks as passing.

```text
python3 scripts/check-repository.py .
```

## Safety checklist

- [ ] No secrets, tokens, credential-bearing URLs, production PII, or raw provider payloads.
- [ ] No Mengantar endpoint/payload/status behavior was invented.
- [ ] Cross-branch authorization impact was considered.
- [ ] State/concurrency/idempotency impact was considered.
- [ ] New local Markdown files are indexed where required.
- [ ] Unresolved legal/provider/production decisions remain explicit gates.
