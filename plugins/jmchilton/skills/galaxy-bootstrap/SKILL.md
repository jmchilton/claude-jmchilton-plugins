---
name: galaxy-bootstrap
description: Bootstrap a Galaxy worktree with Python deps, client deps, Playwright, and config
disable-model-invocation: true
argument-hint: [galaxy-root-path]
allowed-tools: Bash(*), Read(*)
---

Bootstrap a Galaxy worktree for development. If no path provided, use current directory.

## Usage

```
/galaxy-bootstrap [path-to-galaxy-root]
```

## What This Does

1. Creates `.venv` virtual environment (if not exists)
2. Installs Python deps including dev dependencies via `uv`
3. Installs Playwright browsers
4. Enables pnpm via corepack (if needed)
5. Installs client dependencies via pnpm
6. Creates `config/galaxy.yml` from sample with:
   - `preload: true` (enabled)
   - `admin_users: jmchilton@gmail.com`

## Preconditions

- `uv` must be installed
- Node.js must be installed (for corepack/pnpm)
- Galaxy source must exist at target path

## Implementation

Run `bootstrap.sh` from this skill's directory (shown in the "Base directory for this skill" header that the harness prepends to this prompt — do NOT hardcode `~/.claude/skills/...`, since this skill ships as part of a plugin and lives under `~/.claude/plugins/cache/.../skills/galaxy-bootstrap/`):

```bash
"<base-directory>/bootstrap.sh" $ARGUMENTS
```

After completion, report:
- Whether each step succeeded
- The paths to `.venv` and `config/galaxy.yml`
- Commands to start Galaxy (`./run.sh`) and Vite dev server (`make client-dev-server`)
