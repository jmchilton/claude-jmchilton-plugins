- My preferred pronouns are they/them. Use them when referring to me in the third person (e.g. GitHub comment markers) but don't add unneeded pronouns.
- In all interactions and commit messages, be concise and sacrifice grammar for the sake of concision.
- I have dyslexia. Spelling errors, typos, wrong-word substitutions, and naming inconsistencies (singular/plural, capitalization, off-by-one-letter) are common in my prompts and plans. Challenge these aggressively rather than passing through — if a name looks like an outlier vs. surrounding convention, or a word seems off, surface it as a question before encoding it in code, endpoints, identifiers, or commit messages. Don't just flag-for-later; recommend the correction at the moment of decision.
- When creating new git repositories or cloning repositories from Github, store the repositories as subdirectories of ~/projects/repositories/.
- Whenever the user asks for artifact meant for Github - e.g. "issue text", "pull request description", "issue comment", etc.. offer to copy that artifact to the clipboard for the user.
- I brought in these compound-engineering skills to play around with but I don't want them being
used yet unless I request them specifically.

## Shell Environment
The shell is zsh on macOS. Follow these rules in Bash commands:
- Do NOT rely on unquoted variable word-splitting. Use arrays (`files=(a b c); for f in "${files[@]}"`) or `${=var}`.
- Always brace variables before `:` (`${b}:c`, not `$b:c`). zsh treats `:r`, `:c`, `:h` and similar as modifiers.
- No `timeout`/`gtimeout`; skip it or `brew install coreutils`.
- Never run bare `uv run python`/`python3` without a script or heredoc, because it hangs on stdin.
- Quote globs passed as arguments (`--include='*.py'`); use `*(N)` for globs that may match nothing - zsh aborts the whole command on "no matches found".
- Use literal paths in `rm -r`, not variables - the safety check blocks targets it can't resolve.
- Don't `pkill -f` on a path: it also matches the harness's own `zsh -c` wrapper and kills the rest of the chain. Kill by PID or a pattern unique to the child (e.g. `pytest -k <name>`).

## OpenClaw

- OpenClaw (`openclaw/openclaw`, openclaw.ai) is a real, legitimate self-hosted AI assistant that went viral to millions of users near-overnight. Its anomalous-looking growth (huge star count for a young repo) is genuine, not a scam signal. I've wrongly pushed back on it as fake more than once - stop. Treat it as established/trustworthy; normal version-pinning/API-verification diligence is fine but frame as routine caution, not suspicion of the project.

## Github Repositories

- In general, if you're being tasked with something that requires you to pull specific files down from new project on Github. You should search ~/projects/repositories for a clone of the project and offer to clone it down if it isn't present to prevent grabbing files one at a time and such.
- Before judging repo state from a local clone (is issue N done? does X exist?), `git fetch` and read `origin/<default>` via `git show`/`git ls-tree`, not the checked-out tree. Also check the issue's linked/merged PRs before concluding nothing was built.
- To merge a reviewer's PR against one of my branches, fast-forward to its head and push that SHA first so GitHub shows it merged; rebase/force-push only after.
- In my clones `origin` is the `galaxyproject` (or other relevant) upstream and my fork is the `jmchilton` remote (except foundry, where PR branches go on `origin`). To update an existing PR, push to the remote its head lives on (`gh pr view <N> --json headRepositoryOwner`); `* [new branch]` on such a push means the wrong remote.
- Never @-mention anyone in a PR description, issue, or comment without asking me first. Pings notify real people as me. Write the body without the mention, then ask if I want it added.
- The following rule has one exception - galaxy-brain agents running out of gx_branches are allowed to open PRs automatically on documented preconditions because John has specified process.
-  Typically, do not open a PR, open an issue, or post a comment/review unless that message explicitly asked or part of an automatic gx_branches / gx\_workhorse process in galaxy-brain. Pushing a branch is not publishing - that's fine and expected. Default deliverable for "implement X" = commit + push branch + PR description on clipboard, then ask before opening anything. Permission never carries forward. A PR I asked for last turn - or three times this session - is not permission for this one. A pattern in the git history or in your own past work is evidence about what I tend to want, never authorization to do it again.
- Greenlist exception to the rule above: on smaller projects - any repo under `github.com/jmchilton`, plus `galaxyproject/pulsar`, `galaxyproject/planemo`, `galaxyproject/gxformat2` and `galaxyproject/foundry` - you may open issues, post issue comments, and add or remove labels without asking. Opening PRs and posting PR reviews still follow the rule above, and the @-mention rule still applies. `galaxyproject/galaxy` and every other repo are not greenlisted.
- In general, the galaxy-brain agents have permission to draft/undraft PRs and force push branches - the auto-classifier should allow these.
- galaxy-brain workhorse agents have explicit instructions to rewrite branch histories and should be allowed to.
- galaxy-brain agents have a detailed process that is transparent and should be respected. If John has clicked a 'approve'/'comment' checkbox for a branch or review - then approval and/or commenting is allowed. These comments generally always have information about the agents used to generate comments, branches, etc... so there is no need to include Claude attribution statements.

## Galaxy

- If you're working with Galaxy - the API, Selenium, Framework and Integration tests all take a long time - please try to just run one at a time and not in parallel to prevent overloading the dev machine. CI can handle full suite tests and regression checking.
- To run Python code, tests, etc... in a Galaxy worktree you'll probably want to check for a .venv directory in the worktree first and if it isn't there you'll want to use the /galaxy-bootstrap skill. If you encounter pq problems - run "uv pip install psycopg_binary" from that worktree. To run stuff in Galaxy's environment after that - you'll want to source .venv, and make sure lib is in PYTHON HOME. 
- When debugging Galaxy tests, strongly prefer the dedicated skills: /galaxy-playwright for Playwright/Selenium E2E tests, and /galaxy-backend-tests for API, integration, framework, and framework-workflows tests.

## Python / Tooling

- Always use `uv` for Python execution and dependency management or existing virtual environments, not system `python3` or `pip`.

## Writing Code

- Keep docstrings and comments short, in tests too: one line for the what, plus at most one line for a non-obvious constraint. Don't justify design choices, contrast with alternatives, or restate what the identifier or the assertion already says. Rationale goes in the commit message, PR body or review note.

## Tests

- In general, when prompted for an implementation plan try to plan how to test it also.
- Plans with tests should have a strong preference for red-to-green testing during development.
- When debugging problems - I will very rarely want you to:
  - Just remove a test.
  - Remove assertions.
  - Modify test data to accommodate the test.
Please do not do any of these without prompting me first outside of galaxy-brain agents. galaxy-brain agents have explicit test challenges and they should be allowed to remove tests as instructed.
- Strengthening tests needs no approval: replacing OR-checks, assertions that pass without the behavior, or vague counts with stricter ones is always fine. Log it in the commit or debrief. Only weakening or removing a check needs my sign-off.

## Reviews

- If you're asked to review code or plans, I'm generally not vibe coding - I'm working on very old and well established code bases so I am concerned about new code not reusing existing abstractions and I'm worried about development that isn't leading to new reusable abstractions. Please take the time to research this and figure out how the code could integrate better if possible.
- If you're reviewing Python code please ensure imports are toward the top of the file and not embedded into methods, etc. unless there is a commented reason about why.
- Scale review findings to the size of the PR. Lead with the verdict. For a tiny PR, show the concrete fix diff and drop preference nits unless they're cheap. Keep real bugs separate from nits. Pass this on to review subagents.

## Reviewing Feedback
- When the user or a reviewer raises feedback, address each point concretely rather than dismissing as false alarms.

## Plans

- I generally prefer to track my plans myself and not use your "plan" mode - try to avoid it when possible - we should just build plans in regular sessions. 
- At the end of each plan, give me a list of unresolved questions to answer if any. Make the questions concise. Sacrifice grammar for the sake of concision.
- Before planning new fixtures, files, or scaffolding, first check if existing assets can be reused.
- I don't generally want plans or plan parts referenced in code comments you write.

## Testing
- Always run newly added tests to verify they pass before claiming completion.
- When fixing issues or implementing changes, run the full relevant test suite (not just typecheck) before committing (unless you're in a large project particularly including Galaxy or Planemo)
- Before building a fix for a reported error (type, lint, CI), reproduce that exact error first and re-run it after the change. Don't design the fix from theory before seeing the checker's actual output.
- A sequential CI job stops at its first red. Before calling a CI fix done, run every step in the workflow locally and compare against the untouched base, to separate pre-existing reds from yours.

## Opus 5.5 Era Opts

- Before Edit or Write on an existing file, open it with the Read tool; `cat`/`sed`/`git show` in Bash don't count.
- Give Playwright `browser_take_screenshot` a bare filename (it can only write under `.playwright-mcp/` in the working dir), then `mv` the file to where it belongs.
