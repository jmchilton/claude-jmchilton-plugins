# Repository Agent Guide

## Purpose

This repository is the canonical, versioned home for John Chilton's reusable
agent workflows. Keep skills reviewable, documented, and installable from the
same checkout in both Claude Code and Codex.

Do not treat copies under `~/.claude/`, `~/.codex/`, plugin caches, or other home
directories as source. Migrate useful local-only workflows into this repository
or `~/projects/repositories/galaxy-skills`, then install or symlink from their
maintained source.

## Repository contract

- `plugins/jmchilton/skills/` is the shared Claude Code and Codex skill surface.
- `plugins/jmchilton/commands/` is Claude Code-only until a command is converted
  into a provider-neutral skill.
- `.claude-plugin/marketplace.json` publishes the Claude Code marketplace.
- `.agents/plugins/marketplace.json` publishes the Codex marketplace.
- The two plugin manifests describe the same release and must keep matching
  names and clean release versions.
- `README.md` must accurately list components, compatibility, installation,
  update, validation, and maintenance instructions.
- `CHANGELOG.md` records every published version.

Preserve unrelated working-tree changes. Stage only files belonging to the
current task, and never hide user work with destructive Git commands.

## Adding or porting a skill

1. Choose the maintained home first. General personal workflows belong here;
   Galaxy-specific workflows normally belong in
   `~/projects/repositories/galaxy-skills`.
2. Copy the complete skill directory, including referenced scripts, examples,
   and assets. Do not leave a canonical skill stranded only in a home directory.
3. Keep shared skills provider-neutral unless the workflow genuinely targets a
   particular host. Describe both when the skill should and should not trigger.
4. Update the README inventory and any maintenance inventory that tracks the
   skill.
5. Validate the skill and both plugin packaging surfaces.
6. Replace intentional home-directory development copies with symlinks to the
   canonical checkout when that is more useful than a packaged install.

## Version and cache policy

This repository uses explicit semantic versions because Claude Code uses an
explicit plugin version as its update/cache key.

- `plugins/jmchilton/.claude-plugin/plugin.json` is the release-version source
  of truth.
- Every releasable change under `plugins/jmchilton/` requires a version bump:
  patch for fixes, minor for backward-compatible skills or commands, and major
  for breaking removals, renames, or behavior.
- `plugins/jmchilton/.codex-plugin/plugin.json` must contain the exact same clean
  version in commits and tags.
- Do not put a plugin version in a marketplace entry. This avoids competing
  version authorities. Marketplace-level descriptive metadata is not a plugin
  update key.
- Add a matching `CHANGELOG.md` heading before publishing.
- Tag releases as `vMAJOR.MINOR.PATCH` only after validation succeeds.
- A Codex local-development install may temporarily use
  `MAJOR.MINOR.PATCH+codex.<cachebuster>`. Generate it with the plugin-creator
  helper, install it, then restore the clean manifest. Never commit or tag the
  cachebuster suffix.

Uninstall/reinstall is exceptional recovery for a corrupt or historically
unversioned cache. The normal Claude Code update path is marketplace refresh,
plugin update, and `/reload-plugins` (or a new session).

## Validation

Run before every release:

```sh
python3 scripts/validate_plugin_release.py
claude plugin validate .
claude plugin validate plugins/jmchilton
python3 ~/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py \
  plugins/jmchilton
```

Validate every added or changed skill with Codex's skill validator:

```sh
python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  plugins/jmchilton/skills/<skill-name>
```

Legacy Claude commands can emit known frontmatter warnings. Record and improve
them deliberately; do not suppress new validation errors.

CI runs `scripts/validate_plugin_release.py` and additionally verifies that a
plugin-tree change differs from the base revision's release version.

## Release procedure

1. Choose and set the next semantic version in both plugin manifests.
2. Update `CHANGELOG.md` and the README/component inventory as needed.
3. Run all repository, Claude Code, Codex plugin, and changed-skill validators.
4. Commit the release, create the matching `vX.Y.Z` tag, and push both.
5. Exercise the normal Claude Code update path:

   ```sh
   claude plugin marketplace update claude-jmchilton-plugins
   claude plugin update jmchilton@claude-jmchilton-plugins
   ```

6. Run `/reload-plugins` or start a new Claude Code session and verify the new
   skill inventory.
7. For a Codex local-development install, use the plugin-creator cachebuster and
   reinstall flow, restore the clean manifest, then verify in a new thread.

## Instruction-file ownership

`AGENTS.md` is the single source of repository instructions. Root `CLAUDE.md`
must remain a relative symlink to `AGENTS.md` so Claude Code and Codex receive
the same guidance without duplicated text.
