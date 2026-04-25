# LoomMCP - Context Compiler for Coding Agents

context_compilation_for_coding_agents
mission:cut_claude_api_token_usage_by_95_percent

## Quick Start

```bash
cd loommcp
npm install --legacy-peer-deps
npm run build
node dist/index.js
```

## Project Structure

src/
  index.ts           - entry point (stdio MCP server + dashboard on :2337)
  tools.ts           - MCP tool handlers (14 tools!)
  ast.ts             - tree-sitter skeletonization + fallback
  toon.ts           - TOON format compiler
  cache.ts          - state persistence (.loom/)
  security.ts       - path traversal + circuit breakers
  watcher.ts        - file system watchers
  cli.ts            - CLI with init/start/replay commands
  dashboard/
    server.ts      - Express + SSE dashboard with /badge and /replay
  replay/
    recorder.ts   - Session JSONL recorder
    replay-ui.ts  - Animated session replay HTML player
  report/
    generator.ts - HTML report card generator

__tests__/
  mcp-tools.test.mjs - 11 tests passing

## CLI Commands

loom init          - analyze repo, show ROI projection
loom init --json   - machine-readable output
loom start       - start MCP server (default)
loom replay     - replay recorded session

## Benchmark Results (95% - matches jCodeMunch!)

| Repo           | Files | Raw    | TOON   | Reduction | Latency |
|----------------|------:|------:|-------:|:---------:|:-------:|
| loommcp (self)  |    39 | 55,813 | 2,729  | **95%**  | 800ms   |

Run: node eval/benchmark.js . --json

## MCP Tools (14 Total)

| Tool | Description |
|:-----|:-----------|
| loom_get_topology | AST skeleton (signatures only) |
| loom_focus | Page in full implementation |
| loom_search_symbols | Symbol search with ranking |
| loom_get_symbol | O(1) byte-offset retrieval |
| loom_find_importers | Reverse dependency tracking |
| loom_blast_radius | Change impact analysis |
| loom_search_refs | AST-aware find references |
| loom_hybrid_search | Keyword + semantic RRF fusion |
| loom_remember | Cross-session memory (UNIQUE!) |
| loom_recall | Memory retrieval |
| loom_session_compress | Task-aware compression |
| loom_diff_compress | Compressed git diffs |
| loom_get_active_diff | Session changes |
| loom_blur | Remove focus |

## Unique Features

1. **Cross-Session Memory** - remembers code insights across sessions
2. **Task-Aware Compression** - adapts for debug/feature/explore
3. **Session Replay** - JSONL playback
4. **Live Dashboard** - localhost:2337 with SSE

## Configuration

WORKSPACE_ROOT: process.cwd()
.cache_dir: .loom/
.focus_budget: 20 files max
DASHBOARD_PORT: 2337 (env LOOM_DASHBOARD_PORT)