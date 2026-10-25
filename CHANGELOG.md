# Changelog

All notable changes to the `jmchilton` plugin are documented here. Versions
follow Semantic Versioning.

## [1.4.0] - 2026-10-25

### Added

- `rebase-evaluate-fixup` command: judge whether commits should be squashed
  together and write the squashed commit message.

### Changed

- `galaxy-playwright` runs through a new `galaxy_e2e.sh`: each worktree gets
  its own Galaxy and Vite on free ports (8090+N / 5180+N), tests target Vite,
  every test registers a fresh user (no `~/galaxy_selenium_context.yml`), admin
  and library config come via `GALAXY_CONFIG_OVERRIDE_*`, and Selenium runs
  are supported. `packages/test_selenium` package mode is dropped.
- `galaxy-bootstrap` installs CI's pinned ruff and mypy (plus stubs) from
  `pinned-lint-requirements.txt` and `pinned-typecheck-requirements.txt` when
  the branch has them.

## [1.3.0] - 2026-09-22

### Added

- Added small, shared writing, paper documentation, and software documentation skills.

## [1.2.1] - 2026-09-04

### Fixed

- Made `codex-review` Claude-only by moving it out of Codex's shared skill
  discovery path while retaining it through Claude's custom skill path.

## [1.2.0] - 2026-09-03

### Added

- Added `herdr-open-worktree`, a shared Claude Code and Codex workflow for
  opening an existing Git worktree as a native Herdr workspace and optionally
  starting an agent in that checkout.

## [1.1.0] - 2026-09-03

### Added

- Added Codex marketplace and plugin packaging alongside Claude Code packaging.
- Added the shared `codex-review` skill for independent, read-only reviews.
- Documented dual-host installation, portability boundaries, maintenance, and
  release policy.
- Added automated release-version and package-structure validation.

### Changed

- Expanded plugin metadata to include code-review workflows.
