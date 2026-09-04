---
name: herdr-open-worktree
description: Open an existing Git worktree as a Herdr workspace, focus it if already open, and optionally start Claude or Codex there. Use when the user asks to open, move into, or continue work in a worktree through Herdr. Do not use to create or delete worktrees or for general Herdr configuration.
---

# Open a Worktree in Herdr

Use Herdr's native worktree operation so the checkout retains worktree
provenance, grouping, branch status, and workspace behavior. Do not approximate
this with a generic workspace when `herdr worktree open` is available.

## Preconditions

Verify that the caller is inside Herdr before controlling the live session:

```sh
test "${HERDR_ENV:-}" = 1
```

If this fails, explain that the current agent cannot control the focused Herdr
session from outside Herdr and stop. Do not launch bare `herdr`; that opens the
TUI. The installed binary is authoritative, so inspect its current surface:

```sh
herdr --version
herdr worktree
```

Require `herdr worktree open`. If an older version lacks it, report the version
gap and suggest `herdr update`; do not silently fall back to layout automation.

## Resolve the checkout

Use the exact worktree path supplied by the user or produced earlier in the
conversation. If it is ambiguous, inspect the relevant repository with:

```sh
git -C <known-repository-or-worktree> worktree list --porcelain
```

Ask the user only when multiple plausible unopened worktrees remain. Before
opening, verify that the target exists and is a Git checkout:

```sh
git -C <target-path> rev-parse --show-toplevel
git -C <target-path> status --short --branch
```

Resolve paths to absolute physical paths. From `git worktree list --porcelain`,
use the primary checkout (the first `worktree` record, or its bare repository
parent) as the source `--cwd`. This matters when the caller is working from a
planning repository and the target worktree belongs to a different repository;
using the caller's active Herdr workspace would group it under the wrong repo.

## Open or focus the worktree

For an explicit request to open or switch to the checkout:

```sh
herdr worktree open --cwd <source-checkout> --path <target-worktree> --focus
```

Use `--no-focus` instead when the user asks to prepare it in the background.
Pass `--label` only when the user requested a particular workspace label;
otherwise let Herdr derive it from the checkout.

This command is intentionally idempotent: an unopened checkout becomes a new
workspace, while an already-open checkout returns or focuses its existing
workspace. Parse the workspace, tab, and pane IDs from the JSON response rather
than predicting them. Use `.result.already_open` to distinguish reuse from
creation.

## Optionally continue with an agent

Opening the workspace does not imply permission to launch another agent. Only
start Claude or Codex when the user asks to continue there with an agent.

First inspect `herdr agent list`. If the requested agent is already running in
the target workspace, focus it rather than creating a duplicate. Otherwise:

1. For a newly opened workspace, use the returned root pane if it is still an
   interactive shell.
2. For an existing or occupied workspace, create a dedicated tab and read its
   root pane ID from the response:

   ```sh
   herdr tab create --workspace <workspace-id> --cwd <target-worktree> \
     --label <useful-label> --focus
   ```

3. Start the requested kind with a short unique name:

   ```sh
   herdr agent start <unique-name> --kind <claude-or-codex> --pane <pane-id>
   ```

4. If the user supplied a handoff prompt, submit it after the agent is ready:

   ```sh
   herdr agent prompt <unique-name> <handoff-text> --wait --timeout 120000
   ```

Do not invent a handoff prompt, take over an occupied pane, or create an extra
tab merely to prove the workspace opened.

## Boundaries

- Do not run `herdr worktree create`; this workflow opens a checkout that
  already exists.
- Do not run `herdr worktree remove`, close workspaces, or delete branches.
- Use the JSON response's IDs and explicit `--workspace`/`--pane` targets.
- Preserve focus with `--no-focus` for background preparation.
- Report the target path, workspace label/ID, whether it was created or reused,
  and any agent/tab started.
