---
name: herdr-config
description: Install, configure, and customize herdr (terminal-native agent multiplexer, github.com/ogulcancelik/herdr) — keybindings, themes, agent integrations, UI/notification/sound settings, live config reload, and troubleshooting. Edits ~/.config/herdr/config.toml.
argument-hint: "[task] (e.g., keybindings, theme tokyo-night, install-integration claude, status, reload)"
allowed-tools: Bash(*), Read(*), Edit(*), Write(*)
---

Configure the user's local herdr install. Scope = **setup & customization**, primarily `~/.config/herdr/config.toml`.

NOT in scope: orchestrating herdr from inside it (panes/workspaces/agents over the socket API). herdr ships its own `herdr` skill for that, available when running inside herdr (`HERDR_ENV=1`). If the user wants orchestration, point them there instead of duplicating it.

## Usage

```
/herdr-config [task]
```

- `/herdr-config` — show status (installed? version? config present? current theme/keys) and ask what to change
- `/herdr-config keybindings` — interactively customize `[keys]` (the headline use case)
- `/herdr-config theme tokyo-night` — set / preview themes
- `/herdr-config install-integration claude` — wire an agent's hooks into herdr
- `/herdr-config reload` — apply config.toml to the running server

## Source of truth — verify before writing

herdr is actively developed (this skill was written against ~v0.5.x). **Config key names and defaults can drift between versions.** Before writing any key into `config.toml`:

1. `herdr --version`
2. `herdr --default-config` — authoritative current schema + defaults for the installed binary

Treat `config-reference.md` (bundled next to this file) as orientation, not gospel. If the live `--default-config` disagrees with the bundled reference, the live output wins — surface the discrepancy to the user.

## Preconditions

1. **Installed?** `command -v herdr && herdr --version`. If missing, offer to install:
   ```bash
   curl -fsSL https://herdr.dev/install.sh | sh
   ```
   Don't run network-install without the user confirming. `herdr update` updates an existing install.
2. **Config exists?** `~/.config/herdr/config.toml`. If absent, seed it:
   ```bash
   herdr --default-config > ~/.config/herdr/config.toml
   ```
   (Confirm with the user first — they may prefer a minimal file with only overrides.)
3. **Back up before non-trivial edits:** `cp ~/.config/herdr/config.toml ~/.config/herdr/config.toml.bak`

## Applying changes — live reload

Keybindings, theme, and most UI settings are **reloadable without restarting**:

```bash
herdr server reload-config
```

(Or, inside herdr: global menu → `reload config`.) Reload is server-owned: it reads, validates, and applies `config.toml`.

- Invalid TOML → reload applies **nothing**, keeps current running state. Always recommend a reload after editing so the user catches errors immediately.
- Startup-only (need full restart): `experimental.allow_nested`, `onboarding`. Existing pane scrollback buffers aren't resized on reload.

After any edit: validate, `herdr server reload-config`, then report whether herdr accepted it (watch for a startup/validation warning).

## Keybindings (headline workflow)

Keybindings live under `[keys]` in `config.toml`. Workflow:

1. Read the current `[keys]` / `[keys.indexed]` / `[[keys.command]]` from `config.toml` (and compare against `herdr --default-config` to see what's already customized vs default).
2. Ask the user what they want bound (use AskUserQuestion for discrete choices; accept freeform too). Map their intent to the action names in the table below.
3. **Validate before writing:**
   - **No duplicate keys among navigate-mode actions.** Duplicates are a config error — herdr discards the conflicting binding and falls back to the default with a startup warning. Check the whole `[keys]` block, not just the line you changed.
   - Uppercase letter ⇒ implies shift: `D` == `shift+d`. Don't bind both.
   - Prefer **reliable** keys: plain keys, `ctrl+<letter>`, `esc`/`tab`/`enter`, function keys. Warn that `alt+…`, `cmd`/`super`, and punctuation-with-modifiers vary by terminal/tmux and may not fire.
4. Edit `config.toml`, `herdr server reload-config`, confirm no validation warning.

### Key syntax

- plain: `n`, `x`, `-`, `` ` ``
- modifiers: `ctrl+b`, `shift+n`, `alt+x`, `cmd+x`, `super+x`
- special: `enter`, `esc`, `tab`, `backspace`, `left`/`right`/`up`/`down`
- function: `f1`..`f12`
- `""` = unset (no key bound; valid for any action)

### Action reference (`[keys]`)

`prefix` enters/leaves navigate mode; navigate-mode actions are pressed after the prefix. Defaults below are herdr ~0.5.x — confirm via `herdr --default-config`.

| key | default | action |
|-----|---------|--------|
| `prefix` | `ctrl+b` | enter/leave navigate mode |
| `new_workspace` | `n` | create workspace |
| `rename_workspace` | `shift+n` | rename selected workspace |
| `close_workspace` | `shift+d` | close selected workspace |
| `previous_workspace` / `next_workspace` | unset | switch workspace from terminal mode |
| `previous_agent` / `next_agent` | unset | focus prev/next agent in sidebar |
| `new_tab` | `c` | create tab |
| `rename_tab` | unset | rename active tab |
| `close_tab` | unset | close active tab |
| `previous_tab` / `next_tab` | unset | switch tab from terminal mode |
| `split_vertical` | `v` | split pane side-by-side |
| `split_horizontal` | `-` | split pane stacked |
| `close_pane` | `x` | close focused pane |
| `rename_pane` | unset | rename focused pane |
| `focus_pane_left/down/up/right` | unset | move focus directionally from terminal mode |
| `zoom` | `f` | zoom focused pane (legacy alias: `fullscreen`) |
| `resize_mode` | `r` | enter/leave resize mode (then `h/l` width, `j/k` height, `esc` exit) |
| `toggle_sidebar` | `b` | collapse/expand sidebar |
| `detach` | unset | explicit detach in persistent session |
| `reload_config` | unset | reload config.toml from inside herdr |
| `edit_scrollback` | unset | open focused pane scrollback in `$EDITOR` |
| `open_notification_target` | unset | jump to visible notification's pane |

### Indexed shortcuts (`[keys.indexed]`)

Bind number keys 1–9 positionally. Value is a modifier combo only; `""` disables.

```toml
[keys.indexed]
tabs = "ctrl"          # ctrl+1..9 → tab N in active workspace
workspaces = "ctrl+shift"  # ctrl+shift+1..9 → workspace N
agents = ""            # follows visible agent panel order
```

### Custom command keys (`[[keys.command]]`)

Bind a prefix-mode key to a shell command:

```toml
[[keys.command]]
key = "g"
type = "pane"     # "pane" = temp zoomed pane, closes on exit; "shell" (default) = detached background
command = "lazygit"
```

Runs via `/bin/sh -lc` in the active pane's cwd. Available env: `HERDR_SOCKET_PATH`, `HERDR_BIN_PATH`, `HERDR_ACTIVE_WORKSPACE_ID`, `HERDR_ACTIVE_TAB_ID`, `HERDR_ACTIVE_PANE_ID`, `HERDR_ACTIVE_PANE_CWD`.

## Other tasks (see config-reference.md for full detail)

Read `config-reference.md` (bundled beside this SKILL.md) before doing any of these — it has the full option tables for themes, UI, notifications, sound, experimental, advanced, and agent integrations.

- **Theme** — 17 built-ins (`catppuccin` default, `tokyo-night`, `gruvbox`, `dracula`, `nord`, …) under `[theme]`; per-token overrides under `[theme.custom]`. Names are flexible (`tokyo-night` == `tokyonight` == `tokyo_night`).
- **Agent integrations** — `herdr integration install <claude|codex|pi|opencode>` forwards semantic agent state (working/blocked/idle) over the socket API. For Claude Code it writes `~/.claude/hooks/herdr-agent-state.sh` and edits `~/.claude/settings.json` (respects `CLAUDE_CONFIG_DIR`). After install, restart the agent session. `herdr integration uninstall <agent>` reverses it.
- **UI** — `[ui]`: `sidebar_width`, `mouse_capture`, `confirm_close`, `prompt_new_tab_name`, `agent_panel_scope`.
- **Notifications** — `[ui.toast] delivery = off|herdr|terminal|system`. On macOS, `system` works best with `brew install terminal-notifier` (enables click-to-return-to-terminal).
- **Sound** — `[ui.sound]` + per-agent `[ui.sound.agents]` (`claude`, `codex`, …) = `default|on|off`.
- **Advanced / experimental** — `[advanced] scrollback_limit_bytes`; `[experimental] allow_nested` (restart-only), `kitty_graphics`.
- **Logs / troubleshooting** — `~/.config/herdr/herdr-client.log`, `herdr-server.log`, `herdr.log`. More verbosity: `HERDR_LOG=herdr=debug herdr`. Logs rotate by size.
- **Sessions** — `herdr session list|attach|stop|delete <name>` (runtime/socket namespaces; they share the one config.toml). `herdr server stop` stops the shared background server.

## Workflow summary

1. Verify install (`herdr --version`); offer install/update if needed.
2. Verify/seed `~/.config/herdr/config.toml`; back it up.
3. Cross-check intended keys against `herdr --default-config` (schema may have drifted from this skill's reference).
4. For keybindings: gather intent → validate (no nav-mode dupes, prefer reliable keys, uppercase=shift) → edit.
5. For other tasks: read `config-reference.md`, then edit the right section.
6. `herdr server reload-config`; confirm herdr accepted it (no validation warning); report what changed and how to revert (`.bak`).
