# John Chilton's agent plugins

Personal development workflows maintained as an installable plugin for both
[Claude Code](https://code.claude.com/docs/en/plugins) and
[Codex](https://developers.openai.com/plugins/build/plugins).

The repository exists to give these workflows a reviewable, versioned home.
Installing the plugin should be preferable to copying individual files into a
home directory: updates retain provenance, shared skills stay in sync, and
host-specific behavior remains explicit.

## What is portable

| Component | Claude Code | Codex | Notes |
| --- | --- | --- | --- |
| `plugins/jmchilton/skills/` | Yes | Yes | Shared `SKILL.md` workflows. |
| `plugins/jmchilton/commands/` | Yes | No | Claude Code commands awaiting portability review. |
| `USER_CLAUDE.md` | Manual | No | Personal Claude instructions; not installed by the plugin. |
| `.claude-plugin/` manifests | Yes | No | Claude marketplace and plugin metadata. |
| `.codex-plugin/` manifest | No | Yes | Codex plugin metadata. |

The seven skills are the cross-host core. The command collection remains useful
in Claude Code, but a command is not claimed as Codex-compatible until its
workflow has been converted into a provider-neutral skill.

## Install

### Claude Code

Add the GitHub repository as a marketplace, then install the plugin:

```sh
claude plugin marketplace add jmchilton/claude-jmchilton-plugins
claude plugin install jmchilton@claude-jmchilton-plugins
```

For a project-scoped install, add `--scope project` to the install command.

### Codex

Add the same GitHub repository as a marketplace, then install the plugin:

```sh
codex plugin marketplace add jmchilton/claude-jmchilton-plugins
codex plugin add jmchilton@claude-jmchilton-plugins
```

Restart the client or begin a new conversation after installing or upgrading so
the host discovers the bundled skills.

### Test a local checkout

From this repository root:

```sh
claude plugin marketplace add .
codex plugin marketplace add .
```

Install `jmchilton` from the marketplace name reported by each client. This
keeps development testing separate from the published GitHub source.

## Shared skills

| Skill | Purpose |
| --- | --- |
| `codex-review` | Run an independent review in a fresh, read-only Codex CLI session and triage the findings. |
| `galaxy-backend-tests` | Run Galaxy API, integration, framework, workflow-framework, and CWL backend tests. |
| `galaxy-bootstrap` | Prepare a Galaxy worktree with Python, client, browser, and local configuration dependencies; explicit invocation only in Codex. |
| `galaxy-playwright` | Run Galaxy Playwright or Selenium end-to-end tests against a development server. |
| `galaxy-toolshed-tests` | Run Tool Shed API and browser functional tests with their supporting servers. |
| `herdr-config` | Install, inspect, and customize the herdr terminal agent multiplexer. |
| `thermo-nuclear-code-quality-review` | Run an explicitly requested, unusually strict maintainability review. |

Skills may be selected automatically from their descriptions. In Codex, use
`/skills` or mention a skill as `$skill-name` when explicit selection is useful.

## Claude Code commands

Commands are namespaced under the `jmchilton` plugin when installed in Claude
Code.

- **Galaxy CI:** `check-gx-branch`
- **Git history and delivery:** `commit`, `gita`, `deconflict`,
  `decompose-for-rebase`, `pull-request-summary`
- **Review:** `comment-archaeology`, `dedup`, `gx-vitest-review`,
  `py-challenge-patches`, `pyreview`, `review-test`
- **Plans:** `plan-clean`, `plan-debrief`, `plan-integrate-questions`,
  `plan-interview`, `plan-publish`, `plan-research-questions`, `plan-review`,
  `plan-summary`
- **Research:** `research-merge`, `research-pull-request`,
  `research-unresolved-question`
- **Utilities:** `clipdoc`, `clippath`, `update-document`

## Repository layout

```text
.
├── .agents/plugins/marketplace.json       # Codex marketplace
├── .claude-plugin/marketplace.json        # Claude Code marketplace
├── plugins/jmchilton/
│   ├── .claude-plugin/plugin.json         # Claude Code manifest
│   ├── .codex-plugin/plugin.json          # Codex manifest
│   ├── commands/                          # Claude-only commands
│   └── skills/                            # Shared agent skills
└── USER_CLAUDE.md                         # Optional personal instructions
```

## Maintenance

When adding or changing a shared skill:

1. Keep the workflow provider-neutral unless the task genuinely targets one
   host.
2. Give `SKILL.md` a concise `name` and a description that says when the skill
   should and should not activate.
3. Keep referenced scripts and supporting files inside the skill directory.
4. Update this README when the component inventory changes.
5. Keep the Claude and Codex plugin versions aligned for releases.
6. Validate both packaging surfaces and test installation in a clean session.

Claude validation commands:

```sh
claude plugin validate .
claude plugin validate plugins/jmchilton
```

Some legacy commands currently produce warnings because they predate command
frontmatter. They remain tracked portability work rather than being silently
presented as fully normalized components.

Run the repository release checks as well:

```sh
python3 scripts/validate_plugin_release.py
```

Every change under `plugins/jmchilton/` must be released with a new semantic
version. The Claude and Codex manifests carry the same clean release version;
Codex cachebuster suffixes are only for local development and are never
committed. See [AGENTS.md](AGENTS.md) for the complete maintenance and release
policy, and [CHANGELOG.md](CHANGELOG.md) for published changes.

## Updating an installed plugin

Published Claude Code installs update without uninstalling:

```sh
claude plugin marketplace update claude-jmchilton-plugins
claude plugin update jmchilton@claude-jmchilton-plugins
```

Then run `/reload-plugins` or start a new Claude Code session. If an update says
the installed version is already current, verify that the release manifest was
bumped; reinstalling is a recovery step, not the normal update workflow.

## License

[MIT](LICENSE)
