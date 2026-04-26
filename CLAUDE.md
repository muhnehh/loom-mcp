# LoomMCP - Context Compiler for Coding Agents

context_compilation_for_coding_agents
mission:cut_claude_api_token_usage_by_97_percent

## Quick Start

```bash
cd loommcp
npm install --legacy-peer-deps
npm run build
npm start
```

## Project Structure

src/
  index.ts           - entry point (stdio MCP server + dashboard on :2337)
  tools.ts           - MCP tool handlers (32+ tools)
  ast.ts             - tree-sitter skeletonization + 15 language parsers
  toon.ts           - TOON format compiler
  compact.ts        - Compact wire format encoding
  cache.ts          - state persistence (.loom/)
  security.ts       - path traversal + circuit breakers
  watcher.ts        - file system watchers
  embeddings.ts    - GPU embeddings
  livewatch.ts     - Live file watching
  workspace.ts     - SQLite workspace
  cli.ts            - CLI with init/start/replay/pack commands
  dashboard/
    server.ts      - Express + SSE dashboard (/health, /badge, /replay, /api/summary)
  adapters/
    graph.ts       - dependency graph builder (text/DOT/JSON)
    metrics.ts     - session metrics collector
  replay/
    recorder.ts   - Session JSONL recorder
    replay-ui.ts  - Animated session replay HTML player
  report/
    generator.ts - HTML report card generator

__tests__/
  mcp-tools.test.mjs - 32 tests passing

packs/             - 7 LoomPacks (React, Node, Django, Rust, Go, Java, C#)
prompts/           - 3 system prompts (agent, reviewer, debugger)
.github/workflows/ - CI/CD with auto-npm-publish

## CLI Commands

loom init           - analyze repo, show ROI projection
loom init --json    - machine-readable output
loom start          - start MCP server (default)
loom replay        - replay recorded session
loom pack list      - show available LoomPacks
loom pack install <name> - install a LoomPacks config
loom config show   - show current configuration
loom config init    - create default loom.config.json

## Benchmark Results (97.75%)

| Repo           | Files | Raw    | TOON   | Reduction | Latency |
|----------------|------:|------:|-------:|:---------:|:-------:|
| loommcp (self)  |    33 | 53,619 | 1,449  | **97.75%**  | ~4s |

Run: node eval/benchmark.js . --json

## MCP Tools (32+ Total)

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
| loom_get_symbol_importance | Symbol centrality scoring |
| loom_get_changed_symbols | Files changed vs last commit |
| loom_get_untested_symbols | Heuristic test coverage |
| loom_get_deps | Dependency graph (text/DOT/JSON) |
| loom_get_metrics | Session metrics + tool breakdown |
| loom_get_sessions | Historical session data |
| loom_bm25_search | BM25 ranking search |
| loom_fuzzy_search | Fuzzy/typo-tolerant search |
| loom_find_dead_code | Unused code detection |
| loom_get_class_hierarchy | Class inheritance tree |
| loom_pagerank_centrality | Architectural importance |
| loom_attach_repo | Multi-repo attachment |
| loom_workspace_search | Cross-repo search |
| loom_semantic_search | GPU-accelerated embeddings |
| loom_detect_frameworks | Nuxt/Next.js/Django detection |
| loom_get_confidence | Methodology disclosure |
| loom_enforce_hook | PreToolUse/PostToolUse hooks |
| loom_agent_info | Supported agent integrations |

## Unique Features

1. **Cross-Session Memory** - remembers code insights across sessions
2. **Task-Aware Compression** - adapts for debug/feature/explore/review
3. **Session Replay** - JSONL playback
4. **Live Dashboard** - localhost:2337 with SSE
5. **LoomPacks** - framework-specific configs, one-command install
6. **Dependency Graph** - text, DOT, JSON formats
7. **Session Metrics** - per-tool breakdown with latency tracking

## Configuration

WORKSPACE_ROOT: process.cwd()
.cache_dir: .loom/
.focus_budget: 20 files max
DASHBOARD_PORT: 2337 (env LOOM_DASHBOARD_PORT)

## Dashboard Endpoints

- GET /           - Dashboard HTML
- GET /health     - Readiness probe (JSON)
- GET /events     - SSE real-time updates
- GET /badge.svg  - Token reduction badge
- GET /replay     - Session replay UI
- GET /state      - Current session state
- GET /api/summary - JSON stats summary
- POST /emit      - Emit custom events

## Documentation Files

- README.md       - Main competitive analysis
- SETUP.md        - Universal client setup guide
- SUPPORT.md     - Comprehensive support & troubleshooting
- CONTRIBUTING.md - Development guide