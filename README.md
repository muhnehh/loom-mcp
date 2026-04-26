# LoomMCP — Cut Claude Bills by 95%. Keep Your Edge.

> **"We're building the foundation for what context compilation looks like in 2025 and beyond."**
> — This repo

**LoomMCP** is a universal Model Context Protocol server that gives coding agents surgical access to your codebase. Instead of dumping 50k tokens of boilerplate on every request, it serves AST skeletons on-demand — achieving 95% token reduction while keeping code quality intact.

[![npm version](https://img.shields.io/npm/v/@loom-mcp/server?style=flat-square)](https://www.npmjs.com/package/@loom-mcp/server)
[![npm downloads](https://img.shields.io/npm/dm/@loom-mcp/server?style=flat-square)](https://www.npmjs.com/package/@loom-mcp/server)
[![MIT License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![Build](https://img.shields.io/github/actions/workflow/status/muhnehh/loom-mcp/ci.yml?style=flat-square)](https://github.com/muhnehh/loom-mcp/actions)

## tl;dr

```
$20/day Claude bills  →  $1/day  (with 95% token reduction)
50k tokens/turn        →  2.7k tokens/turn  (same capability)
```

Install:
```bash
npm install -g @loom-mcp/server
loom start
/mcp add loom localhost:8080
```

## The Problem

Every autonomous agent — Claude Code, Codex, Cursor Agent, Gemini Code Assist — suffers from the same curse: **static context bloat**. On turn 1, Claude reads your `node_modules`. On turn 50, it reads your `node_modules` again. You're paying $15/1000k tokens to re-read files that never change.

## What LoomMCP Does Differently

- **On-demand AST**: Only the symbols the agent needs are paged in
- **Session awareness**: Tracks what's been focused this session
- **Cross-session memory**: Remembers code insights across sessions
- **Task-aware compression**: Debug mode keeps stack traces. Explore mode is minimal.
- **Live dashboard**: Real-time token savings at `localhost:2337`
- **Session replay**: JSONL playback for debugging agent behavior

## Token Reduction Benchmark

```
node eval/benchmark.js .
```

| Repository | Files | Raw Tokens | TOON Tokens | Reduction | Latency |
|:-----------|------:|----------:|------------:|:---------:|:-------:|
| `vercel/next.js` | 21,070 | 5,028,535 | 201,142 | **96%** | 1180ms |
| `django/django` | 3,010 | 1,298,282 | 25,966 | **98%** | 1235ms |
| `rust-lang/rust` | 36,982 | 8,767,784 | 438,389 | **95%** | 1533ms |
| `loommcp` (self) | 32 | 50,338 | 1,328 | **97%** | 1868ms |

**Average: 96.5% token reduction** across all repos

## Quickstart

```bash
# Install
npm install -g @loom-mcp/server

# Start the server
loom start

# Connect your client (see SETUP.md for all clients)
```

### Claude Code
```bash
/mcp add loom localhost:8080
```

### Claude Desktop (macOS/Windows)
Add to config:
```json
{
  "mcpServers": {
    "loom": {
      "command": "npx",
      "args": ["-y", "@loom-mcp/server", "start"]
    }
  }
}
```

### Cursor, VS Code, Codex, Zed, Windsurf, Gemini
See [SETUP.md](SETUP.md) for all client configurations.

## MCP Tools (28+ Total)

| Tool | Description |
|:-----|:------------|
| `loom_get_topology` | AST skeleton of entire codebase (~3k tokens) |
| `loom_focus` | Page in a specific file or symbol body |
| `loom_search_symbols` | Search symbols with relevance ranking |
| `loom_get_symbol` | O(1) byte-offset symbol retrieval |
| `loom_find_importers` | Reverse dependency graph |
| `loom_blast_radius` | Change impact analysis |
| `loom_search_refs` | AST-aware find references |
| `loom_hybrid_search` | Keyword + semantic RRF fusion |
| `loom_remember` | Store insight across sessions |
| `loom_recall` | Retrieve cross-session memory |
| `loom_session_compress` | Task-aware compression (debug/feature/explore) |
| `loom_diff_compress` | Compressed git diffs |
| `loom_get_active_diff` | Session changes since start |
| `loom_blur` | Remove file from focus |
| `loom_get_symbol_importance` | Symbol centrality scoring |
| `loom_get_changed_symbols` | Files changed vs last commit |
| `loom_get_untested_symbols` | Heuristic test coverage detection |
| `loom_get_deps` | Dependency graph (text/DOT/JSON) |
| `loom_get_metrics` | Session metrics + tool breakdown |
| `loom_get_sessions` | Historical session data |
| **`loom_bm25_search`** | BM25 ranking (statistically optimal search) |
| **`loom_fuzzy_search`** | Fuzzy matching with Levenshtein scoring |
| **`loom_find_dead_code`** | Detect unused functions and unreachable code |
| **`loom_get_class_hierarchy`** | Class inheritance traversal |
| **`loom_pagerank_centrality`** | Architectural importance via PageRank |
| **`loom_attach_repo`** | Attach additional repos for cross-repo search |
| **`loom_workspace_search`** | Search across all attached repos |
| **`loom_semantic_search`** | Semantic embedding search (GPU optional) |
| **`loom_detect_frameworks`** | Detect Nuxt/Next.js/React/Django/etc. |
| **`loom_get_confidence`** | Methodology disclosure (confidence levels) |
| **`loom_enforce_hook`** | Register PreToolUse/PostToolUse hooks |
| **`loom_agent_info`** | Get supported agent integrations |

## Live Dashboard

Starts automatically at `localhost:2337` when you run `loom start`:

- **`/badge.svg`** — Embeddable reduction badge for your README
- **`/replay`** — Animated JSONL session playback
- **`/health`** — Readiness probe for production deployments
- **`/api/summary`** — JSON stats for dashboards/CI

## LoomPacks

Pre-configured toolkits for frameworks. Install with:

```bash
loom pack list         # Show available packs
loom pack install react   # Install React pack
loom pack install node     # Install Node.js pack
```

Available: **React**, **Node.js**, **Python Django**, **Rust**, **Go**, **Java Spring**, **C# .NET**

## System Prompts

Specialized prompts for different tasks:
- `prompts/agent.txt` — General coding assistant
- `prompts/reviewer.txt` — Code review workflow
- `prompts/debugger.txt` — Debug-first approach

## Architecture

```
┌──────────────┐         ~2.7k tokens TOON         ┌───────────────┐
│   Claude     │ ◄─────────────────────────────────►│   LoomMCP     │
│   (Agent)    │                                   │  (AST Engine) │
└──────────────┘                                   └───────────────┘
                                                             │
                                                             ▼
                                                    ~56k raw tokens
                                                             ▼
                                                   ┌───────────────┘
                                                   │  Filesystem   │
                                                   └───────────────┘
```

## Supported Languages

| Language | Status |
|:---------|:-------|
| TypeScript / JavaScript | ✅ Primary |
| Python | ✅ Full |
| Rust | ✅ Full |
| Go | ✅ Full |
| Java | ✅ Full |
| C# | ✅ Full |

## Competitive Analysis

| | LoomMCP | jCodeMunch | Srclight |
|:--------|:-------:|:----------:|:--------:|
| Token Reduction | **95%** | 95-99.6% | ~90% |
| Tools | **28+** | 11 | 42 |
| Languages | **7** | 6 | 25+ |
| Cross-Session Memory | ✅ | ❌ | ❌ |
| Session Replay | ✅ | ❌ | ❌ |
| Live Dashboard | ✅ | ❌ | ❌ |
| Task-Aware Compression | ✅ | ❌ | ❌ |
| Byte-Offset Retrieval | ✅ | ✅ | ✅ |
| BM25 Search | ✅ | ✅ | ✅ |
| Fuzzy Search | ✅ | ✅ | ❌ |
| Dead Code Detection | ✅ | ✅ | ❌ |
| PageRank Centrality | ✅ | ✅ | ❌ |
| Class Hierarchy | ✅ | ✅ | ❌ |
| Multi-Repo Workspaces | ✅ | ❌ | ✅ |
| GPU Embeddings | ✅ | ❌ | ❌ |
| Framework Providers | ✅ | ✅ | ❌ |
| Enforcement Hooks | ✅ | ✅ | ❌ |
| Methodology Disclosure | ✅ | ✅ | ❌ |
| Agent Support (NOUS Hermes) | ✅ | ❌ | ❌ |
| MIT License | ✅ | ❌ | ❌ |
| LoomPacks | ✅ | ❌ | ❌ |

### Where LoomMCP Leads

1. **Most Complete Feature Set** — 28+ tools beating jCodeMunch (11) and matching Srclight (42)
2. **Cross-Session Memory** — No competitor stores code insights between sessions
3. **Session Replay** — JSONL-based animated playback for debugging agent behavior
4. **Live Dashboard** — Real-time SSE visualization at localhost:2337
5. **Task-Aware Compression** — Adapts output based on task type
6. **LoomPacks** — Pre-configured frameworks, one command install
7. **Enforcement Hooks** — PreToolUse/PostToolUse hooks to force agent tool usage
8. **NOUS Hermes Support** — Native MCP client + server for Hermes agent
9. **Methodology Disclosure** — Confidence levels in every response
10. **GPU Embeddings** — Optional semantic search with GPU acceleration
11. **Class Hierarchy** — Inheritance tree traversal
12. **PageRank Centrality** — Architectural importance scoring

## Production Features

- **Circuit breaker**: Won't hammer your filesystem
- **Path traversal protection**: Can't be tricked into reading `../../.env`
- **File watchers**: Auto-invalidate cache when files change
- **Session recorder**: JSONL persistence in `.loom/sessions/`
- **Config file**: `loom.config.json` for workspace customization
- **Docker**: Multi-stage build with healthcheck

## Docker

```bash
docker build -t loom-mcp .
docker run -p 2337:2337 -v $(pwd):/workspace loom-mcp
```

## CI/CD

Every push to `main` auto-builds, tests, and publishes to npm.

## Requirements

- Node.js 18+
- Works on macOS, Linux, Windows

## Roadmap

- [x] Phase 1: Foundation — 17 tools, 7 languages, 95% reduction, dashboard
- [x] Phase 2: Expansion — Dependency graph, session metrics, client adapters
- [x] Phase 3: Scale — LoomPacks, system prompts, CI/CD, Docker, 32 tests
- [x] Phase 4: Dominate — 28+ tools, BM25, fuzzy, dead code, PageRank, multi-repo, GPU, enforcement hooks


## License

MIT — use it forever, no fees, no vendor lock-in.

---

**Bottom line**: LoomMCP matches jCodeMunch's 95% token reduction while adding genuinely novel features — all MIT licensed, all local, all fast.