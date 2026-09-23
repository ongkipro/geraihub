# Repository Governance

## Canonical branches and review

`main` is the canonical accepted repository state. Material changes should arrive through a reviewable pull request with the Specification Validation workflow passing.

Required GitHub branch/ruleset controls:

- require pull requests before merge;
- require the `Specification Validation / validate` status check;
- block force pushes and branch deletion;
- require conversation resolution;
- require at least one approving review once more than one independent maintainer exists.

On 2026-09-23, GitHub branch protection API reported `main` protected: PRs are required, the strict GitHub Actions `validate` check is required, conversations must be resolved, administrators are covered, and force pushes/deletion are disabled. The baseline `validate` check passed on `fe5742f`. The repository has one maintainer, so required approvals are zero; raise this to at least one independent approval when another maintainer is appointed. Recheck remote configuration before treating this observation as current.

## Ownership

`.github/CODEOWNERS` currently points to the repository owner as a bootstrap owner. Replace/add actual engineering, security, privacy, finance, design, and operations approvers when appointed. A CODEOWNERS entry does not waive separation-of-duties gates defined in the specifications.

## Supply-chain and workflow baseline

- Every reusable GitHub Action is pinned to a full 40-character commit SHA; the human-readable release tag is kept as a comment.
- Workflow permissions stay least-privilege and checkout must not retain push credentials for read-only validation.
- Once `package.json` exists, pnpm is the sole JavaScript package manager; `packageManager` pins the pnpm version and `pnpm-lock.yaml` is committed.
- CI installs application dependencies with a frozen lockfile. A second npm/yarn/bun lockfile is a repository validation failure.
- Dependency/runtime/action upgrades are reviewable changes with test evidence; no auto-merge of security-sensitive upgrades is implied.

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
