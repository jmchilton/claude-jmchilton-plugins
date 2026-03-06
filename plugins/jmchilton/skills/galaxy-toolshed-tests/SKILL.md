---
name: galaxy-toolshed-tests
description: Run Galaxy Tool Shed functional tests (API and browser-based) with auto-started test servers
argument-hint: [test_path] (e.g., lib/tool_shed/test/functional/test_shed_repositories.py or lib/tool_shed/test/functional/test_0430_browse_utilities.py)
allowed-tools: Bash(*), Read(*), Skill(*)
---

Run Galaxy Tool Shed functional tests. The test harness automatically starts both a Tool Shed server and a Galaxy server instance.

## Usage

```
/galaxy-toolshed-tests [test_path] [extra_args...]
```

Examples:
- `/galaxy-toolshed-tests` - run all toolshed functional tests
- `/galaxy-toolshed-tests lib/tool_shed/test/functional/test_shed_repositories.py` - specific test file
- `/galaxy-toolshed-tests lib/tool_shed/test/functional/test_shed_categories.py::TestShedCategoriesApi::test_create_okay` - specific test method
- `/galaxy-toolshed-tests lib/tool_shed/test/functional/test_0430_browse_utilities.py` - browser-based test (requires playwright)

## Prerequisites Check

Before running tests, verify:

1. **Virtualenv exists** at `.venv/`
   - Check: `test -d .venv && echo "EXISTS" || echo "MISSING"`
   - If missing: invoke `/galaxy-bootstrap` skill to set it up

2. **Galaxy root detection**
   - Must be run from Galaxy root (has `run_tests.sh` and `lib/tool_shed/`)
   - Check: `test -f run_tests.sh && test -d lib/tool_shed && echo "OK" || echo "NOT GALAXY ROOT"`

3. **Tool Shed frontend built**
   - The Tool Shed server health check hits `/` which serves the SPA frontend. If the frontend isn't built, the server returns 500 and tests fail with: `Test HTTP server on host 127.0.0.1 and port XXXX did not return '200 OK' after 150 tries`
   - Check: `test -f lib/tool_shed/webapp/frontend/dist/index.html && echo "EXISTS" || echo "MISSING"`
   - If missing, build it:
     ```bash
     cd lib/tool_shed/webapp/frontend && pnpm install && pnpm build
     ```
   - This only needs to be done once per worktree/checkout

## Running Tests

### Via run_tests.sh (preferred)

```bash
GALAXY_CONFIG_OVERRIDE_CONDA_AUTO_INIT=false \
./run_tests.sh -toolshed $TEST_PATH --skip-common-startup
```

`$TEST_PATH` is the path to the test file or directory. If omitted, defaults to `./lib/tool_shed/test/functional`.

**Default environment variables** — always set unless the user explicitly asks otherwise:
- `GALAXY_CONFIG_OVERRIDE_CONDA_AUTO_INIT=false` — prevents unnecessary Conda download/install

`run_tests.sh` handles:
- Activating the virtualenv
- Running `common_startup.sh` (use `--skip-common-startup` if run recently)
- Starting/stopping both a Tool Shed server and a Galaxy server automatically
- Generating HTML reports

### Passing extra pytest args

Use `--` to pass args through to pytest:

```bash
GALAXY_CONFIG_OVERRIDE_CONDA_AUTO_INIT=false \
./run_tests.sh -toolshed $TEST_PATH --skip-common-startup -- -s
```

`-s` is useful for debugging since it shows live output (server startup logs, test progress).

## Test Types

### API tests (newer, faster)
Located in `lib/tool_shed/test/functional/test_shed_*.py`. These use `ShedApiTestCase` and interact via API calls only.

| File | Tests |
|------|-------|
| `test_shed_categories.py` | Category CRUD |
| `test_shed_configuration.py` | Configuration endpoints |
| `test_shed_repositories.py` | Repository CRUD, metadata, search |
| `test_shed_tools.py` | Tool-related operations |
| `test_shed_users.py` | User management |
| `test_repositories_integration.py` | Repository integration scenarios |
| `test_galaxy_install.py` | Installing from shed into Galaxy |

### Legacy numbered tests (browser-based, slower)
Located in `lib/tool_shed/test/functional/test_0*.py` and `test_1*.py`. These use `ShedTestCase` which includes Playwright browser interaction (tests are parameterized with `[chromium]`).

- `test_0*` — Tool Shed operations (create repos, dependencies, search, etc.)
- `test_1*` — Galaxy install operations (install, uninstall, reinstall repos)

### Playwright frontend tests
Located in `lib/tool_shed/test/functional/test_frontend_*.py`. These test the Tool Shed web UI directly.

## Test Infrastructure

The test driver (`lib/tool_shed/test/base/driver.py`) starts:
1. **Tool Shed server** — embedded uvicorn with the tool shed ASGI app
2. **Galaxy server** — embedded Galaxy instance configured to use the test tool shed (unless `TOOL_SHED_TEST_OMIT_GALAXY` is set)

Both servers use temporary SQLite databases and temp directories that are cleaned up after tests.

## Useful Options

| Option | Effect |
|--------|--------|
| `--skip-common-startup` | Skip `common_startup.sh` if already run recently |
| `--skip-venv` | Don't create/activate `.venv` |
| `--no_cleanup` | Keep temp files after tests |
| `--verbose_errors` | More verbose error reporting |
| `--debug` | Drop into pdb on failure |
| `-- -s` | Show live stdout (useful for debugging server startup) |
| `-- -k "test_name"` | Run specific test by name pattern |

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `GALAXY_CONFIG_OVERRIDE_CONDA_AUTO_INIT` | Set `false` (default for this skill) |
| `TOOL_SHED_TEST_OMIT_GALAXY` | Set to skip starting a Galaxy instance (for shed-only tests) |
| `TOOL_SHED_TEST_FILE_DIR` | Defaults to `lib/tool_shed/test/test_data` |
| `TOOL_SHED_TEST_HOST` | Host for test tool shed server |
| `TOOL_SHED_TEST_PORT` | Port for test tool shed server |

## Workflow

1. Verify cwd is Galaxy root (has `run_tests.sh`)
2. Check `.venv` exists, if not run `/galaxy-bootstrap`
3. Check tool shed frontend is built (`lib/tool_shed/webapp/frontend/dist/index.html`), if not build it with `cd lib/tool_shed/webapp/frontend && pnpm install && pnpm build`
4. Parse user arguments to determine test path
5. Run tests via `./run_tests.sh -toolshed` with the provided arguments
6. Report results and location of HTML report

## Test Locations

| Type | Directory |
|------|-----------|
| API tests | `lib/tool_shed/test/functional/test_shed_*.py` |
| Legacy browser tests | `lib/tool_shed/test/functional/test_0*.py`, `test_1*.py` |
| Frontend tests | `lib/tool_shed/test/functional/test_frontend_*.py` |
| Test data | `lib/tool_shed/test/test_data/` |
| Test base classes | `lib/tool_shed/test/base/` |
| Test driver | `lib/tool_shed/test/base/driver.py` |

## Tips

- Both a Tool Shed and Galaxy server are auto-started; no need to start them manually
- API tests (`test_shed_*.py`) are faster than legacy numbered tests
- Use `--skip-common-startup` to save time if you've run tests recently and deps haven't changed
- If tests fail with "did not return '200 OK' after 150 tries", the frontend likely needs building
- Use `-- -s` to see live output when debugging server startup issues
- Tests produce HTML reports (path printed at end of run)
