#!/bin/zsh
# Per-worktree Galaxy + Vite for local E2E runs; run from the Galaxy worktree root.
#   galaxy_e2e.sh up                          start (or reuse) this worktree's servers on free ports
#   galaxy_e2e.sh run playwright|selenium T…  run pytest targets against them
#   galaxy_e2e.sh status | down
set -u
WT=$PWD
STATE=$WT/.venv/e2e.env
KEY=e2e-master-key
ADMIN=test@bx.psu.edu

[[ -f run.sh && -d lib/galaxy_test ]] || { echo "run from a Galaxy worktree root" >&2; exit 2; }
[[ -d .venv ]] || { echo "no .venv: run /galaxy-bootstrap first" >&2; exit 2; }

listening() { lsof -ti tcp:$1 -sTCP:LISTEN >/dev/null 2>&1; }
up_ok() { [[ -f $STATE ]] && source $STATE && curl -sf "http://127.0.0.1:${GALAXY_PORT}/api/version" >/dev/null && curl -sf "http://127.0.0.1:${VITE_PORT}/" >/dev/null; }

wait_for() {  # url seconds log
  local i
  for i in {1..$2}; do curl -sf "$1" >/dev/null && return 0; sleep 1; done
  echo "timed out waiting for $1; tail of $3:" >&2; tail -20 "$3" >&2; return 1
}

cmd_up() {
  if up_ok; then echo "reusing Galaxy :$GALAXY_PORT, Vite :$VITE_PORT"; return 0; fi
  [[ -d client/node_modules ]] || { echo "no client/node_modules: run /galaxy-bootstrap (or symlink a sibling's with the same pnpm-lock.yaml)" >&2; exit 2; }
  local n found=
  for n in {0..29}; do
    if ! listening $((8090 + n)) && ! listening $((5180 + n)); then found=1; break; fi
  done
  [[ -n $found ]] || { echo "no free port pair in 8090-8119 / 5180-5209" >&2; exit 1; }
  GALAXY_PORT=$((8090 + n)); VITE_PORT=$((5180 + n))
  print "GALAXY_PORT=$GALAXY_PORT\nVITE_PORT=$VITE_PORT" > $STATE

  PYTHONPATH=lib NO_PROXY='*' GALAXY_SKIP_CLIENT_BUILD=1 \
  GALAXY_CONFIG_OVERRIDE_TOOL_CONFIG_FILE=test/functional/tools/sample_tool_conf.xml \
  GALAXY_CONFIG_OVERRIDE_ADMIN_USERS=$ADMIN \
  GALAXY_CONFIG_OVERRIDE_MASTER_API_KEY=$KEY \
  GALAXY_CONFIG_OVERRIDE_BOOTSTRAP_ADMIN_API_KEY=$KEY \
  GALAXY_CONFIG_OVERRIDE_LIBRARY_IMPORT_DIR=$WT/test-data \
  GALAXY_CONFIG_OVERRIDE_BUILDS_FILE_PATH=shared/ucsc/builds.txt.sample \
  GALAXY_CONFIG_OVERRIDE_CONDA_AUTO_INIT=false \
  nohup .venv/bin/gunicorn 'galaxy.webapps.galaxy.fast_factory:factory()' \
    -k galaxy.webapps.galaxy.workers.Worker -b 127.0.0.1:$GALAXY_PORT \
    --config python:galaxy.web_stack.gunicorn_config --preload > .venv/e2e-galaxy.log 2>&1 &

  (cd client && GALAXY_URL=http://127.0.0.1:$GALAXY_PORT VITE_PORT=$VITE_PORT \
    npm_config_use_node_version=$(cat .node_version) \
    nohup pnpm run develop --strictPort > ../.venv/e2e-vite.log 2>&1 &)

  wait_for "http://127.0.0.1:$GALAXY_PORT/api/version" 300 .venv/e2e-galaxy.log || exit 1
  wait_for "http://127.0.0.1:$VITE_PORT/" 120 .venv/e2e-vite.log || exit 1
  echo "Galaxy :$GALAXY_PORT, Vite :$VITE_PORT (logs in .venv/e2e-*.log)"
}

cmd_run() {
  local backend=${1:-}; shift || true
  [[ $backend == playwright || $backend == selenium ]] && (( $# )) || { echo "usage: run playwright|selenium <targets>" >&2; exit 2; }
  up_ok || { echo "servers not up: run 'galaxy_e2e.sh up'" >&2; exit 2; }
  source .venv/bin/activate
  export PYTHONPATH=lib GALAXY_TEST_FILE_DIR=$WT/test-data GALAXY_TEST_TIMEOUT_MULTIPLIER=2 \
    GALAXY_TEST_EXTERNAL=http://localhost:$VITE_PORT/ \
    GALAXY_CONFIG_MASTER_API_KEY=$KEY GALAXY_TEST_SELENIUM_ADMIN_API_KEY=$KEY \
    GALAXY_TEST_SELENIUM_ADMIN_USER_EMAIL=$ADMIN
  unset GALAXY_TEST_END_TO_END_CONFIG
  if [[ $backend == playwright ]]; then
    export GALAXY_TEST_DRIVER_BACKEND=playwright GALAXY_TEST_SELENIUM_HEADLESS=1
  else
    unset GALAXY_TEST_SELENIUM_HEADLESS
    local sm=(.venv/lib/python*/site-packages/selenium/webdriver/common/macos/selenium-manager(N))
    local drv=$(${sm[1]} --browser chrome --output json 2>/dev/null | jq -r .result.driver_path)
    [[ -x $drv ]] || { echo "chromedriver not found via selenium-manager" >&2; exit 2; }
    export PATH=${drv:h}:$PATH
  fi
  pytest -p no:asyncio "$@" -W ignore::DeprecationWarning -W ignore::PendingDeprecationWarning --tb=short -rA
}

cmd_down() {
  [[ -f $STATE ]] || { echo "nothing recorded"; return 0; }
  source $STATE
  local p
  for p in $GALAXY_PORT $VITE_PORT; do
    lsof -ti tcp:$p -sTCP:LISTEN | xargs kill 2>/dev/null
  done
  rm -f $STATE
  echo "stopped :$GALAXY_PORT, :$VITE_PORT"
}

case ${1:-status} in
  up) cmd_up ;;
  run) shift; cmd_run "$@" ;;
  down) cmd_down ;;
  status) if up_ok; then echo "up: Galaxy :$GALAXY_PORT, Vite :$VITE_PORT"; else echo "down"; fi ;;
  *) echo "usage: galaxy_e2e.sh up|run|status|down" >&2; exit 2 ;;
esac
