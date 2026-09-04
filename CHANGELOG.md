# Changelog

All notable changes to the `jmchilton` plugin are documented here. Versions
follow Semantic Versioning.

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
