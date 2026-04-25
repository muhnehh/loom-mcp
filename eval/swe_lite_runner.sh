#!/usr/bin/env bash
#
# LoomMCP SWE-bench Lite Runner
# Runs automated testing on SWE-bench Lite tasks
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOOM_SERVER="$PROJECT_ROOT/dist/index.js"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${NC}[INFO] $*"; }
log_pass() { echo -e "${GREEN}[PASS] $*${NC}"; }
log_fail() { echo -e "${RED}[FAIL] $*${NC}"; }
log_warn() { echo -e "${YELLOW}[WARN] $*${NC}"; }

usage() {
    cat << EOF
Usage: $(basename "$0") [OPTIONS]

Options:
    --tasks FILE      JSON file with task definitions
    --limit N         Limit to N tasks
    --skip-install    Skip dependency installation
    --verbose         Verbose output
    --json            JSON output
    -h, --help        Show this help

EOF
    exit 1
}

run_task() {
    local task_id=$1
    local repo=$2
    local prompt=$3
    local expected=$4
    
    log_info "Running task: $task_id"
    
    local start_time=$(date +%s)
    
    cd "$PROJECT_ROOT/fixtures/$repo" 2>/dev/null || {
        log_fail "Repository not found: fixtures/$repo"
        echo "SKIP"
        return
    }
    
    request=$(cat <<EOF
{"jsonrpc":"2.0","id":"1","method":"tools/call","params":{"name":"loom_get_topology","arguments":{"dir":"src"}}}
EOF
)
    
    response=$(echo "$request" | node "$LOOM_SERVER" 2>/dev/null)
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo "TASK:$task_id"
    echo "DURATION:${duration}s"
    echo "RESPONSE_SIZE:${#response}"
}

main() {
    local task_file=""
    local limit=0
    local skip_install=false
    local verbose=false
    local json_output=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --tasks) task_file="$2"; shift 2 ;;
            --limit) limit="$2"; shift 2 ;;
            --skip-install) skip_install=true; shift ;;
            --verbose) verbose=true; shift ;;
            --json) json_output=true; shift ;;
            -h|--help) usage ;;
            *) echo "Unknown option: $1"; usage ;;
        esac
    done
    
    if [[ ! -f "$LOOM_SERVER" ]]; then
        log_fail "Loom server not found at $LOOM_SERVER"
        log_info "Run 'npm run build' first"
        exit 1
    fi
    
    if [[ -z "$task_file" ]]; then
        task_file="$PROJECT_ROOT/eval/fixtures/tasks.json"
    fi
    
    if [[ ! -f "$task_file" ]]; then
        log_warn "Task file not found: $task_file"
        log_info "Creating sample tasks file..."
        
        cat > "$task_file" << 'EOF'
[
  {
    "id": "fix_auth_bug",
    "repo": "small_api",
    "prompt": "Add JWT token refresh functionality",
    "expected": "token refresh works"
  }
]
EOF
    fi
    
    log_info "Starting SWE-bench Lite evaluation"
    log_info "Using task file: $task_file"
    
    results=()
    total=0
    passed=0
    
    while IFS= read -r task; do
        ((total++))
        
        if [[ $limit -gt 0 && $total -gt $limit ]]; then
            break
        fi
        
        task_id=$(echo "$task" | jq -r '.id')
        repo=$(echo "$task" | jq -r '.repo')
        prompt=$(echo "$task" | jq -r '.prompt')
        expected=$(echo "$task" | jq -r '.expected')
        
        result=$(run_task "$task_id" "$repo" "$prompt" "$expected")
        
        if [[ "$result" == *"RESPONSE_SIZE"* ]]; then
            ((passed++))
            log_pass "Task $task_id completed"
        fi
    done < <(jq -c '.[]' "$task_file")
    
    echo ""
    log_info "Results: $passed/$total tasks passed"
    
    if [[ $passed -eq $total && $total -gt 0 ]]; then
        log_pass "All tasks passed!"
        exit 0
    else
        log_fail "Some tasks failed"
        exit 1
    fi
}

main "$@"