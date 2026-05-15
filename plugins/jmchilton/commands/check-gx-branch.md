Autonomously check the CI health of a Galaxy branch and, when a failure
is real (not transient), root-cause and fix it red-to-green, push, then
re-review after Galaxy CI has had time to re-run.

The user may supply: an optional branch / PR number / commit (default:
current branch in this checkout), and optional flags `--single`,
`--loop`, `--diagnose`. Default mode is `--loop`.

## Preconditions

- This must be a Galaxy checkout/worktree (has `run_tests.sh` and
  `lib/galaxy_test/`). If not, say so and stop — this command is
  Galaxy-specific and defers to the `galaxy-backend-tests`,
  `galaxy-playwright`, and `galaxy-bootstrap` skills for the harness.
  Never hand-roll python; never use system `python3`/`pip` — go through
  those skills (they manage `.venv`/bootstrap).
- `gh` must be authenticated (used for CI run status and `--log-failed`).

## One round

1. **Resolve target & isolate the offending commits.** Determine the
   branch/PR. Fetch the latest CI run via `gh run list`/`gh run view
   --log-failed`. Isolate this branch's actual commits from any
   stacked/unrelated changes (compare against the merge-base with the
   base branch) — only commits unique to this branch are in scope.

2. **Triage every failure as transient or real.** Treat as **transient**:
   tests marked flaky / on known-flaky lists; infra/network signals
   (timeouts, connection reset, 5xx from mirrors, docker pull failure,
   OOM, runner shutdown/“received a shutdown signal”, git fetch failure);
   failures that also occur on the base branch at the same point or live
   entirely in code paths untouched by this branch's commits. Treat as
   **real**: deterministic, in code this branch changed, and reproduces
   locally. When genuinely uncertain, investigate — do not declare a
   failure transient without a positive transient signal or a local/CI
   re-run that passes.

3. **If all failures are transient (or CI is green): report and stop.**
   State clearly that everything looks fine, list each failure and the
   transient signal that classifies it, and exit this round. Do not edit,
   commit, or push.

4. **For each real failure (skip this whole step under `--diagnose`):**
   - Reproduce locally using the correct harness. Prefer the
     `galaxy-backend-tests` skill (fast). Use the `galaxy-playwright`
     skill only when the failing job is itself a Selenium/Playwright
     suite. Bootstrap via `galaxy-bootstrap` if `.venv` is missing.
   - If no test captures the bug, write a failing one first.
   - Apply the minimal surgical fix at the source layer (not a generated
     artifact, not the symptom). Confirm red-to-green plus the relevant
     suite green.
   - Spawn a review subagent over the diff for correctness/scope/test
     gaps. The subagent returns findings only; you (the orchestrator)
     apply any actionable changes and do all writes.
   - Commit with a root-cause explanation: how the failure happened, why
     this is the right layer, what now proves it green.
   - Push to the branch. If the branch has no open PR, create one on this
     first fixing round (otherwise just push to the existing PR).

## Modes

- **`--diagnose` (read-only, no Playwright):** Do steps 1–3, and instead
  of step 4, write a root-cause theory and a *speculated* fix approach
  for each real failure to `CI_DIAGNOSIS.md` in the cwd. Never run
  Selenium/Playwright, never edit, commit, or push. Implies `--single`.

- **`--single`:** Run exactly one round, then stop and report. No
  scheduled re-review, no looping.

- **`--loop` (default):** After a round that pushed a fix, the new CI
  needs hours to re-run, so schedule a re-review **~3 hours after the
  push** and continue the loop on wake: re-fetch CI, re-triage, fix again
  if still real, push, reschedule. Exit the loop when CI is green or all
  remaining failures are transient, then report the final status. If a
  round made no push (all transient / nothing to do), report and stop —
  do not keep polling. Cap at 3 fix rounds for the same branch; if still
  failing after 3, stop and surface a summary + open questions to the
  user instead of looping further.

  Scheduling mechanism: ScheduleWakeup clamps at 1h, so for the ~3h delay
  create a scheduled routine via the `schedule` skill (cron) that
  re-invokes this command in `--loop` mode on the same target, and delete
  that routine once CI is green / all-transient / the round cap is hit.
  If the `schedule` skill is unavailable, fall back to re-arming
  ScheduleWakeup in ≤1h hops, tracking elapsed time to ~3h.

## Reporting

Always end with: target branch/PR, CI run URL, each failure with
transient-vs-real classification and evidence, what (if anything) was
fixed/pushed with the root-cause explanation, and — in `--loop` mode —
when the next re-review is scheduled or why the loop ended. Only ask the
user a question on a genuine ambiguity that research cannot resolve.
