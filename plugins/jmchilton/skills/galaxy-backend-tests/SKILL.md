---
name: galaxy-backend-tests
description: Run Galaxy backend tests (API, integration, framework, framework-workflows) with auto-started test server
argument-hint: <test_type> [test_path] (e.g., -api lib/galaxy_test/api/test_tools.py::TestToolsApi::test_map_over)
allowed-tools: Bash(*), Read(*), Skill(*)
---

Run Galaxy backend tests. Unlike playwright/selenium tests, these don't need a pre-running server - the test harness starts one automatically.

## Usage

```
/galaxy-backend-tests <test_type> [test_path] [extra_args...]
```

Test types:
- `-api` - API tests in `lib/galaxy_test/api`
- `-integration` - Integration tests in `test/integration`
- `-framework` - Framework tool tests in `test/functional/tools`
- `-framework-workflows` - Workflow evaluation tests
- `-cwl` - CWL conformance API tests

Examples:
- `/galaxy-backend-tests -api` - run all API tests
- `/galaxy-backend-tests -api lib/galaxy_test/api/test_tools.py::TestToolsApi::test_map_over_with_output_format_actions` - specific API test
- `/galaxy-backend-tests -integration test/integration/test_vault.py` - specific integration test
- `/galaxy-backend-tests -framework -id collection_paired` - framework test by tool id
- `/galaxy-backend-tests -framework-workflows -id test_subworkflow_simple` - single workflow framework test

## Prerequisites Check

Before running tests, verify:

1. **Virtualenv exists** at `.venv/`
   - Check: `test -d .venv && echo "EXISTS" || echo "MISSING"`
   - If missing: invoke `/galaxy-bootstrap` skill to set it up

2. **Galaxy root detection**
   - Must be run from Galaxy root (has `run_tests.sh` and `lib/galaxy_test/`)
   - Check: `test -f run_tests.sh && test -d lib/galaxy_test && echo "OK" || echo "NOT GALAXY ROOT"`

## Running Tests

### Via run_tests.sh (preferred - shares Galaxy instance across test classes)

```bash
GALAXY_CONFIG_OVERRIDE_CONDA_AUTO_INIT=false \
GALAXY_CONFIG_ENABLE_BETA_WORKFLOW_MODULES=true \
GALAXY_CONFIG_OVERRIDE_ENABLE_BETA_TOOL_FORMATS=true \
./run_tests.sh $ARGUMENTS
```

The `$ARGUMENTS` is the full argument string from the user (e.g., `-api lib/galaxy_test/api/test_tools.py::TestToolsApi`).

**Default environment variables** — always set these unless the user explicitly asks for a default configuration without them:
- `GALAXY_CONFIG_OVERRIDE_CONDA_AUTO_INIT=false` — prevents unnecessary Conda download/install (see [Conda Exception](#conda-exception))
- `GALAXY_CONFIG_ENABLE_BETA_WORKFLOW_MODULES=true` — enables beta workflow modules for broader test coverage
- `GALAXY_CONFIG_OVERRIDE_ENABLE_BETA_TOOL_FORMATS=true` — enables beta tool formats for broader test coverage

`run_tests.sh` handles:
- Activating the virtualenv
- Running `common_startup.sh` (deps, client build skip)
- Setting `GALAXY_TEST_TOOL_CONF` appropriately per test type
- Starting/stopping a Galaxy test server automatically
- Generating HTML reports

### Via pytest directly (when more control needed)

For API tests:
```bash
source .venv/bin/activate
GALAXY_CONFIG_OVERRIDE_CONDA_AUTO_INIT=false \
GALAXY_CONFIG_ENABLE_BETA_WORKFLOW_MODULES=true \
GALAXY_CONFIG_OVERRIDE_ENABLE_BETA_TOOL_FORMATS=true \
GALAXY_TEST_TOOL_CONF="lib/galaxy/config/sample/tool_conf.xml.sample,test/functional/tools/sample_tool_conf.xml" \
pytest lib/galaxy_test/api/$TEST_PATH -v --tb=short
```

For integration tests:
```bash
source .venv/bin/activate
GALAXY_CONFIG_OVERRIDE_CONDA_AUTO_INIT=false \
GALAXY_CONFIG_ENABLE_BETA_WORKFLOW_MODULES=true \
GALAXY_CONFIG_OVERRIDE_ENABLE_BETA_TOOL_FORMATS=true \
GALAXY_TEST_TOOL_CONF="lib/galaxy/config/sample/tool_conf.xml.sample,test/functional/tools/sample_tool_conf.xml" \
pytest test/integration/$TEST_PATH -v --tb=short
```

For framework tests:
```bash
source .venv/bin/activate
GALAXY_CONFIG_OVERRIDE_CONDA_AUTO_INIT=false \
GALAXY_CONFIG_ENABLE_BETA_WORKFLOW_MODULES=true \
GALAXY_CONFIG_OVERRIDE_ENABLE_BETA_TOOL_FORMATS=true \
GALAXY_TEST_TOOL_CONF="test/functional/tools/sample_tool_conf.xml" \
pytest test/functional/test_toolbox_pytest.py -k $TOOL_ID -m tool -v --tb=short
```

For framework workflow tests:
```bash
source .venv/bin/activate
GALAXY_CONFIG_OVERRIDE_CONDA_AUTO_INIT=false \
GALAXY_CONFIG_ENABLE_BETA_WORKFLOW_MODULES=true \
GALAXY_CONFIG_OVERRIDE_ENABLE_BETA_TOOL_FORMATS=true \
pytest lib/galaxy_test/workflow/test_framework_workflows.py -k $WORKFLOW_ID -m workflow -v --tb=short
```

**Note**: When using pytest directly, a new Galaxy instance is created per test class (run_tests.sh optimizes to share one instance).

## Useful Options

These can be appended as extra arguments:

| Option | Effect |
|--------|--------|
| `--skip-common-startup` | Skip `common_startup.sh` if already run recently |
| `--skip-venv` | Don't create/activate `.venv` |
| `--no_cleanup` | Keep temp files after tests |
| `--verbose_errors` | More verbose error reporting |
| `--debug` | Drop into pdb on failure |
| `--skip_flakey_fails` | Skip tests annotated @flakey on error |

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `GALAXY_CONFIG_OVERRIDE_CONDA_AUTO_INIT` | Set `false` (default for this skill). Only omit for conda resolver tests |
| `GALAXY_CONFIG_ENABLE_BETA_WORKFLOW_MODULES` | Set `true` (default for this skill). Enables beta workflow modules |
| `GALAXY_CONFIG_OVERRIDE_ENABLE_BETA_TOOL_FORMATS` | Set `true` (default for this skill). Enables beta tool formats |
| `GALAXY_TEST_DBURI` | Database connection string (default: temp sqlite) |
| `GALAXY_TEST_NO_CLEANUP` | Keep test directories after run |
| `GALAXY_TEST_VERBOSE_ERRORS` | Verbose error output |
| `GALAXY_TEST_DEFAULT_WAIT` | Max wait for tool test (default 86400s) |
| `GALAXY_TEST_FILE_DIR` | Test data sources |
| `GALAXY_TEST_JOB_CONFIG_FILE` | Custom job config for test |
| `GALAXY_TEST_HOST` | Host for test Galaxy server |
| `GALAXY_TEST_PORT` | Port for test Galaxy server |
| `GALAXY_TEST_SKIP_FLAKEY_TESTS_ON_ERROR` | Skip flakey tests on error |

## Workflow

1. Verify cwd is Galaxy root (has `run_tests.sh`)
2. Check `.venv` exists, if not run `/galaxy-bootstrap`
3. Parse user arguments to determine test type and path
4. Set default env vars (unless user explicitly asks for defaults without them):
   - `GALAXY_CONFIG_OVERRIDE_CONDA_AUTO_INIT=false` (omit only for conda resolver tests — see [Conda Exception](#conda-exception))
   - `GALAXY_CONFIG_ENABLE_BETA_WORKFLOW_MODULES=true`
   - `GALAXY_CONFIG_OVERRIDE_ENABLE_BETA_TOOL_FORMATS=true`
5. Run tests via `./run_tests.sh` with the provided arguments
6. Report results and location of HTML report

## Test Locations

| Type | Directory |
|------|-----------|
| API | `lib/galaxy_test/api/` |
| CWL | `lib/galaxy_test/api/cwl/` |
| Integration | `test/integration/` |
| Framework tools | `test/functional/tools/` (config), `test/functional/test_toolbox_pytest.py` (runner) |
| Framework workflows | `lib/galaxy_test/workflow/test_framework_workflows.py` |

## Conda Exception

By default, **always** set `GALAXY_CONFIG_OVERRIDE_CONDA_AUTO_INIT=false`. Galaxy defaults `conda_auto_init=true` when running from source, which triggers automatic Conda download/install — wasted time for tests that don't exercise conda.

**Only omit this override** (allowing conda auto-init) for tests that specifically exercise conda dependency resolution:
- `test/integration/test_resolvers.py`
- `test/integration/test_container_resolvers.py`
- Framework tests with conda-dependent tools

If unsure whether a test needs conda, set it to `false` — tests that genuinely need it will have `conda_auto_init = True` in their class-level Galaxy config overrides.

## Tips

- API and integration tests auto-start a Galaxy server; no need to start one manually
- Integration tests test special Galaxy configurations (non-default setups)
- Use `--skip-common-startup` to save time if you've run tests recently and deps haven't changed
- For a single framework tool test, use `-framework -id <tool_id>`
- Tests produce HTML reports (path printed at end of run)
- API tests run with `GALAXY_TEST_USE_HIERARCHICAL_OBJECT_STORE=True` by default via run_tests.sh
