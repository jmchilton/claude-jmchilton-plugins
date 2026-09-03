# codex CLI notes

Behaviours below were verified empirically against `codex-cli 0.150.1` on 2026-08-28.
Re-check with `codex exec --help` / `codex exec review --help` if the version has moved.

## Two review lanes

| | `codex exec` (this skill's default) | `codex exec review` |
|---|---|---|
| custom instructions | yes | yes, but see trap 1 |
| `--output-schema` | **honoured** | **silently ignored** |
| `-s/--sandbox` | yes | not exposed |
| `-C/--cd` | yes | no - you must `cd` first |
| scope selection | you state it in the prompt | `--base` / `--commit` / `--uncommitted` |
| output | whatever you ask for | fixed prose: `[P2] title - /abs/path.py:10-10` |

The skill uses plain `codex exec` because structured findings and a read-only
sandbox both matter more than review mode's built-in diff plumbing. Codex runs
`git diff` itself perfectly well when the prompt says which range to review.

## Traps

1. **`--uncommitted`, `--base`, and `--commit` are mutually exclusive with a PROMPT
   argument.** `codex exec review --uncommitted "look for X"` exits 2 with
   `error: the argument '--uncommitted' cannot be used with '[PROMPT]'`. You get
   scope flags *or* custom instructions, never both.
2. **`--output-schema` is accepted and then ignored by `codex exec review`.** It
   exits 0 and returns the normal review prose, so this fails silently. Only plain
   `codex exec` honours it.
3. **`--json` buys nothing here.** The event stream is `thread.started`,
   `turn.started`, `item.started`, `item.completed` (`item.type` is
   `command_execution` or `agent_message`), `turn.completed`. Findings are prose
   inside the final `agent_message` text - there is no structured findings event.
   `turn.completed.usage` reported all-zero token counts, so do not rely on it for
   cost accounting. Use `-o FILE` instead.
4. **Paths differ by lane.** Review mode emits absolute paths; plain `codex exec`
   with the schema emitted repo-relative ones. Normalise before matching findings
   to files.
5. **A prompt argument does not stop codex reading stdin.** If stdin is readable it
   is appended as a `<stdin>` block, so an unredirected pipe hangs the process
   indefinitely after printing `Reading additional input from stdin...`. Always
   pass `< /dev/null`. Foreground runs from a terminal often escape this;
   backgrounded ones never do.
6. **Noisy stderr on macOS.** Expect `xcrun`/`DVTDeveloperPaths` warnings from
   sandboxed git invocations. They are harmless - do not report them as failures.
   Redirect stderr to a log file.

## Auth and model

- `codex login status` - one line, e.g. `Logged in using ChatGPT`. Check it before
  a long run; an auth failure otherwise surfaces minutes in.
- Model and effort come from `~/.codex/config.toml` (currently `gpt-5.6-sol`,
  `model_reasoning_effort = "high"`). Override per run with `-m`. Do not pin a
  model in the skill - the config is the user's to set.
- `--ignore-user-config` skips that config entirely. Useful only if a review needs
  to be reproducible independent of local settings; it also drops the model choice.

## Cost

A two-function, 9-line diff took ~40s. Real PR diffs run minutes. Run anything
substantial with `run_in_background: true` and poll, rather than blocking a turn.
