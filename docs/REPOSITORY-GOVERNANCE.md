# Repository Governance

## Canonical branches and review

`main` is the canonical accepted repository state. Material changes should arrive through a reviewable pull request with the Specification Validation workflow passing.

Recommended GitHub branch/ruleset controls:

- require pull requests before merge;
- require the `Specification Validation / validate` status check;
- block force pushes and branch deletion;
- require conversation resolution;
- optionally require at least one approving review once more than one maintainer exists.

These settings are repository-administration controls and are not claimed enabled merely because this document exists.

## Ownership

`.github/CODEOWNERS` currently points to the repository owner as a bootstrap owner. Replace/add actual engineering, security, privacy, finance, design, and operations approvers when appointed. A CODEOWNERS entry does not waive separation-of-duties gates defined in the specifications.

## Change classes

| Change | Minimum review evidence |
|---|---|
| Documentation clarification | repository validator |
| Product/permission/state change | owning requirement + updated tests/acceptance contract |
| Architecture decision | ADR |
| Database/migration | generated/reviewed SQL + disposable DB migration/rollback or run-forward evidence |
| Provider adapter | T-10 verified contract evidence + adapter tests |
| Security/privacy control | owner review + negative tests |
| Production/deployment | T-17 through T-20 evidence |

## No direct evidence by assertion

A checklist, document, or merged PR can state a requirement. Only an executed test, observed provider result, verified configuration, or approved specialist decision closes the corresponding runtime/provider/legal gate.
