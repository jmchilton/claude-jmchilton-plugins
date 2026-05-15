- In all interactions and commit messages, be concise and sacrifice grammar for the sake of concision.
- I have dyslexia. Spelling errors, typos, wrong-word substitutions, and naming inconsistencies (singular/plural, capitalization, off-by-one-letter) are common in my prompts and plans. Challenge these aggressively rather than passing through — if a name looks like an outlier vs. surrounding convention, or a word seems off, surface it as a question before encoding it in code, endpoints, identifiers, or commit messages. Don't just flag-for-later; recommend the correction at the moment of decision.
- When creating new git repositories or cloning repositories from Github, always store the repositories as subdirectories of ~/projects/repositories/.
- Whenever the user asks for artifact meant for Github - e.g. "issue text", "pull request description", "issue comment", etc.. offer to copy that artifact to the clipboard for the user.
- I brought in these compound-engineering skills to play around with but I don't want them being
used yet unless I request them specifically.

## Subagents

- When user asks you to launch a subagent for research - the interface isn't very good at granting the subagents write permissions for instance - please ask the subagent to prepare reports for writing and please do the writes yourself.

## Github Repositories

- In general, if you're being tasked with something that requires you to pull specific files down from new project on Github. You should search ~/projects/repositories for a clone of the project and offer to clone it down if it isn't present to prevent grabbing files one at a time and such.
- Posting any GitHub comment/review/issue on my behalf: `gh` posts as me (jmchilton). Always lead the body with a clear marker that it was posted by Claude (AI assistant) on my behalf, not authored by me personally. Apply automatically, don't ask each time. Never post as if I wrote it.

## Galaxy

- If you're working with Galaxy - the API, Selenium, Framework and Integration tests all take a long time - please try to just run one at a time and not in parallel to prevent overloading the dev machine. CI can handle full suite tests and regression checking.
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

## Reviews

- If you're asked to review code or plans, I'm generally not vibe coding - I'm working on very old and well established code bases so I am concerned about new code not reusing existing abstractions and I'm worried about development that isn't leading to new reusable abstractions. Please take the time to research this and figure out how the code could integrate better if possible.
- If you're reviewing Python code please ensure imports are toward the top of the file and not embedded into methods, etc. unless there is a commented reason about why.

## Reviewing Feedback
- When the user or a reviewer raises feedback, address each point concretely rather than dismissing as false alarms.

## Plans

- I generally prefer to track my plans myself and not use your "plan" mode - try to avoid it when possible - we should just build plans in regular sessions. 
- At the end of each plan, give me a list of unresolved questions to answer if any. Make the questions concise. Sacrifice grammar for the sake of concision.
- If you're asked to implement a plan or part of a plan - once you're done with the plan and have
reported your summary of what you did, please user the AskUserQuestion tool to prompt the user
among a few options - these options should always include "Launch a subagent to review the work for clarity, correctness, and completeness.", "Generate ideas for next steps and follow up with another use of the AskUserQuestion tool with ideas discovered", if the plan is coming from a document include "Update the plan to reflect our progress." as an option and "Write a debrief of the plan or plan step beside the planning document.", if the you are asked to implement a part of a plan - include "Proceed to implementing the next step of the plan.".
- Before planning new fixtures, files, or scaffolding, first check if existing assets can be reused.
- I don't generally want plans or plan parts referenced in code comments you write.

## Testing
- Always run newly added tests to verify they pass before claiming completion.
- When fixing issues or implementing changes, run the full relevant test suite (not just typecheck) before committing (unless you're in a large project particularly including Galaxy or Planemo)

## Advisor Tool
- If you're Opus, prefer not to use the `advisor` tool - Opus-on-Opus consults feel wasteful. Occasional use is fine when genuinely stuck or about to commit to a risky approach; skip it for routine work.

## Git
- **AVOID `git rebase` operations entirely**. Your interactive-rebase-tool config causes terminal corruption when used as a subprocess (keyboard input becomes unicode codes, terminal enters broken state). Use alternatives instead: cherry-pick, reset + commit, or ask user to manually rebase. `git rebase --continue` and `git rebase --abort` are fine though because they don't use that tool.

