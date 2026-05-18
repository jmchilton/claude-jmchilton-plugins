# herdr config reference (bundled snapshot)

Distilled from herdr's `CONFIGURATION.md` + `INTEGRATIONS.md` at ~v0.5.x. **Not authoritative** — the installed binary's `herdr --default-config` is. Use this for orientation; verify keys/defaults live before writing. Keybindings (`[keys]`, `[keys.indexed]`, `[[keys.command]]`) are documented in SKILL.md, not repeated here.

Config path: `~/.config/herdr/config.toml`. Named sessions share this one file. Apply edits with `herdr server reload-config` (invalid TOML → nothing applied, running state kept).

## What reload can / can't apply

Reloadable live: keybindings + prefix, theme/`[theme.custom]`/legacy `ui.accent`, `ui.confirm_close`, `ui.agent_panel_scope`, `ui.toast.delivery`, server-side `ui.sound` policy, `experimental.kitty_graphics`, `advanced.scrollback_limit_bytes` (for panes created after reload), `ui.sidebar_width` (as default; live width changes only while still config-owned).

Restart-only / special: `experimental.allow_nested` (checked before launch), `onboarding` (won't reopen on reload), existing pane scrollback buffers (not resized live).

## [theme]

```toml
[theme]
name = "tokyo-night"
```

Names are flexible: `tokyo-night` == `tokyonight` == `tokyo_night`.

Built-ins: `catppuccin` (default), `catppuccin-latte`, `tokyo-night`, `tokyo-night-day`, `dracula`, `nord`, `gruvbox`, `gruvbox-light`, `one-dark`, `one-light`, `solarized`, `solarized-light`, `kanagawa`, `kanagawa-lotus`, `rose-pine`, `rose-pine-dawn`, `vesper`.

### [theme.custom] — per-token overrides on top of base

```toml
[theme.custom]
accent = "#f5c2e7"
panel_bg = "reset"          # also: default | none | transparent → use host terminal bg
red = "rgb(255, 85, 85)"
```

All tokens optional; set only what changes. Values: hex `#rrggbb`, named colors, or `rgb(r,g,b)`.

Tokens: `accent` (highlights/active borders), `panel_bg` (panels/tab bar/overlay), `surface0` (selected bg), `surface1` (hover/active bg), `surface_dim` (active workspace bg/separators), `overlay0`/`overlay1` (muted/secondary text), `text` (primary), `subtext0` (workspace names/dim labels), `mauve` (git branch/special), `green` (idle/done), `yellow` (busy/running), `red` (needs attention), `blue` (unseen notifications), `teal` (done notification accent), `peach` (interrupted/warning).

## [ui]

```toml
[ui]
sidebar_width = 26
mouse_capture = true
confirm_close = true
prompt_new_tab_name = true
show_agent_labels_on_pane_borders = false
agent_panel_scope = "all"      # or "current"
accent = "cyan"                # named | #hex | rgb(r,g,b)  (legacy; theme.custom.accent preferred)
```

| option | default | note |
|--------|---------|------|
| `sidebar_width` | 26 | base width before auto-scaling |
| `mouse_capture` | true | false = terminal handles clicks, still forwards mouse to pane apps that ask |
| `confirm_close` | true | confirm before closing a workspace |
| `prompt_new_tab_name` | true | false = create tabs immediately with generated names |
| `show_agent_labels_on_pane_borders` | false | show detected agent labels on split borders when no manual name |
| `agent_panel_scope` | all | `current` = only active workspace's agents in sidebar |

## [ui.toast] — background notifications

```toml
[ui.toast]
delivery = "off"     # off | herdr | terminal | system
```

- `off` — disabled
- `herdr` — in-app top-right toast
- `terminal` — ask outer terminal to show desktop notification (some suppress foreground; e.g. Ghostty on macOS)
- `system` — OS notification service. **macOS:** prefers `terminal-notifier` (`brew install terminal-notifier`), enabling click-to-return-to-terminal for Ghostty/iTerm2/WezTerm/Kitty/Alacritty/Terminal.app; falls back to `osascript`. **Linux:** needs `notify-send`.

Tab-aware suppression: active tab stays quiet; background tabs in same workspace still notify. Legacy `ui.toast.enabled = true|false` still read; saving from inside herdr rewrites to `delivery`.

## [ui.sound]

```toml
[ui.sound]
enabled = true

[ui.sound.agents]
claude = "default"    # default | on | off
droid = "off"
```

Agent keys: `pi`, `claude`, `codex`, `gemini`, `cursor`, `cline`, `open_code`, `github_copilot`, `kimi`, `droid`, `amp`, `grok`.

## [experimental]

```toml
[experimental]
allow_nested = false      # true = allow launching herdr inside a herdr pane (restart-only; debug use)
kitty_graphics = false    # experimental local Kitty graphics; needs Kitty-graphics-capable outer terminal
```

`kitty_graphics` known issue: resizing window / changing font while images visible can leave them stale — redraw or restart the pane app.

## [advanced]

```toml
[advanced]
scrollback_limit_bytes = 10000000   # per-pane retained scrollback; 0 disables. matches Ghostty default.
```

Legacy `scrollback_lines` still accepted inside `[advanced]` but uses the same byte value.

## [onboarding]

```toml
onboarding = true
```

Missing ⇒ behaves like `true` (shows first-run notification setup). Continuing from onboarding writes `onboarding = false`. Set `true` to force the setup screen again.

## Environment variables

| var | purpose |
|-----|---------|
| `HERDR_LOG` | log level filter, default `herdr=info`; e.g. `HERDR_LOG=herdr=debug herdr` |
| `HERDR_ENV` | set to `1` when running *inside* herdr (used to detect/scope, blocks nested launch) |
| `CLAUDE_CONFIG_DIR` | overrides where the claude integration writes hook + settings.json |
| `CODEX_HOME` | overrides codex integration target dir |
| `PI_CODING_AGENT_DIR` | overrides pi extension target dir |

## Logs

`~/.config/herdr/herdr.log` (monolithic `--no-session` + some startup paths), `herdr-client.log` + `herdr-server.log` (persistent session mode — the usual ones). Rotate by size (`.1`, `.2`, …). Default logs are metadata-focused and shareable for issue reports.

## Agent integrations

`herdr integration install <agent>` / `herdr integration uninstall <agent>`. Hybrid model: process detection owns pane identity/liveness; integrations only enrich semantic state (`working`/`blocked`/`idle`) over the socket API; screen heuristics are the fallback. herdr works with zero integration setup (auto-detects agents) — integrations just improve state accuracy. After installing, **restart the agent session** so it picks up the new hook/plugin.

| agent | install writes | honors |
|-------|----------------|--------|
| `claude` | `~/.claude/hooks/herdr-agent-state.sh` + edits `~/.claude/settings.json` | `CLAUDE_CONFIG_DIR` |
| `codex` | `~/.codex/herdr-agent-state.sh` + `~/.codex/hooks.json` + ensures `[features] hooks = true` in `~/.codex/config.toml` | `CODEX_HOME` |
| `pi` | `~/.pi/agent/extensions/herdr-agent-state.ts` | `PI_CODING_AGENT_DIR` |
| `opencode` | `~/.config/opencode/plugins/herdr-agent-state.js` | — |

- **claude** hook mapping: `UserPromptSubmit`/`PreToolUse`/`PostToolUse`/`PostToolUseFailure`/`SubagentStop` → working, `PermissionRequest` → blocked, `Stop` → idle, `SessionEnd` → release. Subagent stop/release is coerced to `working` so a finished subagent doesn't make the parent pane look idle.
- **codex** mapping: `SessionStart` → idle, `UserPromptSubmit`/`PreToolUse` → working, `Stop` → idle. No permission hook → `blocked` stays heuristic. Codex shows hook lifecycle chatter in its own TUI (upstream limitation). Uninstall removes the hook + hooks.json entries but **deliberately leaves config.toml alone**.
- **opencode** has the richest event surface (permission/question/session events → blocked/working/idle).
- **grok**: no hook/plugin — heuristic-only. May load `~/.claude/settings.json`; herdr ignores the conflicting `claude` hook label once it identifies the pane as grok by process.
- **amp**: no plugin — heuristic-only (Amp's plugin API lacks passive permission/blocked events).

Troubleshooting an install that "succeeded" but shows no better state: (1) confirm the agent launched *inside* a herdr pane, (2) restart the agent session, (3) verify the file above was actually written, (4) remember unsupported transitions still fall back to heuristics.

## Sessions & server

- `herdr session list|attach <name>|stop <name>|delete <name>` — runtime/socket namespaces (not workspace replacements); all share the single `config.toml`. Add `--json` for scripts.
- Per-session state: `~/.config/herdr/session.json`, `~/.config/herdr/sessions/<name>/session.json`.
- Default persistence mode: quitting the UI detaches the client; `herdr server stop` stops the shared background server.
- `herdr update` updates an existing install; install script: `curl -fsSL https://herdr.dev/install.sh | sh`.
