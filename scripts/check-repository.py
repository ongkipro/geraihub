#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import re
import sys
from collections import defaultdict, deque
from pathlib import Path

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
errors: list[str] = []

GENERATED_DIRS = {
    ".git", ".next", ".turbo", ".venv", "build", "coverage", "dist",
    "node_modules", "playwright-report", "test-results",
}


def project_markdown_files(root: Path) -> list[Path]:
    paths: list[Path] = []
    for directory, children, files in os.walk(root):
        children[:] = [name for name in children if name not in GENERATED_DIRS]
        paths.extend(Path(directory) / name for name in files if name.endswith(".md"))
    return sorted(paths)


markdown_files = project_markdown_files(ROOT)

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
    "docs/spec/HANDOFF.md",
    "docs/spec/GLOSSARY.md",
    "docs/spec/TRACEABILITY.md",
    "docs/spec/DECISION-GATES.md",
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
    "docs/adr/ADR-001-RUNTIME-DEPLOYMENT-PROFILE.md",
    "docs/adr/ADR-002-TENANT-DATABASE-ENFORCEMENT.md",
    "docs/adr/ADR-003-OUTBOX-RECONCILIATION.md",
    "docs/adr/ADR-004-MONEY-CONCURRENCY.md",
    "docs/adr/ADR-005-SESSION-ACTIVE-BRANCH-CONTEXT.md",
]

for rel in REQUIRED:
    if not (ROOT / rel).is_file():
        errors.append(f"missing required file: {rel}")

# Validate local Markdown links.
link_re = re.compile(r"\[[^\]]+\]\(([^)]+)\)")
for path in markdown_files:
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

# Keep reference tables as links; only plain IDs declare canonical requirements.
id_pattern = r"(?:PR|NFR|TD|ADR|ARCH|DATA|TEN|IAM|API|UI|UX|BILL|SEC|PRIV|OBS|RATE|CTX|OVR|JUR|XFER|LOC|TEST|EVID)(?:-[A-Z0-9]+)*-\d+|T-\d+"
id_re = re.compile(rf"\b(?:{id_pattern})\b")
heading_re = re.compile(rf"^#{{2,6}}\s+({id_pattern})\b")
declarations: dict[str, list[tuple[str, dict[str, str]]]] = defaultdict(list)
references: list[tuple[str, str]] = []

for path in markdown_files:
    lines = path.read_text(encoding="utf-8").splitlines()
    visible: list[str] = []
    fence = None
    for line in lines:
        marker = re.match(r"^\s*(`{3,}|~{3,})", line)
        if marker:
            token = marker.group(1)
            if fence is None:
                fence = token
            elif token[0] == fence[0] and len(token) >= len(fence):
                fence = None
            visible.append("")
        else:
            visible.append(line if fence is None else "")

    headers: list[str] = []
    for index, line in enumerate(visible):
        location = f"{path.relative_to(ROOT)}:{index + 1}"
        references.extend((identifier, location) for identifier in id_re.findall(line))
        heading = heading_re.match(line)
        if heading:
            metadata: dict[str, str] = {}
            for following in visible[index + 1:]:
                if re.match(r"^#{1,6}\s", following):
                    break
                field = re.match(r"^- ([^:]+):\s*(.+)$", following)
                if field:
                    metadata.setdefault(field.group(1).strip().lower(), field.group(2).strip())
            declarations[heading.group(1)].append((location, metadata))
        if not line.startswith("|"):
            headers = []
            continue
        cells = [cell.strip().strip("`") for cell in re.split(r"(?<!\\)\|", line.strip().strip("|"))]
        if not headers:
            headers = [cell.lower() for cell in cells]
        elif id_re.fullmatch(cells[0]):
            declarations[cells[0]].append((location, dict(zip(headers, cells))))

for identifier, entries in declarations.items():
    if len(entries) != 1:
        errors.append(f"duplicate declaration: {identifier} at {', '.join(location for location, _ in entries)}")
    for location, metadata in entries:
        if not any(value.strip() for key, value in metadata.items() if key == "owner" or key.endswith(" owner")):
            errors.append(f"missing accountable owner: {identifier} at {location}")

for identifier, location in references:
    if identifier not in declarations:
        errors.append(f"unresolved requirement/task reference: {identifier} at {location}")

# Parse task metadata/dependencies and prove the graph is acyclic.
tasks_path = ROOT / "TASKS.md"
if tasks_path.is_file():
    text = tasks_path.read_text(encoding="utf-8")
    task_decl_re = re.compile(r"^###\s+(T-\d+)\s+—\s+(.+)$", re.M)
    matches = list(task_decl_re.finditer(text))
    ids = [m.group(1) for m in matches]
    if not ids:
        errors.append("TASKS.md has no task declarations")
    duplicates = sorted({x for x in ids if ids.count(x) > 1})
    if duplicates:
        errors.append("duplicate task IDs: " + ", ".join(duplicates))

    task_set = set(ids)
    deps: dict[str, set[str]] = {x: set() for x in ids}
    for i, match in enumerate(matches):
        tid = match.group(1)
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        block = text[match.end():end]
        for field in ["Status", "Owner", "Constraints", "Done when"]:
            if not re.search(rf"^- {field}:[ \t]*\S.*$", block, re.M):
                errors.append(f"{tid} missing {field} metadata")
        primaries = re.findall(r"^- Primary requirement:[ \t]*(.+)$", block, re.M)
        if len(primaries) != 1 or not re.fullmatch(r"(?:PR|TD)-\d+", primaries[0].strip()):
            errors.append(f"{tid} must have exactly one PR/TD primary requirement")
        elif primaries[0].strip() not in declarations:
            errors.append(f"{tid} references undeclared primary requirement {primaries[0].strip()}")
        dep_match = re.search(r"^- Dependencies:[ \t]*(.+)$", block, re.M)
        if not dep_match:
            errors.append(f"{tid} missing Dependencies metadata")
            continue
        raw = dep_match.group(1).strip()
        if raw.lower() != "none":
            if not re.fullmatch(r"T-\d+(?:,\s*T-\d+)*", raw):
                errors.append(f"{tid} has malformed Dependencies metadata")
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

ux_path = ROOT / "docs/spec/17-UX-FLOWS-SCREEN-CONTRACTS.md"
if ux_path.is_file():
    # Screen/action families are navigation contracts, not requirement declarations.
    surface_re = re.compile(r"\b(?:S|A)-\d{2}\b")
    surface_rows: dict[str, list[int]] = defaultdict(list)
    for number, line in enumerate(ux_path.read_text(encoding="utf-8").splitlines(), 1):
        match = re.match(r"^\| ((?:S|A)-\d{2})\b", line)
        if not match:
            continue
        identifier = match.group(1)
        surface_rows[identifier].append(number)
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        expected_count = 5 if identifier.startswith("S-") else 4
        if len(cells) != expected_count or not all(cells):
            errors.append(f"incomplete screen/action row: {identifier} at UX:{number}")
            continue
        owner_cell = cells[3] if identifier.startswith("S-") else cells[2]
        if not re.search(r"\bT-\d+\b", owner_cell):
            errors.append(f"screen/action lacks task owner: {identifier} at UX:{number}")
        if identifier.startswith("A-") and not re.search(r"\bS-\d{2}\b", cells[1]):
            errors.append(f"action lacks screen path: {identifier} at UX:{number}")
    for identifier, rows in surface_rows.items():
        if len(rows) != 1:
            errors.append(f"duplicate screen/action: {identifier} at UX:{rows}")
    for path in markdown_files:
        for identifier in sorted(set(surface_re.findall(path.read_text(encoding="utf-8")))):
            if identifier not in surface_rows:
                errors.append(f"unresolved screen/action reference: {identifier} at {path.relative_to(ROOT)}")

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
    f"markdown_files={len(markdown_files)}"
)
