---
name: galaxy-playwright
description: Run Galaxy Playwright/Selenium E2E tests against this worktree's own Galaxy + Vite servers
argument-hint: "[test_path] (e.g., test_login.py::TestLogin::test_logging_in)"
allowed-tools: Bash(*), Read(*), Skill(*)
---

Run Galaxy E2E tests (`lib/galaxy_test/selenium/`) from a Galaxy worktree root. Several sessions run at once, so each worktree gets its own Galaxy and Vite on free ports. Never touch another session's servers.

`galaxy_e2e.sh` (next to this file) does all of it:

```sh
E2E=<this skill dir>/galaxy_e2e.sh
$E2E up                                   # start or reuse; Galaxy 8090+N, Vite 5180+N
$E2E run playwright lib/galaxy_test/selenium/$ARGUMENTS
$E2E run selenium   lib/galaxy_test/selenium/$ARGUMENTS
$E2E status
$E2E down                                 # when finished with the worktree
```

- `up` needs `.venv` and `client/node_modules`; if missing run `/galaxy-bootstrap` (or symlink a sibling worktree's `node_modules` with an identical `client/pnpm-lock.yaml`). Ports go in `.venv/e2e.env`, logs in `.venv/e2e-{galaxy,vite}.log`. First start takes ~1 minute; leave servers up between runs.
- After server-side Python changes, `down` then `up`. Client changes hot-reload through Vite.
- Extra env passes through, e.g. `GALAXY_TEST_SCREENSHOTS_DIRECTORY=<dir> $E2E run …`.
- Run one E2E test process per worktree at a time.

## What the script sets, and why

- Tests target Vite (`GALAXY_TEST_EXTERNAL=http://localhost:<vite>/`), not Galaxy: the worktree has no client build, so Galaxy's own port gives a blank page and `#masthead` timeouts.
- No `GALAXY_TEST_END_TO_END_CONFIG`: `~/galaxy_selenium_context.yml` pins one shared user, so state piles up across tests and runs. Unset, every test registers a fresh user like CI.
- Admin, library and dbkey tests: master/bootstrap API key, `test@bx.psu.edu` as admin, `library_import_dir=test-data` and sample genome builds, all via `GALAXY_CONFIG_OVERRIDE_*` (plain `GALAXY_CONFIG_*` loses to `config/galaxy.yml`).
- Playwright runs headless (headed runs hang in `Page.screenshot` when the window is hidden). Selenium leaves headless unset (macOS has no Xvfb) and puts selenium-manager's chromedriver on `PATH`.
- `pytest -p no:asyncio` avoids "Playwright Sync API inside the asyncio loop".

## Reading failures

- Setup-phase `#masthead` or `Page.screenshot` timeouts: check `status` and `curl` the Vite port before blaming the test.
- A failure is a Playwright problem only if the same test passes under `run selenium`.
- `@flakey` tests fail loudly locally; CI skips them on error (`GALAXY_TEST_SKIP_FLAKEY_TESTS_ON_ERROR=1`).
- Collection "Change Datatype" tests need celery and fail locally; `test_history_sharing::test_share_history_login_redirect` fails locally under both backends.
