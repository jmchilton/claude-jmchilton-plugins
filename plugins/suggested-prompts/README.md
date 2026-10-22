# suggested-prompts

Claude Code-only hooks plugin. Offers prompts from `SUGGESTED_PROMPTS.md` in the session's working directory, plus `../_shared/SUGGESTED_PROMPTS.md`.

- `/prompts`, or the 📋 button on the hint line under the prompt, opens a menu with Send and Draft buttons per prompt (1-9 drafts).
- A `## ` heading that starts with exactly one emoji also gets its own button on the hint line, which sends the prompt.
- "Add last prompt" (`a`) appends your last typed prompt to the local file.

File format: one `## Label` heading per prompt, with the prompt as its body (the label when empty; a code fence is stripped). A file with no headings is read as `- ` bullets.

## Development

Not in the marketplace yet. Load it on this machine by naming this folder in `CLAUDE_CODE_PLUGIN_DIRS` (the `env` block of `~/.claude/settings.json`), or for one session with `claude --plugin-dir plugins/suggested-prompts`.

```sh
claude plugin test plugins/suggested-prompts
claude plugin validate plugins/suggested-prompts
```
