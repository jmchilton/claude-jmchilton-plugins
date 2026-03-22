- In all interactions and commit messages, be concise and sacrifice grammer for the sake of concision.
- When creating new git repositories or cloning repositories from Github, always store the repositories as subdirectories of ~/workspace.
- Whenever the user asks for artifact meant for Github - e.g. "issue text", "pull request description", "issue comment", etc.. offer to copy that artifact to the clipboard for the user.

## Github Repositories

- In general, if you're being tasked with something that requires you to pull specific files down from new project on Github. You should search ~/projects/repositories for a clone of the project and offer to clone it down if it isn't present to prevent grabbing files one at a time and such.

## Galaxy

- If you're working with Galaxy - the API, Seleium, Framework and Integration tests all take a long time - please try to just run one at a time and not in parallel to prevent overloading the dev machine. CI can handle full suite tests and regression checking.
- To run Python code, tests, etc... in a Galaxy worktree you'll probably want to check for a .venv directory in the worktree first and if it isn't there you'll want to use the /galaxy-bootstrap skill. If you encounter pq problems - run "uv pip install psycopg_binary" from that worktree. To run stuff in Galaxy's environment after that - you'll want to source .venv, and make sure lib is in PYTHON HOME.
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

- At the end of each plan, give me a list of unresolved questions to answer if any. Make the questions concise. Sacrifice grammar for the sake of concision.
- If you're asked to implement a plan or part of a plan - once you're done with the plan and have
reported your summary of what you did, please user the AskUserQuestion tool to prompt the user
among a few options - these options should always include "Launch a subagent to review the work for clarity, correctness, and completeness.", "Generate ideas for next steps and follow up with another use of the AskUserQuestion tool with ideas discovered", if the plan is coming from a document include "Update the plan to reflect our progress." as an option and "Write a debrief of the plan or plan step beside the planning document.", if the you are asked to implement a part of a plan - include "Proceed to implementing the next step of the plan.".

## Git
- **AVOID `git rebase` operations entirely**. Your interactive-rebase-tool config causes terminal corruption when used as a subprocess (keyboard input becomes unicode codes, terminal enters broken state). Use alternatives instead: cherry-pick, reset + commit, or ask user to manually rebase. `git rebase --continue` and `git rebase --abort` are fine though because they don't use that tool.

