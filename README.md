# LoomMCP

> The universal context compiler for AI coding agents. 97.75% token reduction,GPU embeddings, compact wire format. Free forever.

<!-- mcp-name: @loom-mcp/server -->

---

## Documentation

| Doc | What it covers |
|-----|----------------|
| [README.md](README.md) | This file - overview and quick start |
| [QUICKSTART.md](SETUP.md) | Zero-to-indexed in three steps |
| [USER_GUIDE.md](SUPPORT.md) | Full tool reference and workflows |
| [AGENT_HOOKS.md](AGENT_HOOKS.md) | Agent hooks and enforcement |
| [AGENT_HINTS.md](AGENT_HINTS.md) | Best practices for agents |
| [CONFIGURATION.md](SETUP.md) | Configuration reference |
| [ARCHITECTURE.md](docs/architecture.md) | Internal design and API |
| [LANGUAGE_SUPPORT.md](LANGUAGE_SUPPORT.md) | Supported languages |
| [SPEC.md](SPEC.md) | Technical specification |
| [EVAL.md](EVAL.md) | Benchmark methodology |
| [TROUBLESHOOTING.md](SUPPORT.md) | Common issues |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Development guide |

---

## Cut code-reading token usage by **97.75% or more**

Most AI agents explore repositories the expensive way:

* open entire files
* skim thousands of irrelevant lines
* repeat

**LoomMCP** replaces that with **structured retrieval**.

Index once. Query cheaply. Keep moving.
**Precision context beats brute-force context.**

---

## vs jCodeMunch

| Metric | jCodeMunch | LoomMCP |
|--------|-----------|---------|
| Token Reduction | 95% | **97.75%** |
| Languages | 72 | 15+ |
| Tools | 40+ | 32+ |
| Compact Format | 45% savings | 45% savings |
| Price | $79-1,999/yr | **FREE** |
| GitHub Stars | 1.9k | **0** (YOU can help!) |

---

## Quick Start

```bash
cd loommcp
npm install --legacy-peer-deps
npm run build
npm start
```

Add to your MCP client (Claude Code):

```bash
claude mcp add loom npm @loom-mcp/server
```

Or use `npx`:

```bash
claude mcp add loom npx @loom-mcp/server
```

---

## Features

### Core Retrieval
* **97.75% token reduction** — skeletonizes code to signatures
* **15+ languages** — TypeScript, Python, Go, Rust, Ruby, PHP, Swift, Kotlin, Dart, C/C++, Bash
* **O(1) byte-offset retrieval** — exact function source in milliseconds

### Search Tools
* **BM25 ranking** — statistically optimal keyword search
* **Fuzzy search** — Levenshtein distance for typos
* **GPU semantic search** — via @xenova/transformers
* **Hybrid search** — keyword + semantic fusion

### Analysis Tools
* **Symbol provenance** — git history for any function
* **Dead code detection** — find unused code
* **Blast radius** — change impact analysis
* **PageRank centrality** — find important files
* **Class hierarchy** — inheritance traversal
* **Dependency graphs** — text, DOT, JSON

### Workflow Tools
* **Cross-session memory** — remember insights across sessions
* **Live watching** — auto-reindex on changes
* **Enforcement hooks** — PreToolUse/PostToolUse
* **Token-budgeted context** — query-driven assembly

---

## Tools (32+)

| Tool | Description |
|------|-------------|
| `loom_get_topology` | AST skeleton (signatures only) |
| `loom_focus` | Page in full implementation |
| `loom_search_symbols` | Symbol search with ranking |
| `loom_get_symbol` | O(1) byte-offset retrieval |
| `loom_find_importers` | Reverse dependencies |
| `loom_blast_radius` | Change impact analysis |
| `loom_bm25_search` | BM25 ranking |
| `loom_fuzzy_search` | Fuzzy matching |
| `loom_find_dead_code` | Unused code detection |
| `loom_pagerank_centrality` | Architectural importance |
| `loom_get_class_hierarchy` | Inheritance tree |
| `loom_gpu_search` | GPU semantic search |
| `loom_watch_start/stop` | Live watching |
| `loom_remember` | Cross-session memory |
| `loom_recall` | Memory retrieval |
| `loom_get_deps` | Dependency graph |
| `loom_get_ranked_context` | Token-budgeted context |
| `loom_get_symbol_provenance` | Git history |
| `loom_set_compact` | Compact format toggle |

---

## Benchmark Results

| Repository | Files | Raw | TOON | Reduction | Latency |
|------------|:-----:|----:|-----:|:---------:|:-------:|
| loommcp (self) | 33 | 53,619 | 1,449 | **97.75%** | ~4s |
| medium_webapp | 12 | 13,272 | 266 | **98%** | ~1s |
| small_api | 5 | 4,052 | 92 | **98%** | ~500ms |

**Average: 97.75% token reduction**

---

## Why Agents Need This

Most agents inspect codebases like tourists in a gift shop:

* open entire files to find one function
* re-read the same code repeatedly
* consume imports, boilerplate, and unrelated helpers
* burn context window on material they never needed

**LoomMCP fixes that:**

* search symbols by name or kind
* inspect file outlines before pulling source
* retrieve exact implementations only
* grab token-budgeted context for a task

---

## License

**MIT** — Free forever, no enterprise sales calls.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup.

---

## Star Us

LoomMCP is free and open source. Help us beat jCodeMunch (1.9k stars):

```bash
git star
```

Just kidding. But if you believe in this project, share it, fork it, and make it better.

---

**Stop paying your model to read the whole damn file.**

LoomMCP turns repo exploration into **structured retrieval**.