#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from collections import defaultdict, deque
from pathlib import Path

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
errors: list[str] = []

REQUIRED = [
    "README.md",
    "STATUS.md",
    "PRD.md",
    "TASKS.md",
    "CONTRIBUTING.md",
    "SECURITY.md",
    "docs/REPOSITORY-GOVERNANCE.md",
    ".github/workflows/spec-validation.yml",
    "docs/spec/README.md",
    "docs/spec/02-PRD.md",
    "docs/spec/03-TECHNICAL-DESIGN.md",
    "docs/spec/04-SYSTEM-ARCHITECTURE.md",
    "docs/spec/05-DATA-MODEL.md",
    "docs/spec/06-TENANT-ISOLATION.md",
    "docs/spec/07-IAM-RBAC-ABAC.md",
    "docs/spec/08-STATE-CONCURRENCY-CONTRACT.md",
    "docs/spec/09-API-SPECIFICATION.md",
    "docs/spec/10-DESIGN-SYSTEM-WHITELABEL.md",
    "docs/spec/11-BILLING-PAYMENTS.md",
    "docs/spec/12-SECURITY-ARCHITECTURE.md",
    "docs/spec/13-COMPLIANCE-PRIVACY.md",
    "docs/spec/14-TEST-STRATEGY.md",
    "docs/spec/15-OPERATIONS-RELEASE-READINESS.md",
    "docs/spec/16-OBSERVABILITY-RATE-LIMITING.md",
    "docs/spec/17-UX-FLOWS-SCREEN-CONTRACTS.md",
    "docs/spec/18-ERROR-AND-RESULT-CONTRACT.md",
    "docs/spec/CONTEXT-RECORD.md",
    "docs/adr/README.md",
    "docs/adr/ADR-005-SESSION-ACTIVE-BRANCH-CONTEXT.md",
]

for rel in REQUIRED:
    if not (ROOT / rel).is_file():
        errors.append(f"missing required file: {rel}")

# Validate local Markdown links.
link_re = re.compile(r"\[[^\]]+\]\(([^)]+)\)")
for path in ROOT.rglob("*.md"):
    text = path.read_text(encoding="utf-8")
    for target in link_re.findall(text):
        target = target.strip().split("#", 1)[0]
        if not target or target.startswith(("http://", "https://", "mailto:", "#")):
            continue
        if target.startswith("<") and target.endswith(">"):
            target = target[1:-1]
        resolved = (path.parent / target).resolve()
        try:
            resolved.relative_to(ROOT)
        except ValueError:
            continue
        if not resolved.exists():
            errors.append(f"broken local link: {path.relative_to(ROOT)} -> {target}")

# The spec index must list every canonical spec document.
spec_dir = ROOT / "docs/spec"
if spec_dir.is_dir() and (spec_dir / "README.md").is_file():
    index = (spec_dir / "README.md").read_text(encoding="utf-8")
    for p in sorted(spec_dir.glob("*.md")):
        if p.name == "README.md":
            continue
        if f"({p.name})" not in index:
            errors.append(f"spec index missing: {p.name}")

# The ADR index must list every ADR document.
adr_dir = ROOT / "docs/adr"
if adr_dir.is_dir() and (adr_dir / "README.md").is_file():
    index = (adr_dir / "README.md").read_text(encoding="utf-8")
    for p in sorted(adr_dir.glob("ADR-*.md")):
        if f"({p.name})" not in index:
            errors.append(f"ADR index missing: {p.name}")

# Parse task declarations/dependencies and prove the graph is acyclic.
tasks_path = ROOT / "TASKS.md"
if tasks_path.is_file():
    text = tasks_path.read_text(encoding="utf-8")
    task_decl_re = re.compile(r"^###\s+(T-\d+)\s+—\s+(.+)$", re.M)
    matches = list(task_decl_re.finditer(text))
    ids = [m.group(1) for m in matches]
    duplicates = sorted({x for x in ids if ids.count(x) > 1})
    if duplicates:
        errors.append("duplicate task IDs: " + ", ".join(duplicates))

    task_set = set(ids)
    deps: dict[str, set[str]] = {x: set() for x in ids}
    for i, match in enumerate(matches):
        tid = match.group(1)
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        block = text[match.end():end]
        dep_match = re.search(r"^- Dependencies:\s*(.+)$", block, re.M)
        if not dep_match:
            errors.append(f"{tid} missing Dependencies metadata")
            continue
        raw = dep_match.group(1).strip()
        if raw.lower() != "none":
            for dep in re.findall(r"T-\d+", raw):
                if dep not in task_set:
                    errors.append(f"{tid} references unknown dependency {dep}")
                else:
                    deps[tid].add(dep)

    indegree = {task: len(task_deps) for task, task_deps in deps.items()}
    reverse: dict[str, set[str]] = defaultdict(set)
    for task, task_deps in deps.items():
        for dep in task_deps:
            reverse[dep].add(task)

    queue = deque(sorted(task for task, count in indegree.items() if count == 0))
    visited = 0
    while queue:
        current = queue.popleft()
        visited += 1
        for nxt in sorted(reverse[current]):
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                queue.append(nxt)

    if visited != len(deps):
        errors.append("task dependency graph contains a cycle")

# Reusable GitHub Actions must be pinned to immutable commit SHAs.
workflow_dir = ROOT / ".github/workflows"
if workflow_dir.is_dir():
    uses_re = re.compile(r"^\s*uses:\s*[^@\s]+@([^\s#]+)", re.M)
    for path in sorted(list(workflow_dir.glob("*.yml")) + list(workflow_dir.glob("*.yaml"))):
        text = path.read_text(encoding="utf-8")
        for ref in uses_re.findall(text):
            if not re.fullmatch(r"[0-9a-f]{40}", ref):
                errors.append(f"workflow action not pinned to full SHA: {path.relative_to(ROOT)} -> {ref}")

# Once application code exists, enforce one reproducible JavaScript package-manager contract.
package_json = ROOT / "package.json"
if package_json.is_file():
    try:
        package = json.loads(package_json.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        errors.append(f"invalid package.json: {exc}")
    else:
        package_manager = str(package.get("packageManager", ""))
        if not re.fullmatch(r"pnpm@[^\s]+", package_manager):
            errors.append("package.json must pin packageManager as pnpm@<exact-version>")
        if not (ROOT / "pnpm-lock.yaml").is_file():
            errors.append("package.json exists but pnpm-lock.yaml is missing")
        for conflicting in ["package-lock.json", "yarn.lock", "bun.lock", "bun.lockb"]:
            if (ROOT / conflicting).exists():
                errors.append(f"conflicting JavaScript lockfile present: {conflicting}")

# Canonical validation must not depend on one developer's home-directory tooling.
for rel in ["README.md", "docs/spec/README.md"]:
    path = ROOT / rel
    if path.is_file() and "~/dotfiles/" in path.read_text(encoding="utf-8"):
        errors.append(f"{rel} still depends on machine-local ~/dotfiles tooling")

if errors:
    for error in errors:
        print(f"FAIL: {error}")
    print(f"FAIL findings={len(errors)}")
    raise SystemExit(1)

print(
    "PASS "
    f"required_files={len(REQUIRED)} "
    f"markdown_files={len(list(ROOT.rglob('*.md')))}"
)
