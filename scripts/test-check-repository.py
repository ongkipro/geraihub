#!/usr/bin/env python3
"""Regression checks for the documentation gate using disposable copies."""

import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CHECKER = ROOT / "scripts/check-repository.py"


class RepositoryGateTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="geraihub-doc-check-")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        paths = (
            list(ROOT.glob("*.md"))
            + list((ROOT / "docs").rglob("*.md"))
            + list((ROOT / ".github").rglob("*.md"))
            + list((ROOT / ".github/workflows").glob("*.yml"))
            + list((ROOT / "scripts").glob("*.py"))
        )
        for source in paths:
            target = self.root / source.relative_to(ROOT)
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(source.read_bytes())

    def check(self, expected=None):
        result = subprocess.run(
            [sys.executable, str(CHECKER), str(self.root)],
            capture_output=True, text=True, check=False,
        )
        if expected is None:
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        else:
            self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
            self.assertIn(expected, result.stdout)

    def replace(self, path, old, new):
        target = self.root / path
        text = target.read_text()
        self.assertIn(old, text)
        target.write_text(text.replace(old, new, 1))

    def test_valid_repository(self):
        self.check()

    def test_installed_and_generated_markdown_is_ignored(self):
        for directory in ["node_modules/package", ".next/cache"]:
            path = self.root / directory / "README.md"
            path.parent.mkdir(parents=True)
            path.write_text("[broken](missing.md)\n")
        self.check()

    def test_project_source_markdown_is_still_checked(self):
        path = self.root / "src/README.md"
        path.parent.mkdir(parents=True)
        path.write_text("[broken](missing.md)\n")
        self.check("broken local link: src/README.md")

    def test_navigation_link_is_not_a_second_declaration(self):
        self.replace("docs/spec/TRACEABILITY.md", "[PR-1](02-PRD.md)", "PR-1")
        self.check("duplicate declaration: PR-1")

    def test_missing_requirement_owner(self):
        self.replace("docs/spec/02-PRD.md", "| PR-1 | GeraiHub product owner |", "| PR-1 | |")
        self.check("missing accountable owner: PR-1")

    def test_unknown_requirement(self):
        self.replace("TASKS.md", "Primary requirement: TD-9", "Primary requirement: TD-9999")
        self.check("undeclared primary requirement TD-9999")

    def test_task_requires_single_primary(self):
        self.replace("TASKS.md", "Primary requirement: TD-9", "Primary requirement: TD-9, PR-1")
        self.check("exactly one PR/TD primary requirement")

    def test_task_requires_completion_check(self):
        self.replace("TASKS.md", "- Done when:", "- Completion omitted:")
        self.check("T-1 missing Done when metadata")

    def test_dependency_cycle(self):
        self.replace("TASKS.md", "- Dependencies: None", "- Dependencies: T-1")
        self.check("task dependency graph contains a cycle")

    def test_blank_completion_does_not_consume_the_next_field(self):
        target = self.root / "TASKS.md"
        lines = target.read_text().splitlines()
        index = next(i for i, line in enumerate(lines) if line.startswith("- Done when:"))
        lines[index] = "- Done when: "
        target.write_text("\n".join(lines) + "\n")
        self.check("T-1 missing Done when metadata")

    def test_malformed_dependencies(self):
        self.replace("TASKS.md", "- Dependencies: T-2, T-23", "- Dependencies: pending")
        self.check("T-1 has malformed Dependencies metadata")

    def test_unknown_dependency(self):
        self.replace("TASKS.md", "- Dependencies: T-2, T-23", "- Dependencies: T-9999")
        self.check("unknown dependency T-9999")

    def test_missing_handoff(self):
        (self.root / "docs/spec/HANDOFF.md").unlink()
        self.check("missing required file: docs/spec/HANDOFF.md")

    def test_adr_must_declare_its_id(self):
        self.replace("docs/adr/ADR-001-RUNTIME-DEPLOYMENT-PROFILE.md", "## ADR-001", "## Record")
        self.check("unresolved requirement/task reference: ADR-001")

    def test_missing_action_is_detected(self):
        path = self.root / "docs/spec/17-UX-FLOWS-SCREEN-CONTRACTS.md"
        path.write_text("\n".join(line for line in path.read_text().splitlines()
                                  if not line.startswith("| A-12 ")) + "\n")
        self.check("unresolved screen/action reference: A-12")

    def test_duplicate_action_is_detected(self):
        path = self.root / "docs/spec/17-UX-FLOWS-SCREEN-CONTRACTS.md"
        text = path.read_text()
        row = next(line for line in text.splitlines() if line.startswith("| A-12 "))
        path.write_text(text + "\n" + row + "\n")
        self.check("duplicate screen/action: A-12")

    def test_action_requires_task_owner(self):
        path = self.root / "docs/spec/17-UX-FLOWS-SCREEN-CONTRACTS.md"
        text = path.read_text()
        row = next(line for line in text.splitlines() if line.startswith("| A-12 "))
        path.write_text(text.replace(row, row.replace("T-12/21", "unassigned")))
        self.check("screen/action lacks task owner: A-12")

    def test_unknown_screen_is_detected(self):
        self.replace("TASKS.md", "S-01 through S-09", "S-01 through S-99")
        self.check("unresolved screen/action reference: S-99")


if __name__ == "__main__":
    unittest.main()
