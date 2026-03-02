---
name: galaxy-playwright
description: Run Galaxy Playwright/Selenium E2E tests against a running Galaxy server
argument-hint: [test_path] (e.g., test_login.py::TestLogin::test_login)
allowed-tools: Bash(*), Read(*), Skill(*)
---

Run Galaxy Playwright E2E tests. Works from Galaxy root or `packages/test_selenium`.

## Usage

```
/galaxy-playwright [test_path]
```

Examples:
- `/galaxy-playwright` - show status of Galaxy server and dev server
- `/galaxy-playwright test_login.py` - run all login tests
- `/galaxy-playwright test_workflow_editor.py::TestWorkflowEditor::test_data_input` - run specific test

## Mode Detection

Detect mode based on current working directory:
- **Package mode**: cwd contains `packages/test_selenium` (has `pyproject.toml` with `galaxy-test-selenium`)
- **Root mode**: cwd is Galaxy root (has `run.sh`, `lib/galaxy_test/`)

## Prerequisites Check

Before running tests, verify:

### Root mode only

1. **Virtualenv exists** at `.venv/`
   - If missing: invoke `/galaxy-bootstrap` skill to set it up

### Both modes

2. **Playwright installed**
   - Root mode check: `source .venv/bin/activate && playwright --version`
   - Root mode install: `source .venv/bin/activate && playwright install`
   - Package mode check: `uv run playwright --version`
   - Package mode install: `uv run playwright install`

3. **Config file exists** at `~/galaxy_selenium_context.yml`
   - Check: `test -f ~/galaxy_selenium_context.yml && echo "EXISTS" || echo "MISSING"`
   - If missing, warn user and create from sample:
     - Root mode:
       ```bash
       cp lib/galaxy_test/selenium/jupyter/galaxy_selenium_context.yml.sample ~/galaxy_selenium_context.yml
       echo "Created ~/galaxy_selenium_context.yml - please edit with your credentials"
       ```
     - Package mode:
       ```bash
       cp galaxy_test/selenium/jupyter/galaxy_selenium_context.yml.sample ~/galaxy_selenium_context.yml
       echo "Created ~/galaxy_selenium_context.yml - please edit with your credentials"
       ```

4. **Galaxy running on port 8080**
   - Check: `lsof -i :8080 | grep LISTEN` or `curl -s http://localhost:8080/api/version`
   - If not running, start with (from Galaxy root):
     ```bash
     NO_PROXY=* GALAXY_SKIP_CLIENT_BUILD=1 GALAXY_RUN_WITH_TEST_TOOLS=1 sh run.sh --skip-wheels &
     ```
   - Wait for Galaxy to be ready before running tests

5. **Vite dev server running on port 5173** (optional but recommended for client changes)
   - Check: `lsof -i :5173 | grep LISTEN`
   - If not running: `make client-dev-server &` (from Galaxy root)

## Running Tests

### Root mode

Tests are located in `lib/galaxy_test/selenium/`.

```bash
source .venv/bin/activate

GALAXY_TEST_FILE_DIR=$(pwd)/test-data \
GALAXY_TEST_DRIVER_BACKEND=playwright \
GALAXY_TEST_TIMEOUT_MULTIPLIER=2 \
GALAXY_TEST_SELENIUM_HEADLESS=0 \
GALAXY_TEST_END_TO_END_CONFIG=~/galaxy_selenium_context.yml \
pytest lib/galaxy_test/selenium/$ARGUMENTS -v \
    -W ignore::DeprecationWarning \
    -W ignore::PendingDeprecationWarning \
    --tb=short
```

### Package mode

Tests are located in `galaxy_test/selenium/`.

```bash
GALAXY_TEST_FILE_DIR=$(cd ../.. && pwd)/test-data \
GALAXY_TEST_DRIVER_BACKEND=playwright \
GALAXY_TEST_TIMEOUT_MULTIPLIER=2 \
GALAXY_TEST_SELENIUM_HEADLESS=0 \
GALAXY_TEST_END_TO_END_CONFIG=~/galaxy_selenium_context.yml \
uv run pytest galaxy_test/selenium/$ARGUMENTS -v \
    -W ignore::DeprecationWarning \
    -W ignore::PendingDeprecationWarning \
    --tb=short
```

## Environment Variables

| Variable | Value | Purpose |
|----------|-------|---------|
| `GALAXY_TEST_FILE_DIR` | Galaxy root | Base dir for test files |
| `GALAXY_TEST_DRIVER_BACKEND` | `playwright` | Use Playwright instead of Selenium |
| `GALAXY_TEST_TIMEOUT_MULTIPLIER` | `2` | Increase timeouts for slower machines |
| `GALAXY_TEST_SELENIUM_HEADLESS` | `0` | Show browser (1=headless) |
| `GALAXY_TEST_END_TO_END_CONFIG` | `~/galaxy_selenium_context.yml` | Config with login creds |
| `GALAXY_TEST_EXTERNAL` | `http://localhost:8080/` | Target Galaxy URL (set if using dev server on different port) |

## Config File

The config file `~/galaxy_selenium_context.yml` should contain:

```yaml
local_galaxy_url: http://localhost:8080
login_email: test_user@example.com
login_password: mycoolpassw0rd
# admin_api_key: your_api_key  # for admin tests
```

## Workflow

1. Detect mode (root vs package) based on cwd
2. Root mode only: check if `.venv` exists, if not run `/galaxy-bootstrap`
3. Check if playwright is installed, if not install it
4. Check if `~/galaxy_selenium_context.yml` exists, if not create from sample and warn user
5. Check if Galaxy is running on 8080, if not start it and wait
6. Check if Vite dev server is running on 5173, if not start it
7. Run the specified test with pytest (warnings suppressed, short traceback)
8. Report results

## Common Test Files

| File | Tests |
|------|-------|
| `test_login.py` | Login/logout, registration |
| `test_workflow_editor.py` | Workflow editor UI |
| `test_workflow_run.py` | Running workflows |
| `test_uploads.py` | File uploads |
| `test_history_panel.py` | History panel interactions |
| `test_tool_form.py` | Tool form interactions |
