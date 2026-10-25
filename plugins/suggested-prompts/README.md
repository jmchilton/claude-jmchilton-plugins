# suggested-prompts

Claude Code-only hooks plugin. Offers prompts from `SUGGESTED_PROMPTS.md` in the session's working directory, plus `../_shared/SUGGESTED_PROMPTS.md`.

- `/prompts`, or the 📋 button on the hint line under the prompt, opens a menu with Send and Draft buttons per prompt (1-9 drafts).
- A `## ` heading that starts with exactly one emoji also gets its own button on the hint line, which sends the prompt.
- "Add last prompt" (`a`) appends your last typed prompt to the local file.
- In a galaxy-brain agent dir (`../_shared/scripts/launch_agent.sh` exists), a ➕ button leads the hint line; it opens a New agent menu with one entry per sibling dir with a `CLAUDE.md`, each with ⚡ (blank Claude, default model) and ⚙️ (pick a profile from `../_shared/AGENT_PROFILES.yml` for agent, model and effort); either starts it in a new herdr workspace. A ✖ after it closes this session's herdr pane (and its workspace, if that was the last pane), like `/exit` plus closing the shell.

File format: one `## Label` heading per prompt, with the prompt as its body (the label when empty; a code fence is stripped). A file with no headings is read as `- ` bullets.

## Development

Not in the marketplace yet. Load it on this machine by naming this folder in `CLAUDE_CODE_PLUGIN_DIRS` (the `env` block of `~/.claude/settings.json`), or for one session with `claude --plugin-dir plugins/suggested-prompts`.

```sh
claude plugin test plugins/suggested-prompts
claude plugin validate plugins/suggested-prompts
```
