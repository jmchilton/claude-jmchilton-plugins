#!/usr/bin/env python3
"""Validate the dual-host plugin release and version policy."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CLAUDE_MANIFEST = Path("plugins/jmchilton/.claude-plugin/plugin.json")
CODEX_MANIFEST = Path("plugins/jmchilton/.codex-plugin/plugin.json")
PLUGIN_ROOT = Path("plugins/jmchilton")
SEMVER = re.compile(r"^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$")


def fail(message: str) -> None:
    print(f"error: {message}", file=sys.stderr)
    raise SystemExit(1)


def load_json(relative_path: Path) -> dict:
    path = ROOT / relative_path
    try:
        return json.loads(path.read_text())
    except (OSError, json.JSONDecodeError) as exc:
        fail(f"cannot read valid JSON from {relative_path}: {exc}")


def git(*args: str) -> str:
    result = subprocess.run(
        ["git", *args],
        cwd=ROOT,
        check=False,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if result.returncode:
        fail(f"git {' '.join(args)} failed: {result.stderr.strip()}")
    return result.stdout


def version_at(ref: str) -> str | None:
    result = subprocess.run(
        ["git", "show", f"{ref}:{CLAUDE_MANIFEST.as_posix()}"],
        cwd=ROOT,
        check=False,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if result.returncode:
        return None
    try:
        return json.loads(result.stdout)["version"]
    except (json.JSONDecodeError, KeyError, TypeError):
        fail(f"cannot resolve a version from {ref}:{CLAUDE_MANIFEST}")


def validate_skill(skill_dir: Path) -> None:
    skill_file = skill_dir / "SKILL.md"
    if not skill_file.is_file():
        fail(f"skill directory lacks SKILL.md: {skill_dir.relative_to(ROOT)}")
    text = skill_file.read_text()
    if not text.startswith("---\n"):
        fail(f"SKILL.md lacks YAML frontmatter: {skill_file.relative_to(ROOT)}")
    try:
        frontmatter = text.split("---\n", 2)[1]
    except IndexError:
        fail(f"SKILL.md has unterminated YAML frontmatter: {skill_file.relative_to(ROOT)}")
    fields = {
        match.group(1): match.group(2).strip()
        for match in re.finditer(r"^(name|description):\s*(.+)$", frontmatter, re.MULTILINE)
    }
    for field in ("name", "description"):
        if not fields.get(field):
            fail(f"SKILL.md lacks {field}: {skill_file.relative_to(ROOT)}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--base-ref",
        help="Git revision used to require a version bump when plugin files changed",
    )
    args = parser.parse_args()

    claude = load_json(CLAUDE_MANIFEST)
    codex = load_json(CODEX_MANIFEST)
    claude_marketplace = load_json(Path(".claude-plugin/marketplace.json"))
    codex_marketplace = load_json(Path(".agents/plugins/marketplace.json"))

    if claude.get("name") != codex.get("name"):
        fail("Claude and Codex plugin names differ")

    version = claude.get("version")
    if not isinstance(version, str) or not SEMVER.fullmatch(version):
        fail("Claude manifest version must be clean semantic versioning without build metadata")
    if codex.get("version") != version:
        fail("Claude and Codex manifest versions must match exactly in committed releases")

    changelog = (ROOT / "CHANGELOG.md").read_text()
    if f"## [{version}]" not in changelog:
        fail(f"CHANGELOG.md lacks a heading for {version}")

    for marketplace_name, marketplace in (
        ("Claude", claude_marketplace),
        ("Codex", codex_marketplace),
    ):
        entries = marketplace.get("plugins")
        if not isinstance(entries, list):
            fail(f"{marketplace_name} marketplace has no plugins list")
        matches = [entry for entry in entries if entry.get("name") == claude["name"]]
        if len(matches) != 1:
            fail(f"{marketplace_name} marketplace must contain exactly one jmchilton entry")
        if "version" in matches[0]:
            fail(f"{marketplace_name} marketplace entry must not declare a plugin version")

    skills_root = ROOT / PLUGIN_ROOT / "skills"
    skill_dirs = sorted(path for path in skills_root.iterdir() if path.is_dir())
    if not skill_dirs:
        fail("plugin contains no skills")
    for skill_dir in skill_dirs:
        validate_skill(skill_dir)

    if args.base_ref and set(args.base_ref) != {"0"}:
        changed = set(git("diff", "--name-only", f"{args.base_ref}...HEAD").splitlines())
        plugin_changed = any(
            path == PLUGIN_ROOT.as_posix() or path.startswith(f"{PLUGIN_ROOT.as_posix()}/")
            for path in changed
        )
        if plugin_changed:
            base_version = version_at(args.base_ref)
            if base_version == version:
                fail(
                    f"plugin files changed relative to {args.base_ref}, but version remains {version}"
                )

    print(f"validated jmchilton plugin release {version} ({len(skill_dirs)} skills)")


if __name__ == "__main__":
    main()
