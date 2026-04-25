# LoomMCP - Context Compiler for Coding Agents

context_compilation_for_coding_agents
mission:cut_claude_api_token_usage_by_80_percent

## Quick Start

```bash
cd loommcp
npm install
npm run build
node dist/index.js
```

## Project Structure

src/
  index.ts         - entry point (stdio MCP server)
  tools.ts         - MCP tool handlers
  ast.ts           - tree-sitter skeletonization
  toon.ts          - TOON format compiler
  cache.ts         - state persistence (.loom/)
  security.ts      - path traversal + circuit breakers
  watcher.ts       - file system watchers

prompts/
  system.md        - system prompt for LoomMCP
  toon_spec.md     - TOON format rules

eval/
  token_counter.py - tiktoken benchmark
  swe_lite_runner.sh - automated testing
  fixtures/        - sample repos for testing

## Development

build: npm run build
test: npm test
start: npm run start

## MCP Tools

loom_get_topology  - AST skeleton (signatures only)
loom_focus        - page in full file/function
loom_get_active_diff - track session changes
loom_blur         - remove focus
loom_search_refs  - AST-aware find references

## Configuration

WORKSPACE_ROOT: process.cwd() (uses cwd where server runs)
.cache_dir: .loom/ (created automatically)
.focus_budget: 20 files max

## Key Commands for Testing

```bash
# Test topology
echo '{"jsonrpc":"2.0","id":"1","method":"tools/call","params":{"name":"loom_get_topology","arguments":{"dir":"src"}}}' | node dist/index.js

# Test search
echo '{"jsonrpc":"2.0","id":"1","method":"tools/call","params":{"name":"loom_search_refs","arguments":{"symbol":"loginUser"}}}' | node dist/index.js
```

## Build for Distribution

npm run build creates dist/ with CommonJS output for Node.js 18+