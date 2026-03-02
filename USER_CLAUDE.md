- In all interactions and commit messages, be concise and sacrifice grammer for the sake of concision.
- When creating new git repositories or cloning repositories from Github, always store the repositories as subdirectories of ~/workspace.
- Whenever the user asks for artifact meant for Github - e.g. "issue text", "pull request description", "issue comment", etc.. offer to copy that artifact to the clipboard for the user.

## Galaxy

- If you're working with Galaxy - the API, Seleium, Framework and Integration tests all take a long time - please try to just run one at a time and not in parallel to prevent overloading the dev machine. CI can handle full suite tests and regression checking.

## Tests

- In general, when prompted for an implementation plan try to plan how to test it also.
- Plans with tests should have a strong preference for red-to-green testing during development.
- When debugging problems - I will very rarely want you to:
  - Just remove a test.
  - Remove assertions.
  - Modify test data to accomodate the test.
  Please do not do any of these without prompting me first.
  If you're finding you want to prompt me about these things - please consider fixing the implementation as a possible path forward even if it wasn't explicitly asked for or part of a plan.

## Plans

- At the end of each plan, give me a list of unresolved questions to answer if any. Make the questions concise. Sacrifice grammer for the sake of concision.

## Git
- **AVOID `git rebase` operations entirely**. Your interactive-rebase-tool config causes terminal corruption when used as a subprocess (keyboard input becomes unicode codes, terminal enters broken state). Use alternatives instead: cherry-pick, reset + commit, or ask user to manually rebase.
